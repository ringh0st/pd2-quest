// Answers to the problems and ideas you sent (and to "Contact us"). New ones are marked until seen here.
import { useEffect, useState } from 'react';
import { fetchReplies, isNewReply, markRepliesSeen, canHaveReplies } from '../lib/feedbackReplies.js';
import { Icon } from './icons/Icon.jsx';

export function RepliesList() {
  const [rows, setRows] = useState(null);
  const [fresh, setFresh] = useState(() => new Set());
  useEffect(() => {
    if (!canHaveReplies()) { setRows([]); return undefined; }
    let alive = true;
    fetchReplies().then((list) => {
      if (!alive) return;
      setFresh(new Set(list.filter((r) => isNewReply(r)).map((r) => r.id)));
      setRows(list);
      markRepliesSeen(list);
    }).catch(() => alive && setRows([]));
    return () => { alive = false; };
  }, []);
  if (rows === null) return <div className="skeleton-line" aria-busy="true" />;
  if (!rows.length) return <p className="small muted">No replies yet. When you report a problem or contact us, our answer shows up here.</p>;
  return (
    <ul className="list-plain stack-s">
      {rows.map((r) => (
        <li key={r.id} className={`reply-item${fresh.has(r.id) ? ' new' : ''}`}>
          {fresh.has(r.id) && <span className="reply-new">New</span>}
          <span className="small muted">{r.label}</span>
          {r.message && <p className="small reply-yours">You wrote: “{r.message}”</p>}
          <p className="reply-text">{r.reply}</p>
          <span className="small muted">{r.status === 'fixed' ? <><Icon name="ok" /> Fixed · </> : ''}{new Date(r.replied_at).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
        </li>
      ))}
    </ul>
  );
}
