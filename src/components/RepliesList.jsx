// Answers to the problems and ideas you sent (and to "Contact us"). New ones are marked until seen here.
// The 4 newest show (more if more are new, so nothing unread hides); "Show N older replies" opens the rest in place.
import { useEffect, useRef, useState } from 'react';
import { fetchReplies, isNewReply, markRepliesSeen, canHaveReplies } from '../lib/feedbackReplies.js';
import { Icon } from './icons/Icon.jsx';

const SHOWN = 4;

export function RepliesList() {
  const [rows, setRows] = useState(null);
  const [all, setAll] = useState(false);
  const firstOlder = useRef(null);
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
  const limit = Math.max(SHOWN, fresh.size);
  const shown = all ? rows : rows.slice(0, limit);
  const older = rows.length - limit;
  const showOlder = () => { setAll(true); requestAnimationFrame(() => firstOlder.current?.focus()); };
  return (
    <>
    <ul className="list-plain stack-s">
      {shown.map((r, k) => (
        <li key={r.id} ref={k === limit ? firstOlder : undefined} tabIndex={k === limit ? -1 : undefined} className={`reply-item${fresh.has(r.id) ? ' new' : ''}`}>
          {fresh.has(r.id) && <span className="reply-new">New</span>}
          <span className="small muted">{r.label}</span>
          {r.message && <p className="small reply-yours">You wrote: “{r.message}”</p>}
          <p className="reply-text">{r.reply}</p>
          <span className="small muted">{r.status === 'fixed' ? <><Icon name="ok" /> Fixed · </> : ''}{new Date(r.replied_at).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
        </li>
      ))}
    </ul>
    {older > 0 && (
      <button type="button" className="btn small replies-more" aria-expanded={all} onClick={() => (all ? setAll(false) : showOlder())}>
        <Icon name="down" className={all ? 'flip-up' : ''} /> {all ? 'Show fewer' : `Show ${older} older ${older === 1 ? 'reply' : 'replies'}`}
      </button>
    )}
    </>
  );
}
