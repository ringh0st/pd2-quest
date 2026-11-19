// Checking typed answers (pure, unit tested). Used by the language exercises: type the right form, fill the gap,
// build the sentence. Small things never count against you (capitals, extra spaces, a final full stop); a wrong
// form is named so the feedback can teach: dots on ä/ö (vowel harmony), a double vs single letter (consonant
// length / gradation), or the ending.

const FINAL_PUNCT = /[.!?,;:]+$/;

/** Lowercase, single spaces, no final punctuation, curly quotes straightened. */
export function normalizeAnswer(s = '') {
  return String(s)
    .normalize('NFC')
    .replace(/[’‘]/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
    .replace(FINAL_PUNCT, '')
    .trim()
    .toLowerCase();
}

const undot = (s) => s.replace(/ä/g, 'a').replace(/ö/g, 'o').replace(/y/g, 'u');
const singleLetters = (s) => s.replace(/(.)\1+/g, '$1');

/** The longest shared beginning of two words (for "the stem is right, the ending isn't"). */
function sharedStart(a, b) {
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i += 1;
  return i;
}

/**
 * What kind of mistake `got` is, compared with the closest accepted answer `expected` (both normalized):
 * 'harmony' (only ä/ö/y vs a/o/u differ), 'length' (only double vs single letters differ),
 * 'ending' (same stem, different ending), 'stem' (the ending is right but the stem changed wrongly),
 * or null when nothing specific fits.
 */
export function diagnose(expected, got) {
  if (!got || expected === got) return null;
  if (undot(expected) === undot(got)) return 'harmony';
  if (singleLetters(expected) === singleLetters(got)) return 'length';
  const start = sharedStart(expected, got);
  const minLen = Math.min(expected.length, got.length);
  if (start >= Math.max(2, minLen - 4) && start < minLen) return 'ending';
  const end = sharedStart([...expected].reverse().join(''), [...got].reverse().join(''));
  if (end >= 2 && start >= 1) return 'stem';
  return null;
}

export const DIAGNOSIS_TEXT = {
  harmony: 'Almost! Check the dots: the ending follows the word’s vowels (a/o/u words take -a, ä/ö/y words take -ä).',
  length: 'Almost! A double vs a single letter changes the word in Finnish: check kk/k, pp/p, tt/t, or long vowels.',
  ending: 'The stem is right; the ending isn’t. Check which case or person the sentence needs.',
  stem: 'The ending is right; the stem changes here. Think of the word’s key forms (consonant gradation).',
};

/** Checks a typed answer against the accepted answers. Returns { right, expected, diagnosis }. */
export function checkTyped(accepted, value) {
  const got = normalizeAnswer(value);
  const list = (Array.isArray(accepted) ? accepted : [accepted]).map(normalizeAnswer);
  if (list.includes(got)) return { right: true, expected: accepted[0] ?? accepted, diagnosis: null };
  // diagnose against the closest accepted answer (most shared letters at the start)
  const closest = list.reduce((best, a) => (sharedStart(a, got) > sharedStart(best, got) ? a : best), list[0]);
  return { right: false, expected: (Array.isArray(accepted) ? accepted : [accepted])[list.indexOf(closest)], diagnosis: diagnose(closest, got) };
}

/** Whether a language task is answered right: typed forms and gaps, or a built sentence (tiles joined). */
export function checkTask(question, value) {
  if (question.kind === 'type' || question.kind === 'order') return checkTyped(question.answer, value);
  throw new Error(`Not a typed task: ${question.kind}`);
}

/** Typed tasks have a text answer; everything else is multiple choice. */
export const isTypedTask = (q) => q?.kind === 'type' || q?.kind === 'order';
