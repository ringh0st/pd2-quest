import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { levelsFor, isLevelOpen, starsFor, isWorldOpen, worldStars, WORLD_STYLES } from '../src/game/worlds.js';
import { TRACKS } from '../src/lib/track.js';
import { fiftyFifty, canBuy, canBuyHelper, HELPERS, chestCoins, COINS } from '../src/game/economy.js';
import { questsFor, isQuestDone, emptyDayStats } from '../src/game/quests.js';
import { BADGES } from '../src/game/badges.js';
import { seeded } from '../src/game/random.js';

const load = (id) => JSON.parse(readFileSync(`src/data/pd2/${id}.json`, 'utf8'));
const ids = ['fund', 'auto', 'ui', 'test', 'perf'];

test('every exam names each of its worlds and Bosses, and every world has a look', () => {
  for (const t of Object.values(TRACKS)) {
    const worlds = JSON.parse(readFileSync(`src/data/${t.id}/exam.json`, 'utf8')).worlds;
    for (const id of t.sections) {
      assert.ok(WORLD_STYLES[id], `${t.id}/${id} has no look`);
      const w = worlds?.[id];
      assert.ok(w?.name && w.boss?.name && w.boss.taunt && w.boss.defeat, `${t.id}/${id} has no name or Boss in exam.json`);
    }
  }
});

test('every world ends with a boss', () => {
  for (const id of ids) {
    assert.ok(WORLD_STYLES[id], id);
    const lv = levelsFor(load(id));
    assert.equal(lv.at(-1).kind, 'boss');
    assert.ok(lv.some((l) => l.kind === 'hard'));
    assert.equal(new Set(lv.map((l) => l.id)).size, lv.length);
    // hard levels follow three lessons and cover exactly those
    lv.forEach((l, i) => { if (l.kind === 'hard') assert.deepEqual(l.covers, lv.slice(i - 3, i).map((x) => x.lessonId)); });
  }
});

test('hard levels have enough questions to draw from', () => {
  for (const id of ids) {
    const s = load(id);
    for (const l of levelsFor(s).filter((x) => x.kind === 'hard')) {
      assert.ok(s.questions.filter((q) => l.covers.includes(q.lesson)).length >= 5, l.id);
    }
  }
});

test('levels unlock in order', () => {
  const lv = levelsFor(load('fund'));
  assert.ok(isLevelOpen(lv, 0, {}));
  assert.ok(!isLevelOpen(lv, 1, {}));
  assert.ok(isLevelOpen(lv, 1, { [lv[0].id]: 1 }));
});

test('stars', () => {
  assert.equal(starsFor('lesson', { right: 3, total: 3 }), 3);
  assert.equal(starsFor('lesson', { right: 2, total: 3 }), 2);
  assert.equal(starsFor('lesson', { right: 0, total: 3 }), 0); // mastery gate
  assert.equal(starsFor('lesson', { right: 1, total: 3 }), 1);
  assert.equal(starsFor('hard', { right: 5, total: 5 }), 3);
  assert.equal(starsFor('hard', { right: 4, total: 5 }), 2);
  assert.equal(starsFor('hard', { right: 3, total: 5 }), 1);
  assert.equal(starsFor('hard', { right: 2, total: 5 }), 0);
  assert.equal(starsFor('boss', { won: true, hearts: 2 }), 2);
  assert.equal(starsFor('boss', { won: false, hearts: 0 }), 0);
});

test('worlds open by stars or unlock', () => {
  assert.ok(isWorldOpen('fund', {}));
  assert.ok(!isWorldOpen('auto', {}));
  assert.ok(isWorldOpen('auto', {}, ['auto']));
  assert.ok(isWorldOpen('auto', { a: 3, b: 3 }));
  const ws = worldStars(load('fund'), {});
  assert.equal(ws.got, 0);
  assert.ok(ws.max > 0);
});

test('50/50 removes two wrong answers, never a right one', () => {
  const q = { options: ['a', 'b', 'c', 'd'], answer: [2] };
  for (let i = 0; i < 20; i++) {
    const r = fiftyFifty(q, seeded(i));
    assert.equal(r.length, 2);
    assert.ok(!r.includes(2));
  }
  assert.deepEqual(fiftyFifty({ options: ['a', 'b', 'c', 'd', 'e'], answer: [0, 1] }), []);
});

