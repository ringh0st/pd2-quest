// Daily Bolt ⚡: the same 5 mixed questions all day. Coins the first time each day; replay just for fun.
import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { allQuestions } from '../data/index.js';
import { useStore, finishBolt, earn, checkBadges, getState } from '../state/store.js';
import { seeded } from '../game/random.js';
import { shuffle } from '../engine/session.js';
import { COINS } from '../game/economy.js';
import { dayKey } from '../engine/dates.js';
import { PracticeRunner } from '../components/PracticeRunner.jsx';
import { Zap } from '../components/game/Zap.jsx';
import { Stars } from '../components/game/Stars.jsx';
import { go } from '../hooks/useRoute.js';
import { useFeedback } from '../components/Feedback.jsx';
import { useReducedMotion } from '../hooks/useMotionPrefs.js';
import { totalLessons } from '../state/selectors.js';
import { sfx } from '../audio/sfx.js';
import { useHoldCelebrations } from '../hooks/useFocusMode.js';

/** Same 5 for everyone today: 2 warm-ups from the first worlds, then 3 from anywhere, easiest first. */
export function boltQuestions(day) {
  const rand = seeded('bolt-' + day);
  const warm = shuffle(allQuestions.filter((q) => ['fund', 'auto'].includes(q.section) && (q.difficulty ?? 2) <= 2), rand).slice(0, 2);
  const rest = shuffle(allQuestions.filter((q) => !warm.includes(q)), rand).slice(0, 3);
  return [...warm, ...rest.sort((a, b) => (a.difficulty ?? 2) - (b.difficulty ?? 2))];
}

export function Bolt() {
  const today = dayKey();
  const bolt = useStore((s) => s.bolt);
  const questions = useMemo(() => boltQuestions(today), [today]);
  const playedToday = bolt.day === today;
  const [phase, setPhase] = useState(playedToday ? 'done' : 'intro');
  const [result, setResult] = useState(playedToday ? { right: bolt.score, coins: 0, replay: true } : null);
  const { celebrate } = useFeedback();
  const reduced = useReducedMotion();
  useHoldCelebrations(phase === 'done' && !!result && !result.replay);

  const done = (r) => {
    const first = getState().bolt.day !== today;
    const coins = first ? COINS.dailyBolt + r.firstRight * 4 : 0;
    finishBolt(r.firstRight, coins);
    earn(10);
    checkBadges({ totalLessons: totalLessons() });
    if (r.firstRight >= 4) celebrate(50);
    sfx.levelUp();
    setResult({ right: r.firstRight, coins, replay: !first });
    setPhase('done');
  };

  if (phase === 'run') {
    return (
      <main className="screen focus" id="main">
        <h1 className="sr-only">Daily Bolt</h1>
        <PracticeRunner questions={questions} requeue={false} helpers onExit={() => go('/')} onDone={done} />
      </main>
    );
  }

  const stars = result ? (result.right >= 5 ? 3 : result.right >= 4 ? 2 : result.right >= 2 ? 1 : 0) : 0;
  return (
    <main className="screen focus" id="main" style={{ justifyContent: 'center' }}>
      <div className="topbar" style={{ position: 'absolute', top: 'calc(12px + var(--safe-t))', left: 16 }}>
        <button className="icon-btn" onClick={() => go('/')} aria-label="Close Daily Bolt">✕</button>
      </div>
      <motion.div className="celebrate-card bolt-card" style={{ margin: '0 auto' }} initial={reduced ? { opacity: 0 } : { scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 380, damping: 20 }}>
        <motion.div className="big-emoji" aria-hidden="true" animate={reduced ? {} : { rotate: [0, -12, 12, 0], scale: [1, 1.2, 1] }} transition={{ duration: 0.8 }}>⚡</motion.div>
        <h1>Daily Bolt</h1>
        {phase === 'intro' ? (
          <>
            <p>5 surprise questions, warm-ups first. Same for everyone today.</p>
            <p className="small muted">🪙 {COINS.dailyBolt} + 4 per right answer · counts toward Bolt Chaser badge</p>
            <Zap mood="cheer" size={70} />
            <button className="btn primary block big" autoFocus onClick={() => { sfx.tap(); setPhase('run'); }}>Strike! ⚡</button>
          </>
        ) : (
          <>
            <Stars count={stars} size={40} animateIn={!result.replay || !!result.coins} />
            <p><strong>{result.right}/5</strong> right {result.right === 5 ? '🎯' : ''}</p>
            {result.coins > 0 ? <span className="chip gold">🪙 +{result.coins}</span> : <p className="small muted">Today’s coins collected. New Bolt tomorrow!</p>}
            <button className="btn primary block" autoFocus onClick={() => go('/')}>Back home</button>
            <button className="btn block" onClick={() => setPhase('run')}>Replay for fun</button>
          </>
        )}
      </motion.div>
    </main>
  );
}

