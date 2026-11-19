// "Type the right form": an answer box with ä and ö keys (every keyboard has them, but they're slow to find on a
// phone). Enter checks. After checking: green if right; if not, the right answer and what kind of slip it was.
import { useEffect, useRef } from 'react';
import { Icon } from '../icons/Icon.jsx';
import { DIAGNOSIS_TEXT } from '../../engine/answers.js';

const LETTERS = ['ä', 'ö', 'Ä', 'Ö'];

export function TypedAnswer({ value, onChange, onSubmit, revealed, result, label = 'Your answer' }) {
  const ref = useRef(null);
  useEffect(() => { if (!revealed) ref.current?.focus({ preventScroll: true }); }, [revealed]);
  const insert = (ch) => {
    const el = ref.current;
    if (!el) return;
    const start = el.selectionStart ?? value.length;
    const end = el.selectionEnd ?? value.length;
    onChange(value.slice(0, start) + ch + value.slice(end));
    requestAnimationFrame(() => { el.focus(); el.setSelectionRange(start + 1, start + 1); });
  };
  const state = revealed ? (result?.right ? 'right' : 'wrong') : '';
  return (
    <div className={`typed ${state}`}>
      <label className="sr-only" htmlFor="typed-answer">{label}</label>
      <div className="typed-row">
        <input
          id="typed-answer" ref={ref} className="input typed-input" lang="fi" value={value} disabled={revealed}
          autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false} enterKeyHint="done"
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); if (value.trim()) onSubmit(); } }}
          placeholder="Type here"
        />
        {revealed && <Icon name={result?.right ? 'ok' : 'wrong'} className="typed-mark" label={result?.right ? 'Right' : 'Not quite'} />}
      </div>
      {!revealed && (
        <div className="typed-keys" role="group" aria-label="Finnish letters">
          {LETTERS.map((ch) => (
            <button key={ch} type="button" className="pg-key" onPointerDown={(e) => e.preventDefault()} onClick={() => insert(ch)} aria-label={`Type ${ch}`}>{ch}</button>
          ))}
        </div>
      )}
      {revealed && !result?.right && (
        <p className="typed-fix">
          <strong>Answer:</strong> <span className="answer-pill" lang="fi">{result?.expected}</span>
          {result?.diagnosis && <span className="typed-why"><Icon name="idea" /> {DIAGNOSIS_TEXT[result.diagnosis]}</span>}
        </p>
      )}
    </div>
  );
}
