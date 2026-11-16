// Loads the chosen exam's facts and every section's content (src/data/<track>/). Order follows the official exam guide.
// Only the current exam's files are downloaded; switching exams reloads the app (see lib/track.js).
import { currentTrack, track } from '../lib/track.js';
import { worldTheme } from '../game/worlds.js';

const loaders = import.meta.glob('./*/*.json', { import: 'default' });
const ORDER = track.sections;
const load = (name) => loaders[`./${currentTrack}/${name}.json`]?.() ?? Promise.resolve(null);
const [exam, ...sectionFiles] = await Promise.all([load('exam'), ...ORDER.map(load)]);
const files = Object.fromEntries(ORDER.map((id, i) => [`./${id}.json`, sectionFiles[i]]));
// Short names fit chips and headers on a 320px phone.
const SHORT = { fund: 'Fundamentals', auto: 'Automation', ui: 'User Interface', test: 'Testing', perf: 'Performance' };
const ACCENT = { fund: '--sec-fund', auto: '--sec-auto', ui: '--sec-ui', test: '--sec-test', perf: '--sec-perf' };

export { exam };

// Lookup tables have no prototype, so ids from the URL like "constructor" never match.
const table = (entries) => Object.assign(Object.create(null), Object.fromEntries(entries));

/**
 * About one in five medium/hard questions is kept for mock exams only (never a lesson's own check
 * question), so a mock can always show questions you have never seen: a more honest readiness score.
 * Deterministic by id, so it is stable across devices and updates.
 */
export function isMockOnly(q, checkIds) {
  if ((q.difficulty ?? 2) < 2 || checkIds.has(q.id)) return false;
  let h = 2166136261;
  for (let i = 0; i < q.id.length; i++) { h ^= q.id.charCodeAt(i); h = Math.imul(h, 16777619); }
  return (h >>> 0) % 5 === 0;
}

export const sections = ORDER
  .map((id) => {
    const data = files[`./${id}.json`];
    const meta = exam.sections.find((s) => s.id === id) || {};
    if (!data) return null;
    return {
      ...data,
      weight: meta.weight ?? data.weight,
      objectives: meta.objectives ?? [],
      world: exam.worlds?.[id],
      short: SHORT[id],
      accent: `var(${ACCENT[id]})`,
      questions: data.questions.map((q) => ({ ...q, section: id, mockOnly: isMockOnly(q, new Set(data.lessons.flatMap((l) => l.check))) })),
      flashcards: data.flashcards.map((f) => ({ ...f, section: id })),
    };
  })
  .filter(Boolean);

export const sectionById = table(sections.map((s) => [s.id, s]));
export const allQuestions = sections.flatMap((s) => s.questions);
export const questionById = table(allQuestions.map((q) => [q.id, q]));
export const allFlashcards = sections.flatMap((s) => s.flashcards);
export const lessonById = table(
  sections.flatMap((s) => s.lessons.map((l, i) => [l.id, { ...l, section: s.id, index: i }])),
);

/** A world's look, name and Boss, by section id. */
export const themeOf = (id) => worldTheme(sectionById[id] ?? { id });
