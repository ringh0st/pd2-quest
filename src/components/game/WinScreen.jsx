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
import { routeForLevel } from '../../state/gameSelectors.js';
import { useHoldCelebrations } from '../../hooks/useFocusMode.js';
import { Icon } from '../icons/Icon.jsx';
import { BossArt } from '../art/BossArt.jsx';
import { BreakCard } from '../BreakCard.jsx';
import { exam } from '../../data/index.js';
import { RewardCoins } from './RewardCoins.jsx';

export function WinScreen({ kind, title, stars, prevStars = 0, coins = 0, xp = 0, detail, next, worldId, onRetry }) {
  const reduced = useReducedMotion();
  const { celebrate, announce } = useFeedback();
  const won = stars > 0;
  const newBest = won && stars > prevStars;
  useHoldCelebrations(true); // badges & level-ups wait until you leave this screen

  useEffect(() => {
    const timers = [];
    if (won) {
      if (kind === 'boss') sfx.bossWin(); else sfx.levelUp();
      haptic('celebrate');
      // one rising chime per star as each lands, then the coin clink when the rewards appear
      for (let i = 1; i <= stars; i++) timers.push(setTimeout(() => { sfx.star(i); haptic('light'); }, 420 + i * 380));
      timers.push(setTimeout(() => celebrate(kind === 'boss' ? 60 : 45), 300 + stars * 380));
    } else { if (kind === 'boss') sfx.bossLose(); else sfx.done(); haptic('soft'); }
    announce(won ? `Level complete. ${stars} stars. Plus ${coins} coins and ${xp} XP.` : 'Not this time. Try again!');
    return () => timers.forEach(clearTimeout);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const heading = !won ? (kind === 'boss' ? 'The boss got away!' : kind === 'lesson' ? 'Let’s run that again' : 'So close!') : kind === 'boss' ? 'BOSS DEFEATED!' : stars === 3 ? 'PERFECT!' : 'Level complete!';

  return (
    <main className="screen focus win-screen" id="main" style={{ justifyContent: 'center' }}>
      <motion.div
        className="celebrate-card win-card"
        initial={reduced ? { opacity: 0 } : { scale: 0.6, y: 60, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 360, damping: 22 }}
      >
        {kind === 'boss' && won && worldId ? (
          <div className="ko-row">
            <div className="boss-ko" aria-hidden="true">
              <BossArt world={worldId} size={92} mood="defeated" />
              <motion.span className="ko-stamp" initial={reduced ? false : { scale: 2.6, rotate: -30, opacity: 0 }} animate={{ scale: 1, rotate: 12, opacity: 1 }} transition={{ delay: 0.9, type: 'spring', stiffness: 420, damping: 13 }}>KO!</motion.span>
            </div>
            <Zap mood="cheer" size={80} />
          </div>
        ) : <Zap mood={won ? 'cheer' : 'sad'} size={88} />}
        <h1>{heading}</h1>
        <p className="muted small">{title}</p>
        <Stars count={stars} size={46} animateIn />
        {newBest && prevStars > 0 && (
          <motion.span className="stamp" initial={reduced ? false : { scale: 2.4, rotate: -20, opacity: 0 }} animate={{ scale: 1, rotate: -8, opacity: 1 }} transition={{ delay: 1.6, type: 'spring', stiffness: 400, damping: 12 }}>NEW BEST!</motion.span>
        )}
        {detail && <p className="small">{detail}</p>}
        {won && (
          <motion.div className="row" style={{ justifyContent: 'center', flexWrap: 'wrap' }} initial={reduced ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.5 }}>
            {coins > 0 && <RewardCoins coins={coins} delay={1650} />}
            {xp > 0 && <span className="chip primary">+{xp} XP</span>}
          </motion.div>
        )}
        <p className="muted small">“{zapSays(!won ? 'lose' : stars === 3 ? 'win' : 'okwin', Math.random, exam.zap)}”</p>
        <BreakCard />
        {won && next && (
          <button className="btn primary block big" autoFocus onClick={() => { sfx.tap(); go(routeForLevel(next)); }}>
            {next.kind === 'boss' ? <BossArt world={next.world} size={30} /> : next.kind === 'hard' ? <Icon name="skull" /> : null}
            <span className="next-label">Next: {next.kind === 'boss' ? 'Boss!' : next.kind === 'hard' ? 'Hard level' : next.title}</span>
            <Icon name="next" />
          </button>
        )}
        {!won && onRetry && <button className="btn primary block big" autoFocus onClick={onRetry}><Icon name="retry" /> Try again</button>}
        <div className="row win-actions" style={{ width: '100%' }}>
          {won && onRetry && stars < 3 && <button className="btn grow" onClick={onRetry}>Replay for <span className="heart-row star-row" role="img" aria-label="3 stars"><Icon name="star" fill /><Icon name="star" fill /><Icon name="star" fill /></span></button>}
          <button className="btn grow" onClick={() => go(worldId ? `/world/${worldId}` : '/map')}><Icon name="map" /> Map</button>
        </div>
      </motion.div>
    </main>
  );
}
