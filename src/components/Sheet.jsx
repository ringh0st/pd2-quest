// Bottom sheet dialog: Escape closes, Tab stays inside, focus returns to what opened it.
import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useReducedMotion } from '../hooks/useMotionPrefs.js';

const FOCUSABLE = 'button:not([disabled]), [href], input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function Sheet({ open, onClose, labelledBy, children }) {
  const ref = useRef(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (!open) return;
    const opener = document.activeElement;
    const first = () => {
      const el = ref.current;
      if (!el) return;
      const auto = el.querySelector('[autofocus], [data-autofocus]');
      (auto || el.querySelector(FOCUSABLE) || el).focus();
    };
    const t = setTimeout(first, 30);
    const onKey = (e) => {
      if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); onClose(); return; }
      if (e.key !== 'Tab' || !ref.current) return;
      const items = [...ref.current.querySelectorAll(FOCUSABLE)];
      if (!items.length) return;
      const [a, z] = [items[0], items[items.length - 1]];
      if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); }
      else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
    };
    document.addEventListener('keydown', onKey, true);
    return () => {
      clearTimeout(t);
      document.removeEventListener('keydown', onKey, true);
      if (opener && document.contains(opener)) opener.focus?.();
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="scrim" onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
          <motion.div
            ref={ref} tabIndex={-1}
            className="sheet" role="dialog" aria-modal="true" aria-labelledby={labelledBy}
            initial={reduced ? { opacity: 0, x: '-50%' } : { y: '100%', x: '-50%' }}
            animate={{ y: 0, opacity: 1, x: '-50%' }}
            exit={reduced ? { opacity: 0, x: '-50%' } : { y: '100%', x: '-50%' }}
            transition={{ type: 'spring', stiffness: 400, damping: 34 }}
          >
            <div className="sheet-handle" aria-hidden="true" />
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
