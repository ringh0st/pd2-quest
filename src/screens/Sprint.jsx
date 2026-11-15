// Sprint: rounds of N interleaved questions inside a gentle, pausable focus timer.
import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { sections, sectionById } from '../data/index.js';
import { buildSprint } from '../engine/session.js';
import { earn, getState, pushEvent } from '../state/store.js';
import { XP } from '../engine/xp.js';
import { PracticeRunner } from '../components/PracticeRunner.jsx';
import { go } from '../hooks/useRoute.js';
import { useFeedback } from '../components/Feedback.jsx';
import { useReducedMotion } from '../hooks/useMotionPrefs.js';
import { sfx } from '../audio/sfx.js';
import { haptic } from '../audio/haptics.js';
import { isDue } from '../engine/srs.js';

function makeRound(query) {
  const s = getState();
  const size = s.settings.sprintSize;
  if (query.mode === 'review') {
    const due = sections.flatMap((x) => x.questions).filter((q) => isDue(s.items[q.id]));
    if (due.length) return buildSprint(sections, s.items, { count: size });
  }
  return buildSprint(sections, s.items, { count: size, sectionId: query.section || null, minDifficulty: query.hard ? 3 : 1 });
}

export function Sprint({ query }) {
  const [round, setRound] = useState(() => ({ n: 1, questions: makeRound(query) }));
  const [result, setResult] = useState(null);
  const [totals, setTotals] = useState({ right: 0, answered: 0, xp: 0 });
  const minutes = getState().settings.focusMinutes;
  const [left, setLeft] = useState(minutes * 60);
  const [paused, setPaused] = useState(false);
  const warned = useRef(false);
  const { showToast, celebrate } = useFeedback();
  const reduced = useReducedMotion();
  const sec = query.section ? sectionById[query.section] : null;

  useEffect(() => {
    if (paused || result || !minutes) return;
    const t = setInterval(() => setLeft((x) => Math.max(0, x - 1)), 1000);
    return () => clearInterval(t);
  }, [paused, result, minutes]);

  useEffect(() => {
    if (left === 0 && minutes && !warned.current) {
      warned.current = true;
      sfx.done(); haptic('double');
      showToast('⏰ Sprint time! Finish this one, then breathe.');
    }
  }, [left, minutes, showToast]);

  const done = (r) => {
    const sprintOver = left === 0 && minutes;
    let bonus = XP.roundDone + (sprintOver ? XP.sprintDone : 0);
    earn(bonus);
    // Lucky drop: 1 in 6 rounds, never tied to money.
    if (Math.random() < 1 / 6) {
      const xp = 10 + Math.floor(Math.random() * 3) * 10;
      earn(xp);
      pushEvent({ type: 'chest', xp });
      bonus += xp;
    } else {
      celebrate(r.firstRight === r.total ? 50 : 30);
      sfx.done();
    }
    haptic('success');
    setTotals((t) => ({ right: t.right + r.firstRight, answered: t.answered + r.total, xp: t.xp + r.xp + bonus }));
    setResult({ ...r, bonus, sprintOver });
  };

  const again = () => {
    sfx.tap();
    setResult(null);
    setRound((rd) => ({ n: rd.n + 1, questions: makeRound(query) }));
  };

  const timer = minutes ? (
    <button className="timer-pill" onClick={() => setPaused((p) => !p)} aria-pressed={paused}>
      <span aria-hidden="true">{paused ? '⏸' : left === 0 ? '✅' : '⏱'}</span>
      <span className="sr-only">Pause focus timer, </span>
      {Math.floor(left / 60)}:{String(left % 60).padStart(2, '0')}
      <span className="sr-only"> left</span>
    </button>
  ) : null;

  if (!round.questions.length) {
    return <main className="screen"><p>No questions available yet.</p><button className="btn" onClick={() => go('/')}>Home</button></main>;
  }

  if (result) {
    const perfect = result.firstRight === result.total;
    return (
      <main className="screen focus" id="main" style={{ justifyContent: 'center' }}>
        <motion.div
          className="celebrate-card" style={{ margin: '0 auto' }}
          initial={reduced ? { opacity: 0 } : { scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 22 }}
        >
          <div className="big-emoji" aria-hidden="true">{perfect ? '🌟' : result.firstRight >= result.total / 2 ? '💪' : '🌱'}</div>
          <h1>{perfect ? 'Perfect round!' : `Round ${round.n} done!`}</h1>
          <p><strong>{result.firstRight}/{result.total}</strong> first try · best combo 🔥{result.bestCombo}</p>
          <div className="row" style={{ justifyContent: 'center', flexWrap: 'wrap' }}>
            <span className="chip gold">+{result.xp + result.bonus} XP</span>
            {round.n > 1 && <span className="chip">Session: {totals.xp} XP</span>}
          </div>
          {result.sprintOver
            ? <p className="muted small">Sprint complete! A 3-minute break helps it stick. 🧃</p>
            : <p className="muted small">{perfect ? 'Your brain is on fire. One more?' : 'Missed ones will come back soon. That’s how it sticks.'}</p>}
          <button className="btn primary block big" autoFocus onClick={again}>Keep going ⚡</button>
          <button className="btn block" onClick={() => go('/')}>Done for now ✓</button>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="screen focus" id="main">
      <h1 className="sr-only">Practice sprint, round {round.n}</h1>
      {(sec || query.hard) && <p className="small muted center" style={{ fontWeight: 700 }}>{query.hard ? '🔥 Exam-hard ' : ''}{sec ? `${sec.emoji} ${sec.short} ` : ''}practice</p>}
      <PracticeRunner key={round.n} questions={round.questions} onExit={() => go('/')} onDone={done} topRight={timer} />
    </main>
  );
}
