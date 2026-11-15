// Bottom tab bar. The middle tab is the big raised "Play" button (the adventure map): the one thing
// to tap when you don't know what to do.
import { motion } from 'motion/react';
import { sfx } from '../audio/sfx.js';
import { haptic } from '../audio/haptics.js';
import { Icon } from './icons/Icon.jsx';
import { useReducedMotion, useCalm } from '../hooks/useMotionPrefs.js';

const ITEMS = [
  ['/', 'home', 'Home'],
  ['/cards', 'cards', 'Cards'],
  ['/map', 'play', 'Play', true],
  ['/exam', 'exam', 'Exam'],
  ['/me', 'me', 'Me'],
];

const SPRING = { type: 'spring', stiffness: 520, damping: 22 };
const STILL = { duration: 0 };

export function BottomNav({ path, dueCards }) {
  const reduced = useReducedMotion();
  const calm = useCalm();
  const still = reduced || calm;
  const active = (to) => (to === '/' ? path === '/' : path.startsWith(to) || (to === '/map' && /^\/(world|lesson|play|learn|section|placement)/.test(path)));
  return (
    <nav className="bottom-nav" aria-label="Main">
      {ITEMS.map(([to, icon, label, center]) => {
        const on = active(to);
        if (center) {
          return (
            <a
              key={to} href={`#${to}`} className={`nav-item nav-center${on ? ' on' : ''}`} aria-current={on ? 'page' : undefined}
              onClick={() => { sfx.tap(); haptic('medium'); }}
            >
              <motion.span
                className="nav-center-btn" aria-hidden="true"
                whileTap={still ? undefined : { scale: 0.9, y: 2 }}
                animate={still || on ? {} : { scale: [1, 1.06, 1] }}
                transition={still || on ? STILL : { duration: 1.4, repeat: 2, repeatDelay: 2.5 }}
              >
                <Icon name={icon} size="1em" fill strokeWidth={2} />
              </motion.span>
              <span className="nav-center-label">{label}</span>
            </a>
          );
        }
        return (
          <a
            key={to} href={`#${to}`} className="nav-item" aria-current={on ? 'page' : undefined}
            onClick={() => { sfx.tap(); haptic('light'); }}
          >
            {on && <motion.span layoutId="nav-pill" className="nav-pill" transition={still ? STILL : { type: 'spring', stiffness: 500, damping: 35 }} />}
            <motion.span
              className="nav-icon" aria-hidden="true"
              initial={false}
              animate={on ? { y: -2, scale: 1.12 } : { y: 0, scale: 1 }}
              transition={still ? STILL : SPRING}
            >
              <Icon name={icon} size="1em" strokeWidth={on ? 2.75 : 2} fill={false} />
            </motion.span>
            <span>{label}</span>
            {to === '/cards' && dueCards > 0 && <span className="nav-badge"><span aria-hidden="true">{dueCards > 99 ? '99+' : dueCards}</span><span className="sr-only">, {dueCards} due</span></span>}
          </a>
        );
      })}
    </nav>
  );
}
