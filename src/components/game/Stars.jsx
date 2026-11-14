// 0-3 stars. `animateIn` lands them one by one (with a chime each) on win screens.
import { motion } from 'motion/react';
import { useEffect } from 'react';
import { useReducedMotion } from '../../hooks/useMotionPrefs.js';
import { sfx } from '../../audio/sfx.js';
import { haptic } from '../../audio/haptics.js';

export function Stars({ count = 0, size = 18, animateIn = false }) {
  const reduced = useReducedMotion();
  useEffect(() => {
    if (!animateIn) return;
    const timers = Array.from({ length: count }, (_, i) => setTimeout(() => { sfx.correct(i * 2 + 1); haptic('medium'); }, 450 + i * 380));
    return () => timers.forEach(clearTimeout);
  }, [animateIn, count]);
  return (
    <span className="stars" role="img" aria-label={`${count} of 3 stars`} style={{ fontSize: size }}>
      {[0, 1, 2].map((i) => {
        const on = i < count;
        return (
          <motion.span
            key={i}
            aria-hidden="true"
            className={on ? 'star on' : 'star'}
            initial={animateIn && on && !reduced ? { scale: 0, rotate: -180, y: -40 } : false}
            animate={{ scale: 1, rotate: 0, y: 0 }}
            transition={{ delay: animateIn ? 0.45 + i * 0.38 : 0, type: 'spring', stiffness: 380, damping: 14 }}
            style={i === 1 && animateIn ? { fontSize: '1.3em', margin: '0 -0.05em', transform: 'translateY(-0.2em)' } : undefined}
          >★</motion.span>
        );
      })}
    </span>
  );
}
