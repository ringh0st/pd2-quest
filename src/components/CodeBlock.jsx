// Highlighted code. Wide code scrolls inside its own box (with edge shadows); a Wrap toggle
// appears only when lines are cut off, so phones can show everything without sideways scrolling.
import { useLayoutEffect, useRef, useState } from 'react';
import { tokenize } from '../lib/highlight.js';

export function CodeBlock({ code, lang = 'apex' }) {
  const tokens = tokenize(code || '');
  const ref = useRef(null);
  const [wide, setWide] = useState(false);
  const [wrap, setWrap] = useState(false);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setWide(el.scrollWidth > el.clientWidth + 2);
    measure();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null;
    ro?.observe(el);
    return () => ro?.disconnect();
  }, [code]);

  return (
    <div className="code-wrap">
      <pre ref={ref} className={wrap ? 'code wrap-lines' : 'code'} tabIndex={0} aria-label={`${lang} code`}>
        <code>
          {tokens.map((tk, i) => (tk.t === 'plain' || tk.t === 'space' || tk.t === 'punct' || tk.t === 'other'
            ? tk.v
            : <span key={i} className={`tk-${tk.t}`}>{tk.v}</span>))}
        </code>
      </pre>
      {(wide || wrap) && (
        <button type="button" className="code-toggle" aria-pressed={wrap} onClick={() => setWrap((w) => !w)}>
          {wrap ? '↔ Scroll lines' : '↩ Wrap lines'}
        </button>
      )}
    </div>
  );
}
