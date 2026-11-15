// Study plan from the exam date: what to do today, this week's focus and whether you're on track.
// Pure (no React, no storage) so it can be unit tested. Wording stays kind: "a bit behind", never "failing".
import { daysBetween } from './dates.js';

export const FINAL_DAYS = 7;   // last week: mocks and reviews, no new levels
export const MAX_COMFY = 2;    // levels a day that still feels easy

/**
 * @param {object} o
 * @param {string} o.today          YYYY-MM-DD
 * @param {string} o.examDate       YYYY-MM-DD or ''
 * @param {Array}  o.levels         every level in path order: { id, kind, title, world }
 * @param {object} o.stars          level id -> stars
 * @param {Array}  o.exams          mock history: { at, score, total, timed }
 * @param {number} o.dueReviews     questions due now
 * @param {number} [o.fullLength=60]
 */
export function studyPlan({ today, examDate, levels, stars, exams = [], dueReviews = 0, fullLength = 60 }) {
  const remaining = levels.filter((l) => !(stars[l.id] > 0));
  const fullMocks = exams.filter((e) => e.total >= fullLength && e.timed !== false);
  const todayMock = exams.some((e) => e.at && isSameDay(e.at, today));

  if (!examDate) {
    return { phase: 'no-date', remaining: remaining.length, today: todayTasks({ remaining, dueReviews, perDay: MAX_COMFY, mock: null }) };
  }
  const daysLeft = daysBetween(today, examDate);
  if (daysLeft < 0) return { phase: 'past', daysLeft, remaining: remaining.length, today: [] };

  const learnDays = Math.max(1, daysLeft - FINAL_DAYS);
  const final = daysLeft <= FINAL_DAYS;
  const perDay = final ? 0 : Math.ceil(remaining.length / learnDays);

  // Mocks: a Mini check halfway through the learning days, then full mocks in the final week.
  let mock = null;
  if (final && !todayMock && fullMocks.length < 3 && daysLeft >= 1) mock = { kind: 'full', label: 'Full mock exam (timed)', to: '/exam' };
  else if (!final && remaining.length <= levels.length / 2 && exams.length === 0) mock = { kind: 'mini', label: 'Mini mock: a halfway check', to: '/exam' };

  const status = final
    ? (remaining.length ? 'final-catchup' : 'final')
    : perDay <= MAX_COMFY ? 'on-track' : perDay <= MAX_COMFY + 2 ? 'bit-behind' : 'tight';

  return {
    phase: final ? 'final' : 'learn',
    daysLeft,
    remaining: remaining.length,
    perDay,
    status,
    today: todayTasks({ remaining: final ? remaining.slice(0, 1) : remaining, dueReviews, perDay: final ? 1 : Math.max(1, perDay), mock }),
    weeks: weeklyPlan({ remaining, daysLeft, learnDays, perDay }),
  };
}

function isSameDay(ts, dayKey) {
  const d = new Date(ts);
  const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  return k === dayKey;
}

function todayTasks({ remaining, dueReviews, perDay, mock }) {
  const tasks = [];
  const next = remaining.slice(0, perDay);
  if (next.length) {
    tasks.push({
      kind: 'levels',
      label: next.length === 1 ? next[0].title : `${next.length} levels: ${next[0].title} + ${next.length - 1} more`,
      level: next[0],
    });
  }
  if (dueReviews > 0) tasks.push({ kind: 'reviews', label: dueReviews > 10 ? '5-minute review catch-up' : `${dueReviews} quick review${dueReviews === 1 ? '' : 's'}`, to: '/sprint?mode=review' });
  if (mock) tasks.push({ kind: 'mock', label: mock.label, to: mock.to });
  return tasks.slice(0, 3);
}

/** Weeks until the exam: which worlds each week covers, then the final mock week. */
export function weeklyPlan({ remaining, daysLeft, learnDays, perDay }) {
  const weeks = [];
  const learnWeeks = Math.max(0, Math.ceil(Math.min(learnDays, Math.max(0, daysLeft - FINAL_DAYS)) / 7));
  let k = 0;
  for (let w = 0; w < learnWeeks && k < remaining.length; w++) {
    const chunk = remaining.slice(k, k + perDay * 7);
    k += chunk.length;
    weeks.push({ week: w + 1, kind: 'learn', levels: chunk.length, worlds: [...new Set(chunk.map((l) => l.world))], bosses: chunk.filter((l) => l.kind === 'boss').length });
  }
  if (daysLeft > 0) weeks.push({ week: weeks.length + 1, kind: 'final', levels: 0, worlds: [], bosses: 0 });
  return weeks;
}
