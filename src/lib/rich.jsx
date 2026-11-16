import { InlineCode } from '../components/InlineCode.jsx';
// Renders short text with **bold** and `code` marks. Keeps content safe (no HTML injection).
// With `autoCode`, Apex-looking tokens (method calls, __c fields, @annotations, Dotted.Names)
// are set in the code font too, so they are easy to tell apart and never break mid-word.

const CODE_TOKEN = new RegExp(
  [
    String.raw`(?<![\w$])@[A-Za-z]\w*(?:\([^()]*\))?`, // @isTest, @AuraEnabled(cacheable=true)
    String.raw`\b[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)*\([^()]*\);?`, // Database.insert(x, false);
    String.raw`\b\w+__(?:c|r|e|mdt|x|b)\b(?:\.\w+)*`, // Max_Discount__c.Field
    String.raw`\b[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)+\b`, // Trigger.new, AccessLevel.USER_MODE
  ].join('|'),
  'g',
);

function isCodeToken(t) {
  if (t.startsWith('@') || t.includes('(') || t.includes('__')) return true;
  // dotted names: needs a capital or underscore, so "e.g" or "i.e" stay prose
  return /[A-Z_]/.test(t) && t.length > 3;
}

function autoMark(text, keyBase) {
  const out = [];
  let last = 0;
  for (const m of text.matchAll(CODE_TOKEN)) {
    if (!isCodeToken(m[0])) continue;
    if (m.index > last) out.push(text.slice(last, m.index));
    out.push(<InlineCode key={`${keyBase}-${m.index}`} text={m[0]} />);
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

/** The text is exactly one `code` span (e.g. an answer option that is a line of code). */
export function singleCodeSpan(text = '') {
  const m = /^\s*`([^`]+)`\s*$/.exec(String(text));
  return m ? m[1] : null;
}

/** True when the whole text is code (a class or method body), not prose with a token in it. */
export function isCodeOnly(text = '') {
  return !String(text).includes('`') && /[{};]\s*$|^\s*(public|private|global|static|@\w+|<\w)/.test(String(text)) && /[{}]/.test(String(text));
}

/**
 * `glossary` (optional): { matcher, claims, owner, active, onTerm } from a lesson's key terms.
 * A term becomes a tap target only in the text that first mentions it on the card (`claims`, from
 * `firstMentions`), and only its first mention there.
 */
export function Rich({ text = '', autoCode = false, glossary: g }) {
  const glossary = g && { ...g, used: new Set([...g.claims].filter(([, o]) => o !== g.owner).map(([k]) => k)) };
  const parts = String(text).split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((p, i) => {
    if (p.startsWith('**') && p.endsWith('**')) {
      const inner = p.slice(2, -2);
      return <strong key={i}>{glossary ? linkTerms(inner, glossary, i) : inner}</strong>;
    }
    if (p.startsWith('`') && p.endsWith('`')) {
      const code = <InlineCode key={i} text={p.slice(1, -1)} />;
      return glossary ? wrapWhole(p.slice(1, -1), code, glossary, i) : code;
    }
    if (glossary) return linkTerms(p, glossary, i);
    return autoCode ? autoMark(p, i) : p;
  });
}

function TermButton({ k, glossary, children }) {
  const on = glossary.active === k;
  return (
    <button
      type="button" className={`term${on ? ' on' : ''}`} aria-expanded={on} aria-controls="term-panel"
      onClick={(e) => { e.stopPropagation(); glossary.onTerm(on ? null : k); }}
    >{children}</button>
  );
}

/** A whole code span that is itself a term (e.g. `stripInaccessible`). */
function wrapWhole(text, node, glossary, keyBase) {
  const k = glossary.matcher.indexOf(text);
  if (k === undefined || glossary.used.has(k)) return node;
  glossary.used.add(k);
  return <TermButton key={`t${keyBase}`} k={k} glossary={glossary}>{node}</TermButton>;
}

/** Plain text: the first mention of each term on the card becomes a tap target. */
function linkTerms(text, glossary, keyBase) {
  const out = [];
  let last = 0;
  for (const m of text.matchAll(glossary.matcher.regex)) {
    const k = glossary.matcher.indexOf(m[0]);
    if (k === undefined || glossary.used.has(k)) continue;
    glossary.used.add(k);
    if (m.index > last) out.push(text.slice(last, m.index));
    out.push(<TermButton key={`${keyBase}-${m.index}`} k={k} glossary={glossary}>{m[0]}</TermButton>);
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}
