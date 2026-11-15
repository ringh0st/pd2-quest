// Code highlighting with Prism (MIT): real grammars for Apex, SOQL, JavaScript, HTML/XML and shell.
// Only the languages this app uses are bundled. Tokens are rendered as React elements (no innerHTML).
import Prism from 'prismjs/components/prism-core.js';
import 'prismjs/components/prism-clike.js';
import 'prismjs/components/prism-sql.js';
import 'prismjs/components/prism-apex.js';
import 'prismjs/components/prism-javascript.js';
import 'prismjs/components/prism-markup.js';
import 'prismjs/components/prism-bash.js';

const ALIAS = { apex: 'apex', soql: 'sql', sosl: 'sql', sql: 'sql', js: 'javascript', javascript: 'javascript', html: 'markup', xml: 'markup', markup: 'markup', bash: 'bash', sh: 'bash', shell: 'bash' };
export const LANG_LABEL = { apex: 'Apex', soql: 'SOQL', sosl: 'SOSL', sql: 'SQL', js: 'JavaScript', javascript: 'JavaScript', html: 'HTML', xml: 'XML', markup: 'HTML', bash: 'Terminal', sh: 'Terminal', text: 'Text' };

/** Prism token stream for `code` in `lang` (plain strings when the language is unknown). */
export function highlight(code, lang = 'apex') {
  const grammar = Prism.languages[ALIAS[lang] ?? lang];
  return grammar ? Prism.tokenize(code, grammar) : [code];
}

/** Split a token stream into lines, keeping each token's classes (so line numbers can be drawn). */
export function toLines(tokens) {
  const lines = [[]];
  const walk = (tk, classes) => {
    if (typeof tk === 'string') {
      tk.split('\n').forEach((part, i) => {
        if (i) lines.push([]);
        if (part) lines[lines.length - 1].push({ text: part, classes });
      });
      return;
    }
    const cls = [...classes, 'token', tk.type, ...[].concat(tk.alias ?? [])];
    [].concat(tk.content).forEach((c) => walk(c, cls));
  };
  tokens.forEach((t) => walk(t, []));
  return lines;
}
