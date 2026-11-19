// Draws coins flying from a reward into the coin counter (lib/coinFlight.js): they burst out, then arc one after
// another into the counter, which bumps and ticks up as each lands, with a rising chime. When no counter is on
// screen (inside a lesson), a small one drops in at the top to catch them. Calm mode and Reduce motion get a gentle
// version: nothing travels across the screen, but the counter glows and counts up in steps with chimes, and a
// "+N" label fades in beside it.
import { useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
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
  const [gains, setGains] = useState([]); // "+N" labels: { id, amount, x, y }
  const handled = useRef(new Set());
  const active = flights.length > 0 || pending > 0;

  // Show the drop-in counter while coins are on their way and no real counter is on screen
  useLayoutEffect(() => {
    if (active) { setNeedBank((was) => was || !visibleCounter()); setBankUp(true); return undefined; }
    const t = setTimeout(() => { setBankUp(false); setNeedBank(false); }, 900);
    return () => clearTimeout(t);
  }, [active]);

  // Calm / reduced motion: no travel. The counter counts up in 5 steps with chimes; "+N" fades in beside it.
  useEffect(() => {
    if (!still) return;
    for (const f of flights) {
      if (handled.current.has(f.id)) continue;
      handled.current.add(f.id);
      endFlight(f.id);
      const spot = visibleCounter() ?? { x: BANK.x(), y: BANK.y() };
      setGains((g) => [...g, { id: f.id, amount: f.amount, x: spot.x, y: spot.y }]);
      const step = Math.floor(f.amount / 5);
      for (let i = 0; i < 5; i += 1) {
        setTimeout(() => { landCoins(i === 4 ? f.amount - step * 4 : step); sfx.coinLand(i * 2); }, 250 + i * 170);
      }
      haptic('light');
      setTimeout(() => setGains((g) => g.filter((x) => x.id !== f.id)), 1900);
    }
  }, [still, flights]);

  const onLanded = (flight, c) => {
    landCoins(c.value);
    sfx.coinLand(c.i);
    if (c.i % 3 === 0) haptic('light');
    if (c.i === coinSplit(flight.amount).length - 1) endFlight(flight.id);
  };

  return createPortal(
    <div className="coin-flight-layer">
      <AnimatePresence>
        {bankUp && needBank && (
          <motion.span
            key="bank" className={`chip coin-chip coin-bank${still ? ' glow' : ''}`} data-coin-target=""
            initial={still ? { opacity: 0 } : { y: -60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={still ? { opacity: 0 } : { y: -60, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 420, damping: 26 }}
          >
            <span className="coin-chip-icon"><Icon name="coin" /></span>{Math.max(0, coins - pending)}
          </motion.span>
        )}
      </AnimatePresence>
      {!still && flights.map((f) => <Flight key={f.id} flight={f} onLanded={onLanded} />)}
      <AnimatePresence>
        {gains.map((g) => (
          <motion.span
            key={g.id} className="coin-gain" aria-hidden="true" style={{ left: g.x, top: g.y + 26 }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
          >
            +{g.amount}
          </motion.span>
        ))}
      </AnimatePresence>
    </div>,
    document.body,
  );
}
