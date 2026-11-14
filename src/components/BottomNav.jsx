import { motion } from 'motion/react';
import { sfx } from '../audio/sfx.js';
import { haptic } from '../audio/haptics.js';

const ITEMS = [
  ['/', '🏠', 'Home'],
  ['/learn', '🗺️', 'Learn'],
  ['/cards', '🃏', 'Cards'],
  ['/exam', '🏁', 'Exam'],
  ['/me', '😎', 'Me'],
];

export function BottomNav({ path, dueCards }) {
  const active = (to) => (to === '/' ? path === '/' : path.startsWith(to) || (to === '/learn' && /^\/(section|lesson)/.test(path)));
  return (
    <nav className="bottom-nav" aria-label="Main">
      {ITEMS.map(([to, icon, label]) => {
        const on = active(to);
        return (
          <a
            key={to} href={`#${to}`} className="nav-item" aria-current={on ? 'page' : undefined}
            onClick={() => { sfx.tap(); haptic('light'); }}
          >
            {on && <motion.span layoutId="nav-pill" className="nav-pill" transition={{ type: 'spring', stiffness: 500, damping: 35 }} />}
            <span className="nav-icon" aria-hidden="true">{icon}</span>
            <span>{label}</span>
            {to === '/cards' && dueCards > 0 && <span className="nav-badge" aria-label={`${dueCards} due`}>{dueCards > 99 ? '99+' : dueCards}</span>}
          </a>
        );
      })}
    </nav>
  );
}
