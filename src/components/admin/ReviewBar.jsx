// After "Open the spot" in the Feedback inbox: the report stays on screen while you look at the spot, with
// Edit this (the right editor for the reported item) and Back to report. Admins only.
import { useState, useSyncExternalStore } from 'react';
import { reviewFocus, subscribeReview, setReviewFocus, editorFor } from '../../lib/reviewFocus.js';
import { useAuth } from '../../hooks/useAuth.js';
import { go } from '../../hooks/useRoute.js';
import { track } from '../../lib/track.js';
import { Icon } from '../icons/Icon.jsx';
import { EditSheet } from './EditSheet.jsx';
import { sfx } from '../../audio/sfx.js';

export function ReviewBar({ path, aboveNav }) {
  const report = useSyncExternalStore(subscribeReview, reviewFocus, reviewFocus);
  const { admin } = useAuth();
  const [editing, setEditing] = useState(false);
  if (!admin || !report || path.startsWith('/inbox')) return null;
  const editor = report.exam === track.id ? editorFor(report) : null;
  return (
    <aside className={`review-bar${aboveNav ? ' above-nav' : ''}`} aria-label="The report you’re reviewing">
      <div className="review-text">
        <span className="review-kicker"><Icon name="report" /> Report</span>
        <span className="review-message">{report.message || report.label}</span>
      </div>
      <div className="review-actions">
        {editor && <button type="button" className="btn small primary" onClick={() => { sfx.tap(); setEditing(true); }}><Icon name="pen" /> Edit this</button>}
        <button type="button" className="btn small" onClick={() => { sfx.tap(); go(`/inbox?open=${report.id}`); }}><Icon name="back" /> Back to report</button>
        <button type="button" className="icon-btn" onClick={() => setReviewFocus(null)} aria-label="Close the report bar"><Icon name="close" /></button>
      </div>
      {editor && <EditSheet open={editing} onClose={() => setEditing(false)} {...editor} />}
    </aside>
  );
}
