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
import { Icon } from '../icons/Icon.jsx';

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
        <h2 id="quests-title" className="ic-label" style={{ fontSize: 'calc(18px * var(--text-scale))' }}><span className="ic-flame"><Icon name="target" /></span>Daily quests</h2>
        <span className={`chip${doneCount === 3 ? ' gold' : ''}`} aria-label={`${doneCount} of 3 claimed`}>{doneCount === 3 ? <><Icon name="gift" /> Done!</> : `${doneCount}/3`}</span>
      </div>
      <ul className="list-plain stack-s">
        {quests.map((q) => {
          const p = questProgress(q, stats);
          const done = isQuestDone(q, stats);
          const got = claimed.includes(q.id);
          return (
            <li key={q.id} className={`quest ${got ? 'claimed' : ''}`}>
              <span className={`ic-tile ${got ? 'correct' : done ? 'gold' : 'muted'}`}><Icon name={got ? 'check' : q.icon} strokeWidth={got ? 3 : 2.25} /></span>
              <div className="grow stack-s" style={{ gap: 4 }}>
                <div className="spread small quest-head"><span>{q.text}</span><span className="muted quest-count">{got ? 'Claimed' : `${p}/${q.goal}`}</span></div>
                <div className="bar gold" role="progressbar" aria-label={q.text} aria-valuemin={0} aria-valuemax={q.goal} aria-valuenow={p}><span style={{ width: `${Math.max(3, (p / q.goal) * 100)}%` }} /></div>
              </div>
              {done && !got && (
                <motion.button
                  className="btn gold small quest-claim" aria-label={`Claim ${COINS.dailyQuest} coins for: ${q.text}`} animate={reduced ? {} : { scale: [1, 1.08, 1] }} transition={{ duration: 0.9, repeat: 3 }}
                  onClick={() => { claimQuest(q, { coins: COINS.dailyQuest, bonus: COINS.allQuestsBonus }); sfx.quest(); haptic('success'); celebrate(30); showToast(`+${COINS.dailyQuest} coins!`, 'coin'); }}
                >Claim <Icon name="coin" /> {COINS.dailyQuest}</motion.button>
              )}
            </li>
          );
        })}
      </ul>
      {doneCount < 3 && <p className="small muted ic-label quest-foot"><Icon name="gift" />Finish all 3 for a bonus chest (+{COINS.allQuestsBonus} coins).</p>}
    </section>
  );
}
