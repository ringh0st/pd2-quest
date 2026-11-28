// "Delete my data": removes everything the server holds about you (account, synced progress, Top list scores, feedback
// sent from this device or account). For guests and Google accounts alike. Progress saved on this device stays.
import { useState } from 'react';
import { deleteMyData } from '../../lib/auth.js';
import { useAuth } from '../../hooks/useAuth.js';

export function DeleteMyData() {
  const { user, busy } = useAuth();
  const [confirm, setConfirm] = useState(false);
  const [done, setDone] = useState(false);
  if (done) return <p className="small" role="status">Done: the server no longer has any of your data. Progress on this device stays.</p>;
  return (
    <details className="account-danger">
      <summary className="small">Delete my data</summary>
      <p className="small muted">
        This deletes {user ? 'your account, the progress saved to it' : 'your guest account'}, your Top list scores and the feedback sent from this device{user ? ' or account' : ''}.
        Progress on this device stays (Settings has a reset if you want that gone too).
      </p>
      {confirm
        ? <button type="button" className="btn danger" onClick={async () => { if (await deleteMyData()) { setConfirm(false); setDone(true); } }} disabled={busy}>Yes, delete my data</button>
        : <button type="button" className="btn" onClick={() => setConfirm(true)}>Delete my data…</button>}
    </details>
  );
}
