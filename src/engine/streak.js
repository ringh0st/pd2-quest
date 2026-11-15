// Forgiving streaks: any study counts, and freezes cover missed days automatically.
import { dayKey, daysBetween } from './dates.js';

export const FREEZE_EVERY = 7;   // earn a freeze every 7 streak days
export const MAX_FREEZES = 2;

export function emptyStreak() {
  return { count: 0, best: 0, lastDay: null, freezes: 1, usedFreezeOn: null };
}

/** Call when the learner studies. Returns the new streak and what happened. */
export function recordStudy(streak = emptyStreak(), now = Date.now()) {
  const today = dayKey(now);
  const s = { ...emptyStreak(), ...streak };
  if (s.lastDay === today) return { streak: s, event: null };
  // Device clock set back: never gain (or lose) a streak from time travel.
  if (s.lastDay && daysBetween(s.lastDay, today) < 0) return { streak: s, event: null };

  let event = 'extended';
  if (!s.lastDay) {
    s.count = 1;
    event = 'started';
  } else {
    const gap = daysBetween(s.lastDay, today);
    const missed = gap - 1;
    if (missed <= 0) s.count += 1;
    else if (missed <= s.freezes) {
      s.freezes -= missed;
      s.count += 1;
      s.usedFreezeOn = today;
      event = 'frozen';
    } else {
      s.count = 1;
      event = 'restarted';
    }
  }
  s.lastDay = today;
  if (s.count > 0 && s.count % FREEZE_EVERY === 0 && s.freezes < MAX_FREEZES) {
    s.freezes += 1;
    if (event === 'extended') event = 'earnedFreeze';
  }
  s.best = Math.max(s.best, s.count);
  return { streak: s, event };
}

/** Streak as it should be displayed right now (it is "alive" until a missed day exceeds freezes). */
export function liveStreak(streak, now = Date.now()) {
  if (!streak?.lastDay) return 0;
  const gap = daysBetween(streak.lastDay, dayKey(now));
  if (gap <= 1) return streak.count;
  return gap - 1 <= streak.freezes ? streak.count : 0;
}
