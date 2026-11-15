// Exam simulator: real-exam pacing, no feedback until the end, flags, a question map and a full review.
// An exam in progress is saved on every change and can be resumed after a reload or app switch.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { sections, sectionById, exam } from '../data/index.js';
import { buildExam, isCorrect } from '../engine/session.js';
import { useStore, answerQuestion, earn, recordExam, getState } from '../state/store.js';
import { XP } from '../engine/xp.js';
import { QuestionView, cleanQuestion } from '../components/QuestionView.jsx';
import { CodeBlock } from '../components/CodeBlock.jsx';
import { Rich } from '../lib/rich.jsx';
import { useFeedback } from '../components/Feedback.jsx';
import { useReducedMotion } from '../hooks/useMotionPrefs.js';
import { sfx } from '../audio/sfx.js';
import { haptic } from '../audio/haptics.js';
import { useFocusMode, useHoldCelebrations } from '../hooks/useFocusMode.js';
import { ParkIt } from '../components/ParkIt.jsx';
import { Sheet } from '../components/Sheet.jsx';
import { Segmented } from '../components/Controls.jsx';
import { saveExamSession, loadExamSession, clearExamSession } from '../state/examSession.js';

const LETTERS = 'ABCDEF';
const MODES = [
  { id: 'mini', label: 'Mini mock', count: 20, minutes: 40, emoji: '🏃', blurb: '20 questions · 40 min' },
  { id: 'full', label: 'Full mock exam', count: exam.questions, minutes: exam.minutes, emoji: '🏁', blurb: `${exam.questions} questions · ${exam.minutes} min, like the real thing` },
  { id: 'hard', label: 'Exam-hard mock', count: exam.questions, minutes: exam.minutes, emoji: '🔥', blurb: `${exam.questions} of the toughest questions · ${exam.minutes} min`, hardOnly: true },
];
const TIME = [['standard', 'Standard'], ['extra', '+50% time'], ['untimed', 'Untimed']];
const timeFor = (mode, time) => (time === 'untimed' ? null : Math.round(mode.minutes * (time === 'extra' ? 1.5 : 1)) * 60 * 1000);
const letters = (idx) => idx.map((c) => LETTERS[c]).join(', ');

