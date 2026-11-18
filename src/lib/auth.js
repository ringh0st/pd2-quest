// Signing in with Google (through Supabase Auth). Optional: the app works the same without an account; signing in
// adds progress sync between devices (lib/cloudSync.js) and lets the owner read feedback (screens/Inbox.jsx).
// The Supabase library is loaded only when it's needed: when someone taps Sign in, comes back from Google, or was
// signed in before. Everyone else never downloads it.
import { SUPABASE_KEY, SUPABASE_URL, hasBackend, hasSignIn } from './backend.js';

const RETURN_ROUTE = 'devquest.auth.return';
const listeners = new Set();
// `user` is a Google account; a guest on the Top list has an anonymous account instead (`guest`), which isn't "signed in"
let snapshot = { ready: !hasSignIn(), user: null, guest: false, admin: false, busy: false, error: '' };
let clientPromise = null;

const set = (patch) => { snapshot = { ...snapshot, ...patch }; listeners.forEach((l) => l()); };
export const authSnapshot = () => snapshot;
export function subscribeAuth(fn) { listeners.add(fn); return () => listeners.delete(fn); }

/** The Supabase client (loaded on first use). */
export function supabase() {
  clientPromise ??= import('@supabase/supabase-js').then(({ createClient }) => {
    const client = createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: { flowType: 'pkce', persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, storageKey: 'devquest.auth' },
    });
    // Supabase asks that the callback doesn't await other Supabase calls (it can stall sign-in): run it just after
    client.auth.onAuthStateChange((_event, session) => { setTimeout(() => applySession(client, session), 0); });
    return client;
  });
  return clientPromise;
}

let adminCheckFor = null;
async function applySession(client, session) {
  const user = session?.user ?? null;
  if (!user || user.is_anonymous) { adminCheckFor = null; set({ user: null, guest: !!user, admin: false, ready: true }); return; }
  if (snapshot.user?.id === user.id && adminCheckFor === user.id) return; // same account (token refresh)
  const meta = user.user_metadata || {};
  set({ guest: false, user: { id: user.id, email: user.email, name: meta.full_name || meta.name || '', avatar: meta.avatar_url || meta.picture || '' }, ready: true });
  adminCheckFor = user.id;
  const { data } = await client.rpc('is_admin');
  if (snapshot.user?.id === user.id) set({ admin: data === true });
}

const cameBackFromGoogle = () => /[?&](code|error)=/.test(window.location.search);
const hadSession = () => { try { return !!localStorage.getItem('devquest.auth'); } catch { return false; } };

/** At app start: finish a sign-in that just came back from Google, or restore an earlier one. */
export async function startAuth() {
  if (!hasBackend()) return;
  if (!hasSignIn()) { set({ ready: true }); }
  const returning = cameBackFromGoogle(); // checked first: the Supabase library cleans the address bar itself
  if (!returning && !hadSession()) { set({ ready: true }); return; }
  try {
    const client = await supabase();
    const params = new URLSearchParams(window.location.search);
    if (params.get('error')) set({ error: params.get('error_description') || 'Sign-in was cancelled.' });
    const { data } = await client.auth.getSession(); // also exchanges ?code= for a session
    await applySession(client, data.session);
  } catch {
    set({ ready: true, error: 'Couldn’t reach the sign-in server. Check the connection and try again.' });
  } finally {
    if (returning) {
      // Clean the address bar and go back to the screen sign-in started from
      let back = '';
      try { back = sessionStorage.getItem(RETURN_ROUTE) || ''; sessionStorage.removeItem(RETURN_ROUTE); } catch { /* ignore */ }
      const hash = back || window.location.hash || '#/me';
      window.history.replaceState(null, '', `${window.location.pathname}${hash}`);
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    }
  }
}

/** Goes to Google's sign-in page; Google sends the learner back here. */
export async function signInWithGoogle() {
  set({ busy: true, error: '' });
  try {
    try { sessionStorage.setItem(RETURN_ROUTE, window.location.hash || '#/me'); } catch { /* ignore */ }
    const client = await supabase();
    const { error } = await client.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}${window.location.pathname}`, queryParams: { prompt: 'select_account' } },
    });
    if (error) throw error;
  } catch {
    set({ busy: false, error: 'Couldn’t open Google sign-in. Check the connection and try again.' });
  }
}

export async function signOut() {
  set({ busy: true });
  try { const client = await supabase(); await client.auth.signOut(); } catch { /* signed out locally anyway */ }
  set({ busy: false, user: null, admin: false });
}

/** Deletes the account and its synced progress on the server (progress on this device stays). */
export async function deleteAccount() {
  set({ busy: true, error: '' });
  try {
    const client = await supabase();
    const { error } = await client.rpc('delete_my_account');
    if (error) throw error;
    await client.auth.signOut();
    set({ busy: false, user: null, admin: false });
    return true;
  } catch {
    set({ busy: false, error: 'Couldn’t delete the account right now. Check the connection and try again.' });
    return false;
  }
}

/**
 * A session for the Top list: the Google account if signed in, otherwise a guest (anonymous) account, created the
 * first time it's needed. Throws when guests can't join (anonymous sign-ins are off in Supabase).
 */
export async function playerClient() {
  const client = await supabase();
  const { data } = await client.auth.getSession();
  if (data.session) return client;
  const { error } = await client.auth.signInAnonymously();
  if (error) throw error;
  return client;
}

/** Whether there's any session on this device (Google or guest), without creating one. */
export async function hasPlayerSession() {
  if (!hadSession() || !hasBackend()) return false;
  const client = await supabase();
  const { data } = await client.auth.getSession();
  return !!data.session;
}

/** The signed-in learner's access token, or null (feedback uses it so reports are linked to the account). */
export async function accessToken() {
  if (!snapshot.user || !clientPromise) return null;
  const client = await clientPromise;
  const { data } = await client.auth.getSession();
  return data.session?.access_token ?? null;
}
