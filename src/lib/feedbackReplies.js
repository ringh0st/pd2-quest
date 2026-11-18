// Replies to your feedback (supabase/content.sql, my_feedback_replies): found by this device's random reporter id
// or your account. Checked a few seconds after the app opens, only on devices that ever sent feedback; new ones
// get a small celebration and show on the Me screen.
import { SUPABASE_KEY, SUPABASE_URL, hasBackend } from './backend.js';
import { accessToken, authSnapshot } from './auth.js';
import { pushEvent } from '../state/store.js';

const REPORTER = 'devquest.feedback.reporter.v1';
const SEEN = 'devquest.feedback.seen.v1';
const read = (k) => { try { return localStorage.getItem(k); } catch { return null; } };
const seen = () => { try { return new Set(JSON.parse(read(SEEN) || '[]')); } catch { return new Set(); } };
const stamp = (r) => `${r.id}|${r.replied_at}`;

// How many replies haven't been read yet (the Me tab's badge)
const listeners = new Set();
let unread = 0;
const setUnread = (n) => { if (n !== unread) { unread = n; listeners.forEach((l) => l()); } };
export const unreadReplies = () => unread;
export function subscribeReplies(fn) { listeners.add(fn); return () => listeners.delete(fn); }

export const canHaveReplies = () => hasBackend() && (!!read(REPORTER) || !!authSnapshot().user);

/** Replies to this device's (or account's) reports, newest first. */
export async function fetchReplies() {
  if (!canHaveReplies() || !navigator.onLine) return [];
  const token = await accessToken().catch(() => null);
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/my_feedback_replies`, {
    method: 'POST',
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${token || SUPABASE_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ p_reporter: read(REPORTER) }),
  });
  if (!res.ok) return [];
  return res.json();
}

export const isNewReply = (r, set = seen()) => !set.has(stamp(r));
export function markRepliesSeen(rows) {
  const set = seen();
  rows.forEach((r) => set.add(stamp(r)));
  try { localStorage.setItem(SEEN, JSON.stringify([...set].slice(-200))); } catch { /* storage blocked */ }
  setUnread(0);
}

const RECHECK_MS = 5 * 60 * 1000;
let lastCheck = 0;
let celebrated = new Set();

/** Looks for new replies: updates the badge, and celebrates each new one once. */
async function checkReplies() {
  lastCheck = Date.now();
  try {
    const fresh = (await fetchReplies()).filter((r) => isNewReply(r));
    setUnread(fresh.length);
    const unseenHere = fresh.filter((r) => !celebrated.has(stamp(r)));
    if (unseenHere.length) {
      celebrated = new Set([...celebrated, ...unseenHere.map(stamp)]);
      pushEvent({ type: 'reply', count: unseenHere.length });
    }
  } catch { /* offline: next time */ }
}

/** Call once at app start: checks soon after opening, then each time the app comes back (at most every 5 min). */
export function startReplyCheck() {
  setTimeout(checkReplies, 5000);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && Date.now() - lastCheck > RECHECK_MS) checkReplies();
  });
}
