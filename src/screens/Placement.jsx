// Placement: "I already know some of this." A world check (one question per lesson) or a single-lesson test-out.
// Routes: #/placement/<worldId>  and  #/placement/lesson/<lessonId>
import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { sectionById, lessonById, themeOf } from '../data/index.js';
import { isWorldOpen } from '../game/worlds.js';
import { placementQuestions, placementResult, testOutQuestions, testOutPassed, PLACEMENT_UNLOCK, TEST_OUT_SIZE } from '../game/placement.js';
import { useStore, testOut } from '../state/store.js';
import { PracticeRunner } from '../components/PracticeRunner.jsx';
import { Zap } from '../components/game/Zap.jsx';
import { go } from '../hooks/useRoute.js';
import { useReducedMotion } from '../hooks/useMotionPrefs.js';
import { useHoldCelebrations } from '../hooks/useFocusMode.js';
import { sfx } from '../audio/sfx.js';
import { Icon } from '../components/icons/Icon.jsx';
import { HeroArt } from '../components/art/HeroArt.jsx';
import { WorldEmblem } from '../components/art/WorldEmblem.jsx';
import { haptic } from '../audio/haptics.js';
import { useStudyScreen } from '../hooks/useStudyScreen.js';

export function Placement({ a, b }) {
  useStudyScreen();
  const lessonMode = a === 'lesson';
  const lesson = lessonMode ? lessonById[b] : null;
  const section = lessonMode ? (lesson ? sectionById[lesson.section] : null) : sectionById[a];
  const stars = useStore((s) => s.stars);
  const unlocked = useStore((s) => s.unlockedWorlds);
  const [phase, setPhase] = useState('intro'); // intro | run | done
  const [outcome, setOutcome] = useState(null);
  const reduced = useReducedMotion();
  useHoldCelebrations(phase !== 'intro');

  const questions = useMemo(() => {
    if (!section) return [];
    return lessonMode ? (lesson ? testOutQuestions(section, lesson) : []) : placementQuestions(section, `placement-${Date.now()}`);
  }, [section, lesson, lessonMode]);

  if (!section || (lessonMode && !lesson) || !questions.length) {
    return <main className="screen" id="main"><h1>Not found</h1><button className="btn" onClick={() => go('/map')}>Back to the map</button></main>;
  }
  const theme = themeOf(section.id);
  const back = lessonMode ? `/lesson/${lesson.id}` : `/world/${section.id}`;
  const wasLocked = !isWorldOpen(section.id, stars, unlocked);

  const finish = (r) => {
    if (lessonMode) {
      const passed = testOutPassed(r.firstAnswers);
      if (passed) testOut([lesson.id]);
      setOutcome({ passed, right: r.firstRight, total: r.total });
    } else {
      const res = placementResult(questions, r.firstAnswers);
      testOut(res.proven, { worldId: section.id, unlock: res.unlocks, score: res.score });
      setOutcome({ ...res, right: r.firstRight, total: r.total });
    }
    sfx.levelUp(); haptic('success');
    setPhase('done');
  };

  if (phase === 'run') {
    return (
      <main className="screen focus" id="main">
        <h1 className="sr-only">{lessonMode ? `Test out: ${lesson.title}` : `Placement check: ${theme.name}`}</h1>
        <PracticeRunner questions={questions} requeue={false} onExit={() => go(back)} onDone={finish} />
      </main>
    );
  }

  if (phase === 'done') {
    const good = lessonMode ? outcome.passed : outcome.proven.length > 0;
    return (
      <main className="screen focus" id="main" style={{ justifyContent: 'center' }}>
        <motion.div className="celebrate-card stack" style={{ margin: '0 auto' }} initial={reduced ? false : { scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <Zap mood={good ? 'cheer' : 'happy'} size={80} />
          <h1>{lessonMode ? (outcome.passed ? <>Tested out! <Icon name="star" fill className="ic-gold-fill" /></> : 'Let’s read it first') : 'Placement done!'}</h1>
          <p><strong>{outcome.right}/{outcome.total}</strong> right on first try</p>
          {lessonMode ? (
            <p className="small">{outcome.passed
              ? 'This lesson gets 1 star and the next level is open. Replay it any time for 3 stars.'
              : 'Two or more misses: the cards will make it click. Your misses come back in reviews.'}</p>
          ) : (
            <>
              <p className="small">
                {outcome.proven.length
                  ? `${outcome.proven.length} lesson${outcome.proven.length === 1 ? '' : 's'} marked “known” with 1 star. Replay them later for 3 stars.`
                  : 'Nothing skipped. Starting from lesson 1 is the fastest route.'}
                {wasLocked && outcome.unlocks ? ` ${theme.name} is now open!` : ''}
                {wasLocked && !outcome.unlocks ? ` Score ${Math.round(PLACEMENT_UNLOCK * 100)}%+ to open this world early.` : ''}
              </p>
              <ul className="list-plain stack-s small placement-list">
                {section.lessons.map((l) => {
                  const known = outcome.proven.includes(l.id);
                  return <li key={l.id}><Icon name={known ? 'check' : 'next'} className={known ? 'ic-ok' : ''} /> {l.title} <span className="muted">{known ? '· known' : '· learn'}</span></li>;
                })}
              </ul>
            </>
          )}
          <button className="btn primary block big" autoFocus onClick={() => go(lessonMode && !outcome.passed ? back : `/world/${section.id}`)}>
            {lessonMode && !outcome.passed ? 'Read the cards' : `Go to ${theme.name}`} <Icon name="next" />
          </button>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="screen focus" id="main" style={{ justifyContent: 'center' }}>
      <div className="topbar"><button className="icon-btn" onClick={() => go(back)} aria-label="Back"><Icon name="back" /></button></div>
      <div className="celebrate-card stack" style={{ margin: '0 auto' }}>
        {lessonMode ? <HeroArt kind="placement" size={80} className="ic-hero" /> : <WorldEmblem world={section.id} size={80} className="ic-hero" />}
        <h1>{lessonMode ? `Test out: ${lesson.title}` : `Placement: ${theme.name}`}</h1>
        {lessonMode ? (
          <p className="small">{TEST_OUT_SIZE} questions on this lesson. Get at least {TEST_OUT_SIZE - 1} right first try and it’s marked done with 1 star. Misses are fine: they go to your reviews.</p>
        ) : (
          <p className="small">
            One question per lesson ({questions.length} in all, about {Math.max(3, Math.round(questions.length * 0.7))} min).
            Every one you get right marks that lesson “known” (1 star), so you can skip ahead.
            {wasLocked ? ` Score ${Math.round(PLACEMENT_UNLOCK * 100)}%+ and this world opens early.` : ''}
          </p>
        )}
        <p className="small muted">No hearts, no timer. Don’t guess: a miss just keeps that lesson on your path, which is exactly where it should be.</p>
        <button className="btn primary block big" autoFocus onClick={() => { sfx.tap(); setPhase('run'); }}>Start <Icon name="play" fill /></button>
      </div>
    </main>
  );
}
