import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { levelsFor, isLevelOpen, starsFor, isWorldOpen, worldStars, WORLD_THEMES } from '../src/game/worlds.js';
import { fiftyFifty, canBuy, canBuyHelper, HELPERS, chestCoins, COINS } from '../src/game/economy.js';
import { questsFor, isQuestDone, emptyDayStats } from '../src/game/quests.js';
import { BADGES } from '../src/game/badges.js';
import { seeded } from '../src/game/random.js';

const load = (id) => JSON.parse(readFileSync(`src/data/${id}.json`, 'utf8'));
const ids = ['fund', 'auto', 'ui', 'test', 'perf'];

test('every world has a theme and ends with a boss', () => {
  for (const id of ids) {
    assert.ok(WORLD_THEMES[id], id);
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
