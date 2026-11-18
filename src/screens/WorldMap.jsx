// The adventure map: one themed world per exam section. Worlds open with stars, or early with coins.
import { motion } from 'motion/react';
import { useStore, unlockWorld } from '../state/store.js';
import { sections, exam, themeOf } from '../data/index.js';
import { worldUnlockStars, WORLD_UNLOCK_COINS, isWorldOpen, worldStars, totalStars } from '../game/worlds.js';
import { CoinChip } from '../components/game/CoinChip.jsx';
import { useReducedMotion } from '../hooks/useMotionPrefs.js';
import { useFeedback } from '../components/Feedback.jsx';
import { go } from '../hooks/useRoute.js';
import { sfx } from '../audio/sfx.js';
import { haptic } from '../audio/haptics.js';
import { track } from '../lib/track.js';
import { Icon } from '../components/icons/Icon.jsx';
import { WorldEmblem } from '../components/art/WorldEmblem.jsx';
import { BossArt } from '../components/art/BossArt.jsx';
import { Scenery } from '../components/art/Scenery.jsx';

export function WorldMap() {
  const s = useStore();
  const reduced = useReducedMotion();
  const { showToast, celebrate } = useFeedback();
  const total = totalStars(s.stars);

  return (
    <main className="screen" id="main">
      <header className="spread map-head">
        <h1 className="title-with-icon"><span className="ic-tile" aria-hidden="true"><Icon name="map" /></span>Adventure</h1>
        <div className="row" style={{ gap: 8 }}>
          <span className="chip star-chip" role="img" aria-label={`${total} stars`}><Icon name="star" fill className="ic-gold-fill" />{total}</span>
          <CoinChip />
        </div>
      </header>
      <p className="muted small">{sections.length} worlds, one per exam section. Beat lessons, crush Hard levels, defeat each Boss.</p>
      <ul className="list-plain world-list">
        {sections.map((sec, i) => {
          const t = themeOf(sec.id);
          const open = isWorldOpen(sec.id, s.stars, s.unlockedWorlds);
          const ws = worldStars(sec, s.stars);
          const need = worldUnlockStars(sec.id) - total;
          const style = { '--sky1': t.sky[0], '--sky2': t.sky[1], '--sky1d': t.skyDark[0], '--sky2d': t.skyDark[1], '--accent': sec.accent };
          return (
            <motion.li key={sec.id} initial={reduced ? false : { opacity: 0, y: 30, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: i * 0.08, type: 'spring', stiffness: 300, damping: 24 }}>
              <div className={`world-card sky ${open ? '' : 'locked'}`} style={style}>
                <Scenery world={sec.id} variant="card" />
                <div className="world-num">World {i + 1}</div>
                <div className="row" style={{ alignItems: 'flex-start' }}>
                  <WorldEmblem world={sec.id} size={64} className="world-emblem-big" />
                  <div className="grow">
                    <h2>{t.name}</h2>
                    <p className="small with-icon"><Icon name={sec.icon} style={{ color: 'var(--accent)' }} /> {sec.title} · {sec.weight}% of exam</p>
                  </div>
                </div>
                <div className="stack-s">
                  <div className="spread small world-stats">
                    <span className="with-icon"><Icon name="star" fill className="ic-gold-fill" /> {ws.got}/{ws.max}<span className="sr-only"> stars</span></span>
                    <span className="with-icon"><BossArt world={sec.id} size={26} mood={s.stars[`${sec.id}-boss`] ? 'defeated' : 'idle'} /> {s.stars[`${sec.id}-boss`] ? 'Boss defeated!' : 'Boss waiting'}</span>
                  </div>
                  <div className="bar"><span style={{ width: `${Math.max(2, (ws.got / ws.max) * 100)}%`, background: 'var(--accent)' }} /></div>
                </div>
                {open ? (
                  <button className="btn primary block" onClick={() => { sfx.tap(); haptic('light'); go(`/world/${sec.id}`); }}>
                    {ws.got ? 'Continue' : 'Enter world'}<span className="sr-only"> {t.name}</span> <Icon name="play" fill />
                  </button>
                ) : (
                  <div className="lock-row">
                    <span className="small with-icon"><Icon name="lock" /> Opens at <Icon name="star" fill className="ic-gold-fill" />{worldUnlockStars(sec.id)}<span className="sr-only"> stars</span> ({need} to go)</span>
                    <button
                      className="btn gold small" disabled={s.coins < WORLD_UNLOCK_COINS}
                      onClick={() => { unlockWorld(sec.id, WORLD_UNLOCK_COINS); sfx.unlock(); haptic('success'); celebrate(30); showToast(`${t.name} unlocked!`); }}
                    ><Icon name="coin" />{WORLD_UNLOCK_COINS}<span className="sr-only"> coins:</span> Unlock<span className="sr-only"> {t.name} now</span></button>
                    <a className="btn small" href={`#/placement/${sec.id}`} onClick={() => sfx.tap()}><Icon name="target" /> Test in<span className="sr-only"> to {t.name}</span></a>
                  </div>
                )}
              </div>
            </motion.li>
          );
        })}
      </ul>
      <p className="small muted center">Prefer free practice? Sprints, flashcards and mock exams always cover every section.</p>
      <a className="card link row" href="#/resources" onClick={() => sfx.tap()}>
        <span className="ic-tile" aria-hidden="true"><Icon name="library" /></span>
        <span className="grow"><strong>Free official resources</strong><br /><span className="small muted">{exam.resources.length} Trailhead modules & docs + a {exam.studyPlan.length}-week plan</span></span>
        <Icon name="chevron" />
      </a>
      {track.playground && (
        <a className="card link row" href="#/playground" onClick={() => sfx.tap()}>
          <span className="ic-tile" aria-hidden="true"><Icon name="code" /></span>
          <span className="grow"><strong>Playground</strong><br /><span className="small muted">Write JavaScript and run it right here</span></span>
          <Icon name="chevron" />
        </a>
      )}
    </main>
  );
}
