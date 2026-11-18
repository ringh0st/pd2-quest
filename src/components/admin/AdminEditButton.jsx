// A pencil next to "Report a problem", shown only to admins: opens the Edit sheet for this item.
import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth.js';
import { Icon } from '../icons/Icon.jsx';
import { EditSheet } from './EditSheet.jsx';
import { sfx } from '../../audio/sfx.js';

const NAMES = { card: 'this card', term: 'this meaning', question: 'this question', flashcard: 'this flashcard' };

export function AdminEditButton({ kind, id, card = -1 }) {
  const { admin } = useAuth();
  const [open, setOpen] = useState(false);
  if (!admin) return null;
  return (
    <>
      <button type="button" className="icon-btn admin-edit-btn" onClick={() => { sfx.tap(); setOpen(true); }} aria-label={`Edit ${NAMES[kind] ?? 'this'} (admin)`} title="Edit (admin)">
        <Icon name="pen" />
      </button>
      <EditSheet open={open} onClose={() => setOpen(false)} kind={kind} id={id} card={card} />
    </>
  );
}
