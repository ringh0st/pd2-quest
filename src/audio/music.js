// Quiet background study music, made on the fly (no files): a slow, warm pad under a few sparse
// music-box notes that wander a pentatonic scale, so it never repeats exactly and never gets busy.
// Kept far below the sound effects; fades in and out; pauses while the app is hidden.
// Plays only while a study screen asks for it (`useStudyScreen`) and both Sound effects and Music are on.
import { audio } from './audioContext.js';

const VOLUME = 0.05;
const BEAT = 0.95;               // seconds (~63 bpm)
const BEATS_PER_CHORD = 8;
const NOTE_CHANCE = 0.32;
const LOOKAHEAD = 0.8;
const TICK_MS = 250;
const FADE_IN = 3;
const FADE_OUT = 1.2;
// A calm major pentatonic around A3 and a gentle loop of chord roots (scale steps).
const SCALE = [220, 246.94, 277.18, 329.63, 369.99, 440, 493.88, 554.37, 659.25, 739.99];
const PROGRESSION = [0, 3, 1, 4];

let soundOn = true;
let musicOn = true;
let wanted = 0; // how many screens want music right now
let session = null;

function tone({ ctx }, bus, freq, at, { volume, attack, duration, wave = 'sine' }) {
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = wave;
  o.frequency.value = freq;
  g.gain.setValueAtTime(0.0001, at);
  g.gain.exponentialRampToValueAtTime(volume, at + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, at + duration);
  o.connect(g).connect(bus);
  o.start(at);
  o.stop(at + duration + 0.05);
}

function start() {
  if (session || !soundOn || !musicOn || wanted <= 0 || document.visibilityState === 'hidden') return;
  const a = audio();
  if (!a) return;
  const { ctx, master } = a;
  const bus = ctx.createGain();
  bus.gain.setValueAtTime(0.0001, ctx.currentTime);
  bus.gain.exponentialRampToValueAtTime(VOLUME, ctx.currentTime + FADE_IN);
  bus.connect(master);
  const s = { bus, next: ctx.currentTime + 0.1, beat: 0, last: 3, timer: null };
  s.timer = setInterval(() => {
    while (s.next < ctx.currentTime + LOOKAHEAD) {
      const chordAt = s.beat % BEATS_PER_CHORD === 0;
      const root = PROGRESSION[Math.floor(s.beat / BEATS_PER_CHORD) % PROGRESSION.length];
      if (chordAt) {
        // soft pad: root, third-ish and fifth-ish of the pentatonic, an octave down
        [0, 2, 4].forEach((k) => tone(a, bus, SCALE[(root + k) % SCALE.length] / 2, s.next,
          { volume: 0.35, attack: 1.6, duration: BEAT * BEATS_PER_CHORD + 0.8, wave: 'sine' }));
      }
      if (Math.random() < NOTE_CHANCE) {
        // a wandering note near the last one
        s.last = Math.max(0, Math.min(SCALE.length - 1, s.last + Math.round((Math.random() - 0.5) * 4)));
        tone(a, bus, SCALE[s.last], s.next + Math.random() * 0.08, { volume: 0.5, attack: 0.02, duration: 1.8, wave: 'triangle' });
      }
      s.next += BEAT;
      s.beat += 1;
    }
  }, TICK_MS);
  session = s;
}

function stop() {
  if (!session) return;
  const a = audio();
  const s = session;
  session = null;
  clearInterval(s.timer);
  if (a) {
    const t = a.ctx.currentTime;
    s.bus.gain.cancelScheduledValues(t);
    s.bus.gain.setValueAtTime(Math.max(0.0001, s.bus.gain.value), t);
    s.bus.gain.exponentialRampToValueAtTime(0.0001, t + FADE_OUT);
    setTimeout(() => s.bus.disconnect(), FADE_OUT * 1000 + 100);
  }
}

const sync = () => (soundOn && musicOn && wanted > 0 && document.visibilityState !== 'hidden' ? start() : stop());

export function setMusicSettings({ sound, music }) {
  soundOn = sound !== false;
  musicOn = music !== false;
  sync();
}

/** A study screen asks for music while it is open. Returns a function that releases it. */
export function wantMusic() {
  wanted += 1;
  sync();
  return () => { wanted = Math.max(0, wanted - 1); sync(); };
}

if (typeof document !== 'undefined') document.addEventListener('visibilitychange', sync);
// The first tap may unlock audio after a screen already asked for music.
if (typeof window !== 'undefined') window.addEventListener('pointerdown', () => setTimeout(sync, 0), { capture: true });
