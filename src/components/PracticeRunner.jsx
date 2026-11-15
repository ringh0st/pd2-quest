// Practice loop: answer, instant feedback, XP pop, continue. Misses come back 3 questions later.
import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { QuestionView } from './QuestionView.jsx';
import { Rich } from '../lib/rich.jsx';
import { answerQuestion, earn, getState } from '../state/store.js';
import { answerXp, comboMultiplier } from '../engine/xp.js';
import { isCorrect, shuffleOptions } from '../engine/session.js';
import { sfx } from '../audio/sfx.js';
import { haptic } from '../audio/haptics.js';
import { useFeedback } from './Feedback.jsx';
import { useReducedMotion } from '../hooks/useMotionPrefs.js';
import { sectionById } from '../data/index.js';
import { ParkIt } from './ParkIt.jsx';
import { useHoldCelebrations } from '../hooks/useFocusMode.js';
import { Zap } from './game/Zap.jsx';
import { useStore, useHelper } from '../state/store.js';
import { fiftyFifty, HELPERS } from '../game/economy.js';
import { lessonById } from '../data/index.js';
import { zapSays } from '../game/mascot.js';
import { Icon } from './icons/Icon.jsx';
import { SpeakButton } from './SpeakButton.jsx';

const PRAISE = ['Nailed it!', 'Yes!', 'Boom!', 'Correct!', 'Sharp!', 'You got it!', 'Brain on fire!', 'Clean!'];
const KIND = ['Not quite', 'Not yet', 'Good try'];
const pick = (a) => a[Math.floor(Math.random() * a.length)];

/** Hint text for a question: the lesson's memory hook, else its first text card. */
function hintFor(q) {
  const l = lessonById[q.lesson];
  const card = l?.cards.find((c) => c.type === 'tip') || l?.cards.find((c) => c.type === 'text' && c.body);
  return card?.body ?? 'Re-read the question: what is the scenario really asking for?';
}

/**
 * `initial` resumes a saved run ({ queue, idx, stats, heartsLeft, combo, requeued });
 * `onProgress(snapshot)` is called after every answer with the state to resume from.
 */
