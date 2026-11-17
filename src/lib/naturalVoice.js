// The natural voice: every read-aloud text is recorded ahead of time (scripts/make-voice-audio.mjs, Kokoro "Heart")
// and published with the app as audio/<clipId>.m4a, with audio/index.json listing the clips. The phone only plays
// a small file through one <audio> element, started inside the tap, so it works on iPhones (also on silent) and
// costs no download up front. Texts without a clip (just changed, not recorded yet) use the device voice.
import { clipId } from './speechText.js';

/** Settings value of the natural voice. Older builds stored a "kokoro:<voice>" id; those mean it too. */
export const NATURAL_VOICE = 'natural';
export const isNaturalVoice = (id) => id === NATURAL_VOICE || (typeof id === 'string' && id.startsWith('kokoro:'));

let clips = null; // Set of recorded clip ids, once loaded
let loading = null;

/** Loads the list of recorded clips (small; the service worker keeps a copy for offline use). */
export function loadClipList() {
  loading ??= fetch('audio/index.json')
    .then((r) => (r.ok ? r.json() : []))
    .then((ids) => { clips = new Set(ids); })
    .catch(() => { loading = null; });
  return loading;
}

export const hasClip = (text) => !!clips?.has(clipId(text));

let player = null;
let onDone = null;

function finish() {
  const done = onDone;
  onDone = null;
  done?.();
}

/** Plays the recorded clip of `text`. Call inside a tap. `done` runs when it ends, fails or is stopped. */
export function playClip(text, done) {
  stopClip();
  if (!player) {
    player = new Audio();
    player.preload = 'auto';
    player.setAttribute('playsinline', '');
    player.onended = finish;
    player.onerror = finish;
  }
  onDone = done;
  player.src = `audio/${clipId(text)}.m4a`;
  player.play().catch(finish);
}

export function stopClip() {
  if (!player || !onDone) return;
  player.pause();
  finish();
}
