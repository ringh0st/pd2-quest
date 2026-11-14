import { motion } from 'motion/react';
import { useStore } from '../state/store.js';
import { levelFor, rankFor } from '../engine/xp.js';
import { liveStreak } from '../engine/streak.js';
import { readiness } from '../engine/mastery.js';
import { dayKey, daysUntil } from '../engine/dates.js';
import { sections, exam, sectionById } from '../data/index.js';
import { dueQuestionCount, dueCardCount, nextLesson, greeting } from '../state/selectors.js';
import { weakestSection } from '../engine/mastery.js';
import { ProgressRing } from '../components/ProgressRing.jsx';
import { CountUp } from '../components/CountUp.jsx';
import { go } from '../hooks/useRoute.js';
import { sfx } from '../audio/sfx.js';
import { haptic } from '../audio/haptics.js';
import { useReducedMotion } from '../hooks/useMotionPrefs.js';
import { ParkIt } from '../components/ParkIt.jsx';

const tip = exam.tips[new Date().getDate() % exam.tips.length];

export function Home() {
  const s = useStore();
  const reduced = useReducedMotion();
  const lv = levelFor(s.xp);
  const streak = liveStreak(s.streak);
  const today = s.today.day === dayKey() ? s.today : { xp: 0 };
  const goalP = Math.min(1, today.xp / s.dailyGoal);
  const dueQ = dueQuestionCount(s.items);
  const dueC = dueCardCount(s.cards);
  const lesson = nextLesson(s.lessons);
  const weak = weakestSection(sections, s.items);
  const ready = readiness(sections, s.items);
  const examIn = daysUntil(s.examDate);

  let primary;
  if (dueQ >= 3) primary = { label: `Review ${Math.min(dueQ, s.settings.sprintSize)} due questions`, sub: 'Fresh memories stick best. ~2 min', to: '/sprint?mode=review', emoji: '🔁' };
  else if (lesson) primary = { label: lesson.title, sub: `${sectionById[lesson.section].emoji} Next lesson · ${lesson.minutes} min`, to: `/lesson/${lesson.id}`, emoji: '▶' };
  else primary = { label: `${s.settings.sprintSize}-question sprint`, sub: 'Mixed topics, exam style', to: '/sprint', emoji: '⚡' };

  const enter = (i) => (reduced ? {} : { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.05 * i, duration: 0.35, ease: [0.2, 0, 0, 1] } });
  const tap = (to) => () => { sfx.tap(); haptic('light'); go(to); };

  return (
    <main className="screen" id="main">
      <motion.header className="spread" {...enter(0)}>
        <div>
          <p className="muted small" style={{ fontWeight: 700 }}>{greeting()}{s.name ? `, ${s.name}` : ''}</p>
          <h1>Let’s get you PD2 ready</h1>
        </div>
        <div className="row" style={{ gap: 8 }}>
        <ParkIt />
        <button className="chip" style={{ border: 0, minHeight: 44, fontSize: 18 }} onClick={tap('/me')} aria-label={`${streak} day streak, ${s.streak.freezes} freezes. Open profile`}>
          <motion.span
            aria-hidden="true"
            animate={reduced || !streak || s.settings.calm ? {} : { scale: [1, 1.12, 1], rotate: [0, -4, 4, 0] }}
            transition={{ duration: 1.6, repeat: 1 }}
          >🔥</motion.span>
          <CountUp value={streak} />
          {s.streak.freezes > 0 && <span aria-hidden="true" style={{ fontSize: 14 }}>🧊{s.streak.freezes}</span>}
        </button>
        </div>
      </motion.header>

      <motion.section className="hero stack" aria-label="Today" {...enter(1)}>
        <div className="row" style={{ gap: 16 }}>
          <ProgressRing value={goalP} size={92} stroke={11} color={goalP >= 1 ? 'var(--gold)' : 'var(--primary)'} label={`Daily goal ${today.xp} of ${s.dailyGoal} XP`}>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700 }}>{goalP >= 1 ? '🎯' : <CountUp value={today.xp} />}</div>
              <div className="small muted" style={{ fontSize: 12 }}>/ {s.dailyGoal} XP</div>
            </div>
          </ProgressRing>
          <div className="grow stack-s">
            <div className="spread"><strong>Level {lv.level}</strong><span className="small muted">{lv.into}/{lv.span} XP</span></div>
            <div className="bar gold" role="progressbar" aria-label="Level progress" aria-valuenow={Math.round(lv.progress * 100)} aria-valuemin={0} aria-valuemax={100}>
              <span style={{ width: `${Math.max(3, lv.progress * 100)}%` }} />
            </div>
            <span className="small muted">{rankFor(lv.level)}</span>
          </div>
        </div>

        <motion.button
          className="btn primary block big"
          style={{ flexDirection: 'column', gap: 2, padding: '14px 18px', minHeight: 84 }}
          onClick={tap(primary.to)}
          whileTap={reduced ? undefined : { scale: 0.97 }}
          animate={reduced || s.settings.calm ? {} : { y: [0, -3, 0] }}
          transition={{ duration: 2.4, repeat: 2, ease: 'easeInOut' }}
        >
          <span style={{ fontSize: 'calc(20px * var(--text-scale))' }}>{primary.emoji} {primary.label}</span>
          <span style={{ fontSize: 'var(--fs-small)', opacity: 0.9, fontWeight: 400 }}>{primary.sub}</span>
        </motion.button>
      </motion.section>

      <motion.div className="stat-row" {...enter(2)}>
        <a className="stat card link" href="#/sprint" onClick={() => sfx.tap()}>
          <span aria-hidden="true" style={{ fontSize: 24 }}>⚡</span><span className="lbl">Quick sprint</span>
        </a>
        <a className="stat card link" href="#/cards" onClick={() => sfx.tap()}>
          <span className="num">{dueC}</span><span className="lbl">Cards due</span>
        </a>
        <a className="stat card link" href={`#/sprint?section=${weak?.id}`} onClick={() => sfx.tap()} aria-label={`Weak spot: ${weak?.title}. Practice it`}>
          <span aria-hidden="true" style={{ fontSize: 24 }}>{weak?.emoji}</span><span className="lbl">Weak spot</span>
        </a>
      </motion.div>

      <motion.a className="card link stack-s" href="#/me" {...enter(3)} aria-label={`Exam readiness ${ready} percent`}>
        <div className="spread">
          <strong>🎓 Exam readiness</strong>
          <span style={{ fontWeight: 700, fontSize: 20 }}><CountUp value={ready} />%</span>
        </div>
        <div className="bar"><span style={{ width: `${Math.max(2, ready)}%` }} /></div>
        <span className="small muted">
          {examIn != null && examIn >= 0 ? `📅 Exam in ${examIn} day${examIn === 1 ? '' : 's'} · ` : ''}
          Aim for 85%+ before booking. Pass mark is {exam.passing}%.
        </span>
      </motion.a>

      <motion.aside className="card tight row" style={{ alignItems: 'flex-start' }} {...enter(4)} aria-label="Tip">
        <span aria-hidden="true" style={{ fontSize: 22 }}>💡</span>
        <p className="small">{tip}</p>
      </motion.aside>
    </main>
  );
}
