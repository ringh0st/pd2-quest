// Builds short, interleaved practice sets: due reviews first, then misses, then fresh questions.
import { isDue } from './srs.js';

export function shuffle(arr, rand = Math.random) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Pick `count` questions. `sectionId` narrows to one section; otherwise interleave by exam weight. */
export function buildSprint(sections, items, { count = 5, sectionId = null, now = Date.now(), rand = Math.random } = {}) {
  const pool = sections
    .filter((s) => !sectionId || s.id === sectionId)
    .flatMap((s) => s.questions.map((q) => ({ q, weight: s.weight })));

  const due = pool.filter(({ q }) => isDue(items[q.id], now));
  const shaky = pool.filter(({ q }) => items[q.id]?.seen && !isDue(items[q.id], now) && items[q.id].box <= 2);
  const fresh = pool.filter(({ q }) => !items[q.id]?.seen);
  const rest = pool.filter(({ q }) => items[q.id]?.seen && items[q.id].box > 2 && !isDue(items[q.id], now));

  const picked = [];
  const seen = new Set();
  const take = (list, weighted) => {
    const ordered = weighted ? weightedShuffle(list, rand) : shuffle(list, rand);
    for (const { q } of ordered) {
      if (picked.length >= count) return;
      if (seen.has(q.id)) continue;
      seen.add(q.id);
      picked.push(q);
    }
  };
  take(due, false);
  take(shaky, false);
  // easier fresh questions first so a session starts with a win
  take(fresh.sort((a, b) => a.q.difficulty - b.q.difficulty), true);
  take(rest, false);
  // Start with the easiest question for a quick first win, then mix the rest.
  const mixed = shuffle(picked, rand);
  const easiest = mixed.reduce((best, q, i) => ((q.difficulty ?? 2) < (mixed[best].difficulty ?? 2) ? i : best), 0);
  if (mixed.length) mixed.unshift(...mixed.splice(easiest, 1));
  return mixed;
}

function weightedShuffle(list, rand) {
  return list
    .map((x) => ({ x, k: Math.pow(rand(), 1 / (x.weight || 1)) }))
    .sort((a, b) => b.k - a.k)
    .map(({ x }) => x);
}

/** Exam simulation: questions per section proportional to exam weight. */
export function buildExam(sections, { count = 60, rand = Math.random } = {}) {
  const total = sections.reduce((s, x) => s + x.weight, 0);
  const out = [];
  sections.forEach((s, i) => {
    const n = i === sections.length - 1
      ? count - out.length
      : Math.round((s.weight / total) * count);
    out.push(...shuffle(s.questions, rand).slice(0, Math.max(0, n)));
  });
  return shuffle(out, rand).slice(0, count);
}

export function isCorrect(question, chosen) {
  const a = [...question.answer].sort().join(',');
  const c = [...chosen].sort().join(',');
  return a === c;
}
