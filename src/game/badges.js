// Badges: milestones only, checked from saved state (nothing extra to keep in sync).
// Art: BadgeMedal draws each one from `shape` (rosette | shield | hex | star), `tone` (its colour pair)
// and `icon` (an Icon name for the central glyph). Unearned badges are greyed with a lock.
// Tests get the current exam's numbers in `c` (state/selectors.js badgeContext): totalLessons, worlds,
// passing (pass mark %) and fullLength (questions in a full mock), so every exam's badges fit it.
import { totalStars } from './worlds.js';

export const BADGES = [
  { id: 'first-lesson', icon: 'book', tone: 'mint', shape: 'rosette', name: 'First steps', about: 'Finish your first lesson', test: (s) => Object.keys(s.lessons).length >= 1 },
  { id: 'ten-lessons', icon: 'library', tone: 'teal', shape: 'rosette', name: 'Bookworm', about: 'Finish 10 lessons', test: (s) => Object.keys(s.lessons).length >= 10 },
  { id: 'all-lessons', icon: 'wand', tone: 'plum', shape: 'star', name: 'Grand scholar', about: 'Finish every lesson', test: (s, c) => Object.keys(s.lessons).length >= c.totalLessons },
  { id: 'combo5', icon: 'flame', tone: 'flame', shape: 'rosette', name: 'On fire', about: 'Hit a 5× combo', test: (s) => s.bestCombo >= 5 },
  { id: 'combo10', icon: 'trend', tone: 'berry', shape: 'star', name: 'Unstoppable', about: 'Hit a 10× combo', test: (s) => s.bestCombo >= 10 },
  { id: 'streak3', icon: 'sprout', tone: 'mint', shape: 'hex', name: 'Habit sprout', about: '3-day streak', test: (s) => s.streak.best >= 3 },
  { id: 'streak7', icon: 'leaf', tone: 'teal', shape: 'hex', name: 'Week warrior', about: '7-day streak', test: (s) => s.streak.best >= 7 },
  { id: 'streak30', icon: 'mountain', tone: 'steel', shape: 'hex', name: 'Mountain mind', about: '30-day streak', test: (s) => s.streak.best >= 30 },
  { id: 'boss1', icon: 'swords', tone: 'berry', shape: 'shield', name: 'Boss slayer', about: 'Beat your first Boss', test: (s) => Object.keys(s.stars).some((k) => k.endsWith('-boss')) },
  { id: 'boss5', icon: 'crown', tone: 'gold', shape: 'shield', name: 'Boss legend', about: 'Beat every world’s Boss', test: (s, c) => Object.keys(s.stars).filter((k) => k.endsWith('-boss')).length >= c.worlds },
  { id: 'stars30', icon: 'star', tone: 'gold', shape: 'rosette', name: 'Star collector', about: 'Collect 30 stars', test: (s) => totalStars(s.stars) >= 30 },
  { id: 'stars100', icon: 'sparkles', tone: 'plum', shape: 'star', name: 'Galaxy brain', about: 'Collect 100 stars', test: (s) => totalStars(s.stars) >= 100 },
  { id: 'q100', icon: 'target', tone: 'flame', shape: 'rosette', name: 'Century', about: 'Answer 100 questions', test: (s) => Object.values(s.items).reduce((n, i) => n + i.right + i.wrong, 0) >= 100 },
  { id: 'mock', icon: 'exam', tone: 'teal', shape: 'shield', name: 'Mock passer', about: 'Pass a mock exam', test: (s, c) => s.exams.some((e) => e.score >= c.passing) },
  { id: 'mock85', icon: 'rocket', tone: 'rose', shape: 'shield', name: 'Ready for launch', about: 'Score 85%+ on a full mock', test: (s, c) => s.exams.some((e) => e.score >= 85 && e.total >= c.fullLength) },
  { id: 'shopper', icon: 'shirt', tone: 'rose', shape: 'rosette', name: 'Fashion dev', about: 'Buy something in the shop', test: (s) => s.owned.length > 0 },
  { id: 'parker', icon: 'park', tone: 'steel', shape: 'rosette', name: 'Thought parker', about: 'Park a distracting thought', test: (s) => s.parkedEver > 0 },
  { id: 'bolt7', icon: 'bolt', tone: 'gold', shape: 'star', name: 'Bolt chaser', about: 'Play the Daily Bolt 7 times', test: (s) => (s.boltCount ?? 0) >= 7 },
];

/** Badges newly earned by this state. */
export function newBadges(state, ctx) {
  return BADGES.filter((b) => !state.badges[b.id] && b.test(state, ctx));
}
