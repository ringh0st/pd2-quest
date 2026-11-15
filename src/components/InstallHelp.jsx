// Small "📲 Add to Home Screen" button that opens a sheet with illustrated iPhone steps,
// short Android steps, and how to carry progress over (on iPhone the home-screen app keeps its own storage).
// Hidden when the app already runs from the home screen.
import { useCallback, useState, useSyncExternalStore } from 'react';
import { isIos } from '../lib/displayMode.js';
import { installMode, promptInstall, installDone, markInstalled, subscribeInstall } from '../lib/install.js';
import { Sheet } from './Sheet.jsx';
import { sfx } from '../audio/sfx.js';

function Icon({ children, label }) {
  return (
    <span className="ios-key" role="img" aria-label={label}>
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false">{children}</svg>
    </span>
  );
}

const ShareIcon = () => (
  <Icon label="Share button: a square with an arrow pointing up">
    <path d="M12 3v12M7.5 7.5 12 3l4.5 4.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M8 10H6a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-9a1 1 0 0 0-1-1h-2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </Icon>
);
const MoreIcon = () => (
  <Icon label="More button: three dots">
    <circle cx="5" cy="12" r="2" fill="currentColor" /><circle cx="12" cy="12" r="2" fill="currentColor" /><circle cx="19" cy="12" r="2" fill="currentColor" />
  </Icon>
);
const AddIcon = () => (
  <Icon label="Add to Home Screen: a square with a plus">
    <rect x="4" y="4" width="16" height="16" rx="4" fill="none" stroke="currentColor" strokeWidth="2" />
    <path d="M12 8.5v7M8.5 12h7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </Icon>
);

const IPHONE_STEPS = [
  { icon: null, title: 'Open this page in Safari', body: 'Already in Safari? Great. In another app (Gmail, Slack…), tap “Open in Safari” first.' },
  { icon: <ShareIcon />, title: 'Tap Share', body: <>It’s the square with an arrow, at the bottom of the screen (top right on iPad). Only see <strong>⋯</strong>? Tap <MoreIcon /> first, then <strong>Share</strong>.</> },
  { icon: <AddIcon />, title: 'Tap “Add to Home Screen”', body: 'Scroll down the list to find it. Not there? Tap “View More” or “Edit Actions” at the bottom and add it.' },
  { icon: null, title: 'Keep “Open as Web App” on, then tap Add', body: 'The name can stay “PD2 Quest”. The ⚡ icon appears on your home screen.' },
  { icon: null, title: 'Open PD2 Quest from the new icon', body: 'It opens full screen like a real app and works offline.' },
];

export function InstallHelpButton({ className = '' }) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const done = useSyncExternalStore(subscribeInstall, installDone, () => false);
  if (done && !open) return null;
  return (
    <>
      <button type="button" className={`btn small install-help-btn ${className}`} aria-haspopup="dialog" onClick={() => { sfx.tap(); setOpen(true); }}>
        📲 Add to Home Screen
      </button>
      <Sheet open={open} onClose={close} labelledBy="install-guide-title">
        <InstallGuide onClose={close} onAdded={() => { markInstalled(); close(); }} />
      </Sheet>
    </>
  );
}

function InstallGuide({ onClose, onAdded }) {
  const [ios] = useState(() => isIos());
  const canPrompt = installMode() === 'prompt';

  return (
    <div className="stack install-sheet">
      <h2 id="install-guide-title">📲 Add PD2 Quest to your Home Screen</h2>
      <p className="small muted">One minute, once: its own icon, full screen, works offline, and safer from Safari clearing site data.</p>

      <section className="stack-s" aria-labelledby="iphone-title">
        <h3 id="iphone-title">📱 iPhone &amp; iPad{ios ? ' (this device)' : ''}</h3>
        <ol className="install-guide">
          {IPHONE_STEPS.map((st, k) => (
            <li key={k}>
              <span className="install-num" aria-hidden="true">{k + 1}</span>
              <div className="stack-s" style={{ gap: 4 }}>
                <strong>{st.title} {st.icon}</strong>
                <span className="small">{st.body}</span>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="stack-s install-tip" aria-labelledby="carry-title">
        <h3 id="carry-title">💾 Already studied in Safari?</h3>
        <p className="small">The home-screen app keeps its own progress. Move it over once:</p>
        <ol className="small" style={{ margin: 0, paddingLeft: '1.3em', display: 'grid', gap: 4 }}>
          <li>In Safari: <strong>Me → ⚙️ Settings → 💾 Save backup</strong>.</li>
          <li>In the new app: <strong>Settings → 📂 Restore</strong>, pick the file (Files → Downloads).</li>
        </ol>
      </section>

      {!ios && (
        <section className="stack-s" aria-labelledby="android-title">
          <h3 id="android-title">🤖 Android (Chrome)</h3>
          {canPrompt && <button className="btn primary" onClick={() => promptInstall()}>Install PD2 Quest now</button>}
          <p className="small">Tap <strong>⋮</strong> (top right), then <strong>Install app</strong> or <strong>Add to Home screen</strong>.</p>
        </section>
      )}

      <div className="row wrap">
        <button type="button" className="btn primary grow" onClick={onAdded}>✓ I added it</button>
        <button type="button" className="btn grow" data-autofocus onClick={onClose}>Later</button>
      </div>
      <p className="small muted">Tap “I added it” once it’s on your Home Screen and this button goes away.</p>
    </div>
  );
}
