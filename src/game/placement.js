// Placement: skip what you already know. Pure rules, no React (unit tested).
import { seeded } from './random.js';
import { shuffle } from '../engine/session.js';

export const PLACEMENT_UNLOCK = 0.7; // world placement score that unlocks the world
export const TEST_OUT_SIZE = 4;

/** One question per lesson (medium first, else hard, else any), the same set for a given seed. */
export function placementQuestions(section, seed = 'placement') {
  const rand = seeded(`${seed}-${section.id}`);
  return section.lessons.map((l) => {
    const qs = section.questions.filter((q) => q.lesson === l.id && !q.mockOnly);
    const pick = (d) => shuffle(qs.filter((q) => (q.difficulty ?? 2) === d), rand)[0];
    return pick(2) || pick(3) || qs[0];
  }).filter(Boolean);
}

/** A lesson test-out: its check questions first, topped up with medium/hard ones from the same lesson. */
export function testOutQuestions(section, lesson, rand = Math.random) {
  const own = section.questions.filter((q) => q.lesson === lesson.id && !q.mockOnly);
  const check = lesson.check.map((id) => own.find((q) => q.id === id)).filter(Boolean);
  const extra = shuffle(own.filter((q) => !lesson.check.includes(q.id) && (q.difficulty ?? 2) >= 2), rand);
  return [...check, ...extra].slice(0, TEST_OUT_SIZE);
}

/** A test-out passes with at most one miss on first try (and at least 3 questions answered). */
export function testOutPassed(firstAnswers) {
  const v = Object.values(firstAnswers);
  return v.length >= 3 && v.filter((x) => !x).length <= 1;
}

/** Placement result: lessons proven (right on first try) and whether the world unlocks. */
export function placementResult(questions, firstAnswers) {
  const proven = questions.filter((q) => firstAnswers[q.id] === true).map((q) => q.lesson);
  const score = questions.length ? proven.length / questions.length : 0;
  return { proven: [...new Set(proven)], score, unlocks: score >= PLACEMENT_UNLOCK };
}
