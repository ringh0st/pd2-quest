-- Nimbolt: Weekly and Monthly Top lists with coin prizes for the top 3.
-- Run after setup.sql: SQL Editor → New query → paste all → Run. Safe to run again.
--
-- Everyone can take part: guests through an automatic anonymous account (turn on "Allow anonymous sign-ins"
-- in Authentication → Sign In / Providers), Google users with their account.
-- Score = XP earned in the week (Monday–Sunday, UTC) or calendar month (UTC), counted here on the server:
-- each report is capped (MAX_PER_CALL) and so is each day (MAX_PER_DAY), so a tampered app can't post huge scores.
-- Prizes: 1st 200, 2nd 100, 3rd 50 coins, collected once per place per period (claim_top_prizes).
-- Tables have no policies: the app reads and writes only through the functions below.

-- ---------- tables ----------
create table if not exists public.players (
  user_id uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  name text not null,
  hidden boolean not null default false,       -- "Show me on the Top list" switched off
  updated_at timestamptz not null default now()
);
alter table public.players enable row level security;

create table if not exists public.score_days (
  user_id uuid not null references auth.users (id) on delete cascade,
  day date not null,                           -- UTC day
  points int not null default 0 check (points >= 0),
  updated_at timestamptz not null default now(),
  primary key (user_id, day)
);
create index if not exists score_days_day on public.score_days (day);
alter table public.score_days enable row level security;

create table if not exists public.prize_claims (
  user_id uuid not null references auth.users (id) on delete cascade,
  period text not null,                        -- 'week:2026-11-16' or 'month:2026-11-01'
  place int not null check (place between 1 and 3),
  coins int not null,
  claimed_at timestamptz not null default now(),
  primary key (user_id, period),
  unique (period, place)                       -- each place is paid once, ever
);
alter table public.prize_claims enable row level security;

-- ---------- rules ----------
create or replace function public._top_prize(p_place int) returns int
language sql immutable as $$ select case p_place when 1 then 200 when 2 then 100 when 3 then 50 else 0 end $$;

-- Names: 2–24 characters, no links or markup, nothing rude (a short list; extend it as needed)
create or replace function public._clean_name(p_name text) returns text
language plpgsql immutable as $$
declare n text := btrim(regexp_replace(coalesce(p_name, ''), '\s+', ' ', 'g'));
begin
  if char_length(n) < 2 or char_length(n) > 24 then return null; end if;
  if n ~ '[<>{}\[\]\\/@#$%^*=+|~`"]' or n ~* '(https?|www\.|\.com|\.net|\.org)' then return null; end if;
  if lower(n) ~ '(fuck|shit|bitch|cunt|dick|cock|pussy|nigg|fag|slut|whore|rape|nazi|hitler|porn|sex|penis|vagina|asshole|bastard|retard)' then return null; end if;
  return n;
end $$;

create or replace function public._default_name(p_user uuid) returns text
language sql immutable as $$ select 'Learner ' || substr(replace(p_user::text, '-', ''), 1, 4) $$;

-- Start and end (exclusive) of a period: kind 'week' or 'month', `back` periods ago (0 = the current one)
create or replace function public._top_bounds(p_kind text, p_back int default 0, out start_day date, out end_day date)
language plpgsql stable as $$
declare today date := (now() at time zone 'utc')::date;
begin
  if p_kind = 'week' then
    start_day := date_trunc('week', today)::date - 7 * p_back;
    end_day := start_day + 7;
  elsif p_kind = 'month' then
    start_day := (date_trunc('month', today) - make_interval(months => p_back))::date;
    end_day := (start_day + interval '1 month')::date;
  else
    raise exception 'unknown period %', p_kind;
  end if;
end $$;

-- Everyone visible with points in a period, ranked (ties: whoever got there first)
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
  where not p.hidden
$$;
revoke execute on function public._top_ranked(date, date) from public, anon, authenticated;

