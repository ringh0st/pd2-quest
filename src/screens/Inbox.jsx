// The owner's Feedback inbox: every report, newest first, with where it came from and a link that opens that exact
// spot. Only accounts in the `admins` table can read it (the database checks; this screen just asks).
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { supabase } from '../lib/auth.js';
import { useAuth } from '../hooks/useAuth.js';
import { Icon } from '../components/icons/Icon.jsx';
import { Segmented } from '../components/Controls.jsx';
import { Dropdown } from '../components/Dropdown.jsx';
import { useFeedback } from '../components/Feedback.jsx';
import { sfx } from '../audio/sfx.js';
import { announceFeedbackChanged } from '../hooks/useNewFeedbackCount.js';
import { addCoins } from '../state/store.js';
import { holdCoins, flyCoins } from '../lib/coinFlight.js';
import { setReviewFocus } from '../lib/reviewFocus.js';

const STATUSES = [
  { value: 'new', label: 'New' },
  { value: 'doing', label: 'Doing' },
  { value: 'fixed', label: 'Fixed' },
  { value: 'wontfix', label: 'Won’t fix' },
];
const CATEGORY = { wrong: 'Wrong', confusing: 'Confusing', typo: 'Typo', bug: 'Bug', idea: 'Idea', other: 'Other', question: 'Question', problem: 'Problem' };
const TOPICS = [['all', 'All'], ['content', 'Content'], ['general', 'General']];

/** The in-app part of a report's link ("#/go/js/card/types-4/2"), so it opens here, in this tab. */
const appRoute = (link = '') => (link.includes('#') ? link.slice(link.indexOf('#') + 1) : null);

const QUICK_REPLIES = ['Fixed, thanks for telling us!', 'Good catch! It’s corrected now.', 'Thanks! We’ve made it clearer.', 'Thanks for the idea, we’ll think about it.'];

export function Inbox({ query = {} }) {
  const { ready, user, admin } = useAuth();
  const openId = query.open || null; // back from "Open the spot": show that report
  const [filter, setFilter] = useState(openId ? 'all' : 'new');
  const [topic, setTopic] = useState('all'); // content reports, general messages (Contact us), or both
  const [rows, setRows] = useState(null);
  const [failed, setFailed] = useState(false);
  const { showToast } = useFeedback();

  const load = useCallback(async () => {
    setFailed(false);
    try {
      const client = await supabase();
      let q = client.from('feedback').select('*').order('created_at', { ascending: false }).limit(300);
      if (filter !== 'all') q = q.eq('status', filter);
      if (topic === 'general') q = q.eq('kind', 'app');
      else if (topic === 'content') q = q.neq('kind', 'app');
      const { data, error } = await q;
      if (error) throw error;
      setRows(data);
    } catch { setFailed(true); setRows([]); }
  }, [filter, topic]);

  useEffect(() => { if (admin) { setRows(null); load(); } }, [admin, load]);

  // Saves changes to one report (status, reply, private note) and shows them in place
  const saveRow = async (row, patch, done) => {
    try {
      const client = await supabase();
      const { error } = await client.from('feedback').update(patch).eq('id', row.id);
      if (error) throw error;
      sfx.done();
      announceFeedbackChanged();
      setRows((list) => list.map((r) => (r.id === row.id ? { ...r, ...patch } : r)));
      showToast(done, 'check');
      return true;
    } catch { showToast('Couldn’t save that. Check the connection.'); return false; }
  };

  return (
    <main className="screen" id="main">
      <div className="topbar">
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
          <section className="card stack-s" aria-labelledby="owner-tools">
            <strong id="owner-tools" className="ic-label"><Icon name="tools" /> Owner tools</strong>
            <p className="small muted">For testing the Shop. Coins are saved on this device only.</p>
            <button type="button" className="btn" onClick={(e) => { const from = e.currentTarget; holdCoins(1000); addCoins(1000); sfx.coin(); flyCoins({ from, amount: 1000 }); }}>
              <Icon name="coin" /> Add 1000 coins
            </button>
          </section>
          <Segmented label="Show" options={[...STATUSES.slice(0, 3).map((s) => [s.value, s.label]), ['all', 'All']]} value={filter} onChange={setFilter} />
          <Segmented label="Topic" options={TOPICS} value={topic} onChange={setTopic} />
          {rows === null && <div className="stack" aria-busy="true" aria-label="Loading reports">{[0, 1, 2].map((k) => <div key={k} className="card inbox-skeleton" />)}</div>}
          {failed && <p className="small account-error" role="alert"><Icon name="warn" /> Couldn’t load the reports. Check the connection and refresh.</p>}
          {rows && !failed && !rows.length && <p className="muted center"><Icon name="sparkles" className="ic-gold" /> Nothing here.</p>}
          {rows && rows.length > 0 && (
            <ol className="list-plain stack">
              {rows.map((r) => (
                <InboxRow
                  key={r.id} row={r} focused={r.id === openId}
                  onStatus={(status) => saveRow(r, { status }, `Marked ${STATUSES.find((x) => x.value === status).label.toLowerCase()}`)}
                  onReply={(reply, fixed) => saveRow(r, { reply, replied_at: new Date().toISOString(), ...(fixed ? { status: 'fixed' } : {}) }, 'Reply sent. They’ll see it in the app.')}
                  onNote={(note) => saveRow(r, { note: note || null }, 'Note saved')}
                />
              ))}
            </ol>
          )}
        </>
      )}
    </main>
  );
}

