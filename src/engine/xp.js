// XP and levels. Early levels come fast (quick dopamine), later ones slow down gently.
export const XP = {
  correct: 10,
  firstTry: 5,       // bonus the first time a question is answered right
  wrongTry: 2,       // effort counts: a miss still earns a little, XP is never taken away
  lessonCard: 1,
  lessonDone: 15,
  flashcard: 4,
  roundDone: 10,
  sprintDone: 25,
  examQuestion: 2,
  examPass: 100,
};

/** Combo multiplier: 3 in a row ×1.25, 5 ×1.5, 10+ ×2 */
export function comboMultiplier(combo) {
  if (combo >= 10) return 2;
  if (combo >= 5) return 1.5;
  if (combo >= 3) return 1.25;
  return 1;
}

/** total XP needed to reach level n (level 1 = 0). Step n→n+1 costs 100 + 50(n−1). */
export function xpForLevel(n) {
  return 25 * (n - 1) * (n + 2);
}

export function levelFor(totalXp) {
  let n = 1;
  while (xpForLevel(n + 1) <= totalXp) n++;
  const base = xpForLevel(n);
  const next = xpForLevel(n + 1);
  return { level: n, into: totalXp - base, span: next - base, progress: (totalXp - base) / (next - base) };
}

export function answerXp(correct, combo, firstTime = false) {
  if (!correct) return XP.wrongTry;
  return Math.round((XP.correct + (firstTime ? XP.firstTry : 0)) * comboMultiplier(combo));
}

// Rank titles by level. Each exam can name its own in exam.json (`ranks`, same [level, title] shape).
export const RANKS = [
  [1, 'Trailhead Rookie'],
  [3, 'Quick Learner'],
  [5, 'Steady Climber'],
  [7, 'Rising Star'],
  [9, 'Problem Solver'],
  [12, 'Exam Explorer'],
  [15, 'Certified Mind'],
  [19, 'Salesforce Sage'],
  [24, 'Quest Legend'],
];
export function rankFor(level, ranks = RANKS) {
  let name = ranks[0][1];
  for (const [lv, title] of ranks) if (level >= lv) name = title;
  return name;
}
