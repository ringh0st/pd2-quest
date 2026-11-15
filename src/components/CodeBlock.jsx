// Code, highlighted by Prism, with a language label, line numbers and Copy. Wide code scrolls inside
// its own box (with edge shadows); a Wrap toggle appears only when lines are cut off.
import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { highlight, toLines, LANG_LABEL } from '../lib/prism.js';
import { Icon } from './icons/Icon.jsx';
import { useFeedback } from './Feedback.jsx';

export function CodeBlock({ code = '', lang = 'apex' }) {
  const lines = useMemo(() => toLines(highlight(code.replace(/\s+$/, ''), lang)), [code, lang]);
  const ref = useRef(null);
  const [wide, setWide] = useState(false);
  const [wrap, setWrap] = useState(false);
  const { showToast } = useFeedback();
  const label = LANG_LABEL[lang] ?? lang;

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const measure = () => setWide(el.scrollWidth > el.clientWidth + 2);
    measure();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null;
    ro?.observe(el);
    return () => ro?.disconnect();
  }, [code]);

  const copy = async () => {
    try { await navigator.clipboard.writeText(code); showToast('Code copied', 'check'); } catch { showToast('Copy not available here'); }
  };

  return (
    <div className="code-wrap">
      <div className="code-panel">
        <div className="code-head">
          <span className="code-lang">{label}</span>
          <span className="code-actions">
            {(wide || wrap) && (
              <button type="button" className="code-btn" aria-pressed={wrap} onClick={() => setWrap((w) => !w)}>
                <Icon name={wrap ? 'scroll' : 'wrap'} />{wrap ? 'Scroll' : 'Wrap'}
              </button>
            )}
            <button type="button" className="code-btn" onClick={copy} aria-label={`Copy ${label} code`}><Icon name="copy" />Copy</button>
          </span>
        </div>
        <pre ref={ref} className={`code prism${wrap ? ' wrap-lines' : ''}`} tabIndex={0} aria-label={`${label} code`}>
          <code>
            {lines.map((line, i) => (
              <span key={i} className="code-line">
                <span className="code-ln" aria-hidden="true">{i + 1}</span>
                <span className="code-text">
                  {line.length ? line.map((t, k) => (t.classes.length ? <span key={k} className={t.classes.join(' ')}>{t.text}</span> : t.text)) : ' '}
                </span>
              </span>
            ))}
          </code>
        </pre>
      </div>
    </div>
  );
}
