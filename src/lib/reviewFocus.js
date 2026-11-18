// The report the admin is looking at after "Open the spot" (kept for this tab, also across an exam switch), so the
// Review bar can show it, open the right editor, and lead back to it in the inbox.
import { lessonById } from '../data/index.js';

const KEY = 'devquest.review';
const listeners = new Set();
let focus = (() => { try { return JSON.parse(sessionStorage.getItem(KEY) || 'null'); } catch { return null; } })();

export const reviewFocus = () => focus;
export function subscribeReview(fn) { listeners.add(fn); return () => listeners.delete(fn); }
export function setReviewFocus(report) {
  focus = report ? { id: report.id, exam: report.exam, kind: report.kind, item_id: report.item_id, card: report.card, term: report.term, label: report.label, message: report.message, category: report.category } : null;
  try { if (focus) sessionStorage.setItem(KEY, JSON.stringify(focus)); else sessionStorage.removeItem(KEY); } catch { /* storage blocked */ }
  listeners.forEach((l) => l());
}

/** Which editor a report's spot opens: { kind, id, card } (null for app-wide feedback). */
export function editorFor(r) {
  if (!r?.item_id) return null;
  if (r.kind === 'card') return { kind: 'card', id: r.item_id, card: r.card ?? 0 };
  if (r.kind === 'term') {
    const k = lessonById[r.item_id]?.terms?.findIndex((t) => t.term === r.term) ?? -1;
    return k >= 0 ? { kind: 'term', id: r.item_id, card: k } : { kind: 'card', id: r.item_id, card: r.card ?? 0 };
  }
  if (r.kind === 'question' || r.kind === 'explanation') return { kind: 'question', id: r.item_id, card: -1 };
  if (r.kind === 'flashcard') return { kind: 'flashcard', id: r.item_id, card: -1 };
  return null;
}
