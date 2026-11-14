// Home = game hub: Zap says hi, one big "continue adventure" button, Daily Bolt, quests, readiness.
import { useState } from 'react';
import { motion } from 'motion/react';
import { useStore } from '../state/store.js';
import { levelFor, rankFor } from '../engine/xp.js';
import { liveStreak } from '../engine/streak.js';
import { readiness, weakestSection } from '../engine/mastery.js';
import { dayKey, daysUntil } from '../engine/dates.js';
import { sections, exam } from '../data/index.js';
import { dueQuestionCount, greeting } from '../state/selectors.js';
import { continueLevel, routeForLevel } from '../state/gameSelectors.js';
import { WORLD_THEMES } from '../game/worlds.js';
import { zapSays } from '../game/mascot.js';
import { ProgressRing } from '../components/ProgressRing.jsx';
import { CountUp } from '../components/CountUp.jsx';
import { ZapSays } from '../components/game/Zap.jsx';
import { CoinChip } from '../components/game/CoinChip.jsx';
import { DailyQuests } from '../components/game/DailyQuests.jsx';
import { ParkIt } from '../components/ParkIt.jsx';
import { go } from '../hooks/useRoute.js';
import { useReducedMotion } from '../hooks/useMotionPrefs.js';
import { sfx } from '../audio/sfx.js';
import { haptic } from '../audio/haptics.js';

const tip = exam.tips[new Date().getDate() % exam.tips.length];

function firstLine(s) {
  const h = new Date().getHours();
  if (h >= 23 || h < 5) return zapSays('sleepy');
  if (s.streak.lastDay && s.streak.lastDay !== dayKey() && liveStreak(s.streak) === 0) return zapSays('back');
  return zapSays('hello');
}