export function PracticeRunner({ questions, onDone, onExit, topRight, requeue = true, hearts = null, helpers = false, header, onAnswer, shouldStop, initial = null, onProgress }) {
  const [queue, setQueue] = useState(() => initial?.queue ?? questions.map((q) => q.id));
  // Options are reshuffled each session so learners remember the idea, not the letter.
  const byId = useMemo(() => Object.fromEntries(questions.map((q) => [q.id, shuffleOptions(q)])), [questions]);
  const [idx, setIdx] = useState(() => initial?.idx ?? 0);
  const [chosen, setChosen] = useState([]);
  const [revealed, setRevealed] = useState(false);
  const [lastRight, setLastRight] = useState(null);
  const [combo, setCombo] = useState(() => initial?.combo ?? 0);
  const [pop, setPop] = useState(null);
  const [showWhy, setShowWhy] = useState(false);
  const [verdict, setVerdict] = useState('');
  const stats = useRef(initial?.stats ?? { right: 0, wrong: 0, xp: 0, bestCombo: 0, firstAnswers: {} });
  const requeued = useRef(new Set(initial?.requeued ?? []));
  const [heartsLeft, setHeartsLeft] = useState(() => initial?.heartsLeft ?? hearts);
  const [hidden, setHidden] = useState([]);
  const [hint, setHint] = useState(null);
  const [zapLine, setZapLine] = useState('');
  const held = useStore((st) => st.helpers);
  useHoldCelebrations(true);
  const { announce, celebrate } = useFeedback();
  const reduced = useReducedMotion();

  const feedbackRef = useRef(null);
  const topRef = useRef(null);

  // After Check, bring the explanation above the sticky Continue button; on a new question, go back to the top.
  useEffect(() => {
    if (revealed) {
      const t = setTimeout(() => feedbackRef.current?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'nearest' }), reduced ? 0 : 120);
      return () => clearTimeout(t);
    }
    topRef.current?.scrollIntoView({ block: 'start' });
    // after Continue, put focus on the new question so screen readers read it
    if (idx > 0) {
      const h = topRef.current?.querySelector('.question');
      if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
    }
  }, [revealed, idx, reduced]);

  const q = byId[queue[idx]];
  const need = q.answer.length;
  const multi = need > 1;

  const [overpick, setOverpick] = useState(0);
  const toggle = (i) => {
    if (revealed) return;
    if (multi && !chosen.includes(i) && chosen.length >= need) {
      // Never drop an earlier pick silently: say why and let the learner choose what to unpick.
      setOverpick((n) => n + 1);
      haptic('soft');
      announce(`You can choose ${need}. Unselect one first.`);
      return;
    }
    setChosen((c) => (multi ? (c.includes(i) ? c.filter((x) => x !== i) : [...c, i]) : [i]));
  };

  const askConfidence = useStore((st) => st.settings.askConfidence !== false);
  const [confidence, setConfidence] = useState(null); // 'sure' | 'guess' for the question just checked
  const check = (conf = null) => {
    setConfidence(conf);
    const right = isCorrect(q, chosen);
    const firstTime = right && !(getState().items[q.id]?.right > 0);
    const nextCombo = right ? combo + 1 : 0;
    const xp = answerXp(right, nextCombo, firstTime);
    answerQuestion(q.id, right, nextCombo, Date.now(), { helped: hidden.length > 0 || !!hint, confidence: conf });
    earn(xp);

    const s = stats.current;
    if (!(q.id in s.firstAnswers)) s.firstAnswers[q.id] = right;
    if (right) s.right++; else s.wrong++;
    s.xp += xp;
    s.bestCombo = Math.max(s.bestCombo, nextCombo);

    setCombo(nextCombo);
    const nextHearts = !right && heartsLeft != null ? Math.max(0, heartsLeft - 1) : heartsLeft;
    setHeartsLeft(nextHearts);
    setZapLine(zapSays(right ? (nextCombo >= 3 ? 'combo' : 'correct') : 'wrong'));
    onAnswer?.(right, nextCombo);
    setRevealed(true);
    setLastRight(right);
    setShowWhy(false);
    const v = right ? pick(PRAISE) : pick(KIND);
    setVerdict(v);
    setPop({ xp, id: Date.now(), mult: comboMultiplier(nextCombo) });

    let nextQueue = queue;
    if (right) {
      sfx.correct(nextCombo);
      haptic(nextCombo >= 3 ? 'double' : 'light');
      if ([3, 5, 10].includes(nextCombo)) { sfx.combo(nextCombo >= 10 ? 4 : nextCombo >= 5 ? 3 : 2); celebrate(24); }
    } else {
      if (heartsLeft != null) { sfx.heartLost(); haptic('double'); } else { sfx.wrong(); haptic('soft'); }
      if (requeue && !requeued.current.has(q.id)) {
        requeued.current.add(q.id);
        nextQueue = [...queue];
        nextQueue.splice(Math.min(nextQueue.length, idx + 4), 0, q.id);
        setQueue(nextQueue);
      }
    }
    // Resume point: the question after this one (this answer is already saved in reviews).
    onProgress?.({ queue: nextQueue, idx: idx + 1, stats: { ...stats.current }, heartsLeft: nextHearts, combo: nextCombo, requeued: [...requeued.current] });
    announce(`${right ? 'Correct' : 'Not quite'}. Plus ${xp} XP. ${right ? '' : 'The right answer is shown.'}`);
  };

  const next = () => {
    sfx.flip();
    const outOfHearts = heartsLeft === 0;
    if (idx + 1 >= queue.length || outOfHearts || shouldStop?.(stats.current)) {
      const s = stats.current;
      const unique = Object.keys(s.firstAnswers).length;
      const firstRight = Object.values(s.firstAnswers).filter(Boolean).length;
      onDone({ ...s, total: unique, firstRight, heartsLeft, failed: outOfHearts });
      return;
    }
    setHidden([]);
    setHint(null);
    setIdx(idx + 1);
    setChosen([]);
    setRevealed(false);
    setLastRight(null);
    setPop(null);
  };

  const progress = (idx + (revealed ? 1 : 0)) / queue.length;
  const sec = sectionById[q.section];

  return (
    <div className="stack" style={{ flex: 1 }} ref={topRef}>
      <div className="quiz-top">
        <button className="icon-btn" onClick={onExit} aria-label="Leave session"><Icon name="close" /></button>
        <div className="bar" role="progressbar" aria-label="Session progress" aria-valuemin={0} aria-valuemax={queue.length} aria-valuenow={idx + (revealed ? 1 : 0)}>
          <span style={{ width: `${Math.max(4, progress * 100)}%` }} />
        </div>
        {topRight ?? (heartsLeft != null ? <HeartsChip hearts={heartsLeft} max={hearts} reduced={reduced} /> : <ComboChip combo={combo} reduced={reduced} />)}
        <ParkIt />
      </div>
      {header?.({ combo, heartsLeft, lastRight, revealed, stats: stats.current })}
      {topRight && <div className="row" style={{ justifyContent: 'space-between' }}>
        <span className="chip trunc" title={sec?.title}><Icon name={q.section} /> {sec?.short ?? sec?.title}</span>
        <ComboChip combo={combo} reduced={reduced} />
      </div>}
      {!topRight && !header && (
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <span className="chip trunc" title={sec?.title}><Icon name={q.section} /> {sec?.short ?? sec?.title}</span>
          {heartsLeft != null && <ComboChip combo={combo} reduced={reduced} />}
        </div>
      )}

      {/* Keyed, no exit animation: the previous question is never on screen to swallow a tap. */}
      <motion.div
          key={`${q.id}-${idx}`}
          initial={reduced ? false : { opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.24, ease: [0.2, 0, 0, 1] }}
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
          <QuestionView question={q} chosen={chosen} onToggle={toggle} revealed={revealed} nudge={revealed && lastRight === false} shake={overpick} hidden={hidden} />
      </motion.div>

      {helpers && !revealed && (
        <div className="helper-row" role="group" aria-label="Helpers">
          {q.answer.length === 1 && (
            <button
              className="btn small" disabled={!held.fifty || hidden.length > 0}
              onClick={() => { if (useHelper('fifty')) { sfx.flip(); haptic('medium'); const h = fiftyFifty(q); setHidden(h); setChosen((c) => c.filter((x) => !h.includes(x))); announce('Two wrong answers removed.'); } }}
            ><Icon name="scissors" /> {HELPERS.fifty.name} <span className="helper-count">×{held.fifty ?? 0}</span></button>
          )}
          <button
            className="btn small" disabled={!held.hint || !!hint}
            onClick={() => { if (useHelper('hint')) { sfx.flip(); haptic('light'); const t = hintFor(q); setHint(t); announce('Hint: ' + t); } }}
          ><Icon name="idea" /> {HELPERS.hint.name} <span className="helper-count">×{held.hint ?? 0}</span></button>
        </div>
      )}
      <AnimatePresence>
        {hint && !revealed && (
          <motion.div className="hint-card" initial={reduced ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0 }}>
            <strong><Icon name="idea" /> Hint</strong> <Rich text={hint} />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {revealed && (
          <motion.div
            ref={feedbackRef}
            className={`feedback ${lastRight ? 'right' : 'wrong'}`}
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          >
            <div className="verdict">
              <Zap mood={lastRight ? 'cheer' : 'sad'} size={38} bounce={false} label="" />
              <span className="grow"><span className="verdict-mark"><Icon name={lastRight ? 'ok' : 'wrong'} /></span> {verdict}<br /><span className="small muted" style={{ fontWeight: 400 }}>{zapLine}</span></span>
              <SpeakButton
                label="Read the explanation aloud"
                text={`${lastRight ? 'Correct.' : `Not quite. The answer is ${q.answer.map((i) => `${'ABCDEF'[i]}, ${q.options[i]}`).join(' and ')}.`} ${q.explain}`}
              />
            </div>
            {!lastRight && (
              <p className="right-answer"><strong>Answer{need > 1 ? 's' : ''}:</strong>{' '}
                {q.answer.map((i) => <span key={i} className="answer-pill">{'ABCDEF'[i]}. <Rich text={q.options[i]} autoCode /></span>)}
              </p>
            )}
            {confidence === 'sure' && !lastRight && (
              <p className="conf-note"><Icon name="warn" /> You were sure, so this one is worth a closer look. It comes back soon.</p>
            )}
            {confidence === 'guess' && lastRight && (
              <p className="conf-note"><Icon name="info" /> Nice guess! It comes back tomorrow to make it stick.</p>
            )}
            <p><Rich text={q.explain} autoCode /></p>
            {q.wrong?.some(Boolean) && (
              <>
                <button className="btn ghost small" onClick={() => setShowWhy((v) => !v)} aria-expanded={showWhy}>
                  <Icon name={showWhy ? 'close' : 'idea'} /> {showWhy ? 'Hide' : 'Why not the others?'}
                </button>
                {showWhy && (
                  <ul className="list-plain small why-card">
                    {q.options.map((o, i) => q.wrong[i] ? <li key={i}><Icon name="wrong" /><span><strong>{'ABCDEF'[i]}.</strong> <Rich text={q.wrong[i]} /></span></li> : null)}
                  </ul>
                )}
              </>
            )}
            {q.source && <p className="small muted"><Icon name="book" /> {q.source}</p>}
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ flex: 1 }} />
      <div className="sticky-actions">
        {!revealed ? (
          multi && chosen.length < need ? (
            <button className="btn primary block big" disabled>{`Pick ${need - chosen.length} more`}</button>
          ) : askConfidence ? (
            <div className="check-pair" role="group" aria-label="Check your answer: how sure are you?">
              <button className="btn big check-guess" disabled={chosen.length !== need} onClick={() => check('guess')}>
                <span className="check-k">Check</span><span className="check-v"><Icon name="info" /> Guessing</span>
              </button>
              <button className="btn primary big check-sure" disabled={chosen.length !== need} onClick={() => check('sure')}>
                <span className="check-k">Check</span><span className="check-v"><Icon name="check" /> Sure</span>
              </button>
            </div>
          ) : (
            <button className="btn primary block big" disabled={chosen.length !== need} onClick={() => check()}>Check</button>
          )
        ) : (
          <button className="btn primary block big" onClick={next} autoFocus>
            {heartsLeft === 0 ? 'See result' : idx + 1 >= queue.length ? <>Finish <Icon name="party" /></> : <>Continue <Icon name="next" /></>}
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
      <Icon name="flame" fill={combo > 0} size={`${1 + Math.min(combo, 10) * 0.05}em`} />
      {combo}{mult > 1 && <small>×{mult}</small>}
    </motion.span>
  );
}

function HeartsChip({ hearts, max, reduced }) {
  return (
    <span className="chip hearts" role="img" aria-label={`${hearts} of ${max} hearts left`}>
      {Array.from({ length: max }, (_, i) => (
        <motion.span
          key={i + '-' + (i < hearts)} aria-hidden="true" className={i < hearts ? undefined : 'lost'}
          initial={reduced || i < hearts ? false : { scale: 1.6, rotate: -20 }}
          animate={{ scale: 1, rotate: 0, opacity: i < hearts ? 1 : 0.6 }}
          transition={{ type: 'spring', stiffness: 400, damping: 12 }}
        ><Icon name="heart" fill={i < hearts} /></motion.span>
      ))}
    </span>
  );
}
