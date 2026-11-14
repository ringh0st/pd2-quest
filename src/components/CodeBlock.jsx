import { tokenize } from '../lib/highlight.js';

export function CodeBlock({ code, lang = 'apex' }) {
  const tokens = tokenize(code || '');
  return (
    <pre className="code" tabIndex={0} aria-label={`${lang} code`}>
      <code>
        {tokens.map((tk, i) => (tk.t === 'plain' || tk.t === 'space' || tk.t === 'punct' || tk.t === 'other'
          ? tk.v
          : <span key={i} className={`tk-${tk.t}`}>{tk.v}</span>))}
      </code>
    </pre>
  );
}
