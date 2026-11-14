// "Park it": catch a distracting thought in two taps and get straight back to studying.
import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { parkThought } from '../state/store.js';
import { useFeedback } from './Feedback.jsx';
import { sfx } from '../audio/sfx.js';

export function ParkIt() {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const { showToast } = useFeedback();
  const save = (e) => {
    e.preventDefault();
    if (!text.trim()) return setOpen(false);
    parkThought(text);
    setText('');
    setOpen(false);
    sfx.done();
    showToast('🅿️ Parked! Back to it.');
  };
  return (
    <>
      <button className="icon-btn" onClick={() => { sfx.tap(); setOpen(true); }} aria-label="Park a distracting thought" title="Park a thought">🅿️</button>
      <AnimatePresence>
        {open && (
          <>
            <motion.div className="scrim" onClick={() => setOpen(false)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
            <motion.div
              className="sheet" role="dialog" aria-modal="true" aria-labelledby="park-title"
              initial={{ y: '100%', x: '-50%' }} animate={{ y: 0, x: '-50%' }} exit={{ y: '100%', x: '-50%' }}
              transition={{ type: 'spring', stiffness: 400, damping: 34 }}
            ><form className="stack" onSubmit={save}>
              <div className="sheet-handle" />
              <h2 id="park-title">🅿️ Park that thought</h2>
              <p className="muted small">Brain wandered? Dump it here. It’ll wait for you under Me → Parked thoughts.</p>
              <textarea
                className="input" rows={3} autoFocus value={text} onChange={(e) => setText(e.target.value)}
                placeholder="e.g. reply to Dana, buy oat milk…" aria-label="Thought to park"
              />
              <button className="btn primary block" type="submit">Park it &amp; keep going</button>
            </form></motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
