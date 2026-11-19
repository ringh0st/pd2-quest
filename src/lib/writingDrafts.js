// Your writing for the Writing desk, kept on this device per exam: the text, which self-check items you ticked,
// and when you finished a task.
import { track } from './track.js';

const KEY = `${track.prefix}.writing.v1`;
const read = () => { try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch { return {}; } };

export const writingState = (id) => read()[id] ?? { text: '', ticks: [], done: null };
export function saveWriting(id, patch) {
  const all = read();
  all[id] = { ...writingState(id), ...patch };
  try { localStorage.setItem(KEY, JSON.stringify(all)); } catch { /* storage full or blocked */ }
  return all[id];
}
export const doneCount = () => Object.values(read()).filter((w) => w.done).length;

/** Words in a text (Finnish or English): runs of letters or digits. */
export const wordCount = (text = '') => (text.match(/[\p{L}\p{N}]+(?:[-'][\p{L}\p{N}]+)*/gu) ?? []).length;