export function Exam() {
  const [saved, setSaved] = useState(() => loadExamSession());
  const [setup, setSetup] = useState(null);
  const [run, setRun] = useState(null);
  const [result, setResult] = useState(null);
  const history = useStore((s) => s.exams);
  const inExam = !!run && !result;
  useFocusMode(inExam || !!setup);
  // Level-ups and badges wait until the result has been read.
  useHoldCelebrations(inExam || !!result);

  if (result) return <ExamResult result={result} onClose={() => { setResult(null); setRun(null); }} />;
  if (run) {
    return (
      <ExamRun
        run={run}
        onSubmit={(r) => { clearExamSession(); setSaved(null); setResult(r); }}
        onLeave={() => { setSaved(loadExamSession()); setRun(null); }}
        onDiscard={() => { clearExamSession(); setSaved(null); setRun(null); }}
      />
    );
  }
  if (setup) {
    return (
      <ExamStart
        mode={setup}
        onBack={() => setSetup(null)}
        onStart={(time) => {
          const questions = buildExam(sections, { count: setup.count, hardOnly: !!setup.hardOnly, items: getState().items });
          const limitMs = timeFor(setup, time);
          const session = { modeId: setup.id, label: setup.label, ids: questions.map((q) => q.id), answers: {}, flags: {}, i: 0, limitMs, remainingMs: limitMs, time, startedAt: Date.now(), activeMs: 0 };
          saveExamSession(session);
          setSetup(null);
          setRun({ ...session, questions });
        }}
      />
    );
  }

  const last = history[history.length - 1];
  return (
    <main className="screen" id="main">
      <h1>🏁 Exam simulator</h1>
      <p className="muted">Exam conditions: no hints, flag questions you’re unsure of, and see the full review at the end. Pass mark {exam.passing}%.</p>
      {saved && (
        <div className="card stack-s" style={{ borderColor: 'var(--primary)' }}>
          <strong>⏸ {saved.label} in progress</strong>
          <p className="small muted">
            {Object.values(saved.answers).filter((a) => a?.length).length}/{saved.questions.length} answered
            {saved.remainingMs != null ? ` · ${Math.ceil(saved.remainingMs / 60000)} min left` : ' · untimed'}
          </p>
          <div className="row">
            <button className="btn primary grow" onClick={() => { sfx.tap(); setRun(saved); }}>Resume ▶</button>
            <button className="btn" onClick={() => { if (confirm('Throw away this unfinished mock exam?')) { clearExamSession(); setSaved(null); } }}>Discard</button>
          </div>
        </div>
      )}
      {MODES.map((m) => (
        <button
          key={m.id} className="card link section-card" style={{ textAlign: 'left', width: '100%', font: 'inherit' }}
          onClick={() => {
            if (saved && !confirm('Starting a new mock replaces the one in progress. Continue?')) return;
            sfx.tap(); haptic('medium'); setSetup(m);
          }}
        >
          <span className="section-emoji" aria-hidden="true">{m.emoji}</span>
          <span><strong>{m.label}</strong><br /><span className="small muted">{m.blurb}</span></span>
          <span aria-hidden="true">▶</span>
        </button>
      ))}
      <a className="card link row" href="#/sprint?hard=1" onClick={() => sfx.tap()}>
        <span className="section-emoji" aria-hidden="true">🔥</span>
        <span className="grow"><strong>Exam-hard sprint</strong><br /><span className="small muted">Short rounds of only the toughest questions, with explanations</span></span>
        <span aria-hidden="true">▶</span>
      </a>
      {last && (
        <div className="card stack-s">
          <strong>Recent attempts</strong>
          <ul className="list-plain small">
            {history.slice(-5).reverse().map((h) => (
              <li key={h.at} className="spread">
                <span>{new Date(h.at).toLocaleDateString()} · {h.total} q</span>
                <span className="chip" style={h.score >= exam.passing ? { background: 'var(--correct-bg)' } : undefined}>
                  {h.score >= exam.passing ? '✓ pass' : '• not yet'} {h.score}%
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="card stack-s">
        <strong>📋 About the real exam</strong>
        <ul className="small" style={{ margin: 0, paddingLeft: '1.2em' }}>
          <li>{exam.questions} scored questions (+ up to {exam.unscored} unscored), {exam.minutes} minutes</li>
          <li>Passing score: {exam.passing}%</li>
          <li>Fee: {exam.fee} · Retake: {exam.retake}</li>
          <li>Prerequisite: {exam.prereq}</li>
          <li>{exam.delivery}</li>
        </ul>
      </div>
    </main>
  );
}

function ExamStart({ mode, onBack, onStart }) {
  const [time, setTime] = useState('standard');
  const heading = useRef(null);
  useEffect(() => { window.scrollTo(0, 0); heading.current?.focus(); }, []);
  return (
    <main className="screen focus" id="main">
      <div className="topbar"><button className="icon-btn" onClick={onBack} aria-label="Back to exam menu">←</button></div>
      <div className="stack center">
        <div style={{ fontSize: 56 }} aria-hidden="true">{mode.emoji}</div>
        <h1 ref={heading} tabIndex={-1}>{mode.label}</h1>
        <p className="muted">{mode.count} questions · no feedback until the end · pass mark {exam.passing}%</p>
      </div>
      <div className="card stack">
        <Segmented label="Time" options={TIME} value={time} onChange={setTime} />
        <ul className="small" style={{ margin: 0, paddingLeft: '1.2em' }}>
          <li>Settle in: water, quiet, phone on do-not-disturb.</li>
          <li>Flag anything you’re unsure of and come back from the question map.</li>
          <li>Leaving is safe. Your exam is saved, and the clock stops while the app is closed.</li>
        </ul>
      </div>
      <div style={{ flex: 1 }} />
      <button className="btn primary block big" onClick={() => { sfx.tap(); haptic('medium'); onStart(time); }}>
        Start{time === 'untimed' ? ' (untimed)' : ` · ${Math.round(timeFor(mode, time) / 60000)} min`} ▶
      </button>
    </main>
  );
}

function ExamRun({ run, onSubmit, onLeave, onDiscard }) {
  const { questions } = run;
  const timed = run.limitMs != null;
  const [i, setI] = useState(run.i);
  const [answers, setAnswers] = useState(run.answers);
  const [flags, setFlags] = useState(run.flags);
  const [grid, setGrid] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [remaining, setRemaining] = useState(run.remainingMs);
  const activeMs = useRef(run.activeMs || 0);
  const heading = useRef(null);
  const warned = useRef(false);
  const { announce } = useFeedback();
  const reduced = useReducedMotion();

  // Wall-clock timer: deadline is set when the exam is on screen, so background ticks can't drift.
  useEffect(() => {
    let lastAt = Date.now();
    const tick = () => {
      const now = Date.now();
      const step = now - lastAt;
      lastAt = now;
      activeMs.current += step;
      if (timed) setRemaining((r) => Math.max(0, r - step));
    };
    const t = setInterval(tick, 1000);
    const onVis = () => { if (document.visibilityState === 'visible') lastAt = Date.now(); else tick(); };
    document.addEventListener('visibilitychange', onVis);
    return () => { clearInterval(t); document.removeEventListener('visibilitychange', onVis); };
  }, [timed]);

  // Save every change (answers, flags, position, clock).
  useEffect(() => {
    saveExamSession({
      modeId: run.modeId, label: run.label, ids: questions.map((q) => q.id), answers, flags, i,
      limitMs: run.limitMs, remainingMs: remaining, time: run.time, startedAt: run.startedAt, activeMs: activeMs.current,
    });
  }, [answers, flags, i, remaining]); // eslint-disable-line react-hooks/exhaustive-deps

  // New question: back to the top, focus the question so screen readers read it.
  useEffect(() => {
    window.scrollTo(0, 0);
    heading.current?.focus({ preventScroll: true });
  }, [i]);

  const answered = Object.values(answers).filter((x) => x?.length).length;
  const blanks = questions.length - answered;

  const submit = useCallback(() => {
    const per = {};
    let right = 0;
    const review = questions.map((q) => {
      const chosen = answers[q.id] || [];
      const ok = isCorrect(q, chosen);
      // Blanks are not evidence of knowing or not knowing, so they don't touch the review schedule.
      if (chosen.length) answerQuestion(q.id, ok, 0);
      if (ok) right++;
      per[q.section] = per[q.section] || { right: 0, total: 0 };
      per[q.section].total++;
      if (ok) per[q.section].right++;
      return { q, chosen, ok };
    });
    const score = Math.round((right / questions.length) * 100);
    const counts = answered > 0;
    // XP only for questions actually answered; the pass bonus needs a real, timed attempt.
    const xp = counts ? answered * XP.examQuestion + (score >= exam.passing && timed ? XP.examPass : 0) : 0;
    if (xp) earn(xp);
    const seconds = Math.round(activeMs.current / 1000);
    const res = { at: Date.now(), score, total: questions.length, right, answered, bySection: per, seconds, xp, timed, mode: run.modeId };
    if (counts) recordExam({ at: res.at, score, total: res.total, bySection: per, timed, mode: run.modeId });
    onSubmit({ ...res, review });
  }, [questions, answers, answered, timed, run.modeId, onSubmit]);

  useEffect(() => {
    if (!timed) return;
    if (remaining <= 0) { submit(); return; }
    if (remaining <= 5 * 60 * 1000 && !warned.current) {
      warned.current = true;
      announce('Five minutes left.');
      haptic('double');
    }
  }, [remaining, timed, submit, announce]);

  const q = questions[i];
  const chosen = answers[q.id] || [];
  const multi = q.answer.length > 1;
  const toggle = (k) => setAnswers((a) => {
    const cur = a[q.id] || [];
    const next = multi ? (cur.includes(k) ? cur.filter((x) => x !== k) : [...cur, k].slice(-q.answer.length)) : [k];
    return { ...a, [q.id]: next };
  });
  const sec = Math.ceil((remaining ?? 0) / 1000);
  const low = timed && sec < 300;
  const go = (k) => { sfx.flip(); setI(k); };

  return (
    <main className="screen focus" id="main">
      <div className="quiz-top">
        <button className="icon-btn" onClick={onLeave} aria-label="Pause and leave exam. Your progress is saved">⏸</button>
        <div className="bar" role="progressbar" aria-label="Answered" aria-valuemin={0} aria-valuemax={questions.length} aria-valuenow={answered}>
          <span style={{ width: `${Math.max(2, (answered / questions.length) * 100)}%` }} />
        </div>
        {timed
          ? (
            <span className={low ? 'timer-pill low' : 'timer-pill'} role="timer" aria-live="off">
              <span aria-hidden="true">{low ? '⚠️' : '⏱'}</span><span className="sr-only">Time left </span> {Math.floor(sec / 60)}:{String(sec % 60).padStart(2, '0')}
            </span>
          )
          : <span className="timer-pill"><span aria-hidden="true">∞</span> untimed</span>}
        <ParkIt />
      </div>
      <div className="spread">
        <button className="chip" style={{ border: 0, minHeight: 44 }} onClick={() => setGrid(true)} aria-haspopup="dialog">
          Q {i + 1}/{questions.length}<span className="sr-only">, open question map</span> <span aria-hidden="true">▾</span>
        </button>
        <button
          className={flags[q.id] ? 'chip gold' : 'chip'} style={{ border: 0, minHeight: 44 }}
          aria-pressed={!!flags[q.id]} onClick={() => { sfx.tap(); setFlags((f) => ({ ...f, [q.id]: !f[q.id] })); }}
        >🚩 {flags[q.id] ? 'Flagged' : 'Flag'}</button>
      </div>
      <h1 className="sr-only" ref={heading} tabIndex={-1}>Question {i + 1} of {questions.length}</h1>

      {/* Keyed but no exit animation: the old question must never stay on screen to catch a tap. */}
      <motion.div key={q.id} initial={reduced ? false : { opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.18 }}>
        <QuestionView question={q} chosen={chosen} onToggle={toggle} revealed={false} />
      </motion.div>

      <div style={{ flex: 1 }} />
      <div className="sticky-actions" style={{ gridTemplateColumns: '1fr 2fr' }}>
        <button className="btn" disabled={i === 0} onClick={() => go(i - 1)}>← Prev</button>
        {i + 1 < questions.length
          ? <button className="btn primary" onClick={() => go(i + 1)}>Next →</button>
          : <button className="btn gold" onClick={() => setGrid(true)} aria-haspopup="dialog">Review &amp; submit</button>}
      </div>

      <Sheet open={grid} onClose={() => { setGrid(false); setConfirming(false); }} labelledBy="grid-title">
        <h2 id="grid-title">Question map</h2>
        <p className="small muted">{answered}/{questions.length} answered · {Object.values(flags).filter(Boolean).length} flagged</p>
        <p className="small muted" aria-hidden="true">✓ answered · ○ blank · 🚩 flagged</p>
        <div className="qmap">
          {questions.map((qq, k) => {
            const a = answers[qq.id]?.length > 0;
            return (
              <button
                key={qq.id} className={`qmap-cell${a ? ' done' : ''}${k === i ? ' here' : ''}`}
                onClick={() => { setI(k); setGrid(false); setConfirming(false); }}
                aria-label={`Question ${k + 1}${a ? ', answered' : ', blank'}${flags[qq.id] ? ', flagged' : ''}${k === i ? ', current' : ''}`}
              >
                <span>{k + 1}</span>
                <span className="qmap-mark" aria-hidden="true">{flags[qq.id] ? '🚩' : a ? '✓' : '○'}</span>
              </button>
            );
          })}
        </div>
        {!confirming ? (
          <button className="btn primary block big" onClick={() => { haptic('medium'); if (blanks) setConfirming(true); else submit(); }}>
            Submit exam {blanks ? `(${blanks} blank)` : '✓'}
          </button>
        ) : (
          <div className="stack-s" role="alert">
            <p><strong>{blanks} question{blanks === 1 ? ' is' : 's are'} blank.</strong> Blanks count as wrong.</p>
            <button className="btn primary block" data-autofocus onClick={() => submit()}>Yes, submit now</button>
            <button className="btn block" onClick={() => setConfirming(false)}>Keep answering</button>
          </div>
        )}
        <button className="btn ghost block small" onClick={() => { if (confirm('Throw away this mock exam? Nothing will be saved.')) onDiscard(); }}>Discard exam</button>
      </Sheet>
    </main>
  );
}

function ExamResult({ result, onClose }) {
  const pass = result.score >= exam.passing;
  const { celebrate } = useFeedback();
  const reduced = useReducedMotion();
  const missed = result.review.filter((r) => !r.ok).length;
  const [filter, setFilter] = useState(missed ? 'wrong' : 'all');
  const heading = useRef(null);
  const fast = result.answered > 0 && result.seconds / result.answered < 25;
  const seenBefore = result.review.filter(({ q }) => (getState().items[q.id]?.seen ?? 0) > 1).length;

  useEffect(() => {
    window.scrollTo(0, 0);
    heading.current?.focus({ preventScroll: true });
    if (pass && result.answered) { celebrate(60); sfx.levelUp(); haptic('celebrate'); } else { sfx.done(); }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const list = useMemo(() => result.review.filter((r) => filter === 'all' || !r.ok), [result, filter]);

  return (
    <main className="screen" id="main">
      <motion.div className="hero stack center" initial={reduced ? false : { scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 380, damping: 24 }}>
        <div style={{ fontSize: 64 }} aria-hidden="true">{!result.answered ? '🫥' : pass ? '🏆' : '🧗'}</div>
        <h1 ref={heading} tabIndex={-1}>{!result.answered ? 'Nothing answered' : pass ? 'You passed the mock!' : 'Not yet, and that’s data!'}</h1>
        <p style={{ fontSize: 40, fontWeight: 700 }}>{result.score}%</p>
        <p className="muted">{result.right}/{result.total} correct · {Math.max(1, Math.round(result.seconds / 60))} min · pass mark {exam.passing}%{result.timed ? '' : ' · untimed'}</p>
        {result.xp > 0 && <span className="chip gold" style={{ justifySelf: 'center' }}>+{result.xp} XP</span>}
        {!result.answered && <p className="small">No XP and nothing recorded. Try a Mini mock when you have 40 minutes.</p>}
        {!pass && result.answered > 0 && <p className="small">Every miss is now in your review queue, so you’ll see it again at the right moment.</p>}
      </motion.div>

      {pass && (fast || seenBefore > result.total / 3 || !result.timed) && (
        <div className="card stack-s" role="note">
          <strong>🧭 Keep it honest</strong>
          <ul className="small" style={{ margin: 0, paddingLeft: '1.2em' }}>
            {fast && <li>That was quick: under 25 seconds a question. Real PD2 questions take longer to read, so slow down and read every option.</li>}
            {seenBefore > result.total / 3 && <li>You’d seen {seenBefore} of these questions before. A pass on fresh questions is stronger evidence, so try the Exam-hard mock.</li>}
            {!result.timed && <li>This was untimed. Try one timed mock before exam day.</li>}
          </ul>
        </div>
      )}

      <div className="card stack">
        <strong>By section</strong>
        {sections.map((s) => {
          const r = result.bySection[s.id];
          if (!r) return null;
          const p = Math.round((r.right / r.total) * 100);
          return (
            <div key={s.id} className="stack-s">
              <div className="spread small"><span>{s.emoji} {s.short}</span><strong>{r.right}/{r.total} · {p}%</strong></div>
              <div className="bar" aria-hidden="true"><span style={{ width: `${Math.max(2, p)}%` }} /></div>
            </div>
          );
        })}
      </div>

      <Segmented label="Review" options={[['wrong', `Missed (${missed})`], ['all', `All (${result.total})`]]} value={filter} onChange={setFilter} />
      {!list.length && <p className="muted center">Nothing missed. Switch to All to read every explanation. 🌟</p>}
      <ol className="list-plain stack">
        {list.map(({ q, chosen, ok }) => (
          <li key={q.id} className={`feedback ${ok ? 'right' : 'wrong'}`}>
            <div className="verdict small"><span aria-hidden="true">{ok ? '✓' : '✗'}</span> {ok ? 'Correct' : chosen.length ? 'Missed' : 'Blank'} · {sectionById[q.section].emoji} {sectionById[q.section].short}</div>
            <p><Rich text={cleanQuestion(q.q)} autoCode /></p>
            {q.code && <CodeBlock code={q.code} lang={q.lang} />}
            <ul className="list-plain stack-s small">
              {q.options.map((o, k) => {
                const isKey = q.answer.includes(k);
                const mine = chosen.includes(k);
                if (!isKey && !mine) return null;
                return (
                  <li key={k} className={isKey ? 'review-opt key' : 'review-opt mine'}>
                    <strong>{LETTERS[k]}.</strong> <Rich text={o} autoCode />
                    <span className="review-tag">{isKey && mine ? ' ✓ your answer, correct' : isKey ? ' ✓ correct' : ' ✗ your answer'}</span>
                    {!isKey && q.wrong?.[k] && <div className="muted">Why not: <Rich text={q.wrong[k]} autoCode /></div>}
                  </li>
                );
              })}
            </ul>
            {!chosen.length && <p className="small muted">You left this blank (correct: {letters(q.answer)}).</p>}
            <p className="small"><Rich text={q.explain} autoCode /></p>
          </li>
        ))}
      </ol>
      <button className="btn primary block" onClick={onClose}>Back to exam menu</button>
    </main>
  );
}
