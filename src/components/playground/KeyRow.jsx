// Symbols that are slow to find on a phone keyboard, one tap each. Buttons don't take focus,
// so the keyboard stays open and the text goes where the cursor is.
import { insertAt } from './CodeEditor.jsx';

const KEYS = [
  ['{', '{'], ['}', '}'], ['(', '('], [')', ')'], ['[', '['], [']', ']'], [';', ';'], ['=', '='],
  ["'", "'"], ['"', '"'], ['`', '`'], ['=>', ' => '], ['.', '.'], ['⇥', '  ', 'indent'], ['log', 'console.log()', 'console.log()'],
];

export function KeyRow({ editorRef }) {
  const type = (text) => {
    const ta = editorRef.current;
    if (!ta) return;
    insertAt(ta, text);
    // inside console.log( … )
    if (text.endsWith('()')) { const p = ta.selectionStart - 1; ta.setSelectionRange(p, p); }
  };
  return (
    <div className="pg-keys" role="toolbar" aria-label="Type a symbol">
      {KEYS.map(([face, text, name]) => (
        <button
          key={face} type="button" className="pg-key"
          onPointerDown={(e) => e.preventDefault()}
          onClick={() => type(text)}
          aria-label={`Type ${name || face}`}
        >{face}</button>
      ))}
    </div>
  );
}
