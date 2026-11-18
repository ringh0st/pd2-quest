// "New version ready" banner: shown only outside study flows (lessons, practice, exams hide it).
import { useSyncExternalStore } from 'react';
import { motion } from 'motion/react';
import { updateReady, subscribeUpdates, installUpdate } from '../lib/updates.js';
import { useIsFocusMode } from '../hooks/useFocusMode.js';
import { useReducedMotion } from '../hooks/useMotionPrefs.js';
import { Icon } from './icons/Icon.jsx';
import { BRAND_NAME } from '../lib/appInfo.js';
import { sfx } from '../audio/sfx.js';

export function UpdateBanner() {
  const ready = useSyncExternalStore(subscribeUpdates, updateReady, () => false);
  const busy = useIsFocusMode();
  const reduced = useReducedMotion();
  if (!ready || busy) return null;
  return (
    <motion.div
      className="update-banner" role="status"
      initial={reduced ? false : { y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
    >
      <Icon name="sparkles" />
      <span className="grow">New version of {BRAND_NAME} ready</span>
      <button type="button" className="btn small primary" onClick={() => { sfx.tap(); installUpdate(); }}>Update</button>
    </motion.div>
  );
}
