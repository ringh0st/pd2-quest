// The Weekly and Monthly Top lists (supabase/top.sql, privacy.sql). Joining is a choice: on the Top players screen you
// pick a nickname and join; only then does the app report your XP (the server keeps the score, with daily caps).
// Guests take part through an anonymous account created when they join. Top 3 of each finished week and month
// collect coins (200 / 100 / 50) the next time they open the app. Leaving hides you; Me → Delete my data removes it.
import { onEarn, addCoins, pushEvent } from '../state/store.js';
import { hasBackend } from './backend.js';
import { playerClient, hasPlayerSession, supabase } from './auth.js';

const PENDING_KEY = 'devquest.top.pending';  // XP earned but not yet reported (offline, or a report failed)
const NAME_KEY = 'devquest.top.name';        // the name last sent, per account: "<user id>|<name>"
const JOINED_KEY = 'devquest.top.joined';    // your nickname while you're on the list (empty: not joined)
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

/** Your nickname on the Top list, or '' if you haven't joined (on this device). */
export const topNickname = () => read(JOINED_KEY);
export const isOnTop = () => !!topNickname();

async function sendName(client, force = false) {
  const { data } = await client.auth.getSession();
  const uid = data.session?.user?.id;
  if (!uid) return null;
  const name = topNickname();
  if (!name) return null;
  if (!force && read(NAME_KEY) === `${uid}|${name}`) return null;
  const { data: used, error } = await client.rpc('set_player_name', { p_name: name });
  if (!error) write(NAME_KEY, `${uid}|${name}`);
  return used ?? null;
}

/** Reports XP earned since the last report. */
export function sendPoints() {
  if (!hasBackend() || !navigator.onLine || !isOnTop()) return Promise.resolve();
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

/** You on the list: { name, hidden, week_points, month_points }, or null if you haven't joined. */
export async function fetchMyStatus() {
  if (!isOnTop() || !(await hasPlayerSession())) return null;
  const client = await playerClient();
  await sendName(client);
  const { data, error } = await client.rpc('my_top_status');
  if (error) throw error;
  return data?.[0] ?? null;
}

/** Join the list under a nickname (2–24 characters). Returns the nickname the server used. */
export async function joinTop(nickname) {
  const client = await playerClient(); // a guest gets an anonymous account here, not before
  const { data, error } = await client.rpc('set_player_name', { p_name: nickname.trim(), p_hidden: false });
  if (error) throw error;
  write(JOINED_KEY, data || nickname.trim());
  write(NAME_KEY, '');
  return data;
}

/** Leave the list: you're hidden at once and no more XP is reported. */
export async function leaveTop() {
  if (await hasPlayerSession()) {
    const client = await playerClient();
    const { error } = await client.rpc('set_player_name', { p_name: topNickname(), p_hidden: true });
    if (error) throw error;
  }
  try { [JOINED_KEY, NAME_KEY, PENDING_KEY, 'devquest.top.mine'].forEach((k) => localStorage.removeItem(k)); } catch { /* storage blocked */ }
}

/** "3 days 4 h" / "5 hours" until `date`. */
export function timeLeft(date, now = Date.now()) {
  const ms = date - now;
  const days = Math.floor(ms / 86400000);
  const hours = Math.max(1, Math.floor((ms % 86400000) / 3600000));
  return days >= 1 ? `${days} day${days === 1 ? '' : 's'} ${hours} h` : `${hours} hour${hours === 1 ? '' : 's'}`;
}

/** When the current week (next Monday, UTC) and month (the 1st, UTC) end. */
export function periodEnds(now = new Date()) {
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const week = new Date(d);
  week.setUTCDate(d.getUTCDate() + ((8 - (d.getUTCDay() || 7)) % 7 || 7));
  const month = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  return { week, month };
}

// Your place this week, remembered from the last time the list was opened (for the Home card; no network needed)
const MINE_KEY = 'devquest.top.mine';
export function rememberMyPlace(row) {
  try { localStorage.setItem(MINE_KEY, JSON.stringify(row ? { place: row.place, points: row.points, week: periodEnds().week.toISOString() } : null)); } catch { /* storage blocked */ }
}
export function lastMyPlace() {
  try {
    const v = JSON.parse(localStorage.getItem(MINE_KEY) || 'null');
    return v && v.week === periodEnds().week.toISOString() ? v : null; // a new week starts fresh
  } catch { return null; }
}

/** Call once at app start. */
export function startTopList() {
  if (!hasBackend()) return;
  onEarn((n) => {
    if (!isOnTop()) return; // only XP earned after joining counts
    write(PENDING_KEY, readNum(PENDING_KEY) + n);
    clearTimeout(timer);
    timer = setTimeout(sendPoints, SEND_DELAY_MS);
  });
  window.addEventListener('online', () => sendPoints());
  setTimeout(() => { sendPoints(); claimPrizes(); }, 3000);
}
