// Me screen: answers to the problems and ideas you reported. New ones are marked until you've seen them here.
import { useEffect, useState } from 'react';
import { fetchReplies, isNewReply, markRepliesSeen, canHaveReplies } from '../lib/feedbackReplies.js';
import { Icon } from './icons/Icon.jsx';

export function RepliesCard() {
  const [rows, setRows] = useState([]);
  const [fresh, setFresh] = useState(() => new Set());
  useEffect(() => {
    if (!canHaveReplies()) return;
    let alive = true;
    fetchReplies().then((list) => {
      if (!alive) return;
      setFresh(new Set(list.filter((r) => isNewReply(r)).map((r) => r.id)));
      setRows(list);
      markRepliesSeen(list);
    }).catch(() => {});
    return () => { alive = false; };
  }, []);
  if (!rows.length) return null;
  return (
    <section className="card stack-s" aria-labelledby="replies-title">
      <strong id="replies-title" className="ic-label"><span className="ic-sec" style={{ '--sec-accent': 'var(--primary)' }}><Icon name="chat" /></span>Replies to your reports</strong>
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
    </section>
  );
}
