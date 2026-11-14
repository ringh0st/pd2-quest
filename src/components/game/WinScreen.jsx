// End of a level: stars land one by one, coins + XP, Zap reacts, then Next is right under the result.
import { useEffect } from 'react';
import { motion } from 'motion/react';
import { Zap } from './Zap.jsx';
import { Stars } from './Stars.jsx';
import { go } from '../../hooks/useRoute.js';
import { useReducedMotion } from '../../hooks/useMotionPrefs.js';
import { useFeedback } from '../Feedback.jsx';
import { zapSays } from '../../game/mascot.js';
import { sfx } from '../../audio/sfx.js';
import { haptic } from '../../audio/haptics.js';
import { WORLD_THEMES } from '../../game/worlds.js';
import { routeForLevel } from '../../state/gameSelectors.js';
import { useHoldCelebrations } from '../../hooks/useFocusMode.js';

export function WinScreen({ kind, title, stars, prevStars = 0, coins = 0, xp = 0, detail, next, worldId, onRetry }) {
  const reduced = useReducedMotion();
  const { celebrate, announce } = useFeedback();
  const won = stars > 0;
  const newBest = won && stars > prevStars;
  const theme = WORLD_THEMES[worldId];
  useHoldCelebrations(true); // badges & level-ups wait until you leave this screen

  useEffect(() => {
    if (won) {
      sfx.levelUp(); haptic('celebrate');
      setTimeout(() => celebrate(kind === 'boss' ? 60 : 45), 300 + stars * 380);
    } else { sfx.done(); haptic('soft'); }
    announce(won ? `Level complete. ${stars} stars. Plus ${coins} coins and ${xp} XP.` : 'Not this time. Try again!');
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const heading = !won ? (kind === 'boss' ? 'The boss got away!' : 'So close!') : kind === 'boss' ? 'BOSS DEFEATED!' : stars === 3 ? 'PERFECT!' : 'Level complete!';

  return (
    <main className="screen focus win-screen" id="main" style={{ justifyContent: 'center' }}>
      <motion.div
        className="celebrate-card win-card"
        initial={reduced ? { opacity: 0 } : { scale: 0.6, y: 60, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 360, damping: 22 }}
      >
        {kind === 'boss' && won && <div className="boss-ko" aria-hidden="true">{theme?.boss.emoji}<span>KO!</span></div>}
        <Zap mood={won ? 'cheer' : 'sad'} size={88} />
        <h1>{heading}</h1>
        <p className="muted small">{title}</p>
        <Stars count={stars} size={46} animateIn />
        {newBest && prevStars > 0 && (
          <motion.span className="stamp" initial={reduced ? false : { scale: 2.4, rotate: -20, opacity: 0 }} animate={{ scale: 1, rotate: -8, opacity: 1 }} transition={{ delay: 1.6, type: 'spring', stiffness: 400, damping: 12 }}>NEW BEST!</motion.span>
        )}
        {detail && <p className="small">{detail}</p>}
        {won && (
          <motion.div className="row" style={{ justifyContent: 'center', flexWrap: 'wrap' }} initial={reduced ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.5 }}>
            {coins > 0 && <span className="chip gold">🪙 +{coins}</span>}
            {xp > 0 && <span className="chip primary">+{xp} XP</span>}
          </motion.div>
        )}
        <p className="muted small">“{zapSays(won ? 'win' : 'lose')}”</p>
        {won && next && (
          <button className="btn primary block big" autoFocus onClick={() => { sfx.tap(); go(routeForLevel(next)); }}>
            Next: {next.kind === 'boss' ? '👹 Boss!' : next.kind === 'hard' ? '💀 Hard level' : next.title} →
          </button>
        )}
        {!won && onRetry && <button className="btn primary block big" autoFocus onClick={onRetry}>Try again 🔁</button>}
        <div className="row" style={{ width: '100%' }}>
          {won && onRetry && stars < 3 && <button className="btn grow" onClick={onRetry}>Replay for ★★★</button>}
          <button className="btn grow" onClick={() => go(worldId ? `/world/${worldId}` : '/map')}>🗺️ Map</button>
        </div>
      </motion.div>
    </main>
  );
}
