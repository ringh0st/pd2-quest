// Key terms of a lesson: each one is highlighted in the lesson cards (first time per card) and,
// when tapped, a short, very simple meaning shows under the card.
// Data: lesson.terms = [{ term, match: ['CRUD', ...], say: '...' }]

const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** A matcher for one lesson's terms, or null when it has none. */
export function termMatcher(terms = []) {
  if (!terms.length) return null;
  const byText = new Map();
  terms.forEach((t, k) => [t.term, ...(t.match ?? [])].forEach((m) => byText.set(m.toLowerCase(), k)));
  const words = [...byText.keys()].sort((a, b) => b.length - a.length).map(escape);
  return {
    regex: new RegExp(`(?<![\\w$])(${words.join('|')})(?![\\w$])`, 'gi'),
    indexOf: (text) => byText.get(String(text).toLowerCase()),
  };
}

/**
 * Which text on a card gets each term's tap target: the first one that mentions it.
 * `texts` are the card's texts in reading order. Returns Map(termIndex → textIndex).
 * Mirrors how `Rich` splits text: a code span counts only when it is the whole term.
 */
export function firstMentions(texts, matcher) {
  const claims = new Map();
  texts.forEach((text, owner) => {
    for (const part of String(text ?? '').split(/(\*\*[^*]+\*\*|`[^`]+`)/g)) {
      if (part.startsWith('`') && part.endsWith('`')) {
        const k = matcher.indexOf(part.slice(1, -1));
        if (k !== undefined && !claims.has(k)) claims.set(k, owner);
        continue;
      }
      for (const m of part.matchAll(matcher.regex)) {
        const k = matcher.indexOf(m[0]);
        if (k !== undefined && !claims.has(k)) claims.set(k, owner);
      }
    }
  });
  return claims;
}
