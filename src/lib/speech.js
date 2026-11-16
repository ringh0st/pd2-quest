// Read aloud with the device's own voices (Web Speech API), picking its most natural one. One utterance at a time; tapping the
// same button again stops it. Markup like **bold** and `code` marks is removed before speaking.
const synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
let current = null;
const subs = new Set();
const emit = () => subs.forEach((f) => f());

export const canSpeak = () => !!synth && typeof window.SpeechSynthesisUtterance === 'function';

/** Text as it should be heard: no markdown marks, code dots read naturally. */
export function speakable(text = '') {
  return String(text)
    .replace(/\*\*/g, '')
    .replace(/`([^`]+)`/g, (_, c) => c.replace(/__c\b/g, ' underscore underscore c').replace(/\./g, ' dot '))
    .replace(/\s+/g, ' ')
    .trim();
}

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

let preferred = ''; // voiceURI chosen in Settings ('' = automatic)
export function setPreferredVoice(uri) { preferred = uri || ''; }

function pickVoice() {
  const voices = englishVoices();
  return voices.find((v) => v.voiceURI === preferred) || voices[0] || null;
}

export function speak(id, text) {
  if (!canSpeak()) return;
  if (current === id) { stopSpeaking(); return; } // tap again = stop
  synth.cancel();
  const u = new SpeechSynthesisUtterance(speakable(text));
  const v = pickVoice();
  if (v) { u.voice = v; u.lang = v.lang; } else u.lang = 'en-US';
  u.rate = 1;
  u.onend = u.onerror = () => { if (current === id) { current = null; emit(); } };
  current = id;
  emit();
  synth.speak(u);
}

export function stopSpeaking() {
  if (!synth) return;
  synth.cancel();
  current = null;
  emit();
}

export const speakingId = () => current;
export function subscribeSpeech(fn) { subs.add(fn); return () => subs.delete(fn); }
