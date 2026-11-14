// Loads the exam facts and every section's content. Order follows the official exam guide.
import exam from './exam.json';

const files = import.meta.glob('./{fund,auto,ui,test,perf}.json', { eager: true, import: 'default' });
const ORDER = ['fund', 'auto', 'ui', 'test', 'perf'];
const ACCENT = { fund: '--sec-fund', auto: '--sec-auto', ui: '--sec-ui', test: '--sec-test', perf: '--sec-perf' };

export { exam };

export const sections = ORDER
  .map((id) => {
    const data = files[`./${id}.json`];
    const meta = exam.sections.find((s) => s.id === id) || {};
    if (!data) return null;
    return {
      ...data,
      weight: meta.weight ?? data.weight,
      objectives: meta.objectives ?? [],
      accent: `var(${ACCENT[id]})`,
      questions: data.questions.map((q) => ({ ...q, section: id })),
      flashcards: data.flashcards.map((f) => ({ ...f, section: id })),
    };
  })
  .filter(Boolean);

export const sectionById = Object.fromEntries(sections.map((s) => [s.id, s]));
export const allQuestions = sections.flatMap((s) => s.questions);
export const questionById = Object.fromEntries(allQuestions.map((q) => [q.id, q]));
export const allFlashcards = sections.flatMap((s) => s.flashcards);
export const lessonById = Object.fromEntries(
  sections.flatMap((s) => s.lessons.map((l, i) => [l.id, { ...l, section: s.id, index: i }])),
);
