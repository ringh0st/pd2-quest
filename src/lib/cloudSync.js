// Progress sync for signed-in learners: this exam's progress is saved to the `progress` table a few seconds after it
// changes, and checked when the app opens or comes back to the front. Settings stay per device (text size, sound…).
// When both this device and another changed it since the last sync, the one with more XP wins; the other copy is
// kept on this device (BACKUP_KEY), so nothing is ever thrown away.
import { getState, setState, subscribe, sanitizeState } from '../state/store.js';
import { track } from './track.js';
import { subscribeAuth, authSnapshot, supabase } from './auth.js';

const META_KEY = `devquest.sync.${track.id}`;
const BACKUP_KEY = `devquest.sync.replaced.${track.id}`;
const DEVICE_KEY = 'devquest.device';
const SAVE_DELAY_MS = 4000;

const listeners = new Set();
let status = { state: 'off', at: null }; // off | syncing | synced | offline | error
const setStatus = (patch) => { status = { ...status, ...patch }; listeners.forEach((l) => l()); };
export const syncSnapshot = () => status;
export function subscribeSync(fn) { listeners.add(fn); return () => listeners.delete(fn); }

const readJson = (k, fallback) => { try { return JSON.parse(localStorage.getItem(k) ?? 'null') ?? fallback; } catch { return fallback; } };
const writeJson = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage full or blocked */ } };
function deviceId() {
  let id = readJson(DEVICE_KEY, null);
  if (!id) { id = crypto.randomUUID(); writeJson(DEVICE_KEY, id); }
  return id;
}

/** Nothing studied yet on this device for this exam. */
export const isFresh = (s) => !s.xp && !Object.keys(s.lessons || {}).length && !Object.keys(s.items || {}).length;

/**
 * What to do, given this device's progress, the saved copy (or null) and what this device last knew:
 * meta.lastSync is the saved copy's time when this device last synced, meta.dirty whether it changed since.
 */
export function chooseSync(local, cloud, meta = {}) {
  if (!cloud) return isFresh(local) ? 'none' : 'upload';
  const changedHere = meta.lastSync === undefined ? !isFresh(local) : !!meta.dirty;
  if (cloud.updated_at === meta.lastSync) return changedHere ? 'upload' : 'none';
  if (!changedHere) return 'download';
  return (cloud.xp ?? 0) > (local.xp ?? 0) ? 'download' : 'upload';
}

/** The part of the state that syncs: everything but per-device settings and passing events. */
function syncable(s) {
  const { settings, events, ...rest } = s; // eslint-disable-line no-unused-vars
  return rest;
}

let applying = false;
let timer = null;
let running = null;

async function upload(client) {
  const s = getState();
  const row = { exam: track.id, data: syncable(s), xp: s.xp || 0, device: deviceId(), updated_at: new Date().toISOString() };
  const { data, error } = await client.from('progress').upsert(row, { onConflict: 'user_id,exam' }).select('updated_at').single();
  if (error) throw error;
  writeJson(META_KEY, { lastSync: data.updated_at, dirty: false });
}

function download(cloud) {
  const s = getState();
  if (!isFresh(s)) writeJson(BACKUP_KEY, { savedAt: new Date().toISOString(), state: syncable(s) });
  applying = true;
  try { setState(() => ({ ...sanitizeState(cloud.data), settings: s.settings })); } finally { applying = false; }
  writeJson(META_KEY, { lastSync: cloud.updated_at, dirty: false });
}

/** Checks the saved copy and uploads or downloads as needed. */
export function syncNow() {
  if (!authSnapshot().user) return Promise.resolve();
  if (!navigator.onLine) { setStatus({ state: 'offline' }); return Promise.resolve(); }
  running ??= (async () => {
    setStatus({ state: 'syncing' });
    try {
      const client = await supabase();
      const { data: cloud, error } = await client.from('progress').select('data, xp, updated_at').eq('exam', track.id).maybeSingle();
      if (error) throw error;
      const action = chooseSync(getState(), cloud, readJson(META_KEY, {}));
      if (action === 'upload') await upload(client);
      else if (action === 'download') download(cloud);
      setStatus({ state: 'synced', at: Date.now() });
    } catch {
      setStatus({ state: navigator.onLine ? 'error' : 'offline' });
    }
  })().finally(() => { running = null; }); // after the assignment, always (see topList.sendPoints)
  return running;
}

/** Starts syncing whenever someone is signed in. Call once at app start. */
export function startCloudSync() {
  let userId = null;
  subscribeAuth(() => {
    const id = authSnapshot().user?.id ?? null;
    if (id === userId) return;
    // Another account on this device starts from what this device knows, never from the previous account's copy
    if (userId && id !== userId) writeJson(META_KEY, {});
    userId = id;
    if (id) syncNow(); else setStatus({ state: 'off', at: null });
  });
  subscribe(() => {
    if (applying) return;
    const meta = readJson(META_KEY, {});
    if (!meta.dirty) writeJson(META_KEY, { ...meta, dirty: true });
    if (!authSnapshot().user) return;
    clearTimeout(timer);
    timer = setTimeout(syncNow, SAVE_DELAY_MS);
  });
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') syncNow(); });
  window.addEventListener('online', () => syncNow());
}
