// Getting a code example ready for the playground (pure functions, no DOM, unit tested):
// which examples can run in a browser, the endless-loop guard, a small page for DOM examples,
// the sandboxed frame's document, and error messages in plain words.
import { installRuntime } from './runtime.js';

const RUNNABLE_LANGS = new Set(['js', 'javascript']);
// Node.js-only or module code can't run in a browser frame; decorators are Lightning Web Components syntax
const SERVER_ONLY = /\brequire\s*\(|^\s*import\s+[\w{*'"]|\bimport\s*\(|^\s*export\b|\bmodule\.exports\b|\bprocess\.(env|argv|exit|on|nextTick)\b|\b__dirname\b|\b__filename\b|\bBuffer\.|^\s*@\w+/m;
// "{ ... }" placeholders mark a fragment, not a program
const PLACEHOLDER = /(^|[\s{(,[])\.\.\.\s*($|[}\]),;])/m;

/** Whether this code needs top-level `await`, which only parses inside an async wrapper. */
export function needsAsyncWrap(code) {
  try { new Function(code); return false; } // parse only, never called
  catch (err) { return /await/.test(String(err?.message)) && parses(`(async () => {\n${code}\n})`); }
}

function parses(code) {
  try { new Function(code); return true; } catch { return false; }
}

/** Whether a "Try it" button makes sense: browser JavaScript that parses (as is, or with top-level await). */
export function canTryCode(code, lang) {
  if (!code || !RUNNABLE_LANGS.has(String(lang).toLowerCase())) return false;
  if (SERVER_ONLY.test(code) || PLACEHOLDER.test(code)) return false;
  return parses(code) || needsAsyncWrap(code);
}

/**
 * Adds `__lg();` at the start of every for / while / do loop body, so a loop that never ends is stopped
 * (the frame shares the app's thread, so it can't simply be killed). Strings, comments, template literals
 * and regular expressions are skipped. Text is only inserted, never a newline, so line numbers stay the same.
 */
export function guardLoops(code) {
  let out = '';
  let i = 0;
  const n = code.length;
  let prev = ''; // last significant character, to tell a regex from a division
  const skipQuoted = (from, q) => {
    let j = from + 1;
    while (j < n && code[j] !== q) { if (code[j] === '\\') j += 1; if (q !== '`' && code[j] === '\n') break; j += 1; }
    return j + 1;
  };
  const skipSpaceAndComments = (j) => {
    for (;;) {
      while (j < n && /\s/.test(code[j])) j += 1;
      if (code.startsWith('//', j)) { while (j < n && code[j] !== '\n') j += 1; continue; }
      if (code.startsWith('/*', j)) { const e = code.indexOf('*/', j + 2); j = e < 0 ? n : e + 2; continue; }
      return j;
    }
  };
  const matchParen = (j) => {
    let depth = 0;
    for (; j < n; j += 1) {
      const c = code[j];
      if (c === '"' || c === "'" || c === '`') { j = skipQuoted(j, c) - 1; continue; }
      if (c === '(') depth += 1;
      else if (c === ')') { depth -= 1; if (depth === 0) return j; }
    }
    return -1;
  };
  while (i < n) {
    const c = code[i];
    if (c === '"' || c === "'" || c === '`') { const e = skipQuoted(i, c); out += code.slice(i, e); i = e; prev = c; continue; }
    if (code.startsWith('//', i)) { const e = code.indexOf('\n', i); const end = e < 0 ? n : e; out += code.slice(i, end); i = end; continue; }
    if (code.startsWith('/*', i)) { const e = code.indexOf('*/', i + 2); const end = e < 0 ? n : e + 2; out += code.slice(i, end); i = end; continue; }
    if (c === '/' && (!prev || /[(,=:[!&|?{};+\-*%<>~^]/.test(prev))) {
      let j = i + 1;
      let inClass = false;
      while (j < n && code[j] !== '\n') {
        if (code[j] === '\\') j += 1;
        else if (code[j] === '[') inClass = true;
        else if (code[j] === ']') inClass = false;
        else if (code[j] === '/' && !inClass) break;
        j += 1;
      }
      out += code.slice(i, j + 1); i = j + 1; prev = '/';
      continue;
    }
    const word = /^[A-Za-z_$][\w$]*/.exec(code.slice(i, i + 40))?.[0];
    if (word) {
      const before = code[i - 1];
      const isKeyword = (word === 'for' || word === 'while' || word === 'do') && before !== '.' && !/[\w$]/.test(before || '');
      if (isKeyword) {
        let j = i + word.length;
        if (word === 'for') { const k = skipSpaceAndComments(j); if (code.startsWith('await', k)) j = k + 5; }
        if (word !== 'do') {
          const open = skipSpaceAndComments(j);
          if (code[open] === '(') {
            const close = matchParen(open);
            if (close > 0) {
              const body = skipSpaceAndComments(close + 1);
              if (code[body] === '{') {
                out += `${code.slice(i, body + 1)}__lg();`;
                i = body + 1; prev = '{';
                continue;
              }
            }
          }
        } else {
          const body = skipSpaceAndComments(j);
          if (code[body] === '{') { out += `${code.slice(i, body + 1)}__lg();`; i = body + 1; prev = '{'; continue; }
        }
      }
      out += word; i += word.length; prev = 'a';
      continue;
    }
    out += c;
    if (!/\s/.test(c)) prev = c;
    i += 1;
  }
  return out;
}

/** Whether the code works with the page (then the playground shows the page above the console). */
export function usesPage(code) {
  return /\bdocument\b|\.addEventListener\s*\(|\bquerySelector(All)?\b|\bgetElementById\b|\binnerHTML\b|\bclassList\b|\.closest\s*\(/.test(code);
}

const LIST_NAMES = /^(list|items|todo|todos|menu|ul|nav)$/i;
function elementFor(name, tag) {
  const label = name.replace(/[-_]/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^\w/, (m) => m.toUpperCase());
  const t = tag || (/btn|button/i.test(name) ? 'button'
    : /^(input|field|email|search|query|username|password|name|text)$/i.test(name) || /Input$/.test(name) ? 'input'
    : /form|signup|login/i.test(name) ? 'form'
    : LIST_NAMES.test(name) ? 'ul'
    : /link/i.test(name) ? 'a'
    : /title|heading/i.test(name) ? 'h2'
    : 'div');
  return { tag: t, label };
}
function render({ tag, label }, attrs, children = '') {
  if (tag === 'input') return `<input ${attrs} placeholder="${label}">`;
  if (tag === 'form') return `<form ${attrs}><input name="email" placeholder="Email"> <button>Sign up</button>${children}</form>`;
  if (tag === 'ul') return `<ul ${attrs}><li class="item">One</li><li class="item">Two</li><li class="item">Three</li>${children}</ul>`;
  if (tag === 'a') return `<a ${attrs} href="#">${label}</a>`;
  return `<${tag} ${attrs}>${tag === 'button' ? 'Click me' : label}${children}</${tag}>`;
}

/**
 * A small page for a DOM example: an element for every #id and .class it looks up, and for every variable it uses
 * as an element without creating it (browsers turn an element's id into a global variable, so `btn` just works).
 */
export function starterHtml(code) {
  if (!usesPage(code)) return '';
  const ids = new Map();
  const classes = new Set();
  const add = (name, tag) => { if (/^[A-Za-z][\w-]*$/.test(name) && !ids.has(name)) ids.set(name, tag); };
  for (const m of code.matchAll(/getElementById\(\s*['"`]([\w-]+)['"`]/g)) add(m[1]);
  for (const m of code.matchAll(/(?:querySelector(?:All)?|closest)\(\s*['"`]([^'"`]+)['"`]/g)) {
    for (const part of m[1].split(/[\s>+~,]+/)) {
      const tag = /^([a-z][a-z0-9]*)/.exec(part)?.[1];
      const id = /#([\w-]+)/.exec(part)?.[1];
      if (id) add(id, tag);
      for (const c of part.matchAll(/\.([\w-]+)/g)) classes.add(c[1]);
    }
  }
  const declared = new Set([...code.matchAll(/\b(?:const|let|var|function|class)\s+([A-Za-z_$][\w$]*)/g)].map((m) => m[1]));
  for (const m of code.matchAll(/(?<![.\w$])([A-Za-z_$][\w$]*)\.(?:addEventListener|removeEventListener|append|prepend|appendChild|closest|classList|textContent|innerHTML|innerText|querySelector|querySelectorAll|click|focus|style|dataset|setAttribute|getAttribute|remove|replaceChildren|value|disabled|hidden|children|parentElement)\b/g)) {
    const name = m[1];
    if (!declared.has(name) && !['document', 'window', 'event', 'e', 'this', 'el', 'element', 'node', 'target', 'console', 'Math', 'JSON', 'Object', 'Array', 'Promise'].includes(name)) add(name);
  }
  const parts = [];
  // outer/inner and parent/child nest, to show bubbling
  for (const [outer, inner] of [['outer', 'inner'], ['parent', 'child']]) {
    if (ids.has(outer) && ids.has(inner)) {
      parts.push(render(elementFor(outer, 'div'), `id="${outer}" class="box"`, render(elementFor(inner, ids.get(inner) || 'button'), `id="${inner}"`)));
      ids.delete(outer); ids.delete(inner);
    }
  }
  for (const [name, tag] of ids) parts.push(render(elementFor(name, tag), `id="${name}"`));
  const hasList = parts.some((p) => p.startsWith('<ul'));
  for (const c of classes) if (!(c === 'item' && hasList)) parts.push(`<div class="${c}">${elementFor(c).label}</div>`);
  return parts.join('\n');
}

const FRAME_STYLE = 'body{font:16px/1.5 system-ui,sans-serif;margin:12px;color:#1d1a16;background:#fff}button,input{font:inherit;padding:6px 12px;margin:4px 4px 4px 0}.box{padding:12px;border:2px dashed #b9b0a3;border-radius:10px}li{margin:2px 0}';

/**
 * The sandboxed frame's whole document. `offset` is how many lines come before the learner's first line, to turn
 * the browser's line numbers back into the editor's.
 */
export function buildFrame({ code, html = '', token }) {
  const runtime = `(${installRuntime.toString()})(window, function (m) { parent.postMessage(Object.assign({ pg: ${JSON.stringify(token)} }, m), '*'); });`;
  const safe = (s) => s.replace(/<\/(script)/gi, '<\\/$1');
  const wrap = needsAsyncWrap(code);
  const head = `<!doctype html><html><head><meta charset="utf-8"><style>${FRAME_STYLE}</style><script>${safe(runtime)}</script></head><body>\n${html}\n<script>${wrap ? '(async () => {' : ''}\n`;
  const userCode = safe(guardLoops(code));
  const tail = wrap
    ? '\n})().catch(__report).finally(__done);\n</script></body></html>'
    : '\n</script>\n<script>__done();</script></body></html>';
  return { srcdoc: head + userCode + tail, offset: head.split('\n').length - 1 };
}

/** The editor line an error points to: from the browser's line number, or else from the stack. */
export function errorLine({ line, stack }, offset) {
  let n = Number(line) || 0;
  if (!n && stack) {
    const m = /about:srcdoc:(\d+):\d+/.exec(stack);
    if (m) n = Number(m[1]);
  }
  const editorLine = n - offset;
  return editorLine >= 1 ? editorLine : null;
}

/** One plain sentence about a common error, for beginners (null when there's nothing useful to add). */
export function explainError(name, message = '') {
  let m;
  if (message === '__PLAYGROUND_LOOP__') return 'A loop kept going for over 2 seconds, so it was stopped. Check that its condition eventually becomes false.';
  if ((m = /^(\S+) is not defined$/.exec(message))) return `Nothing called ${m[1]} exists here. Check the spelling, or create it first with let or const. Lesson examples are sometimes short pieces that assume it already exists.`;
  if ((m = /Cannot access '(.+)' before initialization/.exec(message))) return `${m[1]} is used before its let or const line has run (the "temporal dead zone"). Move the line that uses it lower.`;
  if (/Assignment to constant variable/.test(message)) return 'A const can’t be given a new value. Use let if it needs to change.';
  if ((m = /Cannot read propert(?:y|ies) of (undefined|null)(?: \(reading '(.+)'\))?/.exec(message))) return `You asked for ${m[2] ? `.${m[2]}` : 'a property'} on something that is ${m[1]}. Check what the value before the dot really is.`;
  if ((m = /Cannot set propert(?:y|ies) of (undefined|null)/.exec(message))) return `You tried to set a property on something that is ${m[1]}.`;
  if ((m = /(\S+) is not a function/.exec(message))) return `${m[1]} isn’t a function, so it can’t be called with ( ). Check its spelling and what it holds.`;
  if (/is not iterable/.test(message)) return 'This value can’t be looped over or spread. for…of and ... need an array, string, Map, Set or another iterable.';
  if (/has already been declared/.test(message)) return 'The same name is declared twice with let, const or class. Give one of them another name, or reuse the first one.';
  if (/Maximum call stack size exceeded|too much recursion/.test(message)) return 'A function kept calling itself and never stopped. Check the case that should end the recursion.';
  if (/Unexpected end of input/.test(message)) return 'The code ends too early: a { ( [ or quote is probably missing its closing partner.';
  if (name === 'SyntaxError') return 'This isn’t valid JavaScript yet. Check brackets, quotes and commas near this line.';
  return null;
}
