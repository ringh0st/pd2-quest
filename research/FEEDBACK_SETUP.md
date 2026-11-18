# Feedback: setup (about 5 minutes, free)

Every lesson card, word meaning, question, explanation and flashcard has a "Report a problem" button (and Me has
"Send feedback or an idea"). Each report is saved with an exact address of what was reported, and a link that opens
the very same spot in the app. Reports are stored in a Supabase table that only you can read.

## 1. Create the project

1. Go to supabase.com, sign in (you already use it for Lumipals), and click **New project**.
   Name it `dev-quest`, pick any strong database password, and the region closest to you. Free plan is fine.
2. Wait a minute until it's ready.

## 2. Create the table (copy, paste, Run)

Open **SQL Editor → New query**, paste everything below, and click **Run**.

```sql
create table public.feedback (
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

alter table public.feedback enable row level security;

-- Visitors may only ADD reports. Nobody but you (in the dashboard) can read, change or delete them.
create policy "anyone can send feedback" on public.feedback
  for insert to anon, authenticated with check (status = 'new');

create index feedback_new on public.feedback (status, created_at desc);
```

## 3. Send me two values

Open **Project Settings → API** (or **Connect**), and send me:
- the **Project URL** (looks like `https://abcdxyz.supabase.co`)
- the **publishable / anon** key (the public one, NOT the `service_role` / secret key)

Both are safe to put in the app: the table only accepts new reports. I'll add them to `src/lib/backend.js` and
release. Reports people already wrote on their devices are sent automatically then.

## 4. Reading feedback

**Table Editor → feedback**: newest first. Each row shows the label (where), category, message and a **link**:
open it and the app jumps to that exact lesson card, question, explanation or flashcard (switching exam if needed).
Set `status` to `doing` / `fixed` / `wontfix` as you go. Tip: filter `status = new`, sort by `created_at`.
