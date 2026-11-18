-- Dev Quest: everything the app needs in Supabase. Paste all of it into SQL Editor → New query → Run.
-- Safe to run again (it only adds what's missing and refreshes the rules).
--
--   feedback  reports from "Report a problem" / "Send feedback" (anyone may add; only admins read or change)
--   progress  each signed-in learner's progress per exam, for syncing between devices (only its owner can see it)
--   admins    who may read feedback in the app's Feedback inbox (add yourself at the end of this file)

-- ---------- feedback ----------
create table if not exists public.feedback (
  id uuid primary key,
  created_at timestamptz not null default now(),
  status text not null default 'new' check (status in ('new', 'doing', 'fixed', 'wontfix')),
  exam text not null,             -- pd1, pd2, pab, js
  kind text not null,             -- card, term, question, explanation, flashcard, app
  item_id text,                   -- e.g. types-4 (lesson), auto-q12 (question), fund-f3 (flashcard)
  card int,                       -- lesson card index (0 = first card)
  term text,                      -- the word whose meaning was reported
  label text,                     -- readable address, e.g. "JavaScript · types-4 · card 3 (Lesson card)"
  link text,                      -- opens that exact spot in the app
  category text not null,         -- wrong, confusing, typo, bug, idea, other
  message text check (char_length(message) <= 2000),
  contact text check (char_length(contact) <= 200),
  route text, app_version text, device text,
  reporter text,                  -- random id per device (groups one person's reports; not who they are)
  client_time timestamptz
);
-- the account that sent it, when signed in (filled in by the database, never by the app)
alter table public.feedback add column if not exists user_id uuid default auth.uid() references auth.users (id) on delete set null;
alter table public.feedback add column if not exists note text; -- your own note while fixing
create index if not exists feedback_new on public.feedback (status, created_at desc);
alter table public.feedback enable row level security;

-- ---------- admins ----------
create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  added_at timestamptz not null default now()
);
alter table public.admins enable row level security; -- no policies: nobody can read or change it from the app

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;
grant execute on function public.is_admin() to anon, authenticated;

drop policy if exists "anyone can send feedback" on public.feedback;
create policy "anyone can send feedback" on public.feedback
  for insert to anon, authenticated
  with check (status = 'new' and note is null and (user_id is null or user_id = auth.uid()));
drop policy if exists "admins read feedback" on public.feedback;
create policy "admins read feedback" on public.feedback for select to authenticated using (public.is_admin());
drop policy if exists "admins update feedback" on public.feedback;
create policy "admins update feedback" on public.feedback for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- ---------- progress (sync between devices) ----------
create table if not exists public.progress (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  exam text not null check (exam in ('pd1', 'pd2', 'pab', 'js')),
  data jsonb not null,
  xp int not null default 0,
  device text,                    -- random id of the device that saved it last
  updated_at timestamptz not null default now(),
  primary key (user_id, exam),
  constraint progress_size check (pg_column_size(data) < 2000000)
);
alter table public.progress enable row level security;
drop policy if exists "own progress" on public.progress;
create policy "own progress" on public.progress for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ---------- delete my account (the app's "Delete my account" button) ----------
create or replace function public.delete_my_account() returns void
language sql security definer set search_path = public as $$
  delete from auth.users where id = auth.uid();  -- progress goes with it; feedback stays, without the account
$$;
revoke execute on function public.delete_my_account() from anon, public;
grant execute on function public.delete_my_account() to authenticated;

-- ---------- make yourself the admin ----------
-- 1. Sign in once in the app with Google (Me → Sign in with Google).
-- 2. Then put your Google email below, remove the two dashes at the start of the line, and Run just that line:
-- insert into public.admins (user_id) select id from auth.users where email = 'YOUR-EMAIL@gmail.com' on conflict do nothing;
