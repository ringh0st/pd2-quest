// Saves an unfinished lesson or Hard/Boss run so closing the app never loses it.
// One saved run per level id. Question order is stored by id so a resume shows the same questions.
import { questionById } from '../data/index.js';

const KEY = 'pd2quest.runs.v1';
const MAX_AGE = 14 * 24 * 60 * 60 * 1000; // stale runs are dropped after two weeks

function readAll() {
  try {
    const all = JSON.parse(localStorage.getItem(KEY) || '{}');
    return all && typeof all === 'object' && !Array.isArray(all) ? all : {};
  } catch {
    return {};
  }
}

function writeAll(all) {
  try { localStorage.setItem(KEY, JSON.stringify(all)); } catch { /* storage full or blocked */ }
}

export function saveRun(levelId, run) {
  const all = readAll();
  all[levelId] = { ...run, savedAt: Date.now() };
  writeAll(all);
}

export function clearRun(levelId) {
  const all = readAll();
  if (!(levelId in all)) return;
  delete all[levelId];
  writeAll(all);
}

/** The saved run for this level, or null if none, stale, or its questions no longer exist. */
export function loadRun(levelId, now = Date.now()) {
  const run = readAll()[levelId];
  if (!run || typeof run !== 'object' || now - (run.savedAt ?? 0) > MAX_AGE) return null;
  const r = run.runner;
  if (r) {
    const ok = Array.isArray(r.queue) && r.queue.every((id) => questionById[id]) && Number.isInteger(r.idx) && r.idx >= 0 && r.idx < r.queue.length;
    if (!ok) { clearRun(levelId); return null; }
  }
  return run;
}

/** Questions for a saved runner state, in the saved order. */
export function questionsFor(runner) {
  return [...new Set(runner.queue)].map((id) => questionById[id]);
}

/** Ids of levels/lessons with an unfinished run (for "in progress" marks on the map). */
export function savedRunIds(now = Date.now()) {
  return new Set(Object.keys(readAll()).filter((id) => loadRun(id, now)));
}