-- ---------- what the app calls ----------
-- Your name on the list (and whether to show you). Returns the name actually used.
create or replace function public.set_player_name(p_name text, p_hidden boolean default null) returns text
language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); clean text;
begin
  if uid is null then raise exception 'not signed in'; end if;
  clean := coalesce(public._clean_name(p_name), public._default_name(uid));
  insert into players (user_id, name, hidden) values (uid, clean, coalesce(p_hidden, false))
  on conflict (user_id) do update set name = clean, hidden = coalesce(p_hidden, players.hidden), updated_at = now();
  return clean;
end $$;

-- XP just earned. Returns today's total after the caps.
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
  insert into players (user_id, name) values (uid, public._default_name(uid)) on conflict (user_id) do nothing;
  insert into score_days (user_id, day, points) values (uid, today, least(v_add, max_per_day))
  on conflict (user_id, day) do update
    set points = least(score_days.points + excluded.points, max_per_day),
        updated_at = case when excluded.points > 0 then now() else score_days.updated_at end
  returning points into total;
  return total;
end $$;

-- The list for this week or month: the top 50, plus your own row if you're further down.
create or replace function public.top_list(p_kind text)
returns table (place int, name text, points int, me boolean, prize int)
language plpgsql stable security definer set search_path = public as $$
#variable_conflict use_column
declare b record;
begin
  select * into b from public._top_bounds(p_kind, 0);
  return query
    select r.place, r.name, r.points, r.user_id = auth.uid(), public._top_prize(r.place)
    from public._top_ranked(b.start_day, b.end_day) r
    where r.place <= 50 or r.user_id = auth.uid()
    order by r.place;
end $$;

-- You on the list: your name, whether you're hidden, and your points this week and month.
create or replace function public.my_top_status()
returns table (name text, hidden boolean, week_points int, month_points int)
language sql stable security definer set search_path = public as $$
  select p.name, p.hidden,
    coalesce((select sum(s.points) from score_days s, public._top_bounds('week') w where s.user_id = auth.uid() and s.day >= w.start_day and s.day < w.end_day), 0)::int,
    coalesce((select sum(s.points) from score_days s, public._top_bounds('month') m where s.user_id = auth.uid() and s.day >= m.start_day and s.day < m.end_day), 0)::int
  from players p where p.user_id = auth.uid()
$$;

-- Collect prizes for finished weeks (last 4) and months (last 2) where you were in the top 3.
create or replace function public.claim_top_prizes()
returns table (period text, place int, coins int)
language plpgsql security definer set search_path = public as $$
#variable_conflict use_column
declare uid uuid := auth.uid(); k text; back int; b record; mine record; key text;
begin
  if uid is null then return; end if;
  foreach k in array array['week', 'month'] loop
    for back in 1 .. (case when k = 'week' then 4 else 2 end) loop
      select * into b from public._top_bounds(k, back);
      key := k || ':' || b.start_day::text;
      select r.place into mine from public._top_ranked(b.start_day, b.end_day) r where r.user_id = uid;
      if mine.place is not null and mine.place <= 3 then
        begin
          insert into prize_claims (user_id, period, place, coins) values (uid, key, mine.place, public._top_prize(mine.place));
          period := key; place := mine.place; coins := public._top_prize(mine.place);
          return next;
        exception when unique_violation then null; -- already collected (by you, or that place was paid)
        end;
      end if;
    end loop;
  end loop;
end $$;

grant execute on function public.set_player_name(text, boolean) to authenticated;
grant execute on function public.add_top_points(int) to authenticated;
grant execute on function public.top_list(text) to anon, authenticated;
grant execute on function public.my_top_status() to authenticated;
grant execute on function public.claim_top_prizes() to authenticated;
revoke execute on function public.set_player_name(text, boolean) from anon, public;
revoke execute on function public.add_top_points(int) from anon, public;
revoke execute on function public.claim_top_prizes() from anon, public;
