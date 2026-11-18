// The Weekly and Monthly Top lists (supabase/top.sql). XP earned anywhere in the app is reported to the server,
// which keeps the score (with daily caps); the list shows learners' chosen names. Guests take part through an
// automatic anonymous account, created the first time they earn XP. Top 3 of each finished week and month
// collect coins (200 / 100 / 50) the next time they open the app.
import { getState, onEarn, subscribe, addCoins, pushEvent } from '../state/store.js';
import { hasBackend } from './backend.js';
import { playerClient, hasPlayerSession, supabase } from './auth.js';

const PENDING_KEY = 'devquest.top.pending';  // XP earned but not yet reported (offline, or a report failed)
const NAME_KEY = 'devquest.top.name';        // the name last sent, per account: "<user id>|<name>"
const MAX_PER_CALL = 200;                    // the server's cap per report (top.sql)
const SEND_DELAY_MS = 5000;

export const TOP_PRIZES = [200, 100, 50];
export const MAX_POINTS_PER_DAY = 1500;

const readNum = (k) => { try { return Number(localStorage.getItem(k)) || 0; } catch { return 0; } };
const write = (k, v) => { try { localStorage.setItem(k, String(v)); } catch { /* storage blocked */ } };
const read = (k) => { try { return localStorage.getItem(k) || ''; } catch { return ''; } };

let timer = null;
let sending = null;
let guestsBlocked = false; // anonymous sign-ins are off in Supabase, so guests can't join yet
export const guestsCantJoin = () => guestsBlocked;

async function sendName(client, force = false) {
  const { data } = await client.auth.getSession();
  const uid = data.session?.user?.id;
  if (!uid) return null;
  const name = getState().name || '';
  if (!force && read(NAME_KEY) === `${uid}|${name}`) return null;
  const { data: used, error } = await client.rpc('set_player_name', { p_name: name });
  if (!error) write(NAME_KEY, `${uid}|${name}`);
  return used ?? null;
}

/** Reports XP earned since the last report. */
export function sendPoints() {
  if (!hasBackend() || !navigator.onLine) return Promise.resolve();
  // One send at a time. `.finally` is attached after the assignment, so it always runs after it
  // (clearing it inside the function could happen before the assignment when there's nothing to send).
  sending ??= (async () => {
    try {
      let left = readNum(PENDING_KEY);
      if (left <= 0) return;
      const client = await playerClient();
      await sendName(client);
      for (let k = 0; k < 10 && left > 0; k += 1) {
        const chunk = Math.min(left, MAX_PER_CALL);
        const { error } = await client.rpc('add_top_points', { p_points: chunk });
        if (error) break;
        left = readNum(PENDING_KEY) - chunk;
        write(PENDING_KEY, Math.max(0, left));
      }
    } catch (e) {
      if (/anonymous/i.test(String(e?.message))) guestsBlocked = true; // kept for later either way
    }
  })().finally(() => { sending = null; });
  return sending;
}

/** Collects prizes for finished weeks and months, with a celebration. Returns what was collected. */
export async function claimPrizes({ create = false } = {}) {
  if (!hasBackend()) return [];
  try {
    if (!create && !(await hasPlayerSession())) return [];
    const client = await playerClient();
    const { data, error } = await client.rpc('claim_top_prizes');
    if (error || !data?.length) return [];
    for (const p of data) {
      addCoins(p.coins);
      const when = p.period.startsWith('week') ? 'last week' : 'last month';
      pushEvent({ type: 'chest', coins: p.coins, title: `#${p.place} on the Top list ${when}!` });
    }
    return data;
  } catch { return []; }
}

/** The list for 'week' or 'month': [{ place, name, points, me, prize }]. */
export async function fetchTop(kind) {
  const client = await supabase(); // reading the list needs no account
  const { data, error } = await client.rpc('top_list', { p_kind: kind });
  if (error) throw error;
  return data;
}

/** You on the list: { name, hidden, week_points, month_points }, or null before your first points. */
export async function fetchMyStatus() {
  if (!(await hasPlayerSession())) return null;
  const client = await playerClient();
  await sendName(client);
  const { data, error } = await client.rpc('my_top_status');
  if (error) throw error;
  return data?.[0] ?? null;
}

/** Show or hide yourself on the list. Returns the name used. */
export async function setShownOnTop(shown) {
  const client = await playerClient();
  const { data, error } = await client.rpc('set_player_name', { p_name: getState().name || '', p_hidden: !shown });
  if (error) throw error;
  return data;
}

/** When the current week (next Monday, UTC) and month (the 1st, UTC) end. */
export function periodEnds(now = new Date()) {
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const week = new Date(d);
  week.setUTCDate(d.getUTCDate() + ((8 - (d.getUTCDay() || 7)) % 7 || 7));
  const month = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  return { week, month };
}

/** Call once at app start. */
export function startTopList() {
  if (!hasBackend()) return;
  onEarn((n) => {
    write(PENDING_KEY, readNum(PENDING_KEY) + n);
    clearTimeout(timer);
    timer = setTimeout(sendPoints, SEND_DELAY_MS);
  });
  // A changed name reaches the list the next time points are sent or the list is opened
  let name = getState().name;
  subscribe(() => { if (getState().name !== name) { name = getState().name; write(NAME_KEY, ''); } });
  window.addEventListener('online', () => sendPoints());
  setTimeout(() => { sendPoints(); claimPrizes(); }, 3000);
}
