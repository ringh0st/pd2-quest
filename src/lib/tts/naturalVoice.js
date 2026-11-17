// The on-device natural voice (see kokoroWorker.js): downloads on request, then speaks text sentence by sentence.
// Playback goes through one <audio> element (the same path as podcasts), not Web Audio: an iPhone Home Screen app
// plays it reliably, also with the silent switch on and with sound effects off. The element is unlocked inside the
// tap (a short silent clip), so the sentences that arrive later may play.
// Watchdogs catch an engine that stalls without an error (a phone can stop a worker that runs out of memory).
import { wavUrl } from './wav.js';

export const NATURAL_VOICES = [
  { id: 'kokoro:af_heart', name: 'Heart', about: 'warm, female' },
  { id: 'kokoro:af_bella', name: 'Bella', about: 'bright, female' },
  { id: 'kokoro:am_michael', name: 'Michael', about: 'calm, male' },
];
export const isNaturalVoice = (id) => typeof id === 'string' && id.startsWith('kokoro:');

let worker = null;
// idle | loading | ready | error; `last` describes the last time it spoke (shown in Settings to explain problems)
let state = { status: 'idle', progress: 0, error: '', last: '' };
const listeners = new Set();
const set = (patch) => { state = { ...state, ...patch }; listeners.forEach((fn) => fn()); };

let jobSeq = 0;
let playing = null; // { job, queue, done, started, startedAt, onEnd, onFail }

const LOAD_STALL_MS = 90_000; // no download progress and no "ready" for this long: the engine stopped
const FIRST_SOUND_MS = 30_000; // the first sentence takes a few seconds on a phone; far longer means it's stuck
const PAUSE_S = 0.15; // a small breath after each sentence
let loadTimer = 0;
let speakTimer = 0;

let player = null;
let silence = '';
function getPlayer() {
  if (!player) {
    player = new Audio();
    player.preload = 'auto';
    player.setAttribute('playsinline', '');
    player.onended = playNext;
    player.onerror = () => { if (playing?.current) failPlaying('The phone could not play the voice.'); };
  }
  return player;
}

function watchLoad() {
  clearTimeout(loadTimer);
  if (state.status === 'loading') loadTimer = setTimeout(() => fail('The natural voice stopped while getting ready on this device.'), LOAD_STALL_MS);
}

/** The engine is unusable: reset it, report why, and hand any waiting text to the device voice. */
function fail(message) {
  clearTimeout(loadTimer);
  worker?.terminate();
  worker = null;
  set({ status: 'error', error: message });
  failPlaying(message);
}

function release(p) {
  if (p.current) URL.revokeObjectURL(p.current);
  p.queue.forEach((url) => URL.revokeObjectURL(url));
}

function failPlaying(reason) {
  clearTimeout(speakTimer);
  if (!playing) return;
  const p = playing;
  playing = null;
  player?.pause();
  release(p);
  set({ last: `Last try: ${reason}` });
  (p.started ? p.onEnd : p.onFail || p.onEnd)?.();
}

function onMessage({ data }) {
  if (data.type === 'progress') { set({ progress: data.total ? data.loaded / data.total : 0 }); watchLoad(); }
  else if (data.type === 'ready') { clearTimeout(loadTimer); set({ status: 'ready', progress: 1, error: '' }); }
  else if (data.type === 'error') fail(data.message);
  else if (data.job !== playing?.job) return;
  else if (data.type === 'chunk') { playing.queue.push(wavUrl(data.samples, data.rate, PAUSE_S)); if (!playing.current) playNext(); }
  else if (data.type === 'done') { playing.done = true; if (!playing.current) playNext(); }
  else if (data.type === 'failed') failPlaying(data.message || 'the voice engine stopped.');
}

function playNext() {
  const p = playing;
  if (!p) return;
  if (p.current) { URL.revokeObjectURL(p.current); p.current = null; }
  const next = p.queue.shift();
  if (!next) {
    if (p.done) { playing = null; p.onEnd?.(); }
    return;
  }
  p.current = next;
  const el = getPlayer();
  el.src = next;
  el.play().then(() => {
    if (p.started) return;
    p.started = true;
    clearTimeout(speakTimer);
    set({ last: `Last try: first words after ${((performance.now() - p.startedAt) / 1000).toFixed(1)} s.` });
  }).catch((error) => { if (playing === p) failPlaying(`the phone blocked playback (${error?.name || 'error'}).`); });
}

function getWorker() {
  if (!worker) {
    worker = new Worker(new URL('./kokoroWorker.js', import.meta.url), { type: 'module' });
    worker.onmessage = onMessage;
    worker.onerror = (e) => fail(e.message || 'The natural voice could not start on this device.');
  }
  return worker;
}

/** Starts the one-time download (or loads it from the cache). */
export function loadNaturalVoice() {
  if (state.status === 'loading' || state.status === 'ready') return;
  set({ status: 'loading', progress: 0, error: '' });
  getWorker().postMessage({ type: 'load' });
  watchLoad();
}

export const naturalVoiceState = () => state;
export function subscribeNaturalVoice(fn) { listeners.add(fn); return () => listeners.delete(fn); }

/**
 * Speaks `text` with a natural voice id (from NATURAL_VOICES). `onEnd` runs when it finishes; `onFail` runs instead
 * when no sound could be made (so the caller can use the device voice). Call it inside a tap.
 */
export function speakNatural(text, voiceId, onEnd, onFail) {
  stopNatural();
  const el = getPlayer();
  silence ||= wavUrl(new Float32Array(2400), 24000);
  el.src = silence; // a short silent clip unlocks the player inside the tap
  el.play().catch(() => {});
  const job = ++jobSeq;
  playing = { job, queue: [], current: null, done: false, started: false, startedAt: performance.now(), onEnd, onFail };
  speakTimer = setTimeout(() => fail('The natural voice is too slow or stopped on this device.'), FIRST_SOUND_MS);
  getWorker().postMessage({ type: 'speak', job, text, voice: voiceId.replace('kokoro:', '') });
}

export function stopNatural() {
  clearTimeout(speakTimer);
  if (!playing) return;
  const p = playing;
  playing = null;
  worker?.postMessage({ type: 'cancel', job: p.job });
  player?.pause();
  release(p);
}
