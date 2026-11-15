// Leitner-style spaced repetition. Simple, forgiving and easy to reason about.
// Box 0 = new. Each correct answer moves an item up a box; a miss drops it to box 1
// two boxes and it comes back soon (same session for questions, tomorrow at the latest).

export const DAY = 24 * 60 * 60 * 1000;
export const INTERVAL_DAYS = [0, 1, 3, 7, 14, 30, 60];
export const MAX_BOX = INTERVAL_DAYS.length - 1;
export const MASTERED_BOX = 4;

export function newItem() {
  return { box: 0, due: 0, seen: 0, right: 0, wrong: 0, last: 0 };
}

/**
 * grade: 'again' | 'good' | 'easy'.
 * A right answer before the item is due (relearning minutes after a miss, cramming, or answering
 * with a helper via `noPromote`) counts, but doesn't move the item up a box: spacing is what earns it.
 */
export function review(item = newItem(), grade, now = Date.now(), { noPromote = false } = {}) {
  const next = { ...newItem(), ...item };
  next.seen += 1;
  next.last = now;
  if (grade === 'again') {
    next.wrong += 1;
    next.box = Math.max(1, next.box - 2); // forgiving: drop two boxes, not back to zero
    next.due = now + 10 * 60 * 1000; // back in 10 minutes
    return next;
  }
  next.right += 1;
  const early = item.seen > 0 && item.due > now;
  if (early || noPromote) {
    next.box = Math.max(next.box, 1);
    next.due = Math.max(item.seen ? item.due : 0, now + DAY);
    return next;
  }
  const step = grade === 'easy' ? 2 : 1;
  next.box = Math.min(MAX_BOX, next.box + step);
  const days = INTERVAL_DAYS[next.box];
  const fuzz = days >= 3 ? 0.9 + Math.random() * 0.2 : 1; // ±10% spreads the review load
  next.due = now + Math.round(days * fuzz * DAY);
  return next;
}

export function isDue(item, now = Date.now()) {
  return !!item && item.seen > 0 && item.due <= now;
}

/** 0..1 how well this item is known */
export function strength(item) {
  if (!item || !item.seen) return 0;
  return Math.min(item.box, MASTERED_BOX) / MASTERED_BOX;
}
