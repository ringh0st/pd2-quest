// The opening screen: Zap flies in, a lightning arc lights up the PD2 badge, the title pops in letter
// by letter and a bar fills for about 4 seconds while the app loads underneath. Shows the exam facts,
// the studio and the version. Tap, Enter, Space or Escape skips it. Static with reduced motion.
import { useEffect, useRef, useState } from 'react';
import { Zap } from '../game/Zap.jsx';
import { useHoldCelebrations } from '../../hooks/useFocusMode.js';
import { exam } from '../../data/index.js';
import { APP_NAME, APP_TAGLINE, APP_VERSION, COPYRIGHT_YEAR, STUDIO_NAME } from '../../lib/appInfo.js';

const SPLASH_MS = 4000;
const FADE_MS = 450;
const LINES = ['Bulkifying the triggers…', 'Warming up the governor limits…', 'Shuffling your flashcards…', 'Waking up the Bosses…'];

export function SplashScreen({ onDone }) {
  const [leaving, setLeaving] = useState(false);
  const [line, setLine] = useState(0);
  const ref = useRef(null);
  useHoldCelebrations(true); // rewards and pop-ups wait until the splash is gone

  useEffect(() => {
    const leave = setTimeout(() => setLeaving(true), SPLASH_MS);
    const lines = setInterval(() => setLine((i) => (i + 1) % LINES.length), SPLASH_MS / LINES.length);
    // Focus the splash itself so Enter or Escape skips it without a visible focus ring.
    ref.current?.focus({ preventScroll: true });
    return () => { clearTimeout(leave); clearInterval(lines); };
  }, []);

  useEffect(() => {
    if (!leaving) return undefined;
    const done = setTimeout(onDone, FADE_MS);
    return () => clearTimeout(done);
  }, [leaving, onDone]);

  const skip = () => setLeaving(true);

  return (
    <div
      ref={ref} tabIndex={-1}
      className={`splash${leaving ? ' leaving' : ''}`}
      onClick={skip}
      onKeyDown={(e) => ['Enter', 'Escape', ' '].includes(e.key) && skip()}
      role="dialog" aria-modal="true"
      aria-label={`${APP_NAME}, ${APP_TAGLINE} exam prep, by ${STUDIO_NAME}. Version ${APP_VERSION}. Loading.`}
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
            <text y="5.5" textAnchor="middle" className="splash-badge-text">PD2</text>
          </g>
        </svg>
        <div className="splash-zap"><Zap mood="cheer" size={108} hat={null} bounce={false} label="" /></div>
      </div>

      <h1 className="splash-title" aria-hidden="true">
        <span className="splash-word">
          {[...APP_NAME].map((ch, i) => (
            <span key={i} className={ch === ' ' ? 'splash-space' : 'splash-letter'} style={{ '--i': i }}>{ch === ' ' ? ' ' : ch}</span>
          ))}
        </span>
        <span className="splash-tagline">{APP_TAGLINE}</span>
      </h1>

      <p className="splash-facts" aria-hidden="true">
        {exam.questions} questions · {exam.minutes} min · {exam.passing}% to pass
      </p>

      <div className="splash-loading" aria-hidden="true">
        <div className="splash-bar"><span className="splash-fill" style={{ animationDuration: `${SPLASH_MS}ms` }} /></div>
        <p key={line} className="splash-line">{LINES[line]}</p>
      </div>

      <footer className="splash-footer">
        <p className="splash-studio">A <strong>{STUDIO_NAME}</strong> production</p>
        <p className="splash-meta">Version {APP_VERSION} · © {COPYRIGHT_YEAR} {STUDIO_NAME}</p>
        <p className="splash-meta">Not affiliated with Salesforce.</p>
      </footer>

      <button type="button" className="splash-skip" onClick={skip}>Tap to skip</button>
    </div>
  );
}
