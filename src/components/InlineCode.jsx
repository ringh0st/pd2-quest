// Inline code in prose and answer options: code font + Prism colors (light and dark palettes).
import { useMemo } from 'react';
import { highlight, toLines } from '../lib/prism.js';

/** Best guess at the language of a short fragment. */
function guessLang(text) {
  const t = text.trim();
  if (/^<\/?[\w:-]+[\s>/]/.test(t)) return 'markup';
  if (/^(SELECT|FIND)\b/i.test(t)) return 'sql';
  if (/^(sf|sfdx|npm|npx)\s/.test(t)) return 'bash';
  if (/\bthis\.|=>|\bconst\b|\blet\b|\bimport\b|\bexport\b|dispatchEvent/.test(t)) return 'javascript';
  return 'apex';
}

/** Long API names get soft break points (after . ( , and between camelCase words), never mid-word. */
function softBreaks(text, key) {
  return text.split(/(?<=[.(,])|(?<=[a-z])(?=[A-Z])/).flatMap((p, i) => (i ? [<wbr key={`${key}-${i}`} />, p] : [p]));
}

export function InlineCode({ text, block = false }) {
  const lines = useMemo(() => toLines(highlight(text, guessLang(text))), [text]);
  return (
    <code className={block ? 'inline-code hl opt-code' : 'inline-code hl'}>
      {lines.map((line, li) => (
        <span key={li}>
          {li > 0 && <br />}
          {line.map((t, k) => (t.classes.length
            ? <span key={k} className={t.classes.join(' ')}>{softBreaks(t.text, `${li}-${k}`)}</span>
            : softBreaks(t.text, `${li}-${k}`)))}
        </span>
      ))}
    </code>
  );
}
