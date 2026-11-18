// Sends feedback to the Supabase table `feedback` (lib/backend.js). Every report is first saved on the device (the
// outbox), then sent; anything that couldn't be sent (offline, server not set up yet) is retried on the next start or
// when the connection comes back, so nothing a learner writes is lost.
import { SUPABASE_KEY, SUPABASE_URL, hasBackend } from './backend.js';
import { APP_VERSION } from './appInfo.js';
import { accessToken } from './auth.js';

const OUTBOX = 'devquest.feedback.outbox.v1';
const REPORTER = 'devquest.feedback.reporter.v1';

const read = () => { try { return JSON.parse(localStorage.getItem(OUTBOX) || '[]'); } catch { return []; } };
const write = (items) => { try { localStorage.setItem(OUTBOX, JSON.stringify(items)); } catch { /* storage full or blocked */ } };

/** A random id per device, so reports from the same person can be grouped. It says nothing about who they are. */
function reporterId() {
  try {
    let id = localStorage.getItem(REPORTER);
    if (!id) { id = crypto.randomUUID(); localStorage.setItem(REPORTER, id); }
    return id;
  } catch { return null; }
}

const device = () => {
  const ua = navigator.userAgent;
  const os = /iPhone|iPad/.test(ua) ? 'iOS' : /Android/.test(ua) ? 'Android' : /Mac/.test(ua) ? 'Mac' : /Windows/.test(ua) ? 'Windows' : 'Other';
  const app = window.matchMedia?.('(display-mode: standalone)').matches ? 'home screen app' : 'browser';
  return `${os} · ${app} · ${window.innerWidth}×${window.innerHeight}`;
};

/** Saves the report and tries to send it. Resolves to 'sent' or 'saved' (kept on the device for later). */
export async function sendFeedback({ location, category, message, contact }) {
  const row = {
    id: crypto.randomUUID(),
    exam: location.exam, kind: location.kind, item_id: location.id || null, card: location.card, term: location.term || null,
    label: location.label, link: location.link, route: window.location.hash.slice(1) || '/',
    category, message: message.trim().slice(0, 2000) || null, contact: contact.trim().slice(0, 200) || null,
    app_version: APP_VERSION, device: device(), reporter: reporterId(), client_time: new Date().toISOString(),
  };
  write([...read(), row]);
  const left = await flushFeedback();
  return left.some((r) => r.id === row.id) ? 'saved' : 'sent';
}

let flushing = null;
/** Sends everything waiting in the outbox. Resolves to what is still waiting. */
export function flushFeedback() {
  if (!hasBackend() || !navigator.onLine) return Promise.resolve(read());
  flushing ??= (async () => {
    // Signed in: the database links the report to the account (feedback.user_id); otherwise it's anonymous
    const token = await accessToken().catch(() => null);
    for (const row of read()) {
      try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/feedback`, {
          method: 'POST',
          headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${token || SUPABASE_KEY}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
          body: JSON.stringify(row),
        });
        // 201 = saved; 409 = already saved earlier (same id): either way it's done
        if (res.ok || res.status === 409) write(read().filter((r) => r.id !== row.id));
        else break;
      } catch { break; }
    }
    flushing = null;
    return read();
  })();
  return flushing;
}

/** Retry waiting reports at start and whenever the connection comes back. */
export function startFeedbackOutbox() {
  flushFeedback();
  window.addEventListener('online', () => flushFeedback());
}
