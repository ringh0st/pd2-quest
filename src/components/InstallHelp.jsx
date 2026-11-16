// Small "Add to Home Screen" button that opens a sheet with illustrated iPhone steps,
// short Android steps, and how to carry progress over (on iPhone the home-screen app keeps its own storage).
// Hidden when the app already runs from the home screen.
import { useCallback, useState, useSyncExternalStore } from 'react';
import { isIos } from '../lib/displayMode.js';
import { installMode, promptInstall, installDone, markInstalled, subscribeInstall } from '../lib/install.js';
import { Sheet } from './Sheet.jsx';
import { sfx } from '../audio/sfx.js';
import { Icon } from './icons/Icon.jsx';
import { HeroArt } from './art/HeroArt.jsx';

function KeyIcon({ children, label }) {
  return (
    <span className="ios-key" role="img" aria-label={label}>
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false">{children}</svg>
    </span>
  );
}

const ShareIcon = () => (
  <KeyIcon label="Share button: a square with an arrow pointing up">
    <path d="M12 3v12M7.5 7.5 12 3l4.5 4.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M8 10H6a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-9a1 1 0 0 0-1-1h-2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </KeyIcon>
);
const MoreIcon = () => (
  <KeyIcon label="More button: three dots">
    <circle cx="5" cy="12" r="2" fill="currentColor" /><circle cx="12" cy="12" r="2" fill="currentColor" /><circle cx="19" cy="12" r="2" fill="currentColor" />
  </KeyIcon>
);
const MenuIcon = () => (
  <KeyIcon label="Menu button: three dots in a column">
    <circle cx="12" cy="5" r="2" fill="currentColor" /><circle cx="12" cy="12" r="2" fill="currentColor" /><circle cx="12" cy="19" r="2" fill="currentColor" />
  </KeyIcon>
);
const AddIcon = () => (
  <KeyIcon label="Add to Home Screen: a square with a plus">
    <rect x="4" y="4" width="16" height="16" rx="4" fill="none" stroke="currentColor" strokeWidth="2" />
    <path d="M12 8.5v7M8.5 12h7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </KeyIcon>
);

const IPHONE_STEPS = [
  { mark: 'compass', title: 'Open this page in Safari', body: 'Already in Safari? Great. In another app (Gmail, Slack…), tap “Open in Safari” first.' },
  { mark: 'share', icon: <ShareIcon />, title: 'Tap Share', body: <>It’s the square with an arrow, at the bottom of the screen (top right on iPad). Only see three dots? Tap <MoreIcon /> first, then <strong>Share</strong>.</> },
  { mark: 'add', icon: <AddIcon />, title: 'Tap “Add to Home Screen”', body: 'Scroll down the list to find it. Not there? Tap “View More” or “Edit Actions” at the bottom and add it.' },
  { mark: 'check', title: 'Keep “Open as Web App” on, then tap Add', body: 'The name can stay “Dev Quest”. The lightning-bolt icon appears on your home screen.' },
  { mark: 'rocket', title: 'Open Dev Quest from the new icon', body: 'It opens full screen like a real app and works offline.' },
];

export function InstallHelpButton({ className = '' }) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const done = useSyncExternalStore(subscribeInstall, installDone, () => false);
  if (done && !open) return null;
  return (
    <>
      <button type="button" className={`btn small install-help-btn ${className}`} aria-haspopup="dialog" onClick={() => { sfx.tap(); setOpen(true); }}>
        <Icon name="phone" /> Add to Home Screen
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
      <div className="pq-install-head">
        <HeroArt kind="install" size={56} />
        <h2 id="install-guide-title">Add Dev Quest to your Home Screen</h2>
      </div>
      <p className="small muted">One minute, once: its own icon, full screen, works offline, and safer from Safari clearing site data.</p>

      <section className="stack-s" aria-labelledby="iphone-title">
        <h3 id="iphone-title" className="pq-head"><span className="pq-tile s"><Icon name="phone" /></span><span>iPhone &amp; iPad{ios ? ' (this device)' : ''}</span></h3>
        <ol className="install-guide">
          {IPHONE_STEPS.map((st, k) => (
            <li key={k}>
              <span className="pq-tile s pq-step-tile" aria-hidden="true"><Icon name={st.mark} /><span className="install-num">{k + 1}</span></span>
              <div className="stack-s" style={{ gap: 4 }}>
                <strong>{st.title} {st.icon}</strong>
                <span className="small">{st.body}</span>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="stack-s install-tip" aria-labelledby="carry-title">
        <h3 id="carry-title" className="pq-head"><span className="pq-tile s" data-tone="gold"><Icon name="download" /></span><span>Already studied in Safari?</span></h3>
        <p className="small">The home-screen app keeps its own progress. Move it over once:</p>
        <ol className="small" style={{ margin: 0, paddingLeft: '1.3em', display: 'grid', gap: 4 }}>
          <li>In Safari: <Path steps={['Me', 'Settings', 'Save backup']} />.</li>
          <li>In the new app: <Path steps={['Settings', 'Restore']} />, pick the file (Files, then Downloads).</li>
        </ol>
      </section>

      {!ios && (
        <section className="stack-s" aria-labelledby="android-title">
          <h3 id="android-title" className="pq-head"><span className="pq-tile s" data-tone="green"><Icon name="bot" /></span><span>Android (Chrome)</span></h3>
          {canPrompt && <button className="btn primary" onClick={() => promptInstall()}>Install Dev Quest now</button>}
          <p className="small">Tap <MenuIcon /> (top right), then <strong>Install app</strong> or <strong>Add to Home screen</strong>.</p>
        </section>
      )}

      <div className="pq-btn-grid">
        <button type="button" className="btn primary" onClick={onAdded}><Icon name="check" /> I added it</button>
        <button type="button" className="btn" data-autofocus onClick={onClose}>Later</button>
      </div>
      <p className="small muted">Tap “I added it” once it’s on your Home Screen and this button goes away.</p>
    </div>
  );
}

/** "Me, then Settings, then Save backup": bold steps joined by chevrons (read as "then"). */
function Path({ steps }) {
  return (
    <strong className="pq-path">
      {steps.map((step, k) => (
        <span key={step}>{k > 0 && <>{' '}<Icon name="chevron" /><span className="sr-only"> then</span>{' '}</>}{step}</span>
      ))}
    </strong>
  );
}
