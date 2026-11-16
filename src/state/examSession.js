// Saves an in-progress mock exam so a reload, app switch or crash never loses it.
// Time is wall-clock while the exam is on screen; time while the app was closed is not counted.
import { questionById } from '../data/index.js';

import { trackKey } from '../lib/track.js';

const KEY = trackKey('pd2quest.exam.v1');

export function saveExamSession(session) {
  try { localStorage.setItem(KEY, JSON.stringify(session)); } catch { /* storage full or blocked: keep going */ }
}

export function clearExamSession() {
  try { localStorage.removeItem(KEY); } catch { /* ignore */ }
}

/** The saved exam, or null when there is none or it no longer matches the question bank. */
export function loadExamSession() {
  try {
    const s = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (!s || !Array.isArray(s.ids) || !s.ids.length) return null;
    const questions = s.ids.map((id) => questionById[id]);
    if (questions.some((q) => !q)) { clearExamSession(); return null; }
    return {
      ...s,
      questions,
      answers: typeof s.answers === 'object' && s.answers ? s.answers : {},
      flags: typeof s.flags === 'object' && s.flags ? s.flags : {},
      i: Math.min(Math.max(0, s.i | 0), questions.length - 1),
    };
  } catch {
    clearExamSession();
    return null;
  }
}
