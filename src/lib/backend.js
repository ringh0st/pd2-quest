// The app's server: a Supabase project (setup: supabase/README.md). It stores feedback, and, for learners who sign in
// with Google, their progress so it follows them between devices. The URL and the publishable (anon) key are meant to
// be public: the database rules (supabase/setup.sql) let visitors only add feedback and touch their own progress.
// Leave both empty and the app works fully offline: feedback waits on the device and sign-in is hidden.
export const SUPABASE_URL = '';
export const SUPABASE_KEY = '';
export const hasBackend = () => Boolean(SUPABASE_URL && SUPABASE_KEY);
