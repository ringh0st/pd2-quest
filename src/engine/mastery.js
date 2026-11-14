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
