// The adventure: each exam section is a themed world with lessons, Hard challenges and a Boss.

export const WORLD_THEMES = {
  fund: {
    name: 'Sharing Shrine',
    sky: ['#FFE3EC', '#FFF4E0'], skyDark: ['#2A1630', '#1A1424'],
    boss: { name: 'The Sharing Sphinx', taunt: 'Who can see this record? Answer, or be locked out forever!', defeat: 'Fine… your access is… granted.' },
  },
  auto: {
    name: 'Async Forge',
    sky: ['#FFE6D6', '#FFF6E8'], skyDark: ['#2E1A12', '#1C1418'],
    boss: { name: 'The Recursion Hydra', taunt: 'Cut off one trigger and two more fire!', defeat: 'Static Set<Id>… my one weakness…' },
  },
  ui: {
    name: 'Pixel Bay',
    sky: ['#DDF6F1', '#FFF8EC'], skyDark: ['#0F2A2A', '#141A22'],
    boss: { name: 'The Re-render Kraken', taunt: 'I will re-render your component… forever!', defeat: 'You used a guard flag?! Blub…' },
  },
  test: {
    name: 'Bug Swamp',
    sky: ['#E6F5D8', '#FFF8EA'], skyDark: ['#1A2616', '#16181A'],
    boss: { name: 'The Flaky Test Toad', taunt: 'Sometimes I pass, sometimes I fail. Ribbit!', defeat: 'You mocked my callouts… croak.' },
  },
  perf: {
    name: 'Turbo Peaks',
    sky: ['#E8EEFF', '#FFF6EE'], skyDark: ['#171C2E', '#141420'],
    boss: { name: 'The Governor', taunt: '101 SOQL queries? LIMIT EXCEPTION!', defeat: 'Bulkified… I am… defeated.' },
  },
};

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
  out.push({ id: `${section.id}-boss`, kind: 'boss', title: WORLD_THEMES[section.id]?.boss.name ?? 'Boss', world: section.id });
  return out;
}

/** A level is open when the one before it has a star, or it has stars itself (e.g. tested out). The first is always open. */
export function isLevelOpen(levels, index, stars) {
  return index === 0 || (stars[levels[index - 1].id] ?? 0) > 0 || (stars[levels[index].id] ?? 0) > 0;
}

export const WORLD_UNLOCK_STARS = { fund: 0, auto: 6, ui: 15, test: 25, perf: 35 };
export const WORLD_UNLOCK_COINS = 60; // or skip ahead with coins

export function totalStars(stars) {
  return Object.values(stars).reduce((a, b) => a + b, 0);
}

export function isWorldOpen(worldId, stars, unlocked = []) {
  return unlocked.includes(worldId) || totalStars(stars) >= (WORLD_UNLOCK_STARS[worldId] ?? 0);
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
