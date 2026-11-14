// Daily quests: three small goals, the same all day, chosen from a pool by date.
import { seeded } from './random.js';

export const QUEST_POOL = [
  { id: 'answer10', text: 'Answer 10 questions', emoji: '✍️', stat: 'answered', goal: 10 },
  { id: 'answer20', text: 'Answer 20 questions', emoji: '📝', stat: 'answered', goal: 20 },
  { id: 'right8', text: 'Get 8 answers right', emoji: '✅', stat: 'right', goal: 8 },
  { id: 'combo5', text: 'Hit a 5× combo', emoji: '🔥', stat: 'bestCombo', goal: 5 },
  { id: 'lesson1', text: 'Finish a lesson', emoji: '📖', stat: 'lessons', goal: 1 },
  { id: 'lesson2', text: 'Finish 2 lessons', emoji: '📚', stat: 'lessons', goal: 2 },
  { id: 'cards8', text: 'Review 8 flashcards', emoji: '🃏', stat: 'cards', goal: 8 },
  { id: 'stars3', text: 'Earn 3 stars', emoji: '⭐', stat: 'stars', goal: 3 },
  { id: 'bolt', text: 'Play the Daily Bolt', emoji: '⚡', stat: 'bolt', goal: 1 },
];

export function questsFor(dayKey) {
  const rand = seeded('quests-' + dayKey);
  const pool = [...QUEST_POOL];
  const picked = [];
  const usedStats = new Set();
  while (picked.length < 3 && pool.length) {
    const q = pool.splice(Math.floor(rand() * pool.length), 1)[0];
    if (usedStats.has(q.stat)) continue;
    usedStats.add(q.stat);
    picked.push(q);
  }
  return picked;
}

export function emptyDayStats() {
  return { answered: 0, right: 0, bestCombo: 0, lessons: 0, cards: 0, stars: 0, bolt: 0 };
}

export function questProgress(quest, stats) {
  return Math.min(quest.goal, stats[quest.stat] ?? 0);
}

export function isQuestDone(quest, stats) {
  return questProgress(quest, stats) >= quest.goal;
}
