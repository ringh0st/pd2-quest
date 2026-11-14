// Derived views over saved progress + content.
import { isDue } from '../engine/srs.js';
import { sections, allFlashcards, lessonById } from '../data/index.js';

export function dueQuestionCount(items, now = Date.now()) {
  let n = 0;
  for (const s of sections) for (const q of s.questions) if (isDue(items[q.id], now)) n++;
  return n;
}

export function dueCardCount(cards, now = Date.now()) {
  return allFlashcards.filter((f) => isDue(cards[f.id], now)).length;
}

export function newCardCount(cards) {
  return allFlashcards.filter((f) => !cards[f.id]?.seen).length;
}

/** Next lesson to do: continue the section of the most recently finished lesson, else walk sections in order. */
export function nextLesson(done) {
  const finished = Object.entries(done).sort((a, b) => b[1] - a[1]);
  const lastSection = finished.length ? lessonById[finished[0][0]]?.section : null;
  const order = lastSection ? [sections.find((s) => s.id === lastSection), ...sections.filter((s) => s.id !== lastSection)] : sections;
  for (const s of order) {
    if (!s) continue;
    const l = s.lessons.find((x) => !done[x.id]);
    if (l) return { ...l, section: s.id };
  }
  return null;
}

export function totalLessons() {
  return sections.reduce((n, s) => n + s.lessons.length, 0);
}

export function greeting(now = new Date()) {
  const h = now.getHours();
  if (h < 5) return 'Night owl mode 🦉';
  if (h < 12) return 'Good morning ☀️';
  if (h < 18) return 'Good afternoon 👋';
  return 'Good evening 🌙';
}
