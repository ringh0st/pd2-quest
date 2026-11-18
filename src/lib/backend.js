// The app's only server: a Supabase project that stores user feedback (see research/FEEDBACK_SETUP.md).
// The URL and the publishable (anon) key are meant to be public: the database only lets visitors ADD feedback rows,
// never read, change or delete them. Leave both empty and feedback waits on the device until they're set.
export const SUPABASE_URL = '';
export const SUPABASE_KEY = '';
export const hasBackend = () => Boolean(SUPABASE_URL && SUPABASE_KEY);
