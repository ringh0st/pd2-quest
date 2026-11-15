// 0-3 stars: filled gold stars for earned, outlined for empty. `animateIn` lands them one by one
// (with a chime and a pop each) on win screens.
import { motion } from 'motion/react';
import { useEffect } from 'react';
import { Icon } from '../icons/Icon.jsx';
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
  const pop = animateIn && !reduced;
  return (
    <span className="stars" role="img" aria-label={`${count} of 3 stars`} style={{ fontSize: size }}>
      {[0, 1, 2].map((i) => {
        const on = i < count;
        const raised = i === 1 && animateIn;
        return (
          <motion.span
            key={i}
            aria-hidden="true"
            className={`star${on ? ' on' : ''}${raised ? ' raised' : ''}`}
            initial={pop && on ? { scale: 0, rotate: -180, y: -40 } : false}
            animate={pop && on ? { scale: [null, 1.25, 1], rotate: 0, y: 0 } : { scale: 1, rotate: 0, y: 0 }}
            transition={{ delay: animateIn ? 0.45 + i * 0.38 : 0, duration: 0.5, ease: 'backOut' }}
          ><Icon name="star" size="1em" strokeWidth={on ? 1.75 : 2} /></motion.span>
        );
      })}
    </span>
  );
}