export function Home() {
  const s = useStore();
  const reduced = useReducedMotion();
  const [line, setLine] = useState(() => firstLine(s));
  const lv = levelFor(s.xp);
  const streak = liveStreak(s.streak);
  const today = s.today.day === dayKey() ? s.today : { xp: 0 };
  const goalP = Math.min(1, today.xp / s.dailyGoal);
  const dueQ = dueQuestionCount(s.items);
  const weak = weakestSection(sections, s.items);
  const ready = readiness(sections, s.items);
  const examIn = daysUntil(s.examDate);
  const next = continueLevel(s.stars, s.unlockedWorlds);
  const nextTheme = next ? WORLD_THEMES[next.world] : null;
  const boltDone = s.bolt.day === dayKey();

  const primary = next
    ? {
      label: next.kind === 'boss' ? `Fight ${nextTheme.boss.name}!` : next.kind === 'hard' ? `${next.title}: Hard level` : next.title,
      sub: `${nextTheme.emoji} ${nextTheme.name}${next.kind === 'lesson' ? ` · ${next.minutes} min` : ''}`,
      to: routeForLevel(next),
      emoji: next.kind === 'boss' ? nextTheme.boss.emoji : next.kind === 'hard' ? '💀' : '▶',
    }
    : { label: 'Open the map', sub: 'Unlock the next world', to: '/map', emoji: '🗺️' };

  const enter = (i) => (reduced ? {} : { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.05 * i, duration: 0.35, ease: [0.2, 0, 0, 1] } });
  const tap = (to) => () => { sfx.tap(); haptic('light'); go(to); };

  return (
    <main className="screen" id="main">
      <motion.header className="spread wrap" {...enter(0)}>
        <p className="muted small" style={{ fontWeight: 700, flex: '1 1 140px' }}>{greeting()}{s.name ? `, ${s.name}` : ''}</p>
        <div className="row" style={{ gap: 8 }}>
          <button className="chip" style={{ border: 0, minHeight: 44, fontSize: 17 }} onClick={tap('/me')}>
            <span className="sr-only">Streak: </span>
            <motion.span aria-hidden="true" animate={reduced || !streak || s.settings.calm ? {} : { scale: [1, 1.15, 1], rotate: [0, -5, 5, 0] }} transition={{ duration: 1.6, repeat: 1 }}>🔥</motion.span>
            <CountUp value={streak} />
            <span className="sr-only"> days, {s.streak.freezes} freezes. Open profile</span>
            {s.streak.freezes > 0 && <span aria-hidden="true" style={{ fontSize: 13 }}>🧊{s.streak.freezes}</span>}
          </button>
          <CoinChip />
          <ParkIt />
        </div>
      </motion.header>

      <motion.button className="zap-card" {...enter(1)} onClick={() => { sfx.flip(); setLine(zapSays('idle')); }} aria-label={`Zap says: ${line}. Tap for another`}>
        <ZapSays text={line} mood="happy" size={70} />
      </motion.button>

      <motion.section className="hero stack" aria-label="Today" {...enter(2)}>
        <div className="row wrap" style={{ gap: 16 }}>
          <ProgressRing value={goalP} size={84} stroke={10} color={goalP >= 1 ? 'var(--gold-meter)' : 'var(--primary)'} label={`Daily goal ${today.xp} of ${s.dailyGoal} XP`}>
            <div>
              <div style={{ fontSize: 20, fontWeight: 700 }}>{goalP >= 1 ? '🎯' : <CountUp value={today.xp} />}</div>
              <div className="small muted" style={{ fontSize: 11 }}>/ {s.dailyGoal} XP</div>
            </div>
          </ProgressRing>
          <div className="grow stack-s" style={{ flex: '1 1 150px' }}>
            <div className="spread"><strong>Level {lv.level}</strong><span className="small muted">{lv.into}/{lv.span} XP</span></div>
            <div className="bar gold" role="progressbar" aria-label="Level progress" aria-valuenow={Math.round(lv.progress * 100)} aria-valuemin={0} aria-valuemax={100}>
              <span style={{ width: `${Math.max(3, lv.progress * 100)}%` }} />
            </div>
            <span className="small muted">{rankFor(lv.level)}</span>
          </div>
        </div>

        <motion.button
          className="btn primary block big play-btn"
          onClick={tap(primary.to)}
          whileTap={reduced ? undefined : { scale: 0.97 }}
          animate={reduced || s.settings.calm ? {} : { y: [0, -3, 0] }}
          transition={{ duration: 2.4, repeat: 2, ease: 'easeInOut' }}
        >
          <span className="play-emoji" aria-hidden="true">{primary.emoji}</span>
          <span className="stack-s" style={{ gap: 0, textAlign: 'left' }}>
            <span style={{ fontSize: 'calc(19px * var(--text-scale))' }}>{primary.label}</span>
            <span style={{ fontSize: 'var(--fs-small)', fontWeight: 400 }}>{primary.sub}</span>
          </span>
        </motion.button>
      </motion.section>

      <motion.div className="stat-row" {...enter(3)}>
        <a className={`stat card link ${boltDone ? '' : 'glow'}`} href="#/bolt" onClick={() => sfx.tap()}>
          <span aria-hidden="true" style={{ fontSize: 24 }}>{boltDone ? '✅' : '⚡'}</span><span className="lbl">Daily Bolt</span>
        </a>
        <a className="stat card link" href={dueQ ? '#/sprint?mode=review' : '#/sprint'} onClick={() => sfx.tap()} aria-label={dueQ ? `${dueQ} reviews due. Start` : 'Quick sprint'}>
          <span className="num">{dueQ ? dueQ : '⚡'}</span><span className="lbl">{dueQ ? 'Reviews due' : 'Quick sprint'}</span>
        </a>
        <a className="stat card link" href={`#/sprint?section=${weak?.id}`} onClick={() => sfx.tap()} aria-label={`Weak spot: ${weak?.title}. Practice it`}>
          <span aria-hidden="true" style={{ fontSize: 24 }}>{weak?.emoji}</span><span className="lbl">Weak spot</span>
        </a>
      </motion.div>

      <motion.div {...enter(4)}><DailyQuests /></motion.div>

      <motion.a className="card link stack-s" href="#/me" {...enter(5)}>
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

      <motion.aside className="card tight row" style={{ alignItems: 'flex-start' }} {...enter(6)} aria-label="Tip">
        <span aria-hidden="true" style={{ fontSize: 22 }}>💡</span>
        <p className="small">{tip}</p>
      </motion.aside>
    </main>
  );
}
