// "Park it": catch a distracting thought in two taps and get straight back to studying.
import { useCallback, useState } from 'react';
import { parkThought } from '../state/store.js';
import { useFeedback } from './Feedback.jsx';
import { sfx } from '../audio/sfx.js';
import { Sheet } from './Sheet.jsx';

export function ParkIt() {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const { showToast } = useFeedback();
  const close = useCallback(() => setOpen(false), []);
  const save = (e) => {
    e?.preventDefault();
    if (!text.trim()) return setOpen(false);
    parkThought(text);
    setText('');
    setOpen(false);
    sfx.done();
    showToast('🅿️ Parked! Back to it.');
  };
  return (
    <>
      <button className="icon-btn" onClick={() => { sfx.tap(); setOpen(true); }} aria-label="Park a distracting thought" title="Park a thought" aria-haspopup="dialog">🅿️</button>
      <Sheet open={open} onClose={close} labelledBy="park-title">
        <form className="stack" onSubmit={save}>
          <h2 id="park-title">🅿️ Park that thought</h2>
          <p className="muted small">Brain wandered? Dump it here. It’ll wait for you under Me → Parked thoughts. Enter parks it; Shift+Enter adds a line.</p>
          <textarea
            className="input" rows={3} data-autofocus value={text} onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) save(e); }}
            placeholder="e.g. reply to Dana, buy oat milk…" aria-label="Thought to park"
          />
          <button className="btn primary block" type="submit">Park it &amp; keep going</button>
        </form>
      </Sheet>
    </>
  );
}
