-- Nibstep: admin edits to lessons, questions and flashcards, and replies to feedback.
-- Run after setup.sql: SQL Editor → New query → paste all → Run. Safe to run again.
--
--   content_edits  your edits to a lesson card, a key-term meaning, a question or a flashcard. Everyone's app reads
--                  them at start and shows the edited text; only admins can write them.
--   feedback.reply your answer to a report. The person who sent it sees it in the app (Me → Replies), found by
--                  their device's random reporter id or their account.

-- ---------- content edits ----------
create table if not exists public.content_edits (
  exam text not null check (exam in ('pd1', 'pd2', 'pab', 'js')),
  kind text not null check (kind in ('card', 'term', 'question', 'flashcard')),
  item_id text not null,                 -- lesson id (card, term), question id or flashcard id
  card int not null default -1,          -- card index in the lesson, or the term's index; -1 otherwise
  patch jsonb not null check (pg_column_size(patch) < 50000),
  updated_at timestamptz not null default now(),
  updated_by uuid default auth.uid() references auth.users (id) on delete set null,
  primary key (exam, kind, item_id, card)
);
alter table public.content_edits enable row level security;
drop policy if exists "everyone reads edits" on public.content_edits;
create policy "everyone reads edits" on public.content_edits for select to anon, authenticated using (true);
drop policy if exists "admins write edits" on public.content_edits;
create policy "admins write edits" on public.content_edits for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ---------- replies to feedback ----------
alter table public.feedback add column if not exists reply text check (char_length(reply) <= 2000);
alter table public.feedback add column if not exists replied_at timestamptz;

-- Senders can't write replies or notes themselves
drop policy if exists "anyone can send feedback" on public.feedback;
create policy "anyone can send feedback" on public.feedback
  for insert to anon, authenticated
  with check (status = 'new' and note is null and reply is null and replied_at is null
              and (user_id is null or user_id = auth.uid()));

-- The replies to your own reports: by this device's reporter id (a random id only that device knows) or your account
create or replace function public.my_feedback_replies(p_reporter text)
returns table (id uuid, created_at timestamptz, label text, message text, reply text, replied_at timestamptz, status text)
language sql stable security definer set search_path = public as $$
  select f.id, f.created_at, f.label, f.message, f.reply, f.replied_at, f.status
  from feedback f
  where f.reply is not null
    and ((char_length(coalesce(p_reporter, '')) >= 32 and f.reporter = p_reporter)
         or (auth.uid() is not null and f.user_id = auth.uid()))
  order by f.replied_at desc
  limit 50
$$;
grant execute on function public.my_feedback_replies(text) to anon, authenticated;
