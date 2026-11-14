// Lesson: swipe through 4-7 tiny cards, then 2-3 check questions, then a celebration.
import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { lessonById, sectionById, questionById } from '../data/index.js';
import { completeLesson, earn, getState } from '../state/store.js';
import { XP } from '../engine/xp.js';
import { CodeBlock } from '../components/CodeBlock.jsx';
import { PracticeRunner } from '../components/PracticeRunner.jsx';
import { Rich } from '../lib/rich.jsx';
import { go, back } from '../hooks/useRoute.js';
import { useReducedMotion } from '../hooks/useMotionPrefs.js';
import { useFeedback } from '../components/Feedback.jsx';
import { sfx } from '../audio/sfx.js';
import { haptic } from '../audio/haptics.js';
import { nextLesson } from '../state/selectors.js';
import { ParkIt } from '../components/ParkIt.jsx';

const KIND_LABEL = { text: '', code: 'Code', tip: '💡 Memory hook', trap: '⚠️ Exam trap', list: '' };

export function Lesson({ id }) {
  const lesson = lessonById[id];
  const [phase, setPhase] = useState('cards'); // cards | check | done
  const [i, setI] = useState(0);
  const [dir, setDir] = useState(1);
  const [summary, setSummary] = useState(null);
  const reduced = useReducedMotion();
  const { celebrate } = useFeedback();

  if (!lesson) return <main className="screen"><p>Lesson not found.</p></main>;
  const sec = sectionById[lesson.section];
  const cards = lesson.cards;
  const card = cards[i];
  const checks = lesson.check.map((q) => questionById[q]).filter(Boolean);

  const move = (d) => {
    const n = i + d;
    if (n < 0) return;
    sfx.flip(); haptic('light');
    if (n >= cards.length) {
      earn(5);
      setPhase(checks.length ? 'check' : 'done');
      if (!checks.length) finish({ right: 0, total: 0 });
      return;
    }
    setDir(d); setI(n);
  };

  const finish = (result) => {
    const firstTime = !getState().lessons[lesson.id];
    completeLesson(lesson.id);
    if (firstTime) earn(XP.lessonDone);
    setSummary({ ...result, firstTime });
    setPhase('done');
    sfx.done(); haptic('success'); celebrate(40);
  };

  if (phase === 'check') {
    return (
      <main className="screen focus" id="main">
        <p className="small muted center" style={{ fontWeight: 700 }}>Quick check · {checks.length} questions</p>
        <PracticeRunner questions={checks} requeue={false} onExit={() => back(`/section/${sec.id}`)} onDone={finish} />
      </main>
    );
  }

  if (phase === 'done') {
    const nl = nextLesson(getState().lessons);
    return (
      <main className="screen focus" id="main" style={{ justifyContent: 'center' }}>
        <motion.div
          className="celebrate-card" style={{ margin: '0 auto' }}
          initial={reduced ? { opacity: 0 } : { scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 22 }}
        >
          <div className="big-emoji" aria-hidden="true">🏆</div>
          <h1>Lesson done!</h1>
          <p className="muted">{lesson.title}</p>
          {summary?.total > 0 && <p><strong>{summary.firstRight}/{summary.total}</strong> right on first try {summary.firstRight === summary.total ? '🎯' : '· misses come back for review 🌱'}</p>}
          {summary?.firstTime && <span className="chip gold">+{XP.lessonDone} XP lesson bonus</span>}
          {nl && <button className="btn primary block" autoFocus onClick={() => go(`/lesson/${nl.id}`)}>Next: {nl.title} →</button>}
          <button className="btn block" onClick={() => go('/')}>Done for now ✓</button>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="screen focus" id="main">
      <div className="quiz-top">
        <button className="icon-btn" onClick={() => back(`/section/${sec.id}`)} aria-label="Close lesson">✕</button>
        <div className="bar" role="progressbar" aria-label="Lesson progress" aria-valuemin={0} aria-valuemax={cards.length} aria-valuenow={i + 1}>
          <span style={{ width: `${((i + 1) / (cards.length + 1)) * 100}%` }} />
        </div>
        <span className="chip" aria-label={`Card ${i + 1} of ${cards.length}`}>{i + 1}/{cards.length}</span>
        <ParkIt />
      </div>
      <div>
        <p className="small muted" style={{ fontWeight: 700 }}>{sec.emoji} {sec.title}</p>
        <h1 style={{ fontSize: 'calc(22px * var(--text-scale))' }}>{lesson.title}</h1>
      </div>

      <div className="lesson-stage" aria-live="polite">
        <AnimatePresence mode="popLayout" initial={false} custom={dir}>
          <motion.article
            key={i}
            className={`lesson-card ${card.type}`}
            custom={dir}
            initial={reduced ? { opacity: 0 } : { opacity: 0, x: dir * 80, rotate: dir * 3 }}
            animate={{ opacity: 1, x: 0, rotate: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, x: dir * -80, rotate: dir * -3 }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            drag={reduced ? false : 'x'}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.6}
            onDragEnd={(_, info) => { if (info.offset.x < -70) move(1); else if (info.offset.x > 70) move(-1); }}
          >
            {(KIND_LABEL[card.type] || card.title) && <div className="kind">{KIND_LABEL[card.type] || ''}</div>}
            {card.title && <h2>{card.title}</h2>}
            {card.body && card.type !== 'code' && <p><Rich text={card.body} /></p>}
            {card.type === 'list' && <ul>{card.items.map((it, k) => <li key={k}><Rich text={it} /></li>)}</ul>}
            {card.type === 'code' && <><CodeBlock code={card.code} lang={card.lang} />{card.body && <p className="small"><Rich text={card.body} /></p>}</>}
          </motion.article>
        </AnimatePresence>
      </div>

      <div className="dots" aria-hidden="true">{cards.map((_, k) => <span key={k} className={k === i ? 'on' : ''} />)}</div>
      <p className="small muted center">Swipe or tap the buttons</p>
      <div className="sticky-actions" style={{ gridTemplateColumns: '1fr 2fr' }}>
        <button className="btn" onClick={() => move(-1)} disabled={i === 0} aria-label="Previous card">← Back</button>
        <button className="btn primary" onClick={() => move(1)}>{i + 1 >= cards.length ? (checks.length ? 'Quick check ⚡' : 'Finish 🎉') : 'Next →'}</button>
      </div>
    </main>
  );
}
