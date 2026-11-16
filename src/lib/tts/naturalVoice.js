// The on-device natural voice (see kokoroWorker.js): downloads on request, then speaks text through Web Audio.
// Read-aloud plays straight to the speakers, so it works with sound effects switched off.
import { audio } from '../../audio/audioContext.js';

export const NATURAL_VOICES = [
  { id: 'kokoro:af_heart', name: 'Heart', about: 'warm, female' },
  { id: 'kokoro:af_bella', name: 'Bella', about: 'bright, female' },
  { id: 'kokoro:am_michael', name: 'Michael', about: 'calm, male' },
];
export const isNaturalVoice = (id) => typeof id === 'string' && id.startsWith('kokoro:');

let worker = null;
let state = { status: 'idle', progress: 0, error: '' }; // idle | loading | ready | error
const listeners = new Set();
const set = (patch) => { state = { ...state, ...patch }; listeners.forEach((fn) => fn()); };

let jobSeq = 0;
let playing = null; // { job, sources, nextTime, done, onEnd }

function onMessage({ data }) {
  if (data.type === 'progress') set({ progress: data.total ? data.loaded / data.total : 0 });
  else if (data.type === 'ready') set({ status: 'ready', progress: 1, error: '' });
  else if (data.type === 'error') set({ status: 'error', error: data.message });
  else if (data.job !== playing?.job) return;
  else if (data.type === 'chunk') schedule(data.samples, data.rate);
  else if (data.type === 'done') { playing.done = true; finishIfIdle(); }
  else if (data.type === 'failed') { const p = playing; playing = null; p.onEnd?.(); }
}

function getWorker() {
  if (!worker) {
    worker = new Worker(new URL('./kokoroWorker.js', import.meta.url), { type: 'module' });
    worker.onmessage = onMessage;
    worker.onerror = (e) => set({ status: 'error', error: e.message || 'The voice could not start on this device.' });
  }
  return worker;
}

/** Starts the one-time download (or loads it from the cache). */
export function loadNaturalVoice() {
  if (state.status === 'loading' || state.status === 'ready') return;
  set({ status: 'loading', progress: 0, error: '' });
  getWorker().postMessage({ type: 'load' });
}

export const naturalVoiceState = () => state;
export function subscribeNaturalVoice(fn) { listeners.add(fn); return () => listeners.delete(fn); }

function schedule(samples, rate) {
  const a = audio();
  if (!a || !playing) return;
  const { ctx } = a;
  const buffer = ctx.createBuffer(1, samples.length, rate);
  buffer.copyToChannel(samples, 0);
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.connect(ctx.destination);
  const at = Math.max(ctx.currentTime + 0.05, playing.nextTime);
  source.start(at);
  playing.nextTime = at + buffer.duration + 0.12; // a small breath between sentences
  playing.sources.add(source);
  const p = playing;
  source.onended = () => { p.sources.delete(source); if (p === playing) finishIfIdle(); };
}

function finishIfIdle() {
  if (playing?.done && playing.sources.size === 0) { const p = playing; playing = null; p.onEnd?.(); }
}

/** Speaks `text` with a natural voice id (from NATURAL_VOICES). `onEnd` runs when it finishes or fails. */
export function speakNatural(text, voiceId, onEnd) {
  stopNatural();
  audio(); // resume the audio context inside the tap
  const job = ++jobSeq;
  playing = { job, sources: new Set(), nextTime: 0, done: false, onEnd };
  getWorker().postMessage({ type: 'speak', job, text, voice: voiceId.replace('kokoro:', '') });
}

export function stopNatural() {
  if (!playing) return;
  const p = playing;
  playing = null;
  worker?.postMessage({ type: 'cancel', job: p.job });
  p.sources.forEach((s) => { try { s.stop(); } catch { /* already stopped */ } });
}
