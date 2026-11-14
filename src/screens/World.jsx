// One world: a winding path of levels (lessons, 💀 Hard, 👹 Boss) over themed scenery. Zap waits at your next level.
import { motion } from 'motion/react';
import { useStore } from '../state/store.js';
import { sectionById } from '../data/index.js';
import { WORLD_THEMES, isLevelOpen, isWorldOpen, worldStars } from '../game/worlds.js';
import { worldLevels, routeForLevel } from '../state/gameSelectors.js';
import { sectionMastery } from '../engine/mastery.js';
import { Zap } from '../components/game/Zap.jsx';
import { Stars } from '../components/game/Stars.jsx';
import { CoinChip } from '../components/game/CoinChip.jsx';
import { go, back } from '../hooks/useRoute.js';
import { useReducedMotion } from '../hooks/useMotionPrefs.js';
import { sfx } from '../audio/sfx.js';
import { haptic } from '../audio/haptics.js';

const ROW = 112;
const xFor = (i) => 50 + Math.sin(i * 1.1) * 26; // % across

export function World({ id }) {
  const s = useStore();
  const reduced = useReducedMotion();
  const sec = sectionById[id];
  const t = WORLD_THEMES[id];
  if (!sec || !t) return <main className="screen"><p>World not found.</p></main>;
  if (!isWorldOpen(id, s.stars, s.unlockedWorlds)) {
    return <main className="screen"><p>🔒 This world is still locked.</p><button className="btn" onClick={() => go('/map')}>Back to map</button></main>;
  }
  const levels = worldLevels[id];
  const current = levels.findIndex((l, k) => !(s.stars[l.id] > 0) && isLevelOpen(levels, k, s.stars));
  const ws = worldStars(sec, s.stars);
  const height = levels.length * ROW + 40;
  const pts = levels.map((_, i) => [xFor(i), i * ROW + 50]);
  const d = pts.map(([x, y], i) => {
    if (!i) return `M ${x} ${y}`;
    const [px, py] = pts[i - 1];
    return `C ${px} ${py + ROW / 2}, ${x} ${y - ROW / 2}, ${x} ${y}`;
  }).join(' ');
  const style = { '--sky1': t.sky[0], '--sky2': t.sky[1], '--sky1d': t.skyDark[0], '--sky2d': t.skyDark[1], '--accent': sec.accent };
  const mastery = Math.round(sectionMastery(sec, s.items) * 100);

  return (
    <main className="screen world-screen sky" id="main" style={style}>
      <div className="topbar">
        <button className="icon-btn" onClick={() => back('/map')} aria-label="Back to map">←</button>
        <h1 className="grow">{t.emoji} {t.name}</h1>
        <CoinChip />
      </div>
      <div className="card tight stack-s world-info">
        <p className="small"><strong>{sec.emoji} {sec.title}</strong> · {sec.weight}% of exam · {mastery}% mastered</p>
        <div className="spread small"><span>⭐ {ws.got}/{ws.max}</span><span>{levels.length} levels</span></div>
        <div className="row">
          <a className="btn small grow" href={`#/sprint?section=${sec.id}`} onClick={() => sfx.tap()}>⚡ Practice</a>
          <a className="btn small grow" href={`#/cards?section=${sec.id}`} onClick={() => sfx.tap()}>🃏 Cards</a>
        </div>
      </div>

      <div className="path-map" style={{ height }}>
        <svg className="path-line" viewBox={`0 0 100 ${height}`} preserveAspectRatio="none" aria-hidden="true">
          <path d={d} fill="none" stroke="var(--path-color)" strokeWidth="10" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
          <path d={d} fill="none" stroke="var(--surface)" strokeWidth="3" strokeDasharray="2 10" strokeLinecap="round" vectorEffect="non-scaling-stroke" opacity="0.8" />
        </svg>
        {levels.map((l, i) => {
          if (i % 2) return null;
          const e = t.scenery[(i / 2) % t.scenery.length];
          const x = xFor(i) > 50 ? 12 : 84;
          return (
            <motion.span key={'sc' + i} className="scenery" aria-hidden="true" style={{ left: `${x}%`, top: i * ROW + 30 }}
              animate={reduced || s.settings.calm ? {} : { y: [0, -6, 0], rotate: [0, 4, 0] }} transition={{ duration: 3.5 + (i % 3), repeat: Infinity, ease: 'easeInOut' }}>{e}</motion.span>
          );
        })}
        <ol className="list-plain">
          {levels.map((l, i) => {
            const st = s.stars[l.id] ?? 0;
            const open = isLevelOpen(levels, i, s.stars);
            const isCur = i === current;
            const kind = l.kind;
            const label = `${kind === 'boss' ? 'Boss: ' : kind === 'hard' ? 'Hard level: ' : `Level ${i + 1}: `}${l.title}. ${open ? (st ? `${st} stars` : isCur ? 'Up next' : 'Open') : 'Locked'}`;
            return (
              <li key={l.id} className="node-wrap" style={{ left: `${xFor(i)}%`, top: i * ROW + 50 }}>
                {isCur && (
                  <div className={`zap-here ${xFor(i) > 50 ? 'left' : 'right'}`} aria-hidden="true"><Zap size={44} mood="happy" /></div>
                )}
                <motion.button
                  className={`level-node ${kind} ${st ? 'done' : ''} ${isCur ? 'current' : ''} ${open ? '' : 'locked'}`}
                  disabled={!open}
                  aria-label={label}
                  onClick={() => { sfx.tap(); haptic('light'); go(routeForLevel(l)); }}
                  initial={reduced ? false : { scale: 0, opacity: 0 }}
                  animate={isCur && !reduced && !s.settings.calm ? { scale: [1, 1.08, 1], opacity: 1 } : { scale: 1, opacity: 1 }}
                  transition={isCur ? { scale: { duration: 1.6, repeat: Infinity }, opacity: { duration: 0.3 } } : { delay: i * 0.04, type: 'spring', stiffness: 400, damping: 18 }}
                  whileTap={reduced ? undefined : { scale: 0.9 }}
                >
                  <span aria-hidden="true">
                    {!open ? '🔒' : kind === 'boss' ? t.boss.emoji : kind === 'hard' ? '💀' : st ? '★' : i + 1}
                  </span>
                </motion.button>
                <div className="node-label" aria-hidden="true">
                  {st > 0 ? <Stars count={st} size={14} /> : <span>{kind === 'boss' ? 'BOSS' : kind === 'hard' ? 'HARD' : l.title}</span>}
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      {sec.objectives?.length > 0 && (
        <details className="card">
          <summary style={{ fontWeight: 700, cursor: 'pointer', minHeight: 32 }}>Official exam objectives</summary>
          <ul className="small" style={{ marginBottom: 0 }}>{sec.objectives.map((o) => <li key={o}>{o}</li>)}</ul>
        </details>
      )}
    </main>
  );
}
