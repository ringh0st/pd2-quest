// The app's server: a Supabase project (setup: supabase/README.md). It stores feedback, and, for learners who sign in
// with Google, their progress so it follows them between devices. The URL and the publishable key are meant to be
// public: the database rules (supabase/setup.sql) let visitors only add feedback and touch their own progress.
// Leave both empty and the app works fully offline: feedback waits on the device and sign-in is hidden.
export const SUPABASE_URL = 'https://nelyiktepofslgapxobf.supabase.co';
export const SUPABASE_KEY = 'sb_publishable_gSiJlJv-3T4Wt1uQ5_-ovA_zkRhvOx8';
export const hasBackend = () => Boolean(SUPABASE_URL && SUPABASE_KEY);

// Turn on once the Google provider is enabled in Supabase (Authentication → Sign In / Providers → Google),
// so the button never leads to an error page.
export const GOOGLE_SIGN_IN = false;
export const hasSignIn = () => hasBackend() && GOOGLE_SIGN_IN;
