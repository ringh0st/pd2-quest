// Bottom tab bar. All tabs are the same size (Apple HIG / Material 3); the middle "Play" tab
// (the adventure map) is emphasised only by a soft accent tile, solid when it is the current tab.
// Icons never move on selection: the active tab is shown by the pill, a bolder icon and the colour.
import { motion } from 'motion/react';
import { sfx } from '../audio/sfx.js';
import { haptic } from '../audio/haptics.js';
import { NAV_ICONS, PlayGlyph } from './icons/NavIcons.jsx';
import { useReducedMotion, useCalm } from '../hooks/useMotionPrefs.js';
import { track } from '../lib/track.js';
import { useAuth } from '../hooks/useAuth.js';
import { useNewFeedbackCount } from '../hooks/useNewFeedbackCount.js';

const ITEMS = [
  ['/', 'home', 'Home'],
  ['/cards', 'cards', 'Cards'],
  ['/map', 'play', 'Play', true],
  ['/exam', 'exam', 'Exam'],
  ['/me', 'me', 'Me'],
];
// Only for the owner (accounts in the admins table): learners' reports and comments
const ADMIN_ITEM = ['/inbox', 'admin', 'Admin'];

const STILL = { duration: 0 };

export function BottomNav({ path, dueCards }) {
  const reduced = useReducedMotion();
  const calm = useCalm();
  const still = reduced || calm;
  const { admin } = useAuth();
  const newReports = useNewFeedbackCount(admin);
  const items = admin ? [...ITEMS, ADMIN_ITEM] : ITEMS;
  const active = (to) => (to === '/' ? path === '/' : path.startsWith(to) || (to === '/map' && /^\/(world|lesson|play|learn|section|placement)/.test(path)));
  return (
    <nav className="bottom-nav" aria-label="Main" style={{ '--tabs': items.length }}>
      {/* On laptops the bar becomes a sidebar (desktop.css), headed by the exam you are studying */}
      <span className="nav-brand" aria-hidden="true">{track.name}</span>
      {items.map(([to, icon, label, center]) => {
        const on = active(to);
        if (center) {
          return (
            <a
              key={to} href={`#${to}`} className={`nav-item nav-center${on ? ' on' : ''}`} aria-current={on ? 'page' : undefined}
              onClick={() => { sfx.tap(); haptic('light'); }}
            >
              <span className="nav-center-tile" aria-hidden="true"><PlayGlyph /></span>
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
            <span className="nav-icon" aria-hidden="true">{(() => { const C = NAV_ICONS[icon]; return <C on={on} />; })()}</span>
            <span>{label}</span>
            {to === '/cards' && dueCards > 0 && <span className="nav-badge"><span aria-hidden="true">{dueCards > 99 ? '99+' : dueCards}</span><span className="sr-only">, {dueCards} due</span></span>}
            {to === '/inbox' && newReports > 0 && <span className="nav-badge"><span aria-hidden="true">{newReports > 99 ? '99+' : newReports}</span><span className="sr-only">, {newReports} new</span></span>}
          </a>
        );
      })}
    </nav>
  );
}
