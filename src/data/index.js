// Loads the exam facts and every section's content. Order follows the official exam guide.
import exam from './exam.json';

const files = import.meta.glob('./{fund,auto,ui,test,perf}.json', { eager: true, import: 'default' });
const ORDER = ['fund', 'auto', 'ui', 'test', 'perf'];
// Short names fit chips and headers on a 320px phone.
const SHORT = { fund: 'Fundamentals', auto: 'Automation', ui: 'User Interface', test: 'Testing', perf: 'Performance' };
const ACCENT = { fund: '--sec-fund', auto: '--sec-auto', ui: '--sec-ui', test: '--sec-test', perf: '--sec-perf' };

export { exam };

// Lookup tables have no prototype, so ids from the URL like "constructor" never match.
const table = (entries) => Object.assign(Object.create(null), Object.fromEntries(entries));

export const sections = ORDER
  .map((id) => {
    const data = files[`./${id}.json`];
    const meta = exam.sections.find((s) => s.id === id) || {};
    if (!data) return null;
    return {
      ...data,
      weight: meta.weight ?? data.weight,
      objectives: meta.objectives ?? [],
      short: SHORT[id],
      accent: `var(${ACCENT[id]})`,
      questions: data.questions.map((q) => ({ ...q, section: id })),
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
