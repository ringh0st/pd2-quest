// Code highlighting with Prism (MIT): real grammars for Apex, SOQL, JavaScript, HTML/XML and shell, plus a small
// grammar for Salesforce formulas (formula fields, validation rules, flow formulas).
// Only the languages this app uses are bundled. Tokens are rendered as React elements (no innerHTML).
import Prism from 'prismjs/components/prism-core.js';
import 'prismjs/components/prism-clike.js';
import 'prismjs/components/prism-sql.js';
import 'prismjs/components/prism-apex.js';
import 'prismjs/components/prism-javascript.js';
import 'prismjs/components/prism-markup.js';
import 'prismjs/components/prism-bash.js';

// Salesforce formulas: FUNCTION( calls, `Field__c` / `Account.Name` / `$User.Id` references, "text" literals.
Prism.languages.formula = {
  comment: /\/\*[\s\S]*?\*\//,
  string: /"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'/,
  function: /\b[A-Z][A-Z0-9_]*(?=\s*\()/,
  variable: /\$?[A-Za-z_]\w*(?:\.[A-Za-z_]\w*)+|\$[A-Za-z_]\w*|\b\w+__[crx]\b/,
  boolean: /\b(?:TRUE|FALSE|NULL)\b/i,
  number: /\b\d+(?:\.\d+)?\b/,
  operator: /&&|\|\||<>|!=|<=|>=|[-+*\/^&=<>!]/,
  punctuation: /[(),]/,
};

const ALIAS = { formula: 'formula', apex: 'apex', soql: 'sql', sosl: 'sql', sql: 'sql', js: 'javascript', javascript: 'javascript', html: 'markup', xml: 'markup', markup: 'markup', bash: 'bash', sh: 'bash', shell: 'bash' };
export const LANG_LABEL = { apex: 'Apex', soql: 'SOQL', sosl: 'SOSL', sql: 'SQL', js: 'JavaScript', javascript: 'JavaScript', html: 'HTML', xml: 'XML', markup: 'HTML', bash: 'Terminal', sh: 'Terminal', text: 'Text', formula: 'Formula' };

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
