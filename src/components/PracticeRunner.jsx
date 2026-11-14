// Practice loop: answer → instant feedback → XP pop → continue. Misses come back 3 questions later.
import { useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { QuestionView } from './QuestionView.jsx';
import { Rich } from '../lib/rich.jsx';
import { answerQuestion, earn, getState } from '../state/store.js';
import { answerXp, comboMultiplier } from '../engine/xp.js';
import { isCorrect } from '../engine/session.js';
import { sfx } from '../audio/sfx.js';
import { haptic } from '../audio/haptics.js';
import { useFeedback } from './Feedback.jsx';
import { useReducedMotion } from '../hooks/useMotionPrefs.js';
import { sectionById } from '../data/index.js';
import { ParkIt } from './ParkIt.jsx';

const PRAISE = ['Nailed it!', 'Yes!', 'Boom!', 'Correct!', 'Sharp!', 'You got it!', 'Brain on fire!', 'Clean!'];
const KIND = ['Not quite', 'Close one', 'Almost', 'Good try'];
const pick = (a) => a[Math.floor(Math.random() * a.length)];

export function PracticeRunner({ questions, onDone, onExit, topRight, requeue = true }) {
  const [queue, setQueue] = useState(() => questions.map((q) => q.id));
  const byId = useMemo(() => Object.fromEntries(questions.map((q) => [q.id, q])), [questions]);
  const [idx, setIdx] = useState(0);
  const [chosen, setChosen] = useState([]);
  const [revealed, setRevealed] = useState(false);
  const [lastRight, setLastRight] = useState(null);
  const [combo, setCombo] = useState(0);
  const [pop, setPop] = useState(null);
  const [showWhy, setShowWhy] = useState(false);
  const [verdict, setVerdict] = useState('');
  const stats = useRef({ right: 0, wrong: 0, xp: 0, bestCombo: 0, firstAnswers: {} });
  const requeued = useRef(new Set());
  const { announce, celebrate } = useFeedback();
  const reduced = useReducedMotion();

  const q = byId[queue[idx]];
  const need = q.answer.length;
  const multi = need > 1;

  const toggle = (i) => {
    if (revealed) return;
    setChosen((c) => (multi ? (c.includes(i) ? c.filter((x) => x !== i) : [...c, i]) : [i]));
  };

  const check = () => {
    const right = isCorrect(q, chosen);
    const firstTime = right && !(getState().items[q.id]?.right > 0);
    const nextCombo = right ? combo + 1 : 0;
    const xp = answerXp(right, nextCombo, firstTime);
    answerQuestion(q.id, right, nextCombo);
    earn(xp);

    const s = stats.current;
    if (!(q.id in s.firstAnswers)) s.firstAnswers[q.id] = right;
    if (right) s.right++; else s.wrong++;
    s.xp += xp;
    s.bestCombo = Math.max(s.bestCombo, nextCombo);

    setCombo(nextCombo);
    setRevealed(true);
    setLastRight(right);
    setShowWhy(false);
    const v = right ? pick(PRAISE) : pick(KIND);
    setVerdict(v);
    setPop({ xp, id: Date.now(), mult: comboMultiplier(nextCombo) });

    if (right) {
      sfx.correct(nextCombo);
      haptic(nextCombo >= 3 ? 'double' : 'light');
      if ([3, 5, 10].includes(nextCombo)) { sfx.combo(nextCombo >= 10 ? 4 : nextCombo >= 5 ? 3 : 2); celebrate(24); }
    } else {
      sfx.wrong();
      haptic('soft');
      if (requeue && !requeued.current.has(q.id)) {
        requeued.current.add(q.id);
        setQueue((list) => { const n = [...list]; n.splice(Math.min(n.length, idx + 4), 0, q.id); return n; });
      }
    }
    announce(`${right ? 'Correct' : 'Not quite'}. Plus ${xp} XP. ${right ? '' : 'The right answer is shown.'}`);
  };

  const next = () => {
    sfx.flip();
    if (idx + 1 >= queue.length) {
      const s = stats.current;
      const unique = Object.keys(s.firstAnswers).length;
      const firstRight = Object.values(s.firstAnswers).filter(Boolean).length;
      onDone({ ...s, total: unique, firstRight });
      return;
    }
    setIdx(idx + 1);
    setChosen([]);
    setRevealed(false);
    setLastRight(null);
    setPop(null);
  };

  const progress = (idx + (revealed ? 1 : 0)) / queue.length;
  const sec = sectionById[q.section];

  return (
    <div className="stack" style={{ flex: 1 }}>
      <div className="quiz-top">
        <button className="icon-btn" onClick={onExit} aria-label="Leave session">✕</button>
        <div className="bar" role="progressbar" aria-label="Session progress" aria-valuemin={0} aria-valuemax={queue.length} aria-valuenow={idx + (revealed ? 1 : 0)}>
          <span style={{ width: `${Math.max(4, progress * 100)}%` }} />
        </div>
        {topRight ?? <ComboChip combo={combo} reduced={reduced} />}
        <ParkIt />
      </div>
      {topRight && <div className="row" style={{ justifyContent: 'space-between' }}>
        <span className="chip">{sec?.emoji} {sec?.title}</span>
        <ComboChip combo={combo} reduced={reduced} />
      </div>}
      {!topRight && <span className="chip" style={{ justifySelf: 'start' }}>{sec?.emoji} {sec?.title}</span>}

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={`${q.id}-${idx}`}
          initial={reduced ? { opacity: 0 } : { opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={reduced ? { opacity: 0 } : { opacity: 0, x: -40 }}
          transition={{ duration: 0.28, ease: [0.2, 0, 0, 1] }}
          style={{ position: 'relative' }}
        >
          <AnimatePresence>
            {pop && (
              <motion.div
                key={pop.id} className="xp-pop" aria-hidden="true"
                initial={{ opacity: 0, y: 20, scale: 0.6 }}
                animate={{ opacity: [0, 1, 1, 0], y: [20, -10, -24, -40], scale: [0.6, 1.15, 1, 1] }}
                transition={{ duration: 1.3, times: [0, 0.2, 0.7, 1] }}
                onAnimationComplete={() => setPop(null)}
              >+{pop.xp} XP{pop.mult > 1 ? ` ×${pop.mult}` : ''}</motion.div>
            )}
          </AnimatePresence>
          <QuestionView question={q} chosen={chosen} onToggle={toggle} revealed={revealed} nudge={revealed && lastRight === false} />
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {revealed && (
          <motion.div
            className={`feedback ${lastRight ? 'right' : 'wrong'}`}
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          >
            <div className="verdict"><span aria-hidden="true">{lastRight ? '✓' : '✗'}</span> {verdict}</div>
            <p><Rich text={q.explain} /></p>
            {q.wrong?.some(Boolean) && (
              <>
                <button className="btn ghost small" onClick={() => setShowWhy((v) => !v)} aria-expanded={showWhy}>
                  {showWhy ? 'Hide' : 'Why not the others?'}
                </button>
                {showWhy && (
                  <ul className="list-plain small">
                    {q.options.map((o, i) => q.wrong[i] ? <li key={i}><strong>{'ABCDEF'[i]}.</strong> <Rich text={q.wrong[i]} /></li> : null)}
                  </ul>
                )}
              </>
            )}
            {q.source && <p className="small muted">📚 {q.source}</p>}
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ flex: 1 }} />
      <div className="sticky-actions">
        {!revealed ? (
          <button className="btn primary block big" disabled={chosen.length !== need} onClick={check}>
            {chosen.length < need && multi ? `Pick ${need - chosen.length} more` : 'Check'}
          </button>
        ) : (
          <button className="btn primary block big" onClick={next} autoFocus>
            {idx + 1 >= queue.length ? 'Finish 🎉' : 'Continue →'}
          </button>
        )}
      </div>
    </div>
  );
}

function ComboChip({ combo, reduced }) {
  const mult = comboMultiplier(combo);
  return (
    <motion.span
      key={combo}
      className="combo"
      aria-label={`Combo ${combo}${mult > 1 ? `, times ${mult} XP` : ''}`}
      initial={reduced || combo === 0 ? false : { scale: 1.5 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 500, damping: 15 }}
    >
      <span aria-hidden="true" style={{ fontSize: 14 + Math.min(combo, 10) }}>🔥</span>
      {combo}{mult > 1 && <small>×{mult}</small>}
    </motion.span>
  );
}
