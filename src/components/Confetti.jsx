// Canvas confetti burst: vector pieces (no emoji), at most 60, one burst, aria-hidden.
// FeedbackProvider never fires it with reduced motion or Calm mode. Pieces fade out smoothly (no flashing).
// Each style in economy.js CONFETTI has its own shape language here; the shop preview draws the same shapes.
import { useEffect, useRef } from 'react';

/** Unit shapes, centred, roughly -10..10. `stroke` shapes are drawn as lines. */
export const CONFETTI_SHAPES = {
  square: { d: 'M-6 -6H6V6H-6Z' },
  dot: { d: 'M0 -5A5 5 0 1 1 0 5A5 5 0 1 1 0 -5Z' },
  ribbon: { d: 'M-10 0C-6.5 -6 -3 6 0 0S6.5 -6 10 0', stroke: 3.6 },
  star: { d: 'M0 -10L2.6 -3.6L9.5 -3.1L4.2 1.4L5.9 8.1L0 4.4L-5.9 8.1L-4.2 1.4L-9.5 -3.1L-2.6 -3.6Z' },
  sparkle: { d: 'M0 -10Q1.6 -1.6 10 0Q1.6 1.6 0 10Q-1.6 1.6 -10 0Q-1.6 -1.6 0 -10Z' },
  bolt: { d: 'M2.5 -10L-6.5 2H-0.5L-2.5 10L7 -3H1Z' },
  spark: { d: 'M-7 -2.5L7 2.5', stroke: 3.2 },
  heart: { d: 'M0 8.5C-9.5 2.5 -10.5 -4 -6.5 -7.2C-3.4 -9.6 0 -7 0 -4.4C0 -7 3.4 -9.6 6.5 -7.2C10.5 -4 9.5 2.5 0 8.5Z' },
};

/** One shape language per style (ids match economy.js CONFETTI). */
export const CONFETTI_STYLES = {
  classic: { shapes: ['ribbon', 'square', 'ribbon', 'dot'], colors: ['#FF7AB8', '#FFC94D', '#5CD0E8', '#FF9248', '#5EE0B4'] },
  stars: { shapes: ['star', 'star', 'sparkle'], colors: ['#FFC94D', '#FFB938', '#FF9248', '#FFD976'] },
  bolts: { shapes: ['bolt', 'bolt', 'spark'], colors: ['#FFC94D', '#FF9248', '#5CD0E8'] },
  hearts: { shapes: ['heart', 'heart', 'dot'], colors: ['#FF7AB8', '#E8553A', '#FF9DC6', '#D84468'] },
};

const MAX = 60;

/** A single piece as SVG (for previews). */
export function ConfettiPiece({ shape, color, size = 20, rotate = 0 }) {
  const s = CONFETTI_SHAPES[shape] ?? CONFETTI_SHAPES.square;
  return (
    <svg width={size} height={size} viewBox="-12 -12 24 24" aria-hidden="true" focusable="false" className="art">
      <path
        d={s.d} transform={`rotate(${rotate})`} strokeLinecap="round" strokeLinejoin="round"
        fill={s.stroke ? 'none' : color} stroke={s.stroke ? color : 'rgb(58 38 24 / 0.35)'} strokeWidth={s.stroke ?? 1}
      />
    </svg>
  );
}

/** A small cluster of a style's pieces (shop cards). */
export function ConfettiSample({ kind = 'classic', size = 56 }) {
  const st = CONFETTI_STYLES[kind] ?? CONFETTI_STYLES.classic;
  const spots = [[-15, -12, 12, -20], [12, -14, 10, 25], [0, 3, 15, 0], [-14, 14, 9, 35], [15, 12, 11, -30]];
  return (
    <svg width={size} height={size} viewBox="-28 -28 56 56" aria-hidden="true" focusable="false" className="art confetti-sample">
      <circle r="27" className="cf-disc" />
      {spots.map(([x, y, sc, rot], i) => {
        const s = CONFETTI_SHAPES[st.shapes[i % st.shapes.length]];
        const color = st.colors[i % st.colors.length];
        return (
          <path
            key={i} d={s.d} transform={`translate(${x} ${y}) rotate(${rot}) scale(${sc / 10})`}
            strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke"
            fill={s.stroke ? 'none' : color} stroke={s.stroke ? color : 'rgb(58 38 24 / 0.4)'} strokeWidth={s.stroke ? 3.2 : 1}
          />
        );
      })}
    </svg>
  );
}

export function Confetti({ fire, count = 40, origin = { x: 0.5, y: 0.35 }, kind = 'classic' }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!fire) return;
    const canvas = ref.current;
    if (!canvas) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = (canvas.width = window.innerWidth * dpr);
    const h = (canvas.height = window.innerHeight * dpr);
    const ctx = canvas.getContext('2d');
    const style = CONFETTI_STYLES[kind] ?? CONFETTI_STYLES.classic;
    const paths = Object.fromEntries(Object.entries(CONFETTI_SHAPES).map(([k, v]) => [k, new Path2D(v.d)]));
    const parts = Array.from({ length: Math.min(MAX, count) }, () => {
      const a = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.1;
      const v = (8 + Math.random() * 9) * dpr;
      const shape = style.shapes[(Math.random() * style.shapes.length) | 0];
      return {
        x: origin.x * w, y: origin.y * h,
        vx: Math.cos(a) * v, vy: Math.sin(a) * v,
        r: (5 + Math.random() * 5) * dpr,
        rot: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 0.25,
        flip: Math.random() * Math.PI, vf: 0.08 + Math.random() * 0.12, // a slow 3D-ish tumble, never a strobe
        c: style.colors[(Math.random() * style.colors.length) | 0],
        shape,
      };
    });
    const start = performance.now();
    let raf;
    const tick = (t) => {
      const age = t - start;
      ctx.clearRect(0, 0, w, h);
      ctx.globalAlpha = Math.max(0, 1 - age / 1400);
      for (const p of parts) {
        p.vy += 0.35 * dpr; p.vx *= 0.985; p.vy *= 0.985;
        p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.flip += p.vf;
        const def = CONFETTI_SHAPES[p.shape];
        const k = p.r / 10;
        ctx.save();
        ctx.translate(p.x, p.y); ctx.rotate(p.rot);
        ctx.scale(k * (0.35 + 0.65 * Math.abs(Math.cos(p.flip))), k);
        if (def.stroke) {
          ctx.strokeStyle = p.c; ctx.lineWidth = def.stroke; ctx.lineCap = 'round';
          ctx.stroke(paths[p.shape]);
        } else {
          ctx.fillStyle = p.c;
          ctx.fill(paths[p.shape]);
        }
        ctx.restore();
      }
      if (age < 1400) raf = requestAnimationFrame(tick);
      else ctx.clearRect(0, 0, w, h);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [fire, count, origin.x, origin.y, kind]);
  return <canvas ref={ref} className="confetti" aria-hidden="true" style={{ width: '100%', height: '100%' }} />;
}
