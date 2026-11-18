# Supabase setup: feedback + Sign in with Google (about 20 minutes, free)

What you get:
- **Feedback** from every "Report a problem" / "Send feedback" lands in your database, with a link that opens the
  exact card or question. You read and triage it in the app (**Me → Feedback inbox**) or in the Supabase dashboard.
- **Sign in with Google** (optional for learners) on the Me screen. Signed-in learners' progress syncs between devices.

You do steps 1–4 (they need your accounts). Then send me the two values from step 1.4 and I'll switch it on.

## 1. Create the Supabase project

1. Go to supabase.com → **New project**. Name: `dev-quest`. Any strong database password (save it somewhere).
   Region: the one closest to your learners. Free plan is fine.
2. Wait a minute until it's ready.
3. **SQL Editor → New query**: paste everything in [`setup.sql`](setup.sql) → **Run**. (Safe to run again later.)
4. **Project Settings → API** (or the **Connect** button): copy the **Project URL** (`https://xxxx.supabase.co`) and the
   **publishable / anon** key. Send me both. Never send the `service_role` / secret key.

## 2. Create the Google sign-in client (Google Cloud, free)

1. Go to console.cloud.google.com → create a project (e.g. `Nimbolt`).
2. **APIs & Services → OAuth consent screen** (may be called **Google Auth Platform → Branding**):
   - User type: **External**. App name: `Nimbolt`. Support email: yours.
   - App logo: optional (adding one means Google reviews it; you can skip it).
   - App domain → Privacy policy: `https://ringh0st.github.io/pd2-quest/privacy/`
     Terms: `https://ringh0st.github.io/pd2-quest/terms/` · Home page: `https://ringh0st.github.io/pd2-quest/`
   - Authorized domains: `supabase.co` (and later your own domain, e.g. `nimbolt.app`).
   - Scopes: only the default `email`, `profile`, `openid` (no review needed for these).
   - **Publish app** (Audience → "In production"), so anyone can sign in, not just test users.
3. **APIs & Services → Credentials → Create credentials → OAuth client ID**:
   - Type: **Web application**. Name: `Nimbolt web`.
   - Authorized JavaScript origins: `https://ringh0st.github.io`
   - Authorized redirect URIs: `https://YOUR-PROJECT.supabase.co/auth/v1/callback`
     (the exact URL is shown in Supabase under Authentication → Providers → Google, "Callback URL").
   - Create → copy the **Client ID** and **Client secret**.

## 3. Turn on Google in Supabase

1. **Authentication → Sign In / Providers → Google**: enable, paste the Client ID and Client secret → Save.
   (The client secret stays in Supabase. Don't send it to me or put it in the app.)
2. **Authentication → URL Configuration**:
   - Site URL: `https://ringh0st.github.io/pd2-quest/`
   - Redirect URLs: add `https://ringh0st.github.io/pd2-quest/` and `http://localhost:5173/` (for testing).

## 4. Make yourself the admin (after I switch it on)

1. In the app: **Me → Sign in with Google** with your own account.
2. Supabase **SQL Editor**: run this one line with your email:
   ```sql
   insert into public.admins (user_id) select id from auth.users where email = 'YOUR-EMAIL@gmail.com' on conflict do nothing;
   ```
3. Back in the app, pull to refresh (or reopen): **Me → Feedback inbox** appears.

## More SQL files (run each once, in this order, after setup.sql)

- [`top.sql`](top.sql): the Weekly and Monthly Top players lists with coin prizes. Also turn on
  **Authentication → Sign In / Providers → Allow anonymous sign-ins**, so guests can join.
- [`content.sql`](content.sql): your edits to lessons, questions and flashcards (the pencil buttons), and replies
  to feedback that the sender sees in the app.

## Reading feedback

- **In the app:** the Admin tab. New / Doing / Fixed tabs; "Open the spot" jumps to the exact card or question
  (switching exam if needed) and keeps the report on screen with **Edit this** and **Back to report**; a status
  menu; a **reply** the sender sees on their Me screen; and a private note for yourself.
- **In the dashboard:** Table Editor → `feedback`. Filter `status = new`, sort by `created_at`.

## Moving to a new domain later (e.g. Nimbolt)

Add the new address in: Google OAuth client (JavaScript origin), consent screen (authorized domain, privacy/terms
links), and Supabase URL Configuration (Site URL + Redirect URLs). Keep the old ones until the move is done.
