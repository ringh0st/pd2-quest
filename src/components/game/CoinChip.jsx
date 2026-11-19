// Coin balance that bumps when it changes (and with every coin that flies in). Tapping opens the shop.
import { useSyncExternalStore } from 'react';
import { motion } from 'motion/react';
import { coinFlightState, subscribeCoinFlight } from '../../lib/coinFlight.js';
import { useStore } from '../../state/store.js';
import { CountUp } from '../CountUp.jsx';
import { Icon } from '../icons/Icon.jsx';
import { useReducedMotion } from '../../hooks/useMotionPrefs.js';
import { sfx } from '../../audio/sfx.js';

export function CoinChip({ link = true }) {
  const total = useStore((s) => s.coins);
  const { pending, landings } = useSyncExternalStore(subscribeCoinFlight, coinFlightState, coinFlightState);
  const coins = Math.max(0, total - pending); // coins still in flight haven't arrived yet
  const reduced = useReducedMotion();
  const body = (
    <motion.span
      key={`${coins}-${landings}`} data-coin-target="" className="chip coin-chip"
      initial={reduced ? false : { scale: 1.25 }} animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 500, damping: 14 }}
    >
      <span className="coin-chip-icon"><Icon name="coin" /></span><CountUp value={coins} />
    </motion.span>
  );
  if (!link) return <span aria-label={`${coins} coins`}>{body}</span>;
  return <a href="#/shop" className="plain-link" aria-label={`${coins} coins. Open shop`} onClick={() => sfx.tap()}>{body}</a>;
}
