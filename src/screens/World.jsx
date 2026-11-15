// One world: a winding road that climbs from Level 1 at the bottom to the Boss at the summit, over themed
// scenery. Zap waits at your next level, and the screen opens scrolled to it. The DOM stays in level order
// (Level 1 first), so screen readers and the keyboard go Level 1 to the Boss; only the drawing is bottom-up.
import { useEffect, useRef } from 'react';
import { savedRunIds } from '../state/runSession.js';
import { motion } from 'motion/react';
import { useStore } from '../state/store.js';
import { sectionById } from '../data/index.js';
import { WORLD_THEMES, isLevelOpen, isWorldOpen, worldStars } from '../game/worlds.js';
import { worldLevels, routeForLevel } from '../state/gameSelectors.js';
import { sectionMastery } from '../engine/mastery.js';
import { Zap } from '../components/game/Zap.jsx';
import { Stars } from '../components/game/Stars.jsx';
import { CoinChip } from '../components/game/CoinChip.jsx';
import { Icon } from '../components/icons/Icon.jsx';
import { WorldEmblem } from '../components/art/WorldEmblem.jsx';
import { BossArt } from '../components/art/BossArt.jsx';
import { Scenery } from '../components/art/Scenery.jsx';
import { go } from '../hooks/useRoute.js';
import { useReducedMotion } from '../hooks/useMotionPrefs.js';
import { sfx } from '../audio/sfx.js';
import { haptic } from '../audio/haptics.js';

const ROW = 112;
const TOP = 76;    // room above the summit (the Boss node is bigger)
const BOSS_GAP = 44; // extra climb between the last level and the Boss, so the big Boss node never crowds it
const BOTTOM = 70; // room below Level 1 for its label
const xFor = (i) => 50 + Math.sin(i * 1.1) * 24; // % across

/** The node's contents: lock, boss, Hard mark, a star when done, or its number. */
function NodeFace({ level, index, open, stars, world }) {
  if (!open) return <Icon name="lock" />;
  if (level.kind === 'boss') return <BossArt world={world} size={64} mood={stars ? 'defeated' : 'idle'} />;
  if (level.kind === 'hard') return <Icon name="skull" />;
  if (stars) return <Icon name="star" fill />;
  return <span className="node-num">{index + 1}</span>;
}

