// Draws coins flying from a reward into the coin counter (lib/coinFlight.js): they burst out, then arc one after
// another into the counter, which bumps and ticks up as each lands, with a rising chime. When no counter is on
// screen (inside a lesson), a small one drops in at the top to catch them. Calm mode and Reduce motion skip the
// flight: the coins land at once with one chime.
import { useEffect, useLayoutEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import { coinFlightState, subscribeCoinFlight, landCoins, endFlight, coinSplit } from '../../lib/coinFlight.js';
import { useStore } from '../../state/store.js';
import { useReducedMotion, useCalm } from '../../hooks/useMotionPrefs.js';
import { Icon } from '../icons/Icon.jsx';
import { sfx } from '../../audio/sfx.js';
import { haptic } from '../../audio/haptics.js';

const BANK = { x: () => window.innerWidth - 60, y: () => 34 }; // the drop-in counter's spot (top right)

/** The coin counter on screen to fly to, if one is visible. */
function visibleCounter() {
  for (const el of document.querySelectorAll('[data-coin-target]')) {
    const r = el.getBoundingClientRect();
    if (r.width && r.bottom > 0 && r.top < window.innerHeight && getComputedStyle(el).visibility !== 'hidden') {
      return { x: r.left + Math.min(22, r.width / 2), y: r.top + r.height / 2 };
    }
  }
  return null;
}

function Flight({ flight, onLanded }) {
  const parts = useMemo(() => coinSplit(flight.amount), [flight.amount]);
  const [target] = useState(() => visibleCounter() ?? { x: BANK.x(), y: BANK.y() });
  // each coin: a burst position around the reward, then the counter
  const coins = useMemo(() => parts.map((value, i) => {
    const angle = (i / parts.length) * Math.PI * 2 + Math.random() * 0.6;
    const spread = 46 + Math.random() * 40;
    return { value, i, bx: Math.cos(angle) * spread, by: Math.sin(angle) * spread - 20, delay: 0.05 * i };
  }), [parts]);
  const { origin } = flight;
  return coins.map((c) => (
    <motion.span
      key={c.i} className="flying-coin" aria-hidden="true"
      initial={{ x: origin.x, y: origin.y, scale: 0.3, opacity: 0 }}
      animate={{
        x: [origin.x, origin.x + c.bx, target.x],
        y: [origin.y, origin.y + c.by, target.y],
        scale: [0.3, 1.15, 0.6],
        opacity: [0, 1, 1],
      }}
      transition={{ duration: 0.95, delay: c.delay, times: [0, 0.32, 1], ease: ['easeOut', 'easeIn'] }}
      onAnimationComplete={() => onLanded(flight, c)}
    >
      <Icon name="coin" />
    </motion.span>
  ));
}

export function CoinFlightLayer() {
  const { flights, pending } = useSyncExternalStore(subscribeCoinFlight, coinFlightState, coinFlightState);
  const coins = useStore((s) => s.coins);
  const reduced = useReducedMotion();
  const calm = useCalm();
  const still = reduced || calm;
  const [bankUp, setBankUp] = useState(false);
  const [needBank, setNeedBank] = useState(false);

  // Calm / reduced motion: land everything at once
  useEffect(() => {
    if (!still || !flights.length) return;
    flights.forEach((f) => { landCoins(f.amount); endFlight(f.id); });
    sfx.coin(); haptic('light');
  }, [still, flights]);

  // Show the drop-in counter while coins fly and no real counter is on screen
  useLayoutEffect(() => {
    if (still) return undefined;
    if (flights.length) { setNeedBank(!visibleCounter()); setBankUp(true); return undefined; }
    const t = setTimeout(() => setBankUp(false), 900);
    return () => clearTimeout(t);
  }, [flights.length, still]);

  const onLanded = (flight, c) => {
    landCoins(c.value);
    sfx.coinLand(c.i);
    if (c.i % 3 === 0) haptic('light');
    if (c.i === coinSplit(flight.amount).length - 1) endFlight(flight.id);
  };

  return createPortal(
    <div className="coin-flight-layer">
      <AnimatePresence>
        {bankUp && needBank && !still && (
          <motion.span
            key="bank" className="chip coin-chip coin-bank" data-coin-target=""
            initial={{ y: -60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -60, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 420, damping: 26 }}
          >
            <span className="coin-chip-icon"><Icon name="coin" /></span>{Math.max(0, coins - pending)}
          </motion.span>
        )}
      </AnimatePresence>
      {!still && flights.map((f) => <Flight key={f.id} flight={f} onLanded={onLanded} />)}
    </div>,
    document.body,
  );
}
