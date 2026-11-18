// Admin: edit the text of a lesson card, a key-term meaning, a question (with its answers and explanation) or a
// flashcard. Saved to the server, so everyone sees it the next time the app opens; "Undo my edit" brings the
// built-in text back. Text uses the same marks as the content: `code` in backticks, **bold** in double stars.
import { useId, useState } from 'react';
import { Sheet } from '../Sheet.jsx';
import { Icon } from '../icons/Icon.jsx';
import { useFeedback } from '../Feedback.jsx';
import { editFields, saveEdit, resetEdit } from '../../lib/contentEdits.js';
import { sfx } from '../../audio/sfx.js';

const TITLES = { card: 'Edit lesson card', term: 'Edit key-term meaning', question: 'Edit question', flashcard: 'Edit flashcard' };
const LETTERS = 'ABCDEF';

function Field({ label, value, onChange, rows = 3, code = false, hint }) {
  const id = useId();
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {hint && <span className="small muted">{hint}</span>}
      <textarea id={id} className={`input edit-input${code ? ' edit-code' : ''}`} rows={rows} value={value ?? ''} onChange={(e) => onChange(e.target.value)} spellCheck={!code} />
    </div>
  );
}

function Form({ kind, id, card, onDone }) {
  const info = editFields(kind, id, card);
  const [v, setV] = useState(() => structuredClone(info?.now ?? {}));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const { showToast } = useFeedback();
  if (!info) return <p className="muted">This item isn’t in the current exam.</p>;
  const o = info.original;
  const set = (k) => (val) => setV((x) => ({ ...x, [k]: val }));
  const setAt = (k, i) => (val) => setV((x) => { const a = [...(x[k] ?? [])]; a[i] = val; return { ...x, [k]: a }; });
  const toggleAnswer = (i) => setV((x) => {
    const a = new Set(x.answer ?? []);
    if (a.has(i)) a.delete(i); else a.add(i);
    return { ...x, answer: [...a].sort((p, q) => p - q) };
  });

  const save = async () => {
    setBusy(true); setError('');
    try {
      const patch = Object.fromEntries(Object.entries(v).filter(([k, val]) => JSON.stringify(val) !== JSON.stringify(o[k]) && val !== undefined));
      if (!Object.keys(patch).length && !info.edited) { onDone(); return; }
      if (!Object.keys(patch).length) await resetEdit(kind, id, card);
      else await saveEdit(kind, id, card, patch);
      sfx.done(); showToast('Saved. Everyone sees it the next time they open the app.', 'check');
      onDone();
    } catch (e) { setError(e?.message || 'Couldn’t save. Check the connection.'); setBusy(false); }
  };
  const undo = async () => {
    setBusy(true); setError('');
    try { await resetEdit(kind, id, card); sfx.done(); showToast('Back to the built-in text', 'check'); onDone(); }
    catch (e) { setError(e?.message || 'Couldn’t undo. Check the connection.'); setBusy(false); }
  };

  return (
    <div className="stack edit-form">
      <p className="small muted">Use `backticks` for code and **double stars** for bold. Saved edits reach everyone the next time the app opens.</p>
      {kind === 'card' && (<>
        {(o.title !== undefined || v.title) && <Field label="Title" value={v.title} onChange={set('title')} rows={1} />}
        {(o.body !== undefined || v.body) && <Field label="Text" value={v.body} onChange={set('body')} rows={5} />}
        {Array.isArray(o.items) && o.items.map((_, i) => <Field key={i} label={`Point ${i + 1}`} value={v.items?.[i]} onChange={setAt('items', i)} rows={2} />)}
        {o.code !== undefined && <Field label="Code" value={v.code} onChange={set('code')} rows={6} code />}
      </>)}
      {kind === 'term' && <Field label="What it means" value={v.say} onChange={set('say')} rows={4} />}
      {kind === 'flashcard' && (<>
        <Field label="Front (question)" value={v.front} onChange={set('front')} rows={3} />
        <Field label="Back (answer)" value={v.back} onChange={set('back')} rows={5} />
      </>)}
      {kind === 'question' && (<>
        <Field label="Question" value={v.q} onChange={set('q')} rows={4} />
        {o.code !== undefined && <Field label="Code" value={v.code} onChange={set('code')} rows={6} code />}
        <fieldset className="edit-options">
          <legend>Answers <span className="small muted">(tick the correct one{(v.answer?.length ?? 0) > 1 ? 's' : ''})</span></legend>
          {(o.options ?? []).map((_, i) => (
            <div key={i} className="edit-option">
              <label className="edit-correct">
                <input type="checkbox" checked={v.answer?.includes(i) ?? false} onChange={() => toggleAnswer(i)} />
                <span>{LETTERS[i]}{v.answer?.includes(i) ? ' · correct' : ''}</span>
              </label>
              <textarea className="input edit-input" rows={2} aria-label={`Answer ${LETTERS[i]}`} value={v.options?.[i] ?? ''} onChange={(e) => setAt('options', i)(e.target.value)} />
              {!v.answer?.includes(i) && (
                <textarea className="input edit-input edit-why" rows={2} aria-label={`Why ${LETTERS[i]} is wrong`} placeholder="Why it’s wrong (optional)" value={v.wrong?.[i] ?? ''} onChange={(e) => setAt('wrong', i)(e.target.value)} />
              )}
            </div>
          ))}
        </fieldset>
        <Field label="Explanation (why the answer is right)" value={v.explain} onChange={set('explain')} rows={4} />
      </>)}
      {error && <p className="small account-error" role="alert"><Icon name="warn" /> {error}</p>}
      <div className="edit-actions">
        <button type="button" className="btn primary" onClick={save} disabled={busy}><Icon name="check" /> Save</button>
        {info.edited && <button type="button" className="btn" onClick={undo} disabled={busy}><Icon name="retry" /> Undo my edit</button>}
      </div>
    </div>
  );
}

export function EditSheet({ open, onClose, kind, id, card = -1 }) {
  const titleId = useId();
  return (
    <Sheet open={open} onClose={onClose} labelledBy={titleId}>
      <div className="spread">
        <h2 id={titleId} className="pq-head"><span className="pq-tile s"><Icon name="pen" /></span><span>{TITLES[kind] ?? 'Edit'}</span></h2>
        <button type="button" className="icon-btn" onClick={onClose} aria-label="Close"><Icon name="close" /></button>
      </div>
      {open && <Form kind={kind} id={id} card={card} onDone={onClose} />}
    </Sheet>
  );
}
