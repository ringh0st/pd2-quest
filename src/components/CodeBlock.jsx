// Code, highlighted by Prism, with a language label, line numbers and Copy. Long lines wrap by default;
// the Wrap/Scroll button switches every code block in the app (remembered in Settings).
// Browser JavaScript also gets "Try it", which opens it in the playground (`tryable={false}` hides it, e.g. before
// a question is answered, so running it can't give the answer away).
import { useMemo, useState } from 'react';
import { canTryCode } from '../lib/playground/prepare.js';
import { PlaygroundSheet } from './playground/PlaygroundSheet.jsx';
import { highlight, toLines, LANG_LABEL } from '../lib/prism.js';
import { Icon } from './icons/Icon.jsx';
import { useFeedback } from './Feedback.jsx';
import { useStore, updateSettings } from '../state/store.js';
import { sfx } from '../audio/sfx.js';
import { haptic } from '../audio/haptics.js';

export function CodeBlock({ code = '', lang = 'apex', tryable = true }) {
  const lines = useMemo(() => toLines(highlight(code.replace(/\s+$/, ''), lang)), [code, lang]);
  const wrap = useStore((st) => st.settings.codeWrap !== false);
  const setWrap = (on) => updateSettings({ codeWrap: on });
  const { showToast } = useFeedback();
  const label = LANG_LABEL[lang] ?? lang;
  const runnable = useMemo(() => canTryCode(code, lang), [code, lang]);
  const [trying, setTrying] = useState(false);

  const copy = async () => {
    try { await navigator.clipboard.writeText(code); sfx.copy(); haptic('light'); showToast('Code copied', 'check'); } catch { showToast('Copy not available here'); }
  };

  return (
    <div className="code-wrap">
      <div className="code-panel">
        <div className="code-head">
          <span className="code-lang">{label}</span>
          <span className="code-actions">
            <button
              type="button" className="code-btn" onClick={() => { sfx.select(); setWrap(!wrap); }}
              aria-label={wrap ? 'Turn off line wrapping (scroll long lines sideways)' : 'Wrap long lines'}
            >
              <Icon name={wrap ? 'scroll' : 'wrap'} /><span className="code-btn-label">{wrap ? 'Scroll' : 'Wrap'}</span>
            </button>
            <button type="button" className="code-btn" onClick={copy} aria-label={`Copy ${label} code`}><Icon name="copy" /><span className="code-btn-label">Copy</span></button>
            {runnable && tryable && (
              <button type="button" className="code-btn code-try" onClick={() => { sfx.select(); setTrying(true); }} aria-label="Try this code: edit and run it">
                <Icon name="play" />Try it
              </button>
            )}
          </span>
        </div>
        <pre className={`code prism${wrap ? ' wrap-lines' : ''}`} tabIndex={0} aria-label={`${label} code`}>
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
      {runnable && <PlaygroundSheet open={trying} onClose={() => setTrying(false)} code={code} />}
    </div>
  );
}
