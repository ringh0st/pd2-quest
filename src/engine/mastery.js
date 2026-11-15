// Mastery and exam readiness, derived only from saved review items (nothing extra stored).
import { strength } from './srs.js';

export function sectionMastery(section, items) {
  const qs = section.questions;
  if (!qs.length) return 0;
  return qs.reduce((sum, q) => sum + strength(items[q.id]), 0) / qs.length;
}

export function lessonsDone(section, done) {
  return section.lessons.filter((l) => done[l.id]).length;
}

/** Weighted by official exam weights: a single 0..100 "readiness" number. */
export function readiness(sections, items) {
  const totalWeight = sections.reduce((s, x) => s + x.weight, 0) || 1;
  const score = sections.reduce((s, x) => s + sectionMastery(x, items) * x.weight, 0) / totalWeight;
  return Math.round(score * 100);
}

export function weakestSection(sections, items) {
  // weakest relative to how much it matters on the exam
  return [...sections].sort(
    (a, b) => (sectionMastery(a, items) - 1) * a.weight - (sectionMastery(b, items) - 1) * b.weight,
  )[0];
}

export function accuracy(items) {
  let right = 0, seen = 0;
  for (const it of Object.values(items)) { right += it.right; seen += it.right + it.wrong; }
  return seen ? Math.round((right / seen) * 100) : null;
}

/**
 * Score estimate from mock exams: the average of the last two timed full-length mocks
 * (60 questions), or null if there aren't any yet. Mocks are the best evidence of exam
 * performance; readiness above only says how well this question bank is remembered.
 */
export function mockEstimate(exams, fullLength = 60) {
  const real = exams.filter((e) => e.timed !== false && e.total >= fullLength).slice(-2);
  if (!real.length) return null;
  return { score: Math.round(real.reduce((a, e) => a + e.score, 0) / real.length), count: real.length };
}

/** Booking rule shown on Home: two timed full mocks at 80%+. */
export function readyToBook(exams, fullLength = 60) {
  const est = mockEstimate(exams, fullLength);
  return !!est && est.count >= 2 && est.score >= 80;
}
