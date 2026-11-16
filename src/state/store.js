// One small persisted store. Everything the learner earns lives here, saved to localStorage.
import { useSyncExternalStore } from 'react';
import { review, newItem } from '../engine/srs.js';
import { recordStudy, emptyStreak } from '../engine/streak.js';
import { dayKey } from '../engine/dates.js';
import { levelFor } from '../engine/xp.js';
import { COINS, HELPERS } from '../game/economy.js';
import { emptyDayStats, questsFor } from '../game/quests.js';
import { newBadges } from '../game/badges.js';

const KEY = 'pd2quest.v1';

export const DEFAULT_SETTINGS = {
  theme: 'system',        // system | light | dark
  calm: false,            // calm mode: fewer effects, softer celebrations
  motion: 'system',       // system | full | reduced
  sound: true,
  music: true,           // soft background music in study screens (needs sound on)
  codeWrap: true,
  askConfidence: true,
  breakMinutes: 30,      // suggest a short break after this much active study (0 = off)   // Check · Sure / Check · Guessing in practice (not in mock exams)        // code blocks wrap long lines (the Wrap/Scroll button switches it everywhere)
  haptics: true,
  voice: '',             // read-aloud voice (voiceURI); '' = the most natural voice the device has
  font: 'atkinson',       // atkinson | lexend
  textScale: 1,           // 0.9 .. 1.3
  sprintSize: 5,
  focusMinutes: 10,
};

export function initialState() {
  return {
    v: 1,
    onboarded: false,
    name: '',
    xp: 0,
    items: {},            // question id -> srs item
    cards: {},            // flashcard id -> srs item
    lessons: {},          // lesson id -> completion timestamp
    streak: emptyStreak(),
    dailyGoal: 50,
    today: { day: dayKey(), xp: 0, answered: 0, goalHit: false },
    history: {},          // day -> xp
    exams: [],            // { at, score, total, bySection }
    bestCombo: 0,
    examDate: '',
    examOutcome: '',      // '' | 'passed' (set after the exam date)
    parked: [],           // brain-dump notes: { id, text, at }
    settings: { ...DEFAULT_SETTINGS },
    // ---- game layer ----
    coins: 0,
    stars: {},            // level id -> best stars (0..3)
    owned: [],            // shop item ids
    equipped: { hat: null, theme: 'magenta', confetti: 'classic' },
    helpers: { fifty: 2, hint: 2, heart: 1 },
    unlockedWorlds: [],
    badges: {},           // badge id -> timestamp
    day: { key: dayKey(), stats: emptyDayStats(), claimed: [], bonus: false },
    bolt: { day: '', score: 0 },
    boltCount: 0,
    parkedEver: 0,
    placements: {},       // world id -> { score 0..1, at }
    calibration: { sureRight: 0, sureWrong: 0, guessRight: 0, guessWrong: 0 }, // how often 'sure' is right
    events: [],           // transient celebrations queue (not persisted)
  };
}

const kind = (v) => (v === null ? 'null' : Array.isArray(v) ? 'array' : typeof v);

/** Keep only the fields of `saved` whose type matches the default; nested objects are checked one level down. */
function sameShape(saved, base) {
  if (kind(saved) !== 'object') return base;
  const out = { ...base };
  for (const [k, def] of Object.entries(base)) {
    const v = saved[k];
    if (v === undefined) continue;
    if (def === null || kind(v) === kind(def)) out[k] = v;
  }
  return out;
}

/** A map of id -> object (srs items, stars, badges…): drop entries that are not the right type. */
function cleanMap(map, valueKind) {
  if (kind(map) !== 'object') return {};
  return Object.fromEntries(Object.entries(map).filter(([, v]) => kind(v) === valueKind));
}

/**
 * Repairs saved progress so one bad field can never white-screen the app.
 * Unknown keys are dropped; wrong types fall back to defaults.
 */
