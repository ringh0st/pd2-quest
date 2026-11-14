import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '../hooks/useMotionPrefs.js';

/** Number that counts up to its value (a small dopamine tick). */
export function CountUp({ value, duration = 600 }) {
  const reduced = useReducedMotion();
  const [shown, setShown] = useState(value);
  const from = useRef(value);
  useEffect(() => {
    if (reduced) { setShown(value); from.current = value; return; }
    const start = performance.now();
    const a = from.current;
    let raf;
    const step = (t) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setShown(Math.round(a + (value - a) * eased));
      if (p < 1) raf = requestAnimationFrame(step);
      else from.current = value;
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, duration, reduced]);
  return <span style={{ fontVariantNumeric: 'tabular-nums' }}>{shown}</span>;
}