export function World({ id }) {
  const s = useStore();
  const reduced = useReducedMotion();
  const mapRef = useRef(null);
  const sec = sectionById[id];
  const t = WORLD_THEMES[id];
  const open = sec && t && isWorldOpen(id, s.stars, s.unlockedWorlds);

  // Open on the current level, roughly centred (after the app's own scroll-to-top on route change).
  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => {
      const node = mapRef.current?.querySelector('.level-node.current') ?? mapRef.current?.querySelector('.level-node.boss');
      if (!node) return;
      const r = node.getBoundingClientRect();
      const top = Math.max(0, window.scrollY + r.top + r.height / 2 - window.innerHeight / 2);
      window.scrollTo({ top, behavior: reduced ? 'auto' : 'smooth' });
    }, 140);
    return () => clearTimeout(timer);
  }, [id, open]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!sec || !t) return <main className="screen" id="main"><h1>World not found.</h1></main>;
  if (!open) {
    return (
      <main className="screen" id="main">
        <h1 className="title-with-icon"><span className="ic-tile" aria-hidden="true"><Icon name="lock" /></span>This world is still locked.</h1>
        <button className="btn" onClick={() => go('/map')}><Icon name="back" /> Back to map</button>
      </main>
    );
  }
  const levels = worldLevels[id];
  const n = levels.length;
  const inProgress = savedRunIds();
  const current = levels.findIndex((l, k) => !(s.stars[l.id] > 0) && isLevelOpen(levels, k, s.stars));
  const ws = worldStars(sec, s.stars);
  const height = TOP + (n - 1) * ROW + BOSS_GAP + BOTTOM;
  const yFor = (i) => TOP + (n - 1 - i) * ROW + (i < n - 1 ? BOSS_GAP : 0); // Level 1 at the bottom, the Boss at the top
  const pts = levels.map((_, i) => [xFor(i), yFor(i)]);
  const d = pts.map(([x, y], i) => {
    if (!i) return `M ${x} ${y}`;
    const [px, py] = pts[i - 1];
    const h = (y - py) / 2;
    return `C ${px} ${py + h}, ${x} ${y - h}, ${x} ${y}`;
  }).join(' ');
  const style = { '--sky1': t.sky[0], '--sky2': t.sky[1], '--sky1d': t.skyDark[0], '--sky2d': t.skyDark[1], '--accent': sec.accent };
  const mastery = Math.round(sectionMastery(sec, s.items) * 100);

  return (
    <main className="screen world-screen sky" id="main" style={style}>
      <div className="topbar">
        <button className="icon-btn" onClick={() => go('/map')} aria-label="Back to map"><Icon name="back" /></button>
        <h1 className="grow title-with-icon"><WorldEmblem world={id} size={36} />{t.name}</h1>
        <CoinChip />
      </div>
      <div className="card tight stack-s world-info">
        <p className="small with-icon"><Icon name={sec.id} style={{ color: 'var(--accent)' }} /> <span><strong>{sec.title}</strong> · {sec.weight}% of exam · {mastery}% mastered</span></p>
        <div className="spread small">
          <span className="with-icon"><Icon name="star" fill className="ic-gold-fill" /> {ws.got}/{ws.max}<span className="sr-only"> stars</span></span>
          <span>{n} levels</span>
        </div>
        <div className="row world-actions">
          <a className="btn small grow" href={`#/sprint?section=${sec.id}`} onClick={() => sfx.tap()}><Icon name="bolt" /> Practice</a>
          <a className="btn small grow" href={`#/cards?section=${sec.id}`} onClick={() => sfx.tap()}><Icon name="cards" /> Cards</a>
          {!s.placements?.[sec.id] && <a className="btn small grow" href={`#/placement/${sec.id}`} onClick={() => sfx.tap()}><Icon name="target" /> Skip what I know</a>}
        </div>
      </div>

      <div className="path-map" style={{ height }} ref={mapRef}>
        <Scenery world={id} variant="path" />
        <svg className="path-line" viewBox={`0 0 100 ${height}`} preserveAspectRatio="none" aria-hidden="true">
          <path d={d} fill="none" stroke="var(--path-color)" strokeWidth="12" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
          <path d={d} fill="none" stroke="var(--surface)" strokeWidth="3" strokeDasharray="2 10" strokeLinecap="round" vectorEffect="non-scaling-stroke" opacity="0.8" />
        </svg>
        <ol className="list-plain" aria-label={`${t.name} levels, from Level 1 to the Boss`}>
          {levels.map((l, i) => {
            const st = s.stars[l.id] ?? 0;
            const paused = inProgress.has(l.kind === 'lesson' ? l.lessonId : l.id);
            const isOpen = isLevelOpen(levels, i, s.stars);
            const isCur = i === current;
            const kind = l.kind;
            const label = `${kind === 'boss' ? 'Boss: ' : kind === 'hard' ? 'Hard level: ' : `Level ${i + 1}: `}${l.title}. ${isOpen ? (st ? `${st} stars` : isCur ? 'Up next' : 'Open') : 'Locked'}${paused ? '. In progress, tap to resume' : ''}`;
            return (
              <li key={l.id} className={`node-wrap ${kind}`} style={{ left: `${xFor(i)}%`, top: yFor(i) }}>
                {isCur && (
                  <div className={`zap-here ${xFor(i) > 50 ? 'left' : 'right'}`} aria-hidden="true"><Zap size={44} mood="happy" /></div>
                )}
                <motion.button
                  className={`level-node ${kind} ${st ? 'done' : ''} ${isCur ? 'current' : ''} ${isOpen ? '' : 'locked'}`}
                  disabled={!isOpen}
                  style={kind === 'hard' ? { rotate: 45 } : undefined}
                  aria-label={label}
                  onClick={() => { sfx.tap(); haptic('light'); go(routeForLevel(l)); }}
                  initial={reduced ? false : { scale: 0, opacity: 0 }}
                  animate={isCur && !reduced && !s.settings.calm ? { scale: [1, 1.08, 1], opacity: 1 } : { scale: 1, opacity: 1 }}
                  transition={isCur ? { scale: { duration: 1.6, repeat: Infinity }, opacity: { duration: 0.3 } } : { delay: (n - i) * 0.03, type: 'spring', stiffness: 400, damping: 18 }}
                  whileTap={reduced ? undefined : { scale: 0.9 }}
                >
                  <span className="node-face" aria-hidden="true">
                    <NodeFace level={l} index={i} open={isOpen} stars={st} world={id} />
                  </span>
                </motion.button>
                {paused && <span className="node-paused" aria-hidden="true"><Icon name="pause" fill /></span>}
                <div className="node-label" aria-hidden="true">
                  <span>{kind === 'boss' ? 'BOSS' : kind === 'hard' ? 'HARD' : l.title}</span>
                  {st > 0 && <Stars count={st} size={14} />}
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      {sec.objectives?.length > 0 && (
        <details className="card disclosure">
          <summary><Icon name="checklist" /> <span className="grow">Official exam objectives</span> <Icon name="down" className="disclosure-chev" /></summary>
          <ul className="small" style={{ marginBottom: 0 }}>{sec.objectives.map((o) => <li key={o}>{o}</li>)}</ul>
        </details>
      )}
    </main>
  );
}
