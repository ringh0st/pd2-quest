// Admin edits to content, as patches over the built-in text (pure: no DOM, no data imports, unit tested).
// Which fields each kind can change, cleaning a patch before it's used, and applying it in place while keeping
// the original so an edit can be undone.

export const EDIT_FIELDS = {
  card: ['title', 'body', 'items', 'code'],
  term: ['say'],
  question: ['q', 'options', 'answer', 'explain', 'wrong', 'code', 'hint', 'audio'],
  flashcard: ['front', 'back'],
};

const text = (v) => (typeof v === 'string' ? v.slice(0, 4000) : undefined);
const textList = (v) => (Array.isArray(v) ? v.slice(0, 12).map((x) => (typeof x === 'string' ? x.slice(0, 2000) : '')) : undefined);

/** Only known fields with the right shape; a question's answers must point at existing options. */
export function cleanPatch(kind, patch, current = {}) {
  const fields = EDIT_FIELDS[kind];
  if (!fields || !patch || typeof patch !== 'object') return null;
  const out = {};
  // language tasks (typed form, sentence building): the answers are the accepted texts, not option numbers
  const typedTask = kind === 'question' && (current.kind === 'type' || current.kind === 'order');
  for (const f of fields) {
    if (!(f in patch)) continue;
    const v = f === 'items' || f === 'options' || f === 'wrong' || (f === 'answer' && typedTask) ? textList(patch[f])
      : f === 'answer' ? (Array.isArray(patch[f]) ? [...new Set(patch[f].filter(Number.isInteger))].sort((a, b) => a - b) : undefined)
        : text(patch[f]);
    if (v !== undefined) out[f] = v;
  }
  if (typedTask) {
    if (out.answer) out.answer = out.answer.map((a) => a.trim()).filter(Boolean);
    if (out.answer && !out.answer.length) delete out.answer;
    return Object.keys(out).length ? out : null;
  }
  if (kind === 'question') {
    const options = out.options ?? current.options ?? [];
    if (out.answer && (!out.answer.length || out.answer.some((i) => i < 0 || i >= options.length))) delete out.answer;
    if (out.options && out.options.length < 2) return null;
    if (out.options && !out.answer && (current.answer ?? []).some((i) => i >= out.options.length)) return null;
    if (out.wrong && out.wrong.length !== options.length) out.wrong = options.map((_, i) => out.wrong[i] ?? '');
  }
  return Object.keys(out).length ? out : null;
}

const copy = (v) => (Array.isArray(v) ? [...v] : v);

/** Applies `patch` to `target` in place. `originals` (a Map) keeps the untouched values under `key`. */
export function applyPatch(target, key, kind, patch, originals) {
  if (!target) return false;
  if (!originals.has(key)) {
    originals.set(key, Object.fromEntries(EDIT_FIELDS[kind].map((f) => [f, copy(target[f])])));
  }
  restore(target, key, originals);
  const clean = cleanPatch(kind, patch, { ...target });
  if (!clean) return false;
  for (const [f, v] of Object.entries(clean)) target[f] = copy(v);
  return true;
}

/** Puts back the original values (if this item was ever edited). */
export function restore(target, key, originals) {
  const orig = originals.get(key);
  if (!target || !orig) return;
  for (const [f, v] of Object.entries(orig)) {
    if (v === undefined) delete target[f]; else target[f] = copy(v);
  }
}
