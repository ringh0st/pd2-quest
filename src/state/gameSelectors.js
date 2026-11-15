// Game views over content + saved progress: levels, what's next, world locks.
import { sections } from '../data/index.js';
import { levelsFor, isLevelOpen, isWorldOpen } from '../game/worlds.js';

// No prototype: a URL id like "constructor" must not resolve to anything.
const table = (entries) => Object.assign(Object.create(null), Object.fromEntries(entries));
export const worldLevels = table(sections.map((s) => [s.id, levelsFor(s)]));
export const levelById = table(
  sections.flatMap((s) => worldLevels[s.id].map((l, i) => [l.id, { ...l, index: i }])),
);

export function levelOpen(levelId, stars) {
  const l = levelById[levelId];
  return !!l && isLevelOpen(worldLevels[l.world], l.index, stars);
}

/** The level after this one: next in the world, else the first level of the next world. */
export function nextLevelAfter(levelId) {
  const l = levelById[levelId];
  if (!l) return null;
  const list = worldLevels[l.world];
  if (l.index + 1 < list.length) return list[l.index + 1];
  const wi = sections.findIndex((s) => s.id === l.world);
  const nextWorld = sections[wi + 1];
  return nextWorld ? worldLevels[nextWorld.id][0] : null;
}

/** First playable level with no stars, in the open worlds, in order. */
export function continueLevel(stars, unlocked) {
  for (const s of sections) {
    if (!isWorldOpen(s.id, stars, unlocked)) continue;
    const list = worldLevels[s.id];
    const i = list.findIndex((l, k) => !(stars[l.id] > 0) && isLevelOpen(list, k, stars));
    if (i >= 0) return list[i];
  }
  return null;
}

/** Every level in path order across all worlds. */
export const allLevels = sections.flatMap((s) => worldLevels[s.id]);

/** Every level has at least one star. */
export function mapCleared(stars) {
  return sections.every((s) => worldLevels[s.id].every((l) => stars[l.id] > 0));
}

/** First level that is not yet at 3 stars (for "keep your crowns" after the map is cleared). */
export function firstImperfectLevel(stars) {
  for (const s of sections) {
    const l = worldLevels[s.id].find((x) => (stars[x.id] ?? 0) < 3);
    if (l) return l;
  }
  return null;
}

export function routeForLevel(level) {
  if (!level) return '/map';
  return level.kind === 'lesson' ? `/lesson/${level.lessonId}` : `/play/${level.id}`;
}
