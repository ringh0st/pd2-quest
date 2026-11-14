// One small persisted store. Everything the learner earns lives here, saved to localStorage.
import { useSyncExternalStore } from 'react';
import { review, newItem } from '../engine/srs.js';
import { recordStudy, emptyStreak } from '../engine/streak.js';
import { dayKey } from '../engine/dates.js';
import { levelFor } from '../engine/xp.js';

const KEY = 'pd2quest.v1';

export const DEFAULT_SETTINGS = {
  theme: 'system',        // system | light | dark
  calm: false,            // calm mode: fewer effects, softer celebrations
  motion: 'system',       // system | full | reduced
  sound: true,
  haptics: true,
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
    parked: [],           // brain-dump notes: { id, text, at }
    settings: { ...DEFAULT_SETTINGS },
    events: [],           // transient celebrations queue (not persisted)
  };
}

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return initialState();
    const saved = JSON.parse(raw);
    const base = initialState();
    return { ...base, ...saved, settings: { ...base.settings, ...saved.settings }, events: [] };
  } catch {
    return initialState();
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

export function answerQuestion(id, correct, combo, now = Date.now()) {
  setState((s) => ({
    ...s,
    items: { ...s.items, [id]: review(s.items[id] || newItem(), correct ? 'good' : 'again', now) },
    today: { ...rollDay(s, now).today, answered: rollDay(s, now).today.answered + 1 },
    bestCombo: Math.max(s.bestCombo, combo),
  }));
}

export function gradeCard(id, grade, now = Date.now()) {
  setState((s) => ({ ...s, cards: { ...s.cards, [id]: review(s.cards[id] || newItem(), grade, now) } }));
}

export function completeLesson(id, now = Date.now()) {
  setState((s) => ({ ...s, lessons: { ...s.lessons, [id]: s.lessons[id] || now } }));
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

export function pushEvent(ev) {
  setState((s) => ({ ...s, events: [...s.events, ev] }));
}

export function parkThought(text) {
  const t = text.trim();
  if (!t) return;
  setState((s) => ({ ...s, parked: [{ id: Date.now().toString(36), text: t, at: Date.now() }, ...s.parked].slice(0, 50) }));
}

export function unparkThought(id) {
  setState((s) => ({ ...s, parked: s.parked.filter((p) => p.id !== id) }));
}

export function resetProgress() {
  setState((s) => ({ ...initialState(), settings: s.settings, onboarded: true, name: s.name }));
}
