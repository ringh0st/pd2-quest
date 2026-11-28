-- Nibstep: privacy by default and data clean-up. Run after setup.sql, top.sql and content.sql:
-- SQL Editor → New query → paste all → Run. Safe to run again.
--
--   1. The Top lists show only people who chose to join (with a nickname). Everyone else is hidden by default,
--      including everyone already on the list before this file was run: they join again in the app.
--   2. delete_my_data: anyone (guest or Google account) deletes everything the server holds about them: their
--      account, synced progress, Top list scores and the feedback sent from their device or account.
--   3. cleanup_old_data: runs every night and removes what we no longer need (the periods are in the privacy page).

-- ---------- 1. Top lists: opt-in ----------
alter table public.players add column if not exists joined boolean not null default false;
alter table public.players alter column hidden set default true;

create or replace function public._top_ranked(p_start date, p_end date)
returns table (user_id uuid, place int, name text, points int)
language sql stable security definer set search_path = public as $$
  select t.user_id, (row_number() over (order by t.pts desc, t.last asc))::int, p.name, t.pts::int
  from (
    select s.user_id, sum(s.points) as pts, max(s.updated_at) as last
    from score_days s where s.day >= p_start and s.day < p_end
    group by s.user_id having sum(s.points) > 0
  ) t
  join players p on p.user_id = t.user_id
  where p.joined and not p.hidden
$$;
revoke execute on function public._top_ranked(date, date) from public, anon, authenticated;

-- Join (p_hidden false), leave (p_hidden true) or rename. Returns the nickname actually used.
create or replace function public.set_player_name(p_name text, p_hidden boolean default null) returns text
language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); clean text;
begin
  if uid is null then raise exception 'not signed in'; end if;
  clean := coalesce(public._clean_name(p_name), public._default_name(uid));
  insert into players (user_id, name, hidden, joined)
  values (uid, clean, coalesce(p_hidden, true), coalesce(p_hidden = false, false))
  on conflict (user_id) do update
    set name = clean,
        hidden = coalesce(p_hidden, players.hidden),
        joined = players.joined or coalesce(p_hidden = false, false),
        updated_at = now();
  return clean;
end $$;

-- Points from someone who never joined are kept for nobody: only joined players score.
create or replace function public.add_top_points(p_points int) returns int
language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  max_per_call constant int := 200;
  max_per_day constant int := 1500;
  today date := (now() at time zone 'utc')::date;
  v_add int := least(greatest(coalesce(p_points, 0), 0), max_per_call);
  total int;
begin
  if uid is null then raise exception 'not signed in'; end if;
  if not exists (select 1 from players where user_id = uid and joined) then return 0; end if;
  insert into score_days (user_id, day, points) values (uid, today, least(v_add, max_per_day))
  on conflict (user_id, day) do update
    set points = least(score_days.points + excluded.points, max_per_day),
        updated_at = case when excluded.points > 0 then now() else score_days.updated_at end
  returning points into total;
  return total;
end $$;

-- ---------- 2. delete my data ----------
-- p_reporter: this device's random feedback id (only that device knows it), so guests can delete what they sent.
create or replace function public.delete_my_data(p_reporter text default null) returns void
language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid();
begin
  delete from feedback
  where (char_length(coalesce(p_reporter, '')) >= 32 and reporter = p_reporter)
     or (uid is not null and user_id = uid);
  if uid is not null then
    delete from auth.users where id = uid; -- progress, players, score_days and prize_claims go with it
  end if;
end $$;
revoke execute on function public.delete_my_data(text) from public;
grant execute on function public.delete_my_data(text) to anon, authenticated;

-- The older button (Me → Delete my account) now removes the account's feedback too.
create or replace function public.delete_my_account() returns void
language sql security definer set search_path = public as $$
  delete from feedback where user_id = auth.uid();
  delete from auth.users where id = auth.uid();
$$;
revoke execute on function public.delete_my_account() from anon, public;
grant execute on function public.delete_my_account() to authenticated;

-- ---------- 3. clean-up ----------
create or replace function public.cleanup_old_data() returns void
language plpgsql security definer set search_path = public as $$
begin
  -- Daily Top list points and prize records: kept 13 months (prizes are collected within 2 months)
  delete from score_days where day < (now() at time zone 'utc')::date - 400;
  delete from prize_claims where claimed_at < now() - interval '400 days';
  -- Feedback: kept 2 years
  delete from feedback where created_at < now() - interval '2 years';
  -- Guest (anonymous) accounts unused for 12 months, Google accounts unused for 3 years (never an admin)
  delete from auth.users u
  where not exists (select 1 from admins a where a.user_id = u.id)
    and coalesce(u.last_sign_in_at, u.created_at) < now() - case when u.is_anonymous then interval '12 months' else interval '3 years' end
    and not exists (select 1 from progress p where p.user_id = u.id and p.updated_at > now() - case when u.is_anonymous then interval '12 months' else interval '3 years' end)
    and not exists (select 1 from score_days s where s.user_id = u.id and s.updated_at > now() - interval '12 months');
end $$;
revoke execute on function public.cleanup_old_data() from public, anon, authenticated;

-- Run it every night at 03:17 UTC (pg_cron: Database → Extensions; this turns it on if it isn't)
do $$
begin
  create extension if not exists pg_cron;
  perform cron.schedule('nibstep-cleanup', '17 3 * * *', 'select public.cleanup_old_data()');
exception when others then
  raise notice 'Couldn''t schedule the nightly clean-up (%). Turn on pg_cron in Database → Extensions and run this file again.', sqlerrm;
end $$;
