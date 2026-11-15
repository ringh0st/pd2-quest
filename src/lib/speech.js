// Read aloud with the device's built-in voice (Web Speech API). One utterance at a time; tapping the
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

function pickVoice() {
  const voices = synth.getVoices();
  const en = voices.filter((v) => /^en(-|_)/i.test(v.lang));
  return en.find((v) => /Samantha|Google US English|Jenny|Aria|Serena|Karen|Daniel/i.test(v.name)) || en.find((v) => v.default) || en[0] || null;
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
