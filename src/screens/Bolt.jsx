// Daily Bolt: the same 5 mixed questions all day. Coins the first time each day; replay just for fun.
import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { allQuestions, sections, studiedSections } from '../data/index.js';
import { track } from '../lib/track.js';
import { useStore, finishBolt, earn, checkBadges, getState } from '../state/store.js';
import { seeded } from '../game/random.js';
import { shuffle } from '../engine/session.js';
import { COINS } from '../game/economy.js';
import { dayKey } from '../engine/dates.js';
import { PracticeRunner } from '../components/PracticeRunner.jsx';
import { RewardCoins } from '../components/game/RewardCoins.jsx';
import { Stars } from '../components/game/Stars.jsx';
import { go } from '../hooks/useRoute.js';
import { useFeedback } from '../components/Feedback.jsx';
import { useReducedMotion, useCalm } from '../hooks/useMotionPrefs.js';
import { Icon } from '../components/icons/Icon.jsx';
import { HeroArt } from '../components/art/HeroArt.jsx';
import { badgeContext } from '../state/selectors.js';
import { sfx } from '../audio/sfx.js';
import { useHoldCelebrations } from '../hooks/useFocusMode.js';
import { useStudyScreen } from '../hooks/useStudyScreen.js';
import { BreakCard } from '../components/BreakCard.jsx';

/** Same 5 for everyone today: 2 warm-ups from the first two worlds, then 3 from anywhere, easiest first. */
export function boltQuestions(day) {
  const rand = seeded('bolt-' + day);
  const studied = track.lang ? new Set(studiedSections(getState().lessons).flatMap((s) => s.questions.map((q) => q.id))) : null;
  // mock-only questions stay fresh for mocks; a language track only asks about lessons you've done
  const pool = allQuestions.filter((q) => !q.mockOnly && (!studied || studied.has(q.id)));
  const firstWorlds = sections.slice(0, 2).map((s) => s.id);
  const warm = shuffle(pool.filter((q) => firstWorlds.includes(q.section) && (q.difficulty ?? 2) <= 2), rand).slice(0, 2);
  const rest = shuffle(pool.filter((q) => !warm.includes(q)), rand).slice(0, 3);
  return [...warm, ...rest.sort((a, b) => (a.difficulty ?? 2) - (b.difficulty ?? 2))];
}

export function Bolt() {
  useStudyScreen();
  const today = dayKey();
  const bolt = useStore((s) => s.bolt);
  const questions = useMemo(() => boltQuestions(today), [today]);
  const playedToday = bolt.day === today;
  const [phase, setPhase] = useState(playedToday ? 'done' : 'intro');
  const [result, setResult] = useState(playedToday ? { right: bolt.score, coins: 0, replay: true } : null);
  const { celebrate } = useFeedback();
  const reduced = useReducedMotion();
  const calm = useCalm();
  const still = reduced || calm;
  useHoldCelebrations(phase === 'done' && !!result && !result.replay);

  const done = (r) => {
    const first = getState().bolt.day !== today;
    const coins = first ? COINS.dailyBolt + r.firstRight * 4 : 0;
    finishBolt(r.firstRight, coins);
    earn(10);
    checkBadges(badgeContext());
    if (r.firstRight >= 4) celebrate(50);
    sfx.levelUp();
    setResult({ right: r.firstRight, coins, replay: !first });
    setPhase('done');
  };

  if (phase === 'run') {
    return (
      <main className="screen focus" id="main">
        <h1 className="sr-only">Daily Bolt</h1>
        <PracticeRunner questions={questions} requeue={false} helpers onExit={(to) => go(to ?? '/')} onDone={done} />
      </main>
    );
  }

  const stars = result ? (result.right >= 5 ? 3 : result.right >= 4 ? 2 : result.right >= 2 ? 1 : 0) : 0;
  return (
    <main className="screen focus bolt-screen" id="main">
      <div className="topbar">
        <button className="icon-btn" onClick={() => go('/')} aria-label="Close Daily Bolt"><Icon name="close" /></button>
      </div>
      <motion.div className="celebrate-card bolt-card" initial={reduced ? { opacity: 0 } : { scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 380, damping: 20 }}>
        {phase === 'intro' || stars < 3
          ? (
            <motion.div
              className="ic-tile xl gold bolt-tile"
              initial={still ? false : { scale: 0.4, rotate: -20 }}
              animate={still ? { scale: 1, rotate: 0 } : { scale: [null, 1.15, 1], rotate: [null, 12, -8, 0] }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            ><Icon name="bolt" fill strokeWidth={1.8} /></motion.div>
          )
          : <HeroArt kind="star" size={104} />}
        <h1>Daily Bolt</h1>
        {phase === 'intro' ? (
          <>
            <p>5 surprise questions, warm-ups first. Same for everyone today.</p>
            <p className="small muted bolt-reward"><span className="ic-label"><span className="ic-gold"><Icon name="coin" /></span>{COINS.dailyBolt} coins + 4 per right answer</span><span>Counts toward the Bolt Chaser badge</span></p>
            <button className="btn primary block big" autoFocus onClick={() => { sfx.tap(); setPhase('run'); }}><Icon name="bolt" fill /> Strike!</button>
          </>
        ) : (
          <>
            <Stars count={stars} size={40} animateIn={!result.replay || !!result.coins} />
            <p className="ic-label"><strong>{result.right}/5</strong> right{result.right === 5 && <span className="ic-ok"><Icon name="target" label="Perfect" /></span>}</p>
            {result.coins > 0 ? <RewardCoins coins={result.coins} delay={900} /> : <p className="small muted">Today’s coins collected. New Bolt tomorrow!</p>}
            <BreakCard />
            <button className="btn primary block" autoFocus onClick={() => go('/')}>Back home</button>
            <button className="btn block" onClick={() => setPhase('run')}>Replay for fun</button>
          </>
        )}
      </motion.div>
    </main>
  );
}

