// Where a piece of feedback points: an exact, stable address of the thing a learner reported.
// Every report carries this index (exam, kind, id, card) plus a readable label and a link that opens the very same spot
// (the #/go route, screens/GoTo.jsx), so the owner can jump straight to it from the feedback table.
import { track, TRACKS } from './track.js';

/** Kinds of things that can be reported. */
export const KINDS = {
  card: 'Lesson card',
  term: 'Word meaning',
  question: 'Question',
  explanation: 'Explanation',
  flashcard: 'Flashcard',
  app: 'General',
};

/**
 * A location. `kind` from KINDS; `id` is a lesson, question or flashcard id; `card` is a lesson card's index (0-based);
 * `term` a key term's name. `route` is the screen it came from.
 */
export function locationOf(kind, { id = '', card = null, term = '', route = '' } = {}) {
  const exam = track.id;
  // Not about one spot: a general message ("JavaScript · General"); the screen it came from stays in the link
  const parts = kind === 'app' ? [TRACKS[exam].short] : [TRACKS[exam].short, id || route || 'app'];
  if (card !== null) parts.push(`card ${card + 1}`);
  if (term) parts.push(`“${term}”`);
  const label = `${parts.join(' · ')} (${KINDS[kind]})`;
  const path = kind === 'app'
    ? `/go/${exam}/app${route.startsWith('/') ? route : `/${route}`}`
    : `/go/${exam}/${kind}/${encodeURIComponent(id)}${card !== null ? `/${card}` : ''}`;
  return { exam, kind, id, card, term, route, label, link: `${appBase()}#${path}` };
}

/** The app's address without its hash (works on GitHub Pages under /pd2-quest/ and locally). */
export function appBase() {
  if (typeof window === 'undefined') return '';
  return `${window.location.origin}${window.location.pathname}`;
}