export function sanitizeState(saved) {
  const base = initialState();
  if (kind(saved) !== 'object') return base;
  const s = sameShape(saved, base);
  const num = (v, d) => (Number.isFinite(v) ? v : d);
  return {
    ...s,
    xp: Math.max(0, num(s.xp, 0)),
    coins: Math.max(0, num(s.coins, 0)),
    items: cleanMap(s.items, 'object'),
    cards: cleanMap(s.cards, 'object'),
    lessons: cleanMap(s.lessons, 'number'),
    stars: cleanMap(s.stars, 'number'),
    badges: cleanMap(s.badges, 'number'),
    placements: cleanMap(s.placements, 'object'),
    calibration: sameShape(s.calibration, base.calibration),
    history: cleanMap(s.history, 'number'),
    streak: sameShape(s.streak, base.streak),
    today: sameShape(s.today, base.today),
    day: { ...sameShape(s.day, base.day), stats: sameShape(s.day?.stats, base.day.stats), claimed: kind(s.day?.claimed) === 'array' ? s.day.claimed : [] },
    bolt: sameShape(s.bolt, base.bolt),
    settings: sameShape(s.settings, base.settings),
    equipped: sameShape(s.equipped, base.equipped),
    helpers: sameShape(s.helpers, base.helpers),
    exams: s.exams.filter((e) => kind(e) === 'object' && Number.isFinite(e.score)),
    parked: s.parked.filter((p) => kind(p) === 'object' && typeof p.text === 'string'),
    owned: s.owned.filter((x) => typeof x === 'string'),
    unlockedWorlds: s.unlockedWorlds.filter((x) => typeof x === 'string'),
    events: [],
  };
}

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return initialState();
    return sanitizeState(JSON.parse(raw));
  } catch {
    return initialState();
  }
}

/** Progress as a JSON string, for backup. */
export function exportProgress() {
  const { events, ...rest } = state; // eslint-disable-line no-unused-vars
  return JSON.stringify({ app: 'pd2-quest', exportedAt: new Date().toISOString(), state: rest });
}

/** Restore from a backup string. Returns true when it worked. */
export function importProgress(text) {
  try {
    const data = JSON.parse(text);
    const next = sanitizeState(data?.state ?? data);
    setState(() => next);
    return true;
  } catch {
    return false;
  }
}

let state = typeof localStorage !== 'undefined' ? load() : initialState();
const listeners = new Set();

function save() {
  try {
    const { events, ...rest } = state;
    localStorage.setItem(KEY, JSON.stringify(rest));
  } catch { /* storage full or blocked: keep going in memory */ }
}

export function getState() { return state; }

