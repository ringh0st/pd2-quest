import test from 'node:test';
import assert from 'node:assert/strict';
import { review, isDue, newItem, DAY } from '../src/engine/srs.js';
import { levelFor, xpForLevel, answerXp } from '../src/engine/xp.js';
import { recordStudy, liveStreak, emptyStreak } from '../src/engine/streak.js';
import { buildSprint, buildExam, isCorrect } from '../src/engine/session.js';
import { readiness } from '../src/engine/mastery.js';

const t0 = new Date(2026, 10, 14, 12).getTime();

test('srs: correct moves up, miss drops to box 1 due soon', () => {
  let it = review(newItem(), 'good', t0);
  assert.equal(it.box, 1);
  assert.equal(it.due, t0 + DAY);
  it = review(it, 'easy', it.due);
  assert.equal(it.box, 3);
  it = review(it, 'again', t0);
  assert.equal(it.box, 1);
  it = review({ ...it, box: 5 }, 'again', t0);
  assert.equal(it.box, 3);
  assert.ok(isDue(it, t0 + 11 * 60 * 1000));
});

test('xp: level curve', () => {
  assert.equal(xpForLevel(1), 0);
  assert.equal(levelFor(0).level, 1);
  assert.equal(levelFor(99).level, 1);
  assert.equal(levelFor(100).level, 2);
  assert.equal(levelFor(700).level, 5);
  assert.equal(levelFor(2700).level, 10);
  assert.equal(answerXp(true, 1), 10);
  assert.equal(answerXp(true, 1, true), 15);
  assert.equal(answerXp(true, 5), 15);
  assert.equal(answerXp(true, 12), 20);
  assert.equal(answerXp(false, 3), 2);
});

test('streak: same day, next day, freeze, reset', () => {
  let { streak, event } = recordStudy(emptyStreak(), t0);
  assert.equal(event, 'started');
  assert.equal(recordStudy(streak, t0 + 1000).event, null);
  ({ streak } = recordStudy(streak, t0 + DAY));
  assert.equal(streak.count, 2);
  // miss one day, have 1 freeze
  ({ streak, event } = recordStudy(streak, t0 + 3 * DAY));
  assert.equal(event, 'frozen');
  assert.equal(streak.count, 3);
  assert.equal(streak.freezes, 0);
  assert.equal(liveStreak(streak, t0 + 4 * DAY), 3);
  assert.equal(liveStreak(streak, t0 + 6 * DAY), 0);
  ({ streak, event } = recordStudy(streak, t0 + 6 * DAY));
  assert.equal(event, 'restarted');
  assert.equal(streak.count, 1);
});

const mk = (id, weight, n) => ({
  id, weight, lessons: [],
  questions: Array.from({ length: n }, (_, i) => ({ id: `${id}-q${i}`, difficulty: (i % 3) + 1, answer: [0] })),
});
const sections = [mk('a', 30, 20), mk('b', 70, 20)];

test('sprint: unique, due first, easiest first', () => {
  const items = { 'a-q5': { ...newItem(), seen: 1, box: 1, due: t0 - 1 } };
  const s = buildSprint(sections, items, { count: 5, now: t0 });
  assert.equal(s.length, 5);
  assert.equal(new Set(s.map((q) => q.id)).size, 5);
  assert.ok(s.some((q) => q.id === 'a-q5'));
  assert.equal(s[0].difficulty, Math.min(...s.map((q) => q.difficulty)));
});

test('exam: proportional and right length', () => {
  const e = buildExam(sections, { count: 10 });
  assert.equal(e.length, 10);
  assert.equal(e.filter((q) => q.id.startsWith('a')).length, 3);
});

test('isCorrect handles choose-2 in any order', () => {
  assert.ok(isCorrect({ answer: [1, 3] }, [3, 1]));
  assert.ok(!isCorrect({ answer: [1, 3] }, [1]));
});

test('readiness weighted', () => {
  const items = {};
  sections[1].questions.forEach((q) => (items[q.id] = { ...newItem(), seen: 1, box: 4, due: Date.now() + DAY }));
  assert.equal(readiness(sections, items), 70);
});

test('exam: hardOnly prefers difficulty 3, fresh questions first', () => {
  const secs = [{ id: 'z', weight: 100, questions: Array.from({ length: 30 }, (_, i) => ({ id: 'z' + i, difficulty: i < 12 ? 3 : 2, answer: [0] })) }];
  const e = buildExam(secs, { count: 10, hardOnly: true });
  assert.ok(e.every((q) => q.difficulty === 3));
  const items = Object.fromEntries(Array.from({ length: 20 }, (_, i) => ['z' + i, { seen: 3 }]));
  const f = buildExam(secs, { count: 10, items });
  assert.ok(f.every((q) => !items[q.id]));
});

test('shuffleOptions keeps answer and wrong-reasons attached to their options', async () => {
  const { shuffleOptions, isCorrect } = await import('../src/engine/session.js');
  const q = { id: 'x', options: ['a', 'b', 'c', 'd', 'e'], answer: [1, 3], wrong: ['wa', '', 'wc', '', 'we'] };
  for (let s = 1; s < 30; s++) {
    let seed = s;
    const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    const r = shuffleOptions(q, rand);
    assert.deepEqual(r.answer.map((i) => r.options[i]).sort(), ['b', 'd']);
    r.options.forEach((o, i) => assert.equal(r.wrong[i], q.wrong[q.options.indexOf(o)]));
    assert.ok(isCorrect(r, r.answer));
  }
});

test('a miss relearned in the same session is not promoted above a first-try right', () => {
  const t = 1_000_000_000_000;
  const firstRight = review(newItem(), 'good', t);
  const missed = review(newItem(), 'again', t);
  const relearned = review(missed, 'good', t + 3 * 60 * 1000);
  assert.ok(relearned.box <= firstRight.box, `relearned box ${relearned.box} > first-right box ${firstRight.box}`);
  assert.ok(relearned.due >= t + DAY - 1);
  const helped = review(newItem(), 'good', t, { noPromote: true });
  assert.equal(helped.box, 1);
  // a due item answered right does move up
  const later = review(firstRight, 'good', firstRight.due + 1);
  assert.equal(later.box, firstRight.box + 1);
});

test('strength fades when a review is long overdue', async () => {
  const { strength } = await import('../src/engine/srs.js');
  const now = 1_000_000_000_000;
  const fresh = { ...newItem(), seen: 1, box: 4, due: now + DAY };
  const stale = { ...fresh, due: now - 60 * DAY };
  assert.equal(strength(fresh, now), 1);
  assert.ok(strength(stale, now) < 0.5);
  assert.ok(strength(stale, now) >= 0.25);
});

test('streak ignores a device clock set back in time', () => {
  const t = Date.UTC(2026, 10, 15, 12);
  const { streak } = recordStudy({ ...emptyStreak(), count: 4, best: 4, lastDay: '2026-11-15' }, t - 3 * DAY);
  assert.equal(streak.count, 4);
  assert.equal(streak.lastDay, '2026-11-15');
});
