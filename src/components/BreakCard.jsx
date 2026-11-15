// "Time for a short break?" A friendly card on result screens once you've studied for a while.
// Take a break opens a calm 3-minute screen (breathing circle + countdown); Keep going snoozes 10 min.
import { useEffect, useState, useSyncExternalStore } from 'react';
import { motion } from 'motion/react';
import { useStore } from '../state/store.js';
import { breakDue, snoozeBreak, tookBreak, studyMinutes, subscribeStudyClock } from '../lib/studyClock.js';
import { useReducedMotion } from '../hooks/useMotionPrefs.js';
import { Zap } from './game/Zap.jsx';
import { Icon } from './icons/Icon.jsx';
import { sfx } from '../audio/sfx.js';
import { haptic } from '../audio/haptics.js';

const BREAK_SECONDS = 180;

export function BreakCard() {
  const limit = useStore((s) => s.settings.breakMinutes ?? 30);
  const due = useSyncExternalStore(subscribeStudyClock, () => breakDue(limit), () => false);
  const [resting, setResting] = useState(false);
  if (resting) return <BreakScreen onDone={() => { setResting(false); tookBreak(); }} />;
  if (!due) return null;
  return (
    <section className="card stack-s break-card" aria-labelledby="break-title">
      <div className="row" style={{ alignItems: 'center' }}>
        <Zap mood="sleepy" size={48} bounce={false} label="" />
        <div className="grow">
          <strong id="break-title">You’ve studied {Math.round(studyMinutes())} minutes. Time for a short break?</strong>
          <p className="small muted">3 minutes away from the screen helps it stick.</p>
        </div>
      </div>
      <div className="row wrap">
        <button type="button" className="btn primary grow" onClick={() => { sfx.tap(); haptic('light'); setResting(true); }}><Icon name="coffee" /> Take a 3-minute break</button>
        <button type="button" className="btn grow" onClick={() => { sfx.tap(); snoozeBreak(10); }}>Keep going</button>
      </div>
    </section>
  );
}

function BreakScreen({ onDone }) {
  const [left, setLeft] = useState(BREAK_SECONDS);
  const reduced = useReducedMotion();
  useEffect(() => {
    const t = setInterval(() => setLeft((x) => Math.max(0, x - 1)), 1000);
    return () => clearInterval(t);
  }, []);
  useEffect(() => { if (left === 0) { sfx.done(); haptic('success'); } }, [left]);
  const mm = Math.floor(left / 60);
  const ss = String(left % 60).padStart(2, '0');
  return (
    <div className="break-screen" role="dialog" aria-modal="true" aria-labelledby="rest-title">
      <h2 id="rest-title">{left ? 'Break time' : 'Welcome back!'}</h2>
      <motion.div
        className="breath" aria-hidden="true"
        animate={reduced || !left ? {} : { scale: [0.75, 1, 1, 0.75] }}
        transition={{ duration: 10, times: [0, 0.4, 0.5, 1], repeat: Infinity, ease: 'easeInOut' }}
      />
      <p className="muted">{left ? 'Breathe in as the circle grows, out as it shrinks. Stand up, stretch, drink some water.' : 'Fresh brain, ready to go.'}</p>
      <p className="break-timer" role="timer" aria-live="off">{left ? `${mm}:${ss}` : ''}</p>
      <button type="button" className="btn primary block big" autoFocus onClick={() => { sfx.tap(); onDone(); }}>
        {left ? 'I’m back early' : 'Back to it'} <Icon name="next" />
      </button>
    </div>
  );
}