function InboxRow({ row, focused, onStatus, onReply, onNote }) {
  const labelId = useId();
  const replyId = useId();
  const noteId = useId();
  const ref = useRef(null);
  const route = row.kind === 'app' ? null : appRoute(row.link); // general messages aren't about a spot
  const [reply, setReply] = useState(row.reply || '');
  const [fixed, setFixed] = useState(row.status !== 'fixed' && ['wrong', 'typo', 'confusing', 'bug'].includes(row.category));
  const [note, setNote] = useState(row.note || '');
  useEffect(() => { if (focused) ref.current?.scrollIntoView({ block: 'center' }); }, [focused]);
  return (
    <li ref={ref} className={`card stack-s inbox-row${focused ? ' focused' : ''}`}>
      <div className="spread small">
        <span className="chip">{CATEGORY[row.category] || row.category}</span>
        <time className="muted" dateTime={row.created_at}>{new Date(row.created_at).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</time>
      </div>
      <strong className="inbox-label">{row.kind === 'app' ? <><Icon name="chat" /> General message</> : row.label}</strong>
      {row.message ? <p className="inbox-message">{row.message}</p> : <p className="small muted">No message.</p>}
      {row.contact && <p className="small">Email: <span className="inbox-contact">{row.contact}</span></p>}
      <p className="small muted">{[row.device, row.app_version && `v${row.app_version}`, row.user_id ? 'signed in' : 'guest'].filter(Boolean).join(' · ')}</p>
      <div className="inbox-actions">
        {route && <a className="btn" href={`#${route}`} onClick={() => { sfx.tap(); setReviewFocus(row); }}><Icon name="next" /> Open the spot</a>}
        <span className="inbox-status">
          <span id={labelId} className="sr-only">Status</span>
          <Dropdown labelId={labelId} value={row.status} options={STATUSES} onChange={onStatus} />
        </span>
      </div>

      <div className="inbox-reply stack-s">
        <label htmlFor={replyId} className="small"><strong>Reply to them</strong> <span className="muted">(they see it in the app, on the Me screen)</span></label>
        {row.reply && <p className="small muted"><Icon name="ok" /> Sent {row.replied_at ? new Date(row.replied_at).toLocaleDateString(undefined, { dateStyle: 'medium' }) : ''}. Edit and send again to change it.</p>}
        <div className="inbox-quick">
          {QUICK_REPLIES.map((q) => <button key={q} type="button" className="chip-btn" onClick={() => setReply(q)}>{q}</button>)}
        </div>
        <textarea id={replyId} className="input edit-input" rows={3} maxLength={2000} value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Write your reply" />
        <label className="small inbox-check"><input type="checkbox" checked={fixed} onChange={(e) => setFixed(e.target.checked)} /> Also mark as fixed</label>
        <button type="button" className="btn primary" disabled={!reply.trim() || (reply.trim() === (row.reply || '') && !fixed)} onClick={() => onReply(reply.trim(), fixed)}><Icon name="chat" /> {row.reply ? 'Update reply' : 'Send reply'}</button>
      </div>

      <details className="inbox-note" open={!!row.note}>
        <summary className="small"><strong>Private note</strong> <span className="muted">(only you see it)</span></summary>
        <textarea id={noteId} aria-label="Private note" className="input edit-input" rows={2} maxLength={2000} value={note} onChange={(e) => setNote(e.target.value)} placeholder="What to fix, where you got to…" />
        <button type="button" className="btn small" disabled={note === (row.note || '')} onClick={() => onNote(note.trim())}>Save note</button>
      </details>
    </li>
  );
}
