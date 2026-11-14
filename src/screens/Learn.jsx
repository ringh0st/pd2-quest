import { motion } from 'motion/react';
import { useStore } from '../state/store.js';
import { sections, exam } from '../data/index.js';
import { sectionMastery, lessonsDone } from '../engine/mastery.js';
import { ProgressRing } from '../components/ProgressRing.jsx';
import { useReducedMotion } from '../hooks/useMotionPrefs.js';
import { sfx } from '../audio/sfx.js';

export function Learn() {
  const s = useStore();
  const reduced = useReducedMotion();
  return (
    <main className="screen" id="main">
      <header className="stack-s">
        <h1>🗺️ Your PD2 map</h1>
        <p className="muted">5 exam sections. Bigger % = more exam questions. Tap one to explore.</p>
      </header>
      <ul className="list-plain">
        {sections.map((sec, i) => {
          const m = sectionMastery(sec, s.items);
          const done = lessonsDone(sec, s.lessons);
          return (
            <motion.li
              key={sec.id}
              initial={reduced ? false : { opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06, duration: 0.3, ease: [0.2, 0, 0, 1] }}
            >
              <a className="card link section-card" href={`#/section/${sec.id}`} style={{ '--accent': sec.accent }} onClick={() => sfx.tap()}>
                <span className="section-emoji" aria-hidden="true">{sec.emoji}</span>
                <span className="stack-s" style={{ gap: 4 }}>
                  <strong>{sec.title}</strong>
                  <span className="small muted">{sec.weight}% of exam · {done}/{sec.lessons.length} lessons</span>
                </span>
                <ProgressRing value={m} size={52} stroke={7} color={sec.accent} label={`${Math.round(m * 100)}% mastered`}>
                  <span style={{ fontSize: 13, fontWeight: 700 }}>{Math.round(m * 100)}%</span>
                </ProgressRing>
              </a>
            </motion.li>
          );
        })}
      </ul>
      <a className="card link row" href="#/resources" onClick={() => sfx.tap()}>
        <span aria-hidden="true" style={{ fontSize: 26 }}>📚</span>
        <span className="grow"><strong>Free official resources</strong><br /><span className="small muted">{exam.resources.length} Trailhead modules & docs + a {exam.studyPlan.length}-week plan</span></span>
        <span aria-hidden="true">›</span>
      </a>
    </main>
  );
}
