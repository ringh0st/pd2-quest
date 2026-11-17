// What each read-aloud button says, in one place. The app reads these texts, and scripts/make-voice-audio.mjs
// records the same texts with the natural voice ahead of time, so every clip matches its button exactly.
// Pure: no React, no DOM (the recording script imports it in Node).

const LETTERS = 'ABCDEF';

/** A question stem without "(Choose 2)": the app already shows how many answers to pick. */
export function cleanQuestion(text) {
  return String(text).replace(/\s*\(?(choose|select) (\d|two|three)(\s+answers)?[.)]?\s*$/i, '').trim();
}

/** Text as it should be heard: no markdown marks, code dots read naturally. */
export function speakable(text = '') {
  return String(text)
    .replace(/\*\*/g, '')
    .replace(/`([^`]+)`/g, (_, c) => c.replace(/__c\b/g, ' underscore underscore c').replace(/\./g, ' dot '))
    .replace(/\s+/g, ' ')
    .trim();
}

export const cardSpeech = (card) =>
  [card.title, card.body, ...(card.items ?? []), card.type === 'code' ? 'There is a code example on this card.' : '']
    .filter(Boolean).join('. ');

export const termSpeech = (term) => `${term.term}. ${term.say}`;

export const questionSpeech = (q) =>
  [cleanQuestion(q.q), q.code ? 'There is a code example.' : '', ...q.options.map((o, i) => `${LETTERS[i]}. ${o}.`)]
    .filter(Boolean).join(' ');

/** The explanation after Check: the right answer first (shown either way), then why. */
export const explanationSpeech = (q) =>
  `The answer is ${q.answer.map((i) => `${LETTERS[i]}, ${q.options[i]}`).join(' and ')}. ${q.explain}`;

/** What "Try it" in Settings says. */
export const VOICE_SAMPLE = 'Hi! I will read your lessons and explanations out loud. Tap a word you don\'t know, and I\'ll explain it.';

/** Every text a read-aloud button can say in one exam section file (for recording). */
export function sectionSpeech(section) {
  return [
    ...section.lessons.flatMap((lesson) => [...lesson.cards.map(cardSpeech), ...(lesson.terms ?? []).map(termSpeech)]),
    ...section.questions.flatMap((q) => [questionSpeech(q), explanationSpeech(q)]),
  ];
}

/**
 * The file name of a recorded clip: a hash of what is heard (cyrb53, 53 bits, base 36). Bump VOICE_VERSION when
 * the voice or its settings change, so every clip is recorded again.
 */
export const VOICE_VERSION = 'heart-1';
export function clipId(text) {
  const s = `${VOICE_VERSION}|${speakable(text)}`;
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let i = 0; i < s.length; i += 1) {
    const c = s.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 2654435761);
    h2 = Math.imul(h2 ^ c, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36);
}
