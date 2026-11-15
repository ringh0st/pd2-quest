// A calm, capped "add PD2 Quest to your home screen" card. Home decides when (`show`).
import { useEffect, useId, useSyncExternalStore } from 'react';
import { installCardAllowed, installMode, markInstallCardShown, promptInstall, snoozeInstallCard, subscribeInstall } from '../lib/install.js';

const snapshot = () => (installCardAllowed() ? installMode() ?? '' : '');

function ShareIcon() {
  return (
    <svg className="install-icon" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false">
      <path d="M12 3v12M7.5 7.5 12 3l4.5 4.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 10H6a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-9a1 1 0 0 0-1-1h-2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function AddIcon() {
  return (
    <svg className="install-icon" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false">
      <rect x="4" y="4" width="16" height="16" rx="4" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M12 8.5v7M8.5 12h7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function InstallCard({ show = true }) {
  const mode = useSyncExternalStore(subscribeInstall, snapshot, () => '');
  const titleId = useId();
  const visible = show && mode !== '';

  useEffect(() => {
    if (visible) markInstallCardShown();
  }, [visible]);

  if (!visible) return null;
  return (
    <section className="card stack install-card" aria-labelledby={titleId}>
      <div className="stack-s">
        <h2 id={titleId}>📲 Keep PD2 Quest one tap away</h2>
        <p className="small muted">Add it to your home screen: it opens full screen, works offline and keeps your progress safer.</p>
      </div>
      {mode === 'ios' && (
        <ol className="install-steps">
          <li><ShareIcon /><span>Tap <strong>Share</strong> in Safari’s toolbar</span></li>
          <li><AddIcon /><span>Choose <strong>Add to Home Screen</strong></span></li>
        </ol>
      )}
      <div className="row wrap">
        {mode === 'prompt' && (
          <button type="button" className="btn primary grow" onClick={() => promptInstall()}>Install PD2 Quest</button>
        )}
        <button type="button" className={`btn ${mode === 'ios' ? 'grow' : ''}`} onClick={snoozeInstallCard}>Not now</button>
      </div>
    </section>
  );
}
