import { motion } from 'motion/react';
import { useStore } from '../state/store.js';
import { sectionById } from '../data/index.js';
import { sectionMastery } from '../engine/mastery.js';
import { back } from '../hooks/useRoute.js';
import { useReducedMotion } from '../hooks/useMotionPrefs.js';
import { sfx } from '../audio/sfx.js';

export function Section({ id }) {
  const s = useStore();
  const reduced = useReducedMotion();
  const sec = sectionById[id];
  if (!sec) return <main className="screen"><p>Section not found.</p></main>;
  const firstOpen = sec.lessons.findIndex((l) => !s.lessons[l.id]);
  const m = Math.round(sectionMastery(sec, s.items) * 100);

  return (
    <main className="screen" id="main" style={{ '--accent': sec.accent }}>
      <div className="topbar">
        <button className="icon-btn" onClick={() => back('/learn')} aria-label="Back">←</button>
        <h1 className="grow">{sec.emoji} {sec.title}</h1>
      </div>
      <div className="card stack-s">
        <p>{sec.summary}</p>
        <div className="row small muted"><span className="chip">{sec.weight}% of exam</span><span className="chip">{m}% mastered</span><span className="chip">{sec.questions.length} questions</span></div>
      </div>
      <div className="row">
        <a className="btn primary grow" href={`#/sprint?section=${sec.id}`} onClick={() => sfx.tap()}>⚡ Practice</a>
        <a className="btn grow" href={`#/cards?section=${sec.id}`} onClick={() => sfx.tap()}>🃏 Flashcards</a>
      </div>
      <ol className="path list-plain" aria-label="Lessons">
        {sec.lessons.map((l, i) => {
          const done = !!s.lessons[l.id];
          const next = i === firstOpen;
          return (
            <motion.li
              key={l.id}
              initial={reduced ? false : { opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05, type: 'spring', stiffness: 400, damping: 25 }}
              style={{ display: 'contents' }}
            >
              <a className={`path-node ${done ? 'done' : ''} ${next ? 'next' : ''}`} href={`#/lesson/${l.id}`} onClick={() => sfx.tap()}>
                <motion.span
                  className="dot" aria-hidden="true"
                  animate={next && !reduced && !s.settings.calm ? { scale: [1, 1.08, 1] } : {}}
                  transition={{ duration: 1.4, repeat: 3 }}
                >{done ? '★' : next ? '▶' : i + 1}</motion.span>
                <span>
                  <strong>{l.title}</strong><br />
                  <span className="small muted">{done ? 'Done · tap to replay' : next ? `Up next · ${l.minutes} min` : `${l.minutes} min`}</span>
                </span>
              </a>
            </motion.li>
          );
        })}
      </ol>
      {sec.objectives?.length > 0 && (
        <details className="card">
          <summary style={{ fontWeight: 700, cursor: 'pointer', minHeight: 32 }}>Official exam objectives</summary>
          <ul className="small" style={{ marginBottom: 0 }}>{sec.objectives.map((o) => <li key={o}>{o}</li>)}</ul>
        </details>
      )}
    </main>
  );
}
