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
export function buildSprint(sections, items, { count = 5, sectionId = null, minDifficulty = 1, now = Date.now(), rand = Math.random } = {}) {
  const pool = sections
    .filter((s) => !sectionId || s.id === sectionId)
    .flatMap((s) => s.questions
      // mock-only questions stay out of practice until you have met them in a mock
      .filter((q) => (q.difficulty ?? 2) >= minDifficulty && (!q.mockOnly || items[q.id]?.seen))
      .map((q) => ({ q, weight: s.weight })));

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

/**
 * Exam simulation: questions per section proportional to exam weight, about 60% exam-hard.
 * `hardOnly` draws exam-hard questions (difficulty 3) first; `items` lets it prefer questions
 * you have seen least, so repeated mocks show fresh questions before repeats.
 */
export function buildExam(sections, { count = 60, rand = Math.random, hardOnly = false, items = {}, hardShare = 0.6 } = {}) {
  const total = sections.reduce((s, x) => s + x.weight, 0);
  const seenCount = (q) => items[q.id]?.seen ?? 0;
  const ordered = (pool) => shuffle(pool, rand).sort((a, b) => seenCount(a) - seenCount(b));
  const out = [];
  sections.forEach((s, i) => {
    const n = i === sections.length - 1
      ? count - out.length
      : Math.round((s.weight / total) * count);
    const choices = s.questions.filter((q) => q.kind !== 'type' && q.kind !== 'order'); // the mock is multiple choice (typed language tasks are practice)
    const hard = choices.filter((q) => q.difficulty >= 3);
    const other = choices.filter((q) => !(q.difficulty >= 3));
    let pool;
    if (hardOnly) pool = [...ordered(hard), ...ordered(other.filter((q) => q.difficulty === 2))];
    else {
      // Real PD2 items are mostly long scenarios: ~60% exam-hard, the rest mixed.
      // Fresh questions still come first; the hard share applies within them.
      const fresh = (q) => !seenCount(q);
      const mockFirst = (list) => [...list.filter((q) => q.mockOnly), ...list.filter((q) => !q.mockOnly)];
      const hFresh = mockFirst(shuffle(hard.filter(fresh), rand));
      const k = Math.min(hFresh.length, Math.round(n * hardShare));
      const restFresh = mockFirst(shuffle([...hFresh.slice(k), ...other.filter(fresh)], rand));
      pool = [...hFresh.slice(0, k), ...restFresh, ...ordered(choices.filter((q) => !fresh(q)))];
    }
    out.push(...pool.slice(0, Math.max(0, n)));
  });
  return shuffle(out, rand).slice(0, count);
}

export function isCorrect(question, chosen) {
  const a = [...question.answer].sort().join(',');
  const c = [...chosen].sort().join(',');
  return a === c;
}

/**
 * Same question with its options in a new order, so a learner remembers the idea, not the letter.
 * `answer` and `wrong` move with their options. Pass a seeded `rand` to get a stable order.
 */
export function shuffleOptions(question, rand = Math.random) {
  const order = shuffle(question.options.map((_, i) => i), rand);
  return {
    ...question,
    options: order.map((i) => question.options[i]),
    wrong: question.wrong ? order.map((i) => question.wrong[i]) : question.wrong,
    answer: question.answer.map((a) => order.indexOf(a)).sort((x, y) => x - y),
  };
}