export function setState(updater) {
  state = typeof updater === 'function' ? updater(state) : { ...state, ...updater };
  save();
  listeners.forEach((l) => l());
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function useStore(selector = (s) => s) {
  return useSyncExternalStore(subscribe, () => selector(state), () => selector(state));
}

// ---------- actions ----------

function rollDay(s, now) {
  const day = dayKey(now);
  return s.today.day === day ? s : { ...s, today: { day, xp: 0, answered: 0, goalHit: false } };
}

/** Add XP and register study for the streak. Queues celebration events. */
export function earn(amount, now = Date.now()) {
  setState((prev) => {
    let s = rollDay(prev, now);
    const events = [...s.events];
    const before = levelFor(s.xp).level;
    const xp = s.xp + amount;
    const after = levelFor(xp).level;
    if (after > before) events.push({ type: 'levelUp', level: after });

    const { streak, event } = recordStudy(s.streak, now);
    if (event) events.push({ type: 'streak', event, count: streak.count });

    const todayXp = s.today.xp + amount;
    let goalHit = s.today.goalHit;
    if (!goalHit && todayXp >= s.dailyGoal) { goalHit = true; events.push({ type: 'goal' }); }

    return {
      ...s,
      xp,
      streak,
      today: { ...s.today, xp: todayXp, goalHit },
      history: { ...s.history, [s.today.day]: (s.history[s.today.day] || 0) + amount },
      events,
    };
  });
}

// ---- daily quest stats ----
function rollQuestDay(s, now = Date.now()) {
  const key = dayKey(now);
  return s.day?.key === key ? s : { ...s, day: { key, stats: emptyDayStats(), claimed: [], bonus: false } };
}

function bump(s, patch) {
  const r = rollQuestDay(s);
  const stats = { ...r.day.stats };
  for (const [k, v] of Object.entries(patch)) stats[k] = k === 'bestCombo' ? Math.max(stats[k] || 0, v) : (stats[k] || 0) + v;
  return { ...r, day: { ...r.day, stats } };
}

export function bumpDay(patch) {
  setState((s) => bump(s, patch));
}

/**
 * Record an answer. `confidence` ('sure' | 'guess' | null): a right guess counts as practice but isn't
 * promoted (it comes back tomorrow); calibration counts how often "sure" answers are right.
 */
export function answerQuestion(id, correct, combo, now = Date.now(), { helped = false, confidence = null } = {}) {
  setState((prev) => {
    const s = bump(prev, { answered: 1, right: correct ? 1 : 0, bestCombo: combo });
    const r = rollDay(s, now);
    const cal = { ...initialState().calibration, ...s.calibration };
    if (confidence) cal[`${confidence}${correct ? 'Right' : 'Wrong'}`] += 1;
    return {
      ...s,
      calibration: cal,
      items: { ...s.items, [id]: review(s.items[id] || newItem(), correct ? 'good' : 'again', now, { noPromote: helped || confidence === 'guess' }) },
      today: { ...r.today, answered: r.today.answered + 1 },
      bestCombo: Math.max(s.bestCombo, combo),
    };
  });
}

export function gradeCard(id, grade, now = Date.now()) {
  setState((prev) => {
    const s = bump(prev, { cards: 1 });
    return { ...s, cards: { ...s.cards, [id]: review(s.cards[id] || newItem(), grade, now) } };
  });
}

export function completeLesson(id, now = Date.now()) {
  setState((prev) => {
    // Replays count for quests too, so "Finish a lesson" is always possible.
    const s = bump(prev, { lessons: 1 });
    return { ...s, lessons: { ...s.lessons, [id]: s.lessons[id] || now } };
  });
}

// ---- game actions ----
export function addCoins(n) {
  if (n) setState((s) => ({ ...s, coins: Math.max(0, s.coins + n) }));
}

/** Save a level result. Returns { gained, coins } (only new stars pay coins). */
export function saveStars(levelId, stars) {
  const before = state.stars[levelId] ?? 0;
  const gained = Math.max(0, stars - before);
  const coins = gained * COINS.perNewStar;
  // Quests count every star collected (replays too); coins and the map only count new stars.
  setState((prev) => {
    const s = stars ? bump(prev, { stars }) : prev;
    return gained ? { ...s, stars: { ...s.stars, [levelId]: stars }, coins: s.coins + coins } : s;
  });
  return { gained, coins, before };
}

export function buy(item, kind) {
  setState((s) => {
    if (s.coins < item.price) return s;
    if (kind === 'helper') {
      const held = s.helpers[item.id] ?? 0;
      if (held >= HELPERS[item.id].max) return s;
      return { ...s, coins: s.coins - item.price, helpers: { ...s.helpers, [item.id]: held + 1 } };
    }
    if (s.owned.includes(item.id)) return s;
    return { ...s, coins: s.coins - item.price, owned: [...s.owned, item.id] };
  });
}

export function useHelper(id) {
  if ((state.helpers[id] ?? 0) <= 0) return false;
  setState((s) => ({ ...s, helpers: { ...s.helpers, [id]: s.helpers[id] - 1 } }));
  return true;
}

/**
 * Placement / test-out: mark lessons as known (1★ if they had none, no coins: it isn't new play),
 * optionally open the world for free, and remember the score.
 */
export function testOut(lessonIds, { worldId = null, unlock = false, score = null } = {}, now = Date.now()) {
  setState((s) => {
    const stars = { ...s.stars };
    const lessons = { ...s.lessons };
    for (const id of lessonIds) {
      if (!(stars[id] > 0)) stars[id] = 1;
      if (!lessons[id]) lessons[id] = now;
    }
    const unlockedWorlds = unlock && worldId && !s.unlockedWorlds.includes(worldId) ? [...s.unlockedWorlds, worldId] : s.unlockedWorlds;
    const placements = worldId && score != null ? { ...s.placements, [worldId]: { score, at: now } } : s.placements;
    return { ...s, stars, lessons, unlockedWorlds, placements };
  });
}

/** Give back a helper that was spent on a run the learner threw away (never above the cap). */
export function refundHelper(id) {
  setState((s) => ({ ...s, helpers: { ...s.helpers, [id]: Math.min(HELPERS[id]?.max ?? 9, (s.helpers[id] ?? 0) + 1) } }));
}

export function equip(slot, id) {
  setState((s) => ({ ...s, equipped: { ...s.equipped, [slot]: id } }));
}

export function unlockWorld(id, price) {
  setState((s) => (s.coins < price || s.unlockedWorlds.includes(id) ? s : { ...s, coins: s.coins - price, unlockedWorlds: [...s.unlockedWorlds, id] }));
}

export function claimQuest(quest, reward) {
  setState((prev) => {
    const s = rollQuestDay(prev);
    if (s.day.claimed.includes(quest.id)) return s;
    const claimed = [...s.day.claimed, quest.id];
    let coins = s.coins + reward.coins;
    const events = [...s.events];
    let bonus = s.day.bonus;
    if (!bonus && claimed.length >= questsFor(s.day.key).length) {
      bonus = true;
      coins += reward.bonus;
      events.push({ type: 'chest', coins: reward.bonus, title: 'All quests done!' });
    }
    return { ...s, coins, events, day: { ...s.day, claimed, bonus } };
  });
}

export function finishBolt(score, coins) {
  setState((prev) => {
    const s = bump(prev, { bolt: 1 });
    const first = s.bolt.day !== s.day.key;
    return {
      ...s,
      bolt: { day: s.day.key, score: first ? score : Math.max(score, s.bolt.score) },
      boltCount: s.boltCount + (first ? 1 : 0),
      coins: s.coins + (first ? coins : 0),
    };
  });
}

/** Award any newly earned badges (queued as celebrations). */
export function checkBadges(ctx) {
  const fresh = newBadges(state, ctx);
  if (!fresh.length) return;
  setState((s) => ({
    ...s,
    badges: { ...s.badges, ...Object.fromEntries(fresh.map((b) => [b.id, Date.now()])) },
    events: [...s.events, ...fresh.map((b) => ({ type: 'badge', badge: b }))],
  }));
}

export function recordExam(result) {
  setState((s) => ({ ...s, exams: [...s.exams, result].slice(-20) }));
}

export function updateSettings(patch) {
  setState((s) => ({ ...s, settings: { ...s.settings, ...patch } }));
}

export function shiftEvent() {
  setState((s) => ({ ...s, events: s.events.slice(1) }));
}

/** Remove the first `n` queued celebrations (the ones just shown together). */
export function takeEvents(n) {
  setState((s) => ({ ...s, events: s.events.slice(n) }));
}

export function pushEvent(ev) {
  setState((s) => ({ ...s, events: [...s.events, ev] }));
}

export function parkThought(text) {
  const t = text.trim();
  if (!t) return;
  setState((s) => ({ ...s, parkedEver: s.parkedEver + 1, parked: [{ id: Date.now().toString(36), text: t, at: Date.now() }, ...s.parked].slice(0, 50) }));
}

export function unparkThought(id) {
  setState((s) => ({ ...s, parked: s.parked.filter((p) => p.id !== id) }));
}

export function resetProgress() {
  setState((s) => ({ ...initialState(), settings: s.settings, onboarded: true, name: s.name }));
}
