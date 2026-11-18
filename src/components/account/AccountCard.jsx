// The account card on the Me screen: sign in with Google (optional), see that progress is synced, sign out,
// delete the account, and (for the owner) open the Feedback inbox. Hidden until the server is set up.
import { useState, useSyncExternalStore } from 'react';
import { hasBackend } from '../../lib/backend.js';
import { signInWithGoogle, signOut, deleteAccount } from '../../lib/auth.js';
import { subscribeSync, syncSnapshot, syncNow } from '../../lib/cloudSync.js';
import { useAuth } from '../../hooks/useAuth.js';
import { GoogleButton } from './GoogleButton.jsx';
import { Icon } from '../icons/Icon.jsx';
import { sfx } from '../../audio/sfx.js';

function syncText({ state, at }) {
  if (state === 'syncing') return 'Saving your progress…';
  if (state === 'offline') return 'Offline. Your progress syncs when you’re back online.';
  if (state === 'error') return 'Couldn’t sync just now. It will try again.';
  if (state === 'synced' && at) return `Progress synced at ${new Date(at).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}.`;
  return 'Your progress follows you to every device you sign in on.';
}

export function AccountCard() {
  const { ready, user, admin, busy, error } = useAuth();
  const sync = useSyncExternalStore(subscribeSync, syncSnapshot, syncSnapshot);
  const [confirmDelete, setConfirmDelete] = useState(false);
  if (!hasBackend()) return null;

  if (!ready) {
    return <section className="card account-card" aria-busy="true" aria-label="Account"><div className="skeleton-line" /><div className="skeleton-line short" /></section>;
  }

  if (!user) {
    return (
      <section className="card stack-s account-card" aria-labelledby="account-title">
        <strong id="account-title" className="ic-label"><span className="ic-sec" style={{ '--sec-accent': 'var(--primary)' }}><Icon name="cloud" /></span>Keep your progress safe</strong>
        <p className="small muted">Sign in to save your progress and pick up on any device. It’s optional: everything works without an account.</p>
        <GoogleButton busy={busy} onClick={() => { sfx.tap(); signInWithGoogle(); }} />
        {error && <p className="small account-error" role="alert"><Icon name="warn" /> {error}</p>}
      </section>
    );
  }

  return (
    <section className="card stack-s account-card" aria-labelledby="account-title">
      <div className="row">
        {user.avatar
          ? <img className="account-avatar" src={user.avatar} alt="" referrerPolicy="no-referrer" width="44" height="44" />
          : <span className="account-avatar account-avatar-letter" aria-hidden="true">{(user.name || user.email || '?')[0].toUpperCase()}</span>}
        <span className="grow">
          <strong id="account-title" className="account-name">{user.name || 'Signed in'}</strong>
          <span className="small muted account-email">{user.email}</span>
        </span>
      </div>
      <p className="small muted" role="status"><Icon name={sync.state === 'synced' ? 'ok' : sync.state === 'error' || sync.state === 'offline' ? 'warn' : 'cloud'} /> {syncText(sync)}</p>
      {admin && <a className="btn" href="#/inbox" onClick={() => sfx.tap()}><Icon name="report" /> Feedback inbox</a>}
      <div className="account-actions">
        <button type="button" className="btn" onClick={() => { sfx.tap(); syncNow(); }} disabled={sync.state === 'syncing'}><Icon name="retry" /> Sync now</button>
        <button type="button" className="btn" onClick={() => { sfx.tap(); signOut(); }} disabled={busy}>Sign out</button>
      </div>
      <details className="account-danger">
        <summary className="small">Delete my account</summary>
        <p className="small muted">This deletes your account and the progress saved to it. Progress on this device stays.</p>
        {confirmDelete
          ? <button type="button" className="btn danger" onClick={async () => { if (await deleteAccount()) setConfirmDelete(false); }} disabled={busy}>Yes, delete my account</button>
          : <button type="button" className="btn" onClick={() => setConfirmDelete(true)}>Delete account…</button>}
      </details>
      {error && <p className="small account-error" role="alert"><Icon name="warn" /> {error}</p>}
    </section>
  );
}
