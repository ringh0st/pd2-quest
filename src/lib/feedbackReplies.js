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
}

/** Call once at app start. */
export function startReplyCheck() {
  setTimeout(async () => {
    try {
      const fresh = (await fetchReplies()).filter((r) => isNewReply(r));
      if (fresh.length) pushEvent({ type: 'reply', count: fresh.length });
    } catch { /* offline: next time */ }
  }, 5000);
}
