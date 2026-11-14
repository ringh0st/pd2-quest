// Today's three quests with progress bars. Claim each for coins; all three opens a bonus chest.
import { motion } from 'motion/react';
import { useStore, claimQuest } from '../../state/store.js';
import { questsFor, questProgress, isQuestDone, emptyDayStats } from '../../game/quests.js';
import { COINS } from '../../game/economy.js';
import { dayKey } from '../../engine/dates.js';
import { useFeedback } from '../Feedback.jsx';
import { useReducedMotion } from '../../hooks/useMotionPrefs.js';
import { sfx } from '../../audio/sfx.js';
import { haptic } from '../../audio/haptics.js';

export function DailyQuests() {
  const day = useStore((s) => s.day);
  const today = dayKey();
  const stats = day?.key === today ? day.stats : emptyDayStats();
  const claimed = day?.key === today ? day.claimed : [];
  const quests = questsFor(today);
  const { celebrate, showToast } = useFeedback();
  const reduced = useReducedMotion();
  const doneCount = claimed.length;

  return (
    <section className="card stack-s" aria-labelledby="quests-title">
      <div className="spread">
        <h2 id="quests-title" style={{ fontSize: 'calc(18px * var(--text-scale))' }}>🎯 Daily quests</h2>
        <span className="chip" aria-label={`${doneCount} of 3 claimed`}>{doneCount === 3 ? '🎁 Done!' : `${doneCount}/3`}</span>
      </div>
      <ul className="list-plain stack-s">
        {quests.map((q) => {
          const p = questProgress(q, stats);
          const done = isQuestDone(q, stats);
          const got = claimed.includes(q.id);
          return (
            <li key={q.id} className={`quest ${got ? 'claimed' : ''}`}>
              <span className="quest-emoji" aria-hidden="true">{got ? '✅' : q.emoji}</span>
              <div className="grow stack-s" style={{ gap: 4 }}>
                <div className="spread small"><span>{q.text}</span><span className="muted">{p}/{q.goal}</span></div>
                <div className="bar gold" role="progressbar" aria-label={q.text} aria-valuemin={0} aria-valuemax={q.goal} aria-valuenow={p}><span style={{ width: `${Math.max(3, (p / q.goal) * 100)}%` }} /></div>
              </div>
              {done && !got && (
                <motion.button
                  className="btn gold small" animate={reduced ? {} : { scale: [1, 1.08, 1] }} transition={{ duration: 0.9, repeat: 3 }}
                  onClick={() => { claimQuest(q, { coins: COINS.dailyQuest, bonus: COINS.allQuestsBonus }); sfx.chest(); haptic('success'); celebrate(30); showToast(`🪙 +${COINS.dailyQuest} coins!`); }}
                >Claim 🪙{COINS.dailyQuest}</motion.button>
              )}
            </li>
          );
        })}
      </ul>
      {doneCount < 3 && <p className="small muted">Finish all 3 for a 🎁 bonus chest (🪙{COINS.allQuestsBonus}).</p>}
    </section>
  );
}
