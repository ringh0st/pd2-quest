// Badges: milestones only, checked from saved state (nothing extra to keep in sync).
import { totalStars } from './worlds.js';

export const BADGES = [
  { id: 'first-lesson', emoji: '🐣', name: 'First steps', about: 'Finish your first lesson', test: (s) => Object.keys(s.lessons).length >= 1 },
  { id: 'ten-lessons', emoji: '📚', name: 'Bookworm', about: 'Finish 10 lessons', test: (s) => Object.keys(s.lessons).length >= 10 },
  { id: 'all-lessons', emoji: '🧙', name: 'Grand scholar', about: 'Finish every lesson', test: (s, c) => Object.keys(s.lessons).length >= c.totalLessons },
  { id: 'combo5', emoji: '🔥', name: 'On fire', about: 'Hit a 5× combo', test: (s) => s.bestCombo >= 5 },
  { id: 'combo10', emoji: '☄️', name: 'Unstoppable', about: 'Hit a 10× combo', test: (s) => s.bestCombo >= 10 },
  { id: 'streak3', emoji: '🌱', name: 'Habit sprout', about: '3-day streak', test: (s) => s.streak.best >= 3 },
  { id: 'streak7', emoji: '🌳', name: 'Week warrior', about: '7-day streak', test: (s) => s.streak.best >= 7 },
  { id: 'streak30', emoji: '🏔️', name: 'Mountain mind', about: '30-day streak', test: (s) => s.streak.best >= 30 },
  { id: 'boss1', emoji: '⚔️', name: 'Boss slayer', about: 'Beat your first Boss', test: (s) => Object.keys(s.stars).some((k) => k.endsWith('-boss')) },
  { id: 'boss5', emoji: '🏆', name: 'Legend of the five', about: 'Beat all 5 Bosses', test: (s) => Object.keys(s.stars).filter((k) => k.endsWith('-boss')).length >= 5 },
  { id: 'stars30', emoji: '⭐', name: 'Star collector', about: 'Collect 30 stars', test: (s) => totalStars(s.stars) >= 30 },
  { id: 'stars100', emoji: '🌟', name: 'Galaxy brain', about: 'Collect 100 stars', test: (s) => totalStars(s.stars) >= 100 },
  { id: 'q100', emoji: '💯', name: 'Century', about: 'Answer 100 questions', test: (s) => Object.values(s.items).reduce((n, i) => n + i.right + i.wrong, 0) >= 100 },
  { id: 'mock', emoji: '🎓', name: 'Mock passer', about: 'Pass a mock exam', test: (s) => s.exams.some((e) => e.score >= 70) },
  { id: 'mock85', emoji: '🚀', name: 'Ready for launch', about: 'Score 85%+ on a full mock', test: (s) => s.exams.some((e) => e.score >= 85 && e.total >= 60) },
  { id: 'shopper', emoji: '🛍️', name: 'Fashion dev', about: 'Buy something in the shop', test: (s) => s.owned.length > 0 },
  { id: 'parker', emoji: '🅿️', name: 'Thought parker', about: 'Park a distracting thought', test: (s) => s.parkedEver > 0 },
  { id: 'bolt7', emoji: '⚡', name: 'Bolt chaser', about: 'Play the Daily Bolt 7 times', test: (s) => (s.boltCount ?? 0) >= 7 },
];

/** Badges newly earned by this state. */
export function newBadges(state, ctx) {
  return BADGES.filter((b) => !state.badges[b.id] && b.test(state, ctx));
}