test('shop rules', () => {
  assert.ok(canBuy(100, { id: 'x', price: 60 }, []));
  assert.ok(!canBuy(100, { id: 'x', price: 60 }, ['x']));
  assert.ok(!canBuyHelper(1000, HELPERS.fifty, HELPERS.fifty.max));
  for (let i = 0; i < 20; i++) { const c = chestCoins(seeded(i)); assert.ok(c >= COINS.chestMin && c <= COINS.chestMax); }
});

test('daily quests: 3, stable per day, distinct stats', () => {
  const a = questsFor('2026-11-14');
  assert.equal(a.length, 3);
  assert.deepEqual(a, questsFor('2026-11-14'));
  assert.equal(new Set(a.map((q) => q.stat)).size, 3);
  assert.ok(!isQuestDone(a[0], emptyDayStats()));
});

test('badges have unique ids', () => {
  assert.equal(new Set(BADGES.map((b) => b.id)).size, BADGES.length);
});

test('saved progress with broken fields is repaired, not crashed on', async () => {
  globalThis.localStorage ??= { getItem: () => null, setItem: () => {}, removeItem: () => {} };
  const { sanitizeState, initialState } = await import('../src/state/store.js');
  const bad = sanitizeState({ xp: 'lots', coins: null, items: { a: 5, b: { box: 2 } }, exams: [null, { score: 80 }], settings: { textScale: 'big', sound: false }, streak: 7, stars: { x: '3', y: 2 } });
  assert.equal(bad.xp, 0);
  assert.equal(bad.coins, 0);
  assert.deepEqual(Object.keys(bad.items), ['b']);
  assert.equal(bad.exams.length, 1);
  assert.equal(bad.settings.textScale, initialState().settings.textScale);
  assert.equal(bad.settings.sound, false);
  assert.deepEqual(bad.streak, initialState().streak);
  assert.deepEqual(bad.stars, { y: 2 });
  assert.deepEqual(sanitizeState('garbage').items, {});
});

test('placement: one question per lesson, results and test-out rule', async () => {
  const { placementQuestions, placementResult, testOutQuestions, testOutPassed } = await import('../src/game/placement.js');
  const sec = {
    id: 'z',
    lessons: [{ id: 'z-1', check: ['a1'] }, { id: 'z-2', check: ['b1'] }, { id: 'z-3', check: [] }],
    questions: [
      { id: 'a1', lesson: 'z-1', difficulty: 1 }, { id: 'a2', lesson: 'z-1', difficulty: 2 }, { id: 'a3', lesson: 'z-1', difficulty: 3 },
      { id: 'b1', lesson: 'z-2', difficulty: 3 }, { id: 'c1', lesson: 'z-3', difficulty: 1 },
    ],
  };
  const qs = placementQuestions(sec, 'seed');
  assert.deepEqual(qs.map((q) => q.lesson), ['z-1', 'z-2', 'z-3']);
  assert.equal(qs[0].id, 'a2'); // medium preferred
  assert.deepEqual(placementQuestions(sec, 'seed').map((q) => q.id), qs.map((q) => q.id)); // stable
  const r = placementResult(qs, { [qs[0].id]: true, [qs[1].id]: true, [qs[2].id]: false });
  assert.deepEqual(r.proven, ['z-1', 'z-2']);
  assert.equal(r.unlocks, false); // 2/3 < 70%
  assert.equal(placementResult(qs, Object.fromEntries(qs.map((q) => [q.id, true]))).unlocks, true);
  assert.equal(testOutQuestions(sec, sec.lessons[0])[0].id, 'a1'); // check question first
  assert.equal(testOutPassed({ a: true, b: true, c: false, d: true }), true);
  assert.equal(testOutPassed({ a: true, b: false, c: false, d: true }), false);
  assert.equal(testOutPassed({ a: true, b: true }), false); // too few
});

test('a tested-out level is open even if the one before it is not done', () => {
  const lv = [{ id: 'l1' }, { id: 'h1' }, { id: 'l2' }, { id: 'l3' }];
  assert.equal(isLevelOpen(lv, 2, { l1: 1 }), false);
  assert.equal(isLevelOpen(lv, 2, { l1: 1, l2: 1 }), true);
  assert.equal(isLevelOpen(lv, 3, { l1: 1, l2: 1 }), true);
});
