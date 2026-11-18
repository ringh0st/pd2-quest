// A light code editor: a real <textarea> (typing, selection, undo, screen readers, phone keyboards all native)
// over the same text drawn with syntax colors. Both wrap identically, so they always line up.
// Tab indents; Escape first, then Tab, moves on (said in the hint). Enter keeps the indent. Ctrl/Cmd+Enter runs.
import { forwardRef, useMemo, useState } from 'react';
import { highlight, toLines } from '../../lib/prism.js';

const INDENT = '  ';

/** Types `text` at the cursor as if typed (keeps the browser's undo history where it can). */
export function insertAt(textarea, text) {
  textarea.focus();
  const ok = typeof document.execCommand === 'function' && document.execCommand('insertText', false, text);
  if (!ok) {
    textarea.setRangeText(text, textarea.selectionStart, textarea.selectionEnd, 'end');
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
  }
}

export const CodeEditor = forwardRef(function CodeEditor({ value, onChange, onRun, lang = 'js', label, describedBy }, ref) {
  const [tabMovesFocus, setTabMovesFocus] = useState(false);
  const lines = useMemo(() => toLines(highlight(value, lang)), [value, lang]);

  const onKeyDown = (e) => {
    const ta = e.currentTarget;
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); onRun?.(); return; }
    if (e.key === 'Escape') { if (!tabMovesFocus) { e.stopPropagation(); setTabMovesFocus(true); } return; }
    if (e.key === 'Tab' && !tabMovesFocus && !e.altKey && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      const { selectionStart: a, value: v } = ta;
      const lineStart = v.lastIndexOf('\n', a - 1) + 1;
      if (e.shiftKey) {
        const n = v.startsWith(INDENT, lineStart) ? INDENT.length : v[lineStart] === ' ' ? 1 : 0;
        if (n) { ta.setSelectionRange(lineStart, lineStart + n); insertAt(ta, ''); ta.setSelectionRange(Math.max(lineStart, a - n), Math.max(lineStart, a - n)); }
      } else insertAt(ta, INDENT);
      return;
    }
    if (e.key === 'Enter' && !e.shiftKey && !e.altKey) {
      e.preventDefault();
      const { selectionStart: a, value: v } = ta;
      const line = v.slice(v.lastIndexOf('\n', a - 1) + 1, a);
      const indent = /^\s*/.exec(line)[0];
      const opens = /[{([]\s*$/.test(line);
      const closes = /^\s*[})\]]/.test(v.slice(a, v.indexOf('\n', a) < 0 ? v.length : v.indexOf('\n', a)));
      if (opens && closes) {
        insertAt(ta, `\n${indent}${INDENT}\n${indent}`);
        const pos = a + 1 + indent.length + INDENT.length;
        ta.setSelectionRange(pos, pos);
      } else insertAt(ta, `\n${indent}${opens ? INDENT : ''}`);
      return;
    }
    if (tabMovesFocus && e.key !== 'Tab' && e.key !== 'Shift') setTabMovesFocus(false);
  };

  return (
    <div className="pg-editor">
      <pre className="code prism pg-editor-colors" aria-hidden="true">
        <code>
          {lines.map((line, i) => (
            <span key={i} className="pg-editor-line">
              {line.length ? line.map((t, k) => (t.classes.length ? <span key={k} className={t.classes.join(' ')}>{t.text}</span> : t.text)) : ' '}
              {'\n'}
            </span>
          ))}
        </code>
      </pre>
      <textarea
        ref={ref}
        className="pg-editor-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        onFocus={() => setTabMovesFocus(false)}
        spellCheck={false} autoCapitalize="off" autoComplete="off" autoCorrect="off"
        aria-label={label}
        aria-describedby={describedBy}
        data-keeps-escape={tabMovesFocus ? undefined : ''}
      />
    </div>
  );
});
