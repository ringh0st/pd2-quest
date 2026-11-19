// Tiny generated sounds (no files): one named sound per moment, soft and rounded.
// Misses are gentle, never harsh. All of them obey the Sound effects switch.
import { audio } from './audioContext.js';

let enabled = true;
export function setSoundEnabled(on) { enabled = on; }
export const isSoundEnabled = () => enabled;

function tone(freq, { at = 0, dur = 0.16, type = 'sine', vol = 0.12, slide = 0 } = {}) {
  const a = audio();
  if (!a) return;
  const { ctx, master } = a;
  const t = ctx.currentTime + at;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (slide) o.frequency.exponentialRampToValueAtTime(freq * slide, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(master);
  o.start(t);
  o.stop(t + dur + 0.02);
}

/** A short, soft noise burst (for whooshes and page turns). */
function whoosh({ at = 0, dur = 0.14, vol = 0.04, from = 1800, to = 600 } = {}) {
  const a = audio();
  if (!a) return;
  const { ctx, master } = a;
  const t = ctx.currentTime + at;
  const len = Math.max(1, Math.floor(ctx.sampleRate * dur));
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const f = ctx.createBiquadFilter();
  f.type = 'bandpass'; f.Q.value = 1.2;
  f.frequency.setValueAtTime(from, t);
  f.frequency.exponentialRampToValueAtTime(to, t + dur);
  const g = ctx.createGain();
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(f).connect(g).connect(master);
  src.start(t);
}

const C5 = 523.25;
const semis = (n) => C5 * Math.pow(2, n / 12);
const play = (fn) => { if (!enabled) return; try { fn(); } catch { /* sound is a nice extra; never break the app */ } };
const arp = (steps, { at = 0, gap = 0.07, dur = 0.24, type = 'triangle', vol = 0.09, base = 0 } = {}) =>
  steps.forEach((s, i) => tone(semis(s + base), { at: at + i * gap, dur, type, vol }));

export const sfx = {
  // ---- taps and navigation ----
  tap: () => play(() => tone(semis(12), { dur: 0.05, type: 'triangle', vol: 0.05 })),
  select: () => play(() => tone(semis(9), { dur: 0.06, type: 'triangle', vol: 0.06 })),
  toggleOn: () => play(() => { tone(semis(7), { dur: 0.06, type: 'triangle', vol: 0.06 }); tone(semis(12), { at: 0.05, dur: 0.08, type: 'triangle', vol: 0.06 }); }),
  toggleOff: () => play(() => { tone(semis(7), { dur: 0.06, type: 'triangle', vol: 0.05 }); tone(semis(2), { at: 0.05, dur: 0.08, type: 'triangle', vol: 0.05 }); }),
  flip: () => play(() => { whoosh({ dur: 0.1, vol: 0.03 }); tone(semis(7), { at: 0.02, dur: 0.09, type: 'triangle', vol: 0.05, slide: 1.5 }); }),
  sheetOpen: () => play(() => whoosh({ dur: 0.16, vol: 0.03, from: 600, to: 1600 })),
  sheetClose: () => play(() => whoosh({ dur: 0.12, vol: 0.025, from: 1400, to: 500 })),
  // ---- answers ----
  correct: (combo = 1) => play(() => {
    const lift = Math.min(combo - 1, 7) * 2; // each combo step climbs the scale
    tone(semis(lift), { dur: 0.12, type: 'triangle' });
    tone(semis(lift + 7), { at: 0.08, dur: 0.2, type: 'triangle' });
  }),
  wrong: () => play(() => {
    tone(semis(-5), { dur: 0.18, type: 'sine', vol: 0.08 });
    tone(semis(-8), { at: 0.1, dur: 0.22, type: 'sine', vol: 0.07 });
  }),
  combo: (n) => play(() => arp([0, 4, 7, 12].slice(0, Math.min(4, n)), { gap: 0.05, dur: 0.12, type: 'square', vol: 0.035, base: 5 })),
  nope: () => play(() => tone(semis(-2), { dur: 0.08, type: 'sine', vol: 0.05, slide: 0.85 })), // can't do that (e.g. too many picks)
  // ---- game moments ----
  heartLost: () => play(() => { tone(semis(-3), { dur: 0.14, vol: 0.07 }); tone(semis(-10), { at: 0.12, dur: 0.3, vol: 0.06, slide: 0.9 }); }),
  bossHit: () => play(() => { whoosh({ dur: 0.08, vol: 0.05, from: 2400, to: 900 }); tone(semis(-12), { at: 0.03, dur: 0.16, type: 'square', vol: 0.04, slide: 0.7 }); }),
  bossWin: () => play(() => arp([0, 4, 7, 12, 16, 19, 24], { gap: 0.07, dur: 0.3, vol: 0.1 })),
  bossLose: () => play(() => arp([7, 4, 0, -5], { gap: 0.12, dur: 0.3, type: 'sine', vol: 0.07 })),
  star: (n = 1) => play(() => tone(semis(12 + n * 4), { dur: 0.22, type: 'sine', vol: 0.09 })),
  coin: () => play(() => { tone(semis(19), { dur: 0.06, type: 'square', vol: 0.03 }); tone(semis(24), { at: 0.06, dur: 0.16, type: 'square', vol: 0.03 }); }),
  purchase: () => play(() => { arp([19, 24], { gap: 0.06, dur: 0.12, type: 'square', vol: 0.03 }); arp([0, 7, 12], { gap: 0.08, dur: 0.24, vol: 0.08, base: 12 }); }),
  equip: () => play(() => { whoosh({ dur: 0.1, vol: 0.03 }); arp([7, 12], { gap: 0.06, dur: 0.14, vol: 0.07 }); }),
  unlock: () => play(() => { tone(semis(-5), { dur: 0.05, type: 'square', vol: 0.03 }); arp([0, 7, 12, 19], { gap: 0.06, dur: 0.22, vol: 0.08 }); }),
  streak: () => play(() => arp([4, 7, 11, 16], { gap: 0.06, dur: 0.2, vol: 0.08 })),
  quest: () => play(() => arp([0, 4, 7], { gap: 0.06, dur: 0.18, vol: 0.08, base: 7 })),
  levelUp: () => play(() => arp([0, 4, 7, 12, 16], { gap: 0.08, dur: 0.25, vol: 0.1 })),
  chest: () => play(() => arp([12, 16, 19, 24], { gap: 0.06, dur: 0.3, type: 'sine', vol: 0.09 })),
  /** One coin landing in the counter: each one a step higher, like a music box filling up. */
  coinLand: (i = 0) => play(() => tone(semis(19 + [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24, 26][i % 12]), { dur: 0.09, type: 'triangle', vol: 0.05 })),
  /** The chest wobbling before it opens: soft wooden knocks. */
  chestShake: () => play(() => { tone(semis(-5), { dur: 0.05, type: 'triangle', vol: 0.05 }); tone(semis(-3), { at: 0.12, dur: 0.05, type: 'triangle', vol: 0.05 }); tone(semis(-5), { at: 0.24, dur: 0.05, type: 'triangle', vol: 0.05 }); }),
  /** The chest popping open: a bright upward sparkle. */
  chestPop: () => play(() => { tone(semis(7), { dur: 0.22, type: 'sine', vol: 0.08, slide: 2 }); arp([19, 24, 28, 31], { at: 0.08, gap: 0.04, dur: 0.18, type: 'triangle', vol: 0.05 }); }),
  done: () => play(() => arp([0, 7, 12], { gap: 0.1, dur: 0.3, vol: 0.1 })),
  start: () => play(() => { whoosh({ dur: 0.2, vol: 0.04, from: 500, to: 2200 }); arp([0, 4, 7, 12], { gap: 0.06, dur: 0.2, vol: 0.09, base: 2 }); }),
  // ---- study tools ----
  park: () => play(() => { whoosh({ dur: 0.14, vol: 0.03, from: 900, to: 300 }); tone(semis(0), { at: 0.08, dur: 0.12, vol: 0.06 }); }),
  flag: () => play(() => tone(semis(5), { dur: 0.08, type: 'triangle', vol: 0.06, slide: 1.25 })),
  gradeAgain: () => play(() => tone(semis(-2), { dur: 0.12, vol: 0.06 })),
  gradeGood: () => play(() => arp([0, 7], { gap: 0.06, dur: 0.14, vol: 0.07 })),
  gradeEasy: () => play(() => arp([0, 7, 12], { gap: 0.05, dur: 0.14, vol: 0.07 })),
  timerWarn: () => play(() => { tone(semis(12), { dur: 0.1, vol: 0.06 }); tone(semis(12), { at: 0.2, dur: 0.1, vol: 0.06 }); }),
  submit: () => play(() => { whoosh({ dur: 0.18, vol: 0.035, from: 700, to: 2000 }); tone(semis(7), { at: 0.1, dur: 0.2, vol: 0.07 }); }),
  copy: () => play(() => tone(semis(14), { dur: 0.05, type: 'triangle', vol: 0.05 })),
  tick: () => play(() => tone(semis(19), { dur: 0.03, type: 'sine', vol: 0.03 })),
};
