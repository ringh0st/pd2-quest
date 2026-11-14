// Tiny generated sounds (no files). Soft, rounded tones; misses are gentle, never harsh.
let ctx = null;
let enabled = true;
export function setSoundEnabled(on) { enabled = on; }

function ac() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function tone(freq, { at = 0, dur = 0.16, type = 'sine', vol = 0.12, slide = 0 } = {}) {
  const c = ac();
  if (!c) return;
  const t = c.currentTime + at;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (slide) o.frequency.exponentialRampToValueAtTime(freq * slide, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(c.destination);
  o.start(t);
  o.stop(t + dur + 0.02);
}

const C5 = 523.25;
const semis = (n) => C5 * Math.pow(2, n / 12);
const play = (fn) => { if (!enabled) return; try { fn(); } catch { /* ignore */ } };

export const sfx = {
  tap: () => play(() => tone(semis(12), { dur: 0.05, type: 'triangle', vol: 0.05 })),
  flip: () => play(() => tone(semis(7), { dur: 0.09, type: 'triangle', vol: 0.06, slide: 1.5 })),
  correct: (combo = 1) => play(() => {
    const lift = Math.min(combo - 1, 7) * 2; // each combo step climbs the scale
    tone(semis(lift), { dur: 0.12, type: 'triangle' });
    tone(semis(lift + 7), { at: 0.08, dur: 0.2, type: 'triangle' });
  }),
  wrong: () => play(() => {
    tone(semis(-5), { dur: 0.18, type: 'sine', vol: 0.08 });
    tone(semis(-8), { at: 0.1, dur: 0.22, type: 'sine', vol: 0.07 });
  }),
  combo: (n) => play(() => [0, 4, 7, 12].slice(0, Math.min(4, n)).forEach((s, i) => tone(semis(s + 5), { at: i * 0.05, dur: 0.12, type: 'square', vol: 0.035 }))),
  levelUp: () => play(() => [0, 4, 7, 12, 16].forEach((s, i) => tone(semis(s), { at: i * 0.08, dur: 0.25, type: 'triangle', vol: 0.1 }))),
  chest: () => play(() => [12, 16, 19, 24].forEach((s, i) => tone(semis(s), { at: i * 0.06, dur: 0.3, type: 'sine', vol: 0.09 }))),
  done: () => play(() => [0, 7, 12].forEach((s, i) => tone(semis(s), { at: i * 0.1, dur: 0.3, type: 'triangle', vol: 0.1 }))),
  tick: () => play(() => tone(semis(19), { dur: 0.03, type: 'sine', vol: 0.03 })),
};
