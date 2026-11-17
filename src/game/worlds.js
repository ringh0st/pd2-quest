// The adventure: each exam section is a themed world with lessons, Hard challenges and a Boss.
import { track } from '../lib/track.js';

// How each world looks, by section id (its emblem and Boss art are keyed the same way). Names and Bosses are
// content: each exam names its worlds in src/data/<exam>/exam.json (`worlds`), so the same look can carry
// different names in different exams.
export const WORLD_STYLES = {
  fund: { sky: ['#FFE3EC', '#FFF4E0'], skyDark: ['#2B1A1C', '#1B1614'] },
  auto: { sky: ['#FFE6D6', '#FFF6E8'], skyDark: ['#2E1D12', '#1C1612'] },
  ui: { sky: ['#DDF6F1', '#FFF8EC'], skyDark: ['#14261F', '#161A16'] },
  test: { sky: ['#E6F5D8', '#FFF8EA'], skyDark: ['#1D2616', '#171713'] },
  perf: { sky: ['#E8EEFF', '#FFF6EE'], skyDark: ['#26221C', '#171412'] },
};
const FALLBACK_WORLD = { name: 'World', boss: { name: 'The Boss', taunt: 'Answer me this!', defeat: 'You win… this time.' } };

/** A world's look plus its name and Boss from the exam's content (`section.world`). */
export function worldTheme(section) {
  return { ...WORLD_STYLES.fund, ...WORLD_STYLES[section?.look ?? section?.id], ...FALLBACK_WORLD, ...section?.world };
}

export const HARD_EVERY = 3;          // a Hard challenge after every 3 lessons
export const HARD_SIZE = 5;
export const BOSS_HP = 8;             // correct answers needed to win
export const BOSS_HEARTS = 3;

/** Ordered levels of one world: lessons, a Hard challenge every 3 lessons, then the Boss. */
export function levelsFor(section) {
  const out = [];
  let hard = 0;
  section.lessons.forEach((lesson, i) => {
    out.push({ id: lesson.id, kind: 'lesson', lessonId: lesson.id, title: lesson.title, minutes: lesson.minutes, world: section.id });
    const isLast = i === section.lessons.length - 1;
    if ((i + 1) % HARD_EVERY === 0 && !isLast) {
      hard++;
      const covers = section.lessons.slice(i + 1 - HARD_EVERY, i + 1).map((l) => l.id);
      out.push({ id: `${section.id}-hard-${hard}`, kind: 'hard', title: `Challenge ${hard}`, covers, world: section.id });
    }
  });
  out.push({ id: `${section.id}-boss`, kind: 'boss', title: worldTheme(section).boss.name, world: section.id });
  return out;
}

/** A level is open when the one before it has a star, or it has stars itself (e.g. tested out). The first is always open. */
export function isLevelOpen(levels, index, stars) {
  return index === 0 || (stars[levels[index - 1].id] ?? 0) > 0 || (stars[levels[index].id] ?? 0) > 0;
}

// A world opens by its place on the map (the exam's section order), so every exam's worlds open one by one.
const UNLOCK_STARS_BY_PLACE = [0, 6, 15, 25, 35, 45, 55];
export function worldUnlockStars(worldId, order = track.sections) {
  const place = order.indexOf(worldId);
  return place < 0 ? 0 : UNLOCK_STARS_BY_PLACE[Math.min(place, UNLOCK_STARS_BY_PLACE.length - 1)];
}
export const WORLD_UNLOCK_COINS = 60; // or skip ahead with coins

export function totalStars(stars) {
  return Object.values(stars).reduce((a, b) => a + b, 0);
}

export function isWorldOpen(worldId, stars, unlocked = []) {
  return unlocked.includes(worldId) || totalStars(stars) >= worldUnlockStars(worldId);
}

export function worldStars(section, stars) {
  const lv = levelsFor(section);
  return { got: lv.reduce((n, l) => n + (stars[l.id] ?? 0), 0), max: lv.length * 3 };
}

/** Stars from a result. Lessons always give ≥1 for finishing. Hard needs 3/5. Boss stars = hearts left. */
export function starsFor(kind, { right = 0, total = 0, hearts = 0, won = false } = {}) {
  if (kind === 'boss') return won ? Math.max(1, Math.min(3, hearts)) : 0;
  if (kind === 'hard') {
    if (right >= total) return 3;
    if (right >= total - 1) return 2;
    return right >= Math.ceil(total * 0.6) ? 1 : 0;
  }
  if (!total) return 3;
  if (right >= total) return 3;
  if (right >= total / 2) return 2;
  // Mastery gate: at least one first-try right answer to pass a lesson (its misses were re-asked).
  return right >= 1 ? 1 : 0;
}
