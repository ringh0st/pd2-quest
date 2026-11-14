// Exam simulator: real-exam pacing (2 min per question), no feedback until the end, flags and a review.
import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { sections, sectionById, exam } from '../data/index.js';
import { buildExam, isCorrect } from '../engine/session.js';
import { useStore, answerQuestion, earn, recordExam } from '../state/store.js';
import { XP } from '../engine/xp.js';
import { QuestionView, cleanQuestion } from '../components/QuestionView.jsx';
import { Rich } from '../lib/rich.jsx';
import { useFeedback } from '../components/Feedback.jsx';
import { useReducedMotion } from '../hooks/useMotionPrefs.js';
import { sfx } from '../audio/sfx.js';
import { haptic } from '../audio/haptics.js';
import { useFocusMode } from '../hooks/useFocusMode.js';
import { ParkIt } from '../components/ParkIt.jsx';

const MODES = [
  { id: 'mini', label: 'Mini mock', count: 20, minutes: 40, emoji: '🏃', blurb: '20 questions · 40 min' },
  { id: 'full', label: 'Full mock exam', count: exam.questions, minutes: exam.minutes, emoji: '🏁', blurb: `${exam.questions} questions · ${exam.minutes} min, like the real thing` },
];

export function Exam() {
  const [run, setRun] = useState(null);
  const [result, setResult] = useState(null);
  const history = useStore((s) => s.exams);
  useFocusMode(!!run && !result);

  if (result) return <ExamResult result={result} onClose={() => { setResult(null); setRun(null); }} />;
  if (run) return <ExamRun run={run} onSubmit={setResult} onQuit={() => setRun(null)} />;

  const last = history[history.length - 1];
  return (
    <main className="screen" id="main">
      <h1>🏁 Exam simulator</h1>
      <p className="muted">Exam conditions: no hints, flag questions you’re unsure of, and see the full review at the end. Pass mark {exam.passing}%.</p>
      {MODES.map((m) => (
        <button
          key={m.id} className="card link section-card" style={{ textAlign: 'left', width: '100%', font: 'inherit' }}
          onClick={() => { sfx.tap(); haptic('medium'); setRun({ ...m, questions: buildExam(sections, { count: m.count }), startedAt: Date.now() }); }}
        >
          <span className="section-emoji" aria-hidden="true">{m.emoji}</span>
          <span><strong>{m.label}</strong><br /><span className="small muted">{m.blurb}</span></span>
          <span aria-hidden="true">▶</span>
        </button>
      ))}
      {last && (
        <div className="card stack-s">
          <strong>Recent attempts</strong>
          <ul className="list-plain small">
            {history.slice(-5).reverse().map((h) => (
              <li key={h.at} className="spread">
                <span>{new Date(h.at).toLocaleDateString()} · {h.total} q</span>
                <span className="chip" style={h.score >= exam.passing ? { background: 'var(--correct-bg)' } : undefined}>
                  {h.score >= exam.passing ? '✓' : '•'} {h.score}%
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

function ExamRun({ run, onSubmit, onQuit }) {
  const { questions } = run;
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState({});
  const [flags, setFlags] = useState({});
  const [grid, setGrid] = useState(false);
  const [left, setLeft] = useState(run.minutes * 60);
  const reduced = useReducedMotion();

  useEffect(() => {
    const t = setInterval(() => setLeft((x) => Math.max(0, x - 1)), 1000);
    return () => clearInterval(t);
  }, []);

  const submit = () => {
    const per = {};
    let right = 0;
    const review = questions.map((q) => {
      const chosen = answers[q.id] || [];
      const ok = isCorrect(q, chosen);
      answerQuestion(q.id, ok, 0);
      if (ok) right++;
      per[q.section] = per[q.section] || { right: 0, total: 0 };
      per[q.section].total++;
      if (ok) per[q.section].right++;
      return { q, chosen, ok };
    });
    const score = Math.round((right / questions.length) * 100);
    const xp = questions.length * XP.examQuestion + (score >= exam.passing ? XP.examPass : 0);
    earn(xp);
    const res = { at: Date.now(), score, total: questions.length, right, bySection: per, seconds: run.minutes * 60 - left, xp };
    recordExam({ at: res.at, score, total: res.total, bySection: per });
    onSubmit({ ...res, review });
  };

  useEffect(() => { if (left === 0) submit(); }, [left]); // eslint-disable-line react-hooks/exhaustive-deps

  const q = questions[i];
  const chosen = answers[q.id] || [];
  const multi = q.answer.length > 1;
  const toggle = (k) => setAnswers((a) => {
    const cur = a[q.id] || [];
    const next = multi ? (cur.includes(k) ? cur.filter((x) => x !== k) : [...cur, k].slice(-q.answer.length)) : [k];
    return { ...a, [q.id]: next };
  });
  const answered = Object.values(answers).filter((x) => x.length).length;
  const mm = Math.floor(left / 60);
  const low = left < 300;

  return (
    <main className="screen focus" id="main">
      <div className="quiz-top">
        <button className="icon-btn" onClick={() => { if (confirm('Leave this mock exam? Progress in it will be lost.')) onQuit(); }} aria-label="Quit exam">✕</button>
        <div className="bar" role="progressbar" aria-label="Answered" aria-valuemin={0} aria-valuemax={questions.length} aria-valuenow={answered}>
          <span style={{ width: `${Math.max(2, (answered / questions.length) * 100)}%` }} />
        </div>
        <span className="timer-pill" role="timer" aria-label={`${mm} minutes left`} style={low ? { background: 'var(--incorrect-bg)' } : undefined}>
          ⏱ {mm}:{String(left % 60).padStart(2, '0')}
        </span>
        <ParkIt />
      </div>
      <div className="spread">
        <button className="chip" style={{ border: 0, minHeight: 40 }} onClick={() => setGrid(true)} aria-label="Open question map">
          Q {i + 1}/{questions.length} ▾
        </button>
        <button
          className="chip" style={{ border: 0, minHeight: 40, background: flags[q.id] ? 'var(--gold)' : undefined, color: flags[q.id] ? 'var(--on-gold)' : undefined }}
          aria-pressed={!!flags[q.id]} onClick={() => { sfx.tap(); setFlags((f) => ({ ...f, [q.id]: !f[q.id] })); }}
        >🚩 {flags[q.id] ? 'Flagged' : 'Flag'}</button>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={q.id} initial={reduced ? { opacity: 0 } : { opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={reduced ? { opacity: 0 } : { opacity: 0, x: -30 }} transition={{ duration: 0.22 }}>
          <QuestionView question={q} chosen={chosen} onToggle={toggle} revealed={false} />
        </motion.div>
      </AnimatePresence>

      <div style={{ flex: 1 }} />
      <div className="sticky-actions" style={{ gridTemplateColumns: '1fr 2fr' }}>
        <button className="btn" disabled={i === 0} onClick={() => { sfx.flip(); setI(i - 1); }}>← Prev</button>
        {i + 1 < questions.length
          ? <button className="btn primary" onClick={() => { sfx.flip(); setI(i + 1); }}>Next →</button>
          : <button className="btn gold" onClick={() => setGrid(true)}>Review & submit</button>}
      </div>

      <AnimatePresence>
        {grid && (
          <>
            <motion.div className="scrim" onClick={() => setGrid(false)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
            <motion.div
              className="sheet" role="dialog" aria-modal="true" aria-labelledby="grid-title"
              initial={{ y: '100%', x: '-50%' }} animate={{ y: 0, x: '-50%' }} exit={{ y: '100%', x: '-50%' }}
              transition={{ type: 'spring', stiffness: 400, damping: 34 }}
            >
              <div className="sheet-handle" />
              <h2 id="grid-title">Question map</h2>
              <p className="small muted">{answered}/{questions.length} answered · {Object.values(flags).filter(Boolean).length} flagged</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(48px, 1fr))', gap: 8 }}>
                {questions.map((qq, k) => {
                  const a = answers[qq.id]?.length;
                  return (
                    <button
                      key={qq.id} className="btn small" style={{ minHeight: 48, padding: 0, ...(a ? { '--b-bg': 'var(--primary-soft)' } : {}), ...(k === i ? { outline: '2px solid var(--text)' } : {}) }}
                      onClick={() => { setI(k); setGrid(false); }}
                      aria-label={`Question ${k + 1}${a ? ', answered' : ', not answered'}${flags[qq.id] ? ', flagged' : ''}`}
                    >{flags[qq.id] ? '🚩' : ''}{k + 1}</button>
                  );
                })}
              </div>
              <button className="btn primary block big" onClick={() => { haptic('medium'); submit(); }}>
                Submit exam {answered < questions.length ? `(${questions.length - answered} blank)` : '✓'}
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </main>
  );
}

function ExamResult({ result, onClose }) {
  const pass = result.score >= exam.passing;
  const { celebrate } = useFeedback();
  const reduced = useReducedMotion();
  const [filter, setFilter] = useState('wrong');
  useEffect(() => { if (pass) { celebrate(60); sfx.levelUp(); haptic('celebrate'); } else { sfx.done(); } }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const list = useMemo(() => result.review.filter((r) => filter === 'all' || !r.ok), [result, filter]);

  return (
    <main className="screen" id="main">
      <motion.div className="hero stack center" initial={reduced ? { opacity: 0 } : { scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 380, damping: 24 }}>
        <div style={{ fontSize: 64 }} aria-hidden="true">{pass ? '🏆' : '🧗'}</div>
        <h1>{pass ? 'You passed the mock!' : 'Not yet, and that’s data!'}</h1>
        <p style={{ fontSize: 40, fontWeight: 700 }}>{result.score}%</p>
        <p className="muted">{result.right}/{result.total} correct · {Math.round(result.seconds / 60)} min · pass mark {exam.passing}%</p>
        <span className="chip gold" style={{ justifySelf: 'center' }}>+{result.xp} XP</span>
        {!pass && <p className="small">Every miss is now in your review queue, so you’ll see it again at the right moment.</p>}
      </motion.div>

      <div className="card stack">
        <strong>By section</strong>
        {sections.map((s) => {
          const r = result.bySection[s.id];
          if (!r) return null;
          const p = Math.round((r.right / r.total) * 100);
          return (
            <div key={s.id} className="stack-s">
              <div className="spread small"><span>{s.emoji} {s.title}</span><strong>{p}%</strong></div>
              <div className="bar"><span style={{ width: `${Math.max(2, p)}%` }} /></div>
            </div>
          );
        })}
      </div>

      <div className="segmented" role="radiogroup" aria-label="Review filter">
        <button role="radio" aria-checked={filter === 'wrong'} onClick={() => setFilter('wrong')}>Missed ({result.review.filter((r) => !r.ok).length})</button>
        <button role="radio" aria-checked={filter === 'all'} onClick={() => setFilter('all')}>All</button>
      </div>
      <ul className="list-plain">
        {list.map(({ q, chosen, ok }) => (
          <li key={q.id} className={`feedback ${ok ? 'right' : 'wrong'}`}>
            <div className="verdict small"><span aria-hidden="true">{ok ? '✓' : '✗'}</span> {ok ? 'Correct' : 'Missed'} · {sectionById[q.section].emoji}</div>
            <strong><Rich text={cleanQuestion(q.q)} /></strong>
            <p className="small">Your answer: {chosen.length ? chosen.map((c) => 'ABCDE'[c]).join(', ') : 'blank'} · Correct: {q.answer.map((c) => 'ABCDE'[c]).join(', ')}</p>
            <ul className="small" style={{ margin: 0, paddingLeft: '1.2em' }}>
              {q.answer.map((a) => <li key={a}><Rich text={q.options[a]} /></li>)}
            </ul>
            <p className="small"><Rich text={q.explain} /></p>
          </li>
        ))}
      </ul>
      <button className="btn primary block" onClick={onClose}>Back to exam menu</button>
    </main>
  );
}
