// The owner's Feedback inbox: every report, newest first, with where it came from and a link that opens that exact
// spot. Only accounts in the `admins` table can read it (the database checks; this screen just asks).
import { useCallback, useEffect, useId, useState } from 'react';
import { supabase } from '../lib/auth.js';
import { useAuth } from '../hooks/useAuth.js';
import { go } from '../hooks/useRoute.js';
import { Icon } from '../components/icons/Icon.jsx';
import { Segmented } from '../components/Controls.jsx';
import { Dropdown } from '../components/Dropdown.jsx';
import { useFeedback } from '../components/Feedback.jsx';
import { sfx } from '../audio/sfx.js';

const STATUSES = [
  { value: 'new', label: 'New' },
  { value: 'doing', label: 'Doing' },
  { value: 'fixed', label: 'Fixed' },
  { value: 'wontfix', label: 'Won’t fix' },
];
const CATEGORY = { wrong: 'Wrong', confusing: 'Confusing', typo: 'Typo', bug: 'Bug', idea: 'Idea', other: 'Other' };

/** The in-app part of a report's link ("#/go/js/card/types-4/2"), so it opens here, in this tab. */
const appRoute = (link = '') => (link.includes('#') ? link.slice(link.indexOf('#') + 1) : null);

export function Inbox() {
  const { ready, user, admin } = useAuth();
  const [filter, setFilter] = useState('new');
  const [rows, setRows] = useState(null);
  const [failed, setFailed] = useState(false);
  const { showToast } = useFeedback();

  const load = useCallback(async () => {
    setFailed(false);
    try {
      const client = await supabase();
      let q = client.from('feedback').select('*').order('created_at', { ascending: false }).limit(300);
      if (filter !== 'all') q = q.eq('status', filter);
      const { data, error } = await q;
      if (error) throw error;
      setRows(data);
    } catch { setFailed(true); setRows([]); }
  }, [filter]);

  useEffect(() => { if (admin) { setRows(null); load(); } }, [admin, load]);

  const setStatus = async (row, status) => {
    try {
      const client = await supabase();
      const { error } = await client.from('feedback').update({ status }).eq('id', row.id);
      if (error) throw error;
      sfx.done();
      setRows((list) => (filter === 'all' ? list.map((r) => (r.id === row.id ? { ...r, status } : r)) : list.filter((r) => r.id !== row.id)));
      showToast(`Marked ${STATUSES.find((s) => s.value === status).label.toLowerCase()}`, 'check');
    } catch { showToast('Couldn’t save that. Check the connection.'); }
  };

  return (
    <main className="screen" id="main">
      <div className="topbar">
        <button className="icon-btn" onClick={() => go('/me')} aria-label="Back"><Icon name="back" /></button>
        <h1 className="grow pq-head"><span className="pq-tile s"><Icon name="report" /></span><span>Feedback inbox</span></h1>
        {admin && <button className="icon-btn" onClick={() => { sfx.tap(); setRows(null); load(); }} aria-label="Refresh"><Icon name="retry" /></button>}
      </div>
      {!ready && <p className="muted">Checking your account…</p>}
      {ready && !admin && (
        <section className="card stack-s">
          <p>{user ? 'This account can’t read feedback.' : 'Sign in first (Me → Sign in with Google).'}</p>
          <p className="small muted">Only accounts added to the admins table in Supabase can open the inbox (see supabase/README.md).</p>
        </section>
      )}
      {admin && (
        <>
          <Segmented label="Show" options={[...STATUSES.slice(0, 3).map((s) => [s.value, s.label]), ['all', 'All']]} value={filter} onChange={setFilter} />
          {rows === null && <div className="stack" aria-busy="true" aria-label="Loading reports">{[0, 1, 2].map((k) => <div key={k} className="card inbox-skeleton" />)}</div>}
          {failed && <p className="small account-error" role="alert"><Icon name="warn" /> Couldn’t load the reports. Check the connection and refresh.</p>}
          {rows && !failed && !rows.length && <p className="muted center"><Icon name="sparkles" className="ic-gold" /> Nothing here.</p>}
          {rows && rows.length > 0 && (
            <ol className="list-plain stack">
              {rows.map((r) => <InboxRow key={r.id} row={r} onStatus={(s) => setStatus(r, s)} />)}
            </ol>
          )}
        </>
      )}
    </main>
  );
}

function InboxRow({ row, onStatus }) {
  const labelId = useId();
  const route = appRoute(row.link);
  return (
    <li className="card stack-s inbox-row">
      <div className="spread small">
        <span className="chip">{CATEGORY[row.category] || row.category}</span>
        <time className="muted" dateTime={row.created_at}>{new Date(row.created_at).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</time>
      </div>
      <strong className="inbox-label">{row.label}</strong>
      {row.message ? <p className="inbox-message">{row.message}</p> : <p className="small muted">No message.</p>}
      {row.contact && <p className="small">Reply to: <span className="inbox-contact">{row.contact}</span></p>}
      <p className="small muted">{[row.device, row.app_version && `v${row.app_version}`, row.user_id ? 'signed in' : 'guest'].filter(Boolean).join(' · ')}</p>
      <div className="inbox-actions">
        {route && <a className="btn" href={`#${route}`} onClick={() => sfx.tap()}><Icon name="next" /> Open the spot</a>}
        <span className="inbox-status">
          <span id={labelId} className="sr-only">Status</span>
          <Dropdown labelId={labelId} value={row.status} options={STATUSES} onChange={onStatus} />
        </span>
      </div>
    </li>
  );
}
