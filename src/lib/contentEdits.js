// Admin edits to lessons, questions and flashcards (supabase/content.sql). Every app reads the edits for its exam
// at start, from a small cache first and then fresh from the server, and shows the edited text in place.
// Admins save edits from the Edit sheet; they reach everyone the next time the app opens.
import { lessonById, questionById, allFlashcards } from '../data/index.js';
import { track } from './track.js';
import { SUPABASE_KEY, SUPABASE_URL, hasBackend } from './backend.js';
import { supabase } from './auth.js';
import { applyPatch, restore, cleanPatch, EDIT_FIELDS } from './contentPatch.js';

const CACHE_KEY = `devquest.edits.${track.id}`;
const originals = new Map();
let edits = new Map(); // key -> patch
const listeners = new Set();
let version = 0;
const bump = () => { version += 1; listeners.forEach((l) => l()); };
export const contentVersion = () => version;
export function subscribeContent(fn) { listeners.add(fn); return () => listeners.delete(fn); }

export const editKey = (kind, id, card = -1) => `${kind}|${id}|${card ?? -1}`;

/** The live object an edit changes (the same object every screen shows). */
export function editTarget(kind, id, card = -1) {
  if (kind === 'card') return lessonById[id]?.cards?.[card] ?? null;
  if (kind === 'term') return lessonById[id]?.terms?.[card] ?? null;
  if (kind === 'question') return questionById[id] ?? null;
  if (kind === 'flashcard') return allFlashcards.find((f) => f.id === id) ?? null;
  return null;
}

/** The text as it is now, and as it was built in (before any edit). */
export function editFields(kind, id, card = -1) {
  const t = editTarget(kind, id, card);
  if (!t) return null;
  const now = Object.fromEntries(EDIT_FIELDS[kind].map((f) => [f, t[f]]));
  const original = { ...(originals.get(editKey(kind, id, card)) ?? now), kind: t.kind }; // kind: which form to show
  return { now, original, edited: edits.has(editKey(kind, id, card)) };
}

function applyAll(rows) {
  const next = new Map(rows.map((r) => [editKey(r.kind, r.item_id, r.card), r]));
  for (const key of edits.keys()) {
    if (!next.has(key)) { const [kind, id, card] = key.split('|'); restore(editTarget(kind, id, Number(card)), key, originals); }
  }
  for (const [key, r] of next) applyPatch(editTarget(r.kind, r.item_id, r.card), key, r.kind, r.patch, originals);
  edits = next;
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(rows)); } catch { /* storage full or blocked */ }
  bump();
}

/** At app start: the cached edits now, then the latest from the server. */
export async function startContentEdits() {
  try { const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || '[]'); if (cached.length) applyAll(cached); } catch { /* none */ }
  if (!hasBackend()) return;
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/content_edits?exam=eq.${track.id}&select=kind,item_id,card,patch`, {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
    });
    if (res.ok) applyAll(await res.json());
  } catch { /* offline: the cached edits stay */ }
}

const rowsNow = () => [...edits.values()];

/** Saves an edit (admins only; the database checks). Returns true when saved. */
export async function saveEdit(kind, id, card, patch) {
  const target = editTarget(kind, id, card);
  const clean = cleanPatch(kind, patch, { ...(originals.get(editKey(kind, id, card)) ?? target ?? {}), kind: target?.kind });
  if (!target || !clean) throw new Error('That edit isn’t valid (a question needs 2+ options and a correct answer).');
  const client = await supabase();
  const row = { exam: track.id, kind, item_id: id, card: card ?? -1, patch: clean };
  const { error } = await client.from('content_edits').upsert({ ...row, updated_at: new Date().toISOString() }, { onConflict: 'exam,kind,item_id,card' });
  if (error) throw error;
  applyAll([...rowsNow().filter((r) => editKey(r.kind, r.item_id, r.card) !== editKey(kind, id, card)), row]);
  return true;
}

/** Removes an edit: the built-in text comes back for everyone. */
export async function resetEdit(kind, id, card) {
  const client = await supabase();
  const { error } = await client.from('content_edits').delete().match({ exam: track.id, kind, item_id: id, card: card ?? -1 });
  if (error) throw error;
  applyAll(rowsNow().filter((r) => editKey(r.kind, r.item_id, r.card) !== editKey(kind, id, card)));
}
