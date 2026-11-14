// The adventure map: five themed worlds (one per exam section). Worlds open with stars, or early with coins.
import { motion } from 'motion/react';
import { useStore, unlockWorld } from '../state/store.js';
import { sections, exam } from '../data/index.js';
import { WORLD_THEMES, WORLD_UNLOCK_STARS, WORLD_UNLOCK_COINS, isWorldOpen, worldStars, totalStars } from '../game/worlds.js';
import { CoinChip } from '../components/game/CoinChip.jsx';
import { useReducedMotion } from '../hooks/useMotionPrefs.js';
import { useFeedback } from '../components/Feedback.jsx';
import { go } from '../hooks/useRoute.js';
import { sfx } from '../audio/sfx.js';
import { haptic } from '../audio/haptics.js';

export function WorldMap() {
  const s = useStore();
  const reduced = useReducedMotion();
  const { showToast, celebrate } = useFeedback();
  const total = totalStars(s.stars);

  return (
    <main className="screen" id="main">
      <header className="spread">
        <h1>🗺️ Adventure</h1>
        <div className="row" style={{ gap: 8 }}>
          <span className="chip" aria-label={`${total} stars`}>⭐ {total}</span>
          <CoinChip />
        </div>
      </header>
      <p className="muted small">Five worlds, one per exam section. Beat lessons, crush Hard levels, defeat each Boss.</p>
      <ul className="list-plain world-list">
        {sections.map((sec, i) => {
          const t = WORLD_THEMES[sec.id];
          const open = isWorldOpen(sec.id, s.stars, s.unlockedWorlds);
          const ws = worldStars(sec, s.stars);
          const need = WORLD_UNLOCK_STARS[sec.id] - total;
          const style = { '--sky1': t.sky[0], '--sky2': t.sky[1], '--sky1d': t.skyDark[0], '--sky2d': t.skyDark[1], '--accent': sec.accent };
          return (
            <motion.li key={sec.id} initial={reduced ? false : { opacity: 0, y: 30, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: i * 0.08, type: 'spring', stiffness: 300, damping: 24 }}>
              <div className={`world-card sky ${open ? '' : 'locked'}`} style={style}>
                <div className="world-scenery" aria-hidden="true">
                  {t.scenery.slice(0, 3).map((e, k) => (
                    <motion.span key={k} style={{ left: `${58 + k * 13}%`, top: `${12 + (k % 2) * 30}%` }}
                      animate={reduced || s.settings.calm ? {} : { y: [0, -5, 0] }} transition={{ duration: 3 + k, repeat: Infinity, ease: 'easeInOut' }}>{e}</motion.span>
                  ))}
                </div>
                <div className="world-num">World {i + 1}</div>
                <div className="row" style={{ alignItems: 'flex-start' }}>
                  <span className="world-emoji" aria-hidden="true">{t.emoji}</span>
                  <div className="grow">
                    <h2>{t.name}</h2>
                    <p className="small">{sec.emoji} {sec.title} · {sec.weight}% of exam</p>
                  </div>
                </div>
                <div className="stack-s">
                  <div className="spread small"><span>⭐ {ws.got}/{ws.max}</span><span>{t.boss.emoji} {s.stars[`${sec.id}-boss`] ? 'Boss defeated!' : 'Boss waiting'}</span></div>
                  <div className="bar"><span style={{ width: `${Math.max(2, (ws.got / ws.max) * 100)}%`, background: 'var(--accent)' }} /></div>
                </div>
                {open ? (
                  <button className="btn primary block" onClick={() => { sfx.tap(); haptic('light'); go(`/world/${sec.id}`); }}>
                    {ws.got ? 'Continue ▶' : 'Enter world ▶'}<span className="sr-only"> {t.name}</span>
                  </button>
                ) : (
                  <div className="lock-row">
                    <span className="small"><span aria-hidden="true">🔒</span> Opens at ⭐{WORLD_UNLOCK_STARS[sec.id]} ({need} to go)</span>
                    <button
                      className="btn gold small" disabled={s.coins < WORLD_UNLOCK_COINS}
                      onClick={() => { unlockWorld(sec.id, WORLD_UNLOCK_COINS); sfx.chest(); haptic('success'); celebrate(30); showToast(`🔓 ${t.name} unlocked!`); }}
                    >🪙{WORLD_UNLOCK_COINS} Unlock<span className="sr-only"> {t.name} now</span></button>
                  </div>
                )}
              </div>
            </motion.li>
          );
        })}
      </ul>
      <p className="small muted center">Prefer free practice? Sprints, flashcards and mock exams always cover every section.</p>
      <a className="card link row" href="#/resources" onClick={() => sfx.tap()}>
        <span aria-hidden="true" style={{ fontSize: 26 }}>📚</span>
        <span className="grow"><strong>Free official resources</strong><br /><span className="small muted">{exam.resources.length} Trailhead modules & docs + a {exam.studyPlan.length}-week plan</span></span>
        <span aria-hidden="true">›</span>
      </a>
    </main>
  );
}
