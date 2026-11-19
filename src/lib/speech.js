// Read aloud: the natural voice (clips recorded ahead of time, lib/naturalVoice.js) when it's chosen and the text has
// a clip, otherwise the device's own voices (Web Speech API), picking its most natural one. One at a time; tapping the
// same button again stops it. Markup like **bold** and `code` marks is removed before speaking.
import { hasClip, isNaturalVoice, loadClipList, playClip, stopClip } from './naturalVoice.js';
import { speakable } from './speechText.js';

const synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
let current = null;
const subs = new Set();
const emit = () => subs.forEach((f) => f());

const hasDeviceVoice = () => !!synth && typeof window.SpeechSynthesisUtterance === 'function';
export const canSpeak = () => hasDeviceVoice() || isNaturalVoice(preferred);

// Devices ship plain voices and much more natural ones (iPhone/Mac "Premium" and "Enhanced" voices,
// Edge's "Natural" voices, Chrome's Google voices). Score them so the most natural English voice wins.
const NOVELTY = /Albert|Bad News|Bahh|Bells|Boing|Bubbles|Cellos|Good News|Jester|Organ|Superstar|Trinoids|Whisper|Wobble|Zarvox|Grandma|Grandpa|Eddy|Flo|Reed|Rocko|Sandy|Shelley|Fred|Junior|Ralph|Kathy/i;
const QUALITY = [
  [/premium/i, 60],
  [/natural|neural/i, 55],
  [/enhanced/i, 45],
  [/online/i, 35],
  [/google/i, 30],
  [/\b(Ava|Zoe|Evan|Nathan|Noelle|Allison|Susan|Tom|Samantha|Serena|Daniel|Karen|Moira|Jenny|Aria|Guy|Libby|Sonia)\b/i, 15],
];
const english = (v) => /^en(-|_)/i.test(v.lang) && !NOVELTY.test(v.name);
function quality(v) {
  const named = QUALITY.reduce((sum, [re, points]) => sum + (re.test(v.name) ? points : 0), 0);
  return named + (/^en[-_]US/i.test(v.lang) ? 4 : /^en[-_](GB|AU|IE|CA)/i.test(v.lang) ? 2 : 0);
}

/** English voices on this device, the most natural first. Can be empty until the browser has loaded them. */
export function englishVoices() {
  if (!synth) return [];
  return synth.getVoices().filter(english).sort((a, b) => quality(b) - quality(a) || a.name.localeCompare(b.name));
}

/** Calls `fn` when the device's voice list arrives or changes (it loads late in most browsers). */
export function onVoicesChanged(fn) {
  if (!synth?.addEventListener) return () => {};
  synth.addEventListener('voiceschanged', fn);
  return () => synth.removeEventListener('voiceschanged', fn);
}

let preferred = ''; // chosen in Settings: a natural voice id, a device voiceURI, or '' (automatic)
export function setPreferredVoice(uri) {
  preferred = uri || '';
  if (isNaturalVoice(preferred)) loadClipList();
}

function pickVoice() {
  const voices = englishVoices();
  return voices.find((v) => v.voiceURI === preferred) || voices[0] || null;
}

export function speak(id, text) {
  if (current === id) { stopSpeaking(); return; } // tap again = stop
  stopSpeaking();
  const finished = () => { if (current === id) { current = null; emit(); } };
  // Decided inside the tap (the clip list is already loaded), so the phone allows the sound to start.
  if (isNaturalVoice(preferred) && hasClip(text)) {
    current = id;
    emit();
    playClip(text, finished);
    return;
  }
  speakWithDevice(id, text, finished);
}

function speakWithDevice(id, text, finished) {
  if (!hasDeviceVoice()) { finished(); return; }
  const u = new SpeechSynthesisUtterance(speakable(text));
  const v = pickVoice();
  if (v) { u.voice = v; u.lang = v.lang; } else u.lang = 'en-US';
  u.rate = 1;
  u.onend = u.onerror = finished;
  current = id;
  emit();
  synth.speak(u);
}

export function stopSpeaking() {
  stopClip();
  synth?.cancel();
  current = null;
  emit();
}

export const speakingId = () => current;
export function subscribeSpeech(fn) { subs.add(fn); return () => subs.delete(fn); }

// ---------- the language being learned (Finnish): read by the device's own voice for that language ----------
const LANG_TAG = { fi: 'fi-FI' };
const ofLanguage = (lang) => (v) => v.lang?.toLowerCase().replace('_', '-').startsWith(lang);

/** The best device voice for `lang` ('fi'), or null when the device has none. */
export function languageVoice(lang) {
  if (!synth) return null;
  const voices = synth.getVoices().filter(ofLanguage(lang));
  return voices.sort((a, b) => quality(b) - quality(a))[0] ?? null;
}

/** Reads `text` in the learned language (slower for listening practice with `rate` < 1). Tap again to stop. */
export function speakLanguage(id, text, { lang = 'fi', rate = 0.9, onEnd } = {}) {
  if (current === id) { stopSpeaking(); return; }
  stopSpeaking();
  if (!hasDeviceVoice()) { onEnd?.(); return; }
  const u = new SpeechSynthesisUtterance(text);
  const v = languageVoice(lang);
  if (v) u.voice = v;
  u.lang = v?.lang ?? LANG_TAG[lang] ?? lang;
  u.rate = rate;
  u.onend = u.onerror = () => { if (current === id) { current = null; emit(); } onEnd?.(); };
  current = id;
  emit();
  synth.speak(u);
}
