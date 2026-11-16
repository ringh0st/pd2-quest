// The opening screen: Zap flies in, a lightning arc lights up the badge, the title pops in letter
// by letter and a bar fills for about 4 seconds while the app loads underneath. Then the two exams
// appear as big buttons, PD1 Quest and PD2 Quest (the last one studied is the main button); picking
// the other exam reloads the app into it. A tap during loading skips to the
// button. Shows the exam facts, the studio and the version. Static with reduced motion.
import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Zap } from '../game/Zap.jsx';
import { Icon } from '../icons/Icon.jsx';
import { useStore } from '../../state/store.js';
import { sfx } from '../../audio/sfx.js';
import { haptic } from '../../audio/haptics.js';
import { useHoldCelebrations } from '../../hooks/useFocusMode.js';
import { APP_VERSION, BRAND_NAME, BRAND_TAGLINE, COPYRIGHT_YEAR, STUDIO_NAME } from '../../lib/appInfo.js';
import { TRACKS, TRACK_IDS, currentTrack, hasChosenTrack, switchTrack, chooseTrack } from '../../lib/track.js';

const SPLASH_MS = 4000;
const FADE_MS = 450;
const LINES = ['Charging Zap’s batteries…', 'Polishing the stars…', 'Shuffling your flashcards…', 'Waking up the Bosses…'];

export function SplashScreen({ onDone }) {
  const [ready, setReady] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [line, setLine] = useState(0);
  const ref = useRef(null);
  const startRef = useRef(null);
  const returning = useStore((s) => s.onboarded);
  const chosen = hasChosenTrack() || returning; // people who studied PD2 before exams existed keep it as their main button
  useHoldCelebrations(true); // rewards and pop-ups wait until the splash is gone

  useEffect(() => {
    const done = setTimeout(() => setReady(true), SPLASH_MS);
    const lines = setInterval(() => setLine((i) => (i + 1) % LINES.length), SPLASH_MS / LINES.length);
    // Focus the splash itself so Enter or a tap can skip the loading without a visible focus ring.
    ref.current?.focus({ preventScroll: true });
    return () => { clearTimeout(done); clearInterval(lines); };
  }, []);

  // When loading is done, the Start/Play button takes focus (Enter or Space presses it).
  useEffect(() => { if (ready) startRef.current?.focus({ preventScroll: true }); }, [ready]);

  useEffect(() => {
    if (!leaving) return undefined;
    const done = setTimeout(onDone, FADE_MS);
    return () => clearTimeout(done);
  }, [leaving, onDone]);

  const skip = () => setReady(true);
  const pick = (id) => (e) => {
    e.stopPropagation(); sfx.start(); haptic('success');
    if (id !== currentTrack) { switchTrack(id); return; } // reloads straight into the other exam
    chooseTrack(id);
    setLeaving(true);
  };

  return (
    <div
      ref={ref} tabIndex={-1}
      className={`splash${leaving ? ' leaving' : ''}${ready ? ' picking' : ''}`}
      onClick={ready ? undefined : skip}
      onKeyDown={(e) => !ready && ['Enter', 'Escape', ' '].includes(e.key) && skip()}
      role="dialog" aria-modal="true"
      aria-label={`${BRAND_NAME}, ${BRAND_TAGLINE} exam prep, by ${STUDIO_NAME}. Version ${APP_VERSION}.${ready ? ' Pick your exam.' : ' Loading.'}`}
    >
      <div className="splash-rays" aria-hidden="true" />

      <div className="splash-stage" aria-hidden="true">
        <svg className="splash-art" viewBox="0 0 200 130" focusable="false">
          {/* lightning from Zap to the badge */}
          <path className="splash-bolt" d="M70 92 L92 70 L84 66 L110 44 L102 40 L134 22" pathLength="1" />
          <g className="splash-badge" transform="translate(152 30)">
            <circle className="splash-badge-glow" r="30" />
            <path d="M-11 18 L-16 38 L-6 32 L0 40 L4 20 Z M11 18 L16 38 L6 32 L0 40 L-4 20 Z" className="splash-ribbon" />
            <circle r="22" className="splash-badge-ring" />
            <circle r="16.5" className="splash-badge-face" />
            <path className="splash-badge-star" d="M0 -10 L2.9 -3.6 L9.5 -3.1 L4.5 1.3 L6 8 L0 4.4 L-6 8 L-4.5 1.3 L-9.5 -3.1 L-2.9 -3.6 Z" />
          </g>
        </svg>
        <div className="splash-zap"><Zap mood="cheer" size={108} hat={null} bounce={false} label="" /></div>
      </div>

      <h1 className="splash-title" aria-hidden="true">
        <span className="splash-word">
          {[...BRAND_NAME].map((ch, i) => (
            <span key={i} className={ch === ' ' ? 'splash-space' : 'splash-letter'} style={{ '--i': i }}>{ch === ' ' ? ' ' : ch}</span>
          ))}
        </span>
        <span className="splash-tagline">{BRAND_TAGLINE}</span>
      </h1>

      <p className="splash-facts" aria-hidden="true">Bite-sized exam prep · plain words · real exam focus</p>

      {ready ? (
        <div className="splash-tracks" role="group" aria-label="Pick your exam">
          {TRACK_IDS.map((id, k) => {
            const main = chosen && id === currentTrack;
            return (
              <motion.button
                key={id} ref={main || (!chosen && k === 0) ? startRef : undefined} type="button"
                className={`btn big splash-start splash-track${main ? ' primary' : ''}`} onClick={pick(id)}
                initial={{ opacity: 0, scale: 0.7, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 420, damping: 18, delay: k * 0.08 }}
              >
                <Icon name="play" fill />
                <span className="splash-track-text">
                  <span className="splash-track-name">{TRACKS[id].name}</span>
                  <span className="splash-track-sub">{TRACKS[id].exam.replace('Salesforce ', '')}</span>
                </span>
              </motion.button>
            );
          })}
        </div>
      ) : (
        <div className="splash-loading" aria-hidden="true">
          <div className="splash-bar"><span className="splash-fill" style={{ animationDuration: `${SPLASH_MS}ms` }} /></div>
          <p key={line} className="splash-line">{LINES[line]}</p>
        </div>
      )}

      <footer className="splash-footer">
        <p className="splash-studio">A <strong>{STUDIO_NAME}</strong> production</p>
        <p className="splash-meta">Version {APP_VERSION} · © {COPYRIGHT_YEAR} {STUDIO_NAME}</p>
        <p className="splash-meta">Not affiliated with Salesforce.</p>
      </footer>

      {!ready && <button type="button" className="splash-skip" onClick={(e) => { e.stopPropagation(); skip(); }}>Skip</button>}
    </div>
  );
}
