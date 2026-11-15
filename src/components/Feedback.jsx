// Global feedback services: screen-reader announcements, toasts (text plus an optional Icon) and confetti bursts.
import { createContext, isValidElement, useCallback, useContext, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Confetti } from './Confetti.jsx';
import { useReducedMotion, useCalm } from '../hooks/useMotionPrefs.js';
import { useStore } from '../state/store.js';
import { Icon } from './icons/Icon.jsx';

const Ctx = createContext(null);

export function FeedbackProvider({ children }) {
  const [msg, setMsg] = useState('');
  const [toast, setToast] = useState(null);
  const [burst, setBurst] = useState(0);
  const [burstCount, setBurstCount] = useState(40);
  const reduced = useReducedMotion();
  const calm = useCalm();
  const confettiOn = useStore((s) => s.settings.confetti !== false);
  const confettiKind = useStore((s) => s.equipped?.confetti ?? 'classic');
  const timer = useRef();

  const announce = useCallback((text) => {
    setMsg('');
    setTimeout(() => setMsg(text), 30);
  }, []);
  /** showToast('Saved', 'check'), showToast({ text, icon }) or showToast(<>…</>). `icon` is an optional Icon name. */
  const showToast = useCallback((text, icon) => {
    const t = text && typeof text === 'object' && !isValidElement(text) && 'text' in text ? text : { text, icon };
    clearTimeout(timer.current);
    setToast({ text: t.text, icon: t.icon, id: Date.now() });
    timer.current = setTimeout(() => setToast(null), 2200);
  }, []);
  const celebrate = useCallback((size = 40) => {
    if (reduced || calm || !confettiOn) return;
    setBurstCount(Math.min(60, size));
    setBurst((b) => b + 1);
  }, [reduced, calm, confettiOn]);

  return (
    <Ctx.Provider value={{ announce, showToast, celebrate }}>
      {children}
      <div className="sr-only" aria-live="polite" aria-atomic="true">{msg}</div>
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id} className="toast" role="status"
            initial={{ y: -40, opacity: 0, x: '-50%' }} animate={{ y: 0, opacity: 1, x: '-50%' }} exit={{ y: -40, opacity: 0, x: '-50%' }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          >
            {toast.icon && <span className="toast-icon"><Icon name={toast.icon} /></span>}
            <span className="toast-text">{toast.text}</span>
          </motion.div>
        )}
      </AnimatePresence>
      {burst > 0 && <Confetti fire={burst} count={burstCount} kind={confettiKind} />}
    </Ctx.Provider>
  );
}

export const useFeedback = () => useContext(Ctx);
