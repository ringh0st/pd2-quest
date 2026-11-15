// One-tap light/dark switch for the top bar. It flips what you see now; "Auto" (follow the phone)
// stays available in Settings.
import { motion } from 'motion/react';
import { useStore, updateSettings } from '../state/store.js';
import { useSystemDark } from '../hooks/useSystemDark.js';
import { useReducedMotion } from '../hooks/useMotionPrefs.js';
import { Icon } from './icons/Icon.jsx';
import { sfx } from '../audio/sfx.js';
import { haptic } from '../audio/haptics.js';

export function ThemeToggle() {
  const theme = useStore((s) => s.settings.theme);
  const sysDark = useSystemDark();
  const reduced = useReducedMotion();
  const dark = theme === 'system' ? sysDark : theme === 'dark';

  return (
    <button
      type="button"
      className="icon-btn theme-toggle"
      role="switch"
      aria-checked={dark}
      aria-label="Dark mode"
      title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      onClick={() => { sfx.tap(); haptic('light'); updateSettings({ theme: dark ? 'light' : 'dark' }); }}
    >
      <motion.span
        key={dark ? 'moon' : 'sun'}
        style={{ display: 'grid', placeItems: 'center' }}
        initial={reduced ? false : { rotate: -90, scale: 0.4, opacity: 0 }}
        animate={{ rotate: 0, scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 420, damping: 18 }}
      >
        <Icon name={dark ? 'moon' : 'sun'} />
      </motion.span>
    </button>
  );
}
