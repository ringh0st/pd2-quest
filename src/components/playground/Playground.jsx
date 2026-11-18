// Edit JavaScript and run it: editor, symbol keys, Run/Stop and Reset, a page preview for DOM code, and the console.
// Edits are kept while the app is open (and on this device when `saveAs` is given), so closing never loses work.
import { useId, useRef, useState } from 'react';
import { CodeEditor } from './CodeEditor.jsx';
import { KeyRow } from './KeyRow.jsx';
import { ConsoleOutput } from './ConsoleOutput.jsx';
import { Icon } from '../icons/Icon.jsx';
import { useCodeRunner } from '../../hooks/useCodeRunner.js';
import { starterHtml, usesPage } from '../../lib/playground/prepare.js';
import { sfx } from '../../audio/sfx.js';

const edits = new Map(); // this session's edits, by starting code
const SAVE_PREFIX = 'devquest.playground.';

function load(initial, saveAs) {
  if (edits.has(initial)) return edits.get(initial);
  if (saveAs) { try { const v = localStorage.getItem(SAVE_PREFIX + saveAs); if (v != null) return JSON.parse(v); } catch { /* storage off */ } }
  return { code: initial, html: starterHtml(initial) };
}

export function Playground({ initialCode, saveAs, label = 'JavaScript code' }) {
  const [state, setState] = useState(() => load(initialCode, saveAs));
  const [pageShown, setPageShown] = useState(false);
  const editorRef = useRef(null);
  const hostRef = useRef(null);
  const hintId = useId();
  const { status, lines, start, stop, reset } = useCodeRunner(hostRef);
  const { code, html } = state;
  const page = usesPage(code) || html.trim() !== '';
  const changed = code !== initialCode || html !== starterHtml(initialCode);

  const update = (next) => {
    const value = { ...state, ...next };
    setState(value);
    edits.set(initialCode, value);
    if (saveAs) { try { localStorage.setItem(SAVE_PREFIX + saveAs, JSON.stringify(value)); } catch { /* storage off */ } }
  };
  const run = () => {
    sfx.tap();
    const pageHtml = html.trim() ? html : starterHtml(code);
    if (pageHtml !== html) update({ html: pageHtml });
    setPageShown(page);
    start({ code, html: pageHtml, showPage: page });
  };
  const resetCode = () => {
    sfx.select();
    update({ code: initialCode, html: starterHtml(initialCode) });
    edits.delete(initialCode);
    setPageShown(false);
    reset();
  };
  const goToLine = (n) => {
    const ta = editorRef.current;
    if (!ta) return;
    const all = ta.value.split('\n');
    const from = all.slice(0, n - 1).reduce((sum, l) => sum + l.length + 1, 0);
    ta.focus();
    ta.setSelectionRange(from, from + (all[n - 1]?.length ?? 0));
  };

  return (
    <div className="pg">
      <p id={hintId} className="small muted pg-hint">
        Change anything, then Run. It runs only here and can’t affect the app or your progress.
        <span className="pg-desk-hint"> Ctrl+Enter runs. Tab indents (press Esc, then Tab, to move on).</span>
      </p>
      <CodeEditor ref={editorRef} value={code} onChange={(v) => update({ code: v })} onRun={run} label={label} describedBy={hintId} />
      <KeyRow editorRef={editorRef} />
      <div className="pg-actions">
        {status === 'running'
          ? <button type="button" className="btn pg-run" onClick={() => { sfx.select(); stop(); }}><Icon name="stop" /> Stop</button>
          : <button type="button" className="btn primary pg-run" onClick={run} data-autofocus><Icon name="play" /> Run</button>}
        <button type="button" className="btn" onClick={resetCode} disabled={!changed}><Icon name="retry" /> Reset</button>
      </div>
      {page && (
        <details className="pg-html disclosure">
          <summary>
            <span className="grow">Page HTML <span className="small muted">(the elements the code works with)</span></span>
            <Icon name="down" className="disclosure-chev" />
          </summary>
          <CodeEditor value={html} onChange={(v) => update({ html: v })} onRun={run} lang="html" label="Page HTML" />
        </details>
      )}
      <div className={pageShown ? 'pg-page' : 'pg-page pg-page-off'}>
        {pageShown && <span className="pg-page-label">Page <span className="small muted">(you can click it)</span></span>}
        <div ref={hostRef} className="pg-host" />
      </div>
      <ConsoleOutput status={status} lines={lines} onLine={goToLine} />
    </div>
  );
}
