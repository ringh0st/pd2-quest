// Decorative scenery for a world: an absolutely positioned, pointer-events-none layer of small hand-built
// SVG shapes. variant 'card' decorates a world card on the map (right side, behind the text);
// variant 'path' lines both edges of a world's climbing level path. Low contrast; a soft drift only
// when motion is allowed (a few repeats, then still).
import { motion } from 'motion/react';
import { useReducedMotion, useCalm } from '../../hooks/useMotionPrefs.js';

const mix = (a, pct, b) => `color-mix(in srgb, ${a} ${pct}%, ${b})`;

/* ---------- shapes (24-unit grid) ---------- */

const Blossom = () => (
  <g>
    {[0, 72, 144, 216, 288].map((a) => <ellipse key={a} cx="12" cy="6.5" rx="4" ry="5.5" fill={mix('var(--primary)', 45, 'var(--surface)')} transform={`rotate(${a} 12 12)`} />)}
    <circle cx="12" cy="12" r="2.6" fill="var(--gold)" />
  </g>
);
const Lantern = () => (
  <g>
    <path d="M12 1 V4" stroke="var(--text-muted)" strokeWidth="1.4" />
    <rect x="9" y="3.5" width="6" height="2" rx="1" fill="var(--gold-ledge)" />
    <ellipse cx="12" cy="12" rx="7" ry="7.4" fill="var(--incorrect)" />
    <path d="M7.4 12 H16.6 M8 8.6 H16 M8 15.4 H16" stroke={mix('var(--incorrect)', 60, '#000')} strokeWidth="0.9" />
    <rect x="9" y="18.6" width="6" height="2" rx="1" fill="var(--gold-ledge)" />
    <path d="M12 20.6 V23" stroke="var(--gold-ledge)" strokeWidth="1.4" />
  </g>
);
const Leaf = ({ c = 'var(--sec-auto)' }) => (
  <g>
    <path d="M4 20 C4 10 10 4 20 4 C20 14 14 20 4 20 Z" fill={c} />
    <path d="M4 20 L15 9" stroke={mix(c, 60, 'var(--surface)')} strokeWidth="1.2" strokeLinecap="round" />
  </g>
);
const Spark = () => <path d="M12 1 L14.4 9.6 L23 12 L14.4 14.4 L12 23 L9.6 14.4 L1 12 L9.6 9.6 Z" fill="var(--flame-fill)" />;
const Chain = () => (
  <g fill="none" stroke={mix('var(--text-muted)', 80, 'var(--surface)')} strokeWidth="2.4">
    <rect x="2" y="7" width="11" height="7" rx="3.5" transform="rotate(-30 7.5 10.5)" />
    <rect x="11" y="10" width="11" height="7" rx="3.5" transform="rotate(-30 16.5 13.5)" />
  </g>
);
const Cog = () => (
  <g>
    {[0, 45, 90, 135].map((a) => <rect key={a} x="10" y="2" width="4" height="20" rx="1" fill="var(--sec-auto)" transform={`rotate(${a} 12 12)`} />)}
    <circle cx="12" cy="12" r="7" fill="var(--sec-auto)" />
    <circle cx="12" cy="12" r="2.8" fill="var(--surface)" />
  </g>
);
const Palm = () => (
  <g>
    <path d="M11 23 C11 17 11.6 12 13.4 8 L14.8 8.6 C13.4 12.4 12.8 17 13 23 Z" fill={mix('var(--flame)', 75, 'var(--text)')} />
    <path d="M14 8 C10 5 6 6 4 9 C7 8 10.4 8 14 8 Z M14 8 C13 4 9.6 2.4 7 3 C9.6 4.4 12 6 14 8 Z M14 8 C16.6 4.4 20 4 22 5.6 C19.4 5.8 16.6 6.6 14 8 Z M14 8 C17.6 8 20.6 9.6 21 12.6 C18.8 10.8 16.4 9.4 14 8 Z" fill="var(--sec-auto)" />
  </g>
);
const Shell = () => (
  <g>
    <path d="M12 21 L3 9 C6 3 18 3 21 9 Z" fill={mix('var(--primary)', 30, 'var(--surface)')} />
    <path d="M12 21 L7 6 M12 21 V4.6 M12 21 L17 6" stroke={mix('var(--primary)', 60, 'var(--surface)')} strokeWidth="1.2" />
    <rect x="9" y="19.5" width="6" height="3" rx="1.5" fill={mix('var(--primary)', 45, 'var(--surface)')} />
  </g>
);
const PixelWave = () => <path d="M1 18 h4 v-4 h4 v-4 h6 v4 h4 v4 h4 v4 H1 Z" fill="var(--sec-test)" />;
const Mushroom = () => (
  <g>
    <path d="M9 13 H15 V20 C15 21.6 9 21.6 9 20 Z" fill={mix('var(--gold)', 30, 'var(--surface)')} />
    <path d="M2 14 C2 6 7 3 12 3 C17 3 22 6 22 14 Z" fill="var(--incorrect)" />
    <circle cx="8" cy="9" r="1.8" fill="var(--surface)" /><circle cx="15" cy="7" r="1.4" fill="var(--surface)" /><circle cx="17" cy="11" r="1.2" fill="var(--surface)" />
  </g>
);
const Reeds = () => (
  <g>
    <path d="M7 23 V9 M12 23 V5 M17 23 V10" stroke="var(--sec-auto)" strokeWidth="1.6" strokeLinecap="round" />
    <rect x="5.6" y="7" width="2.8" height="7" rx="1.4" fill={mix('var(--flame)', 70, 'var(--text)')} />
    <rect x="10.6" y="3" width="2.8" height="7" rx="1.4" fill={mix('var(--flame)', 70, 'var(--text)')} />
    <path d="M17 14 C20 12 21 9 21 6 C18 8 17 11 17 14 Z" fill="var(--sec-auto)" />
  </g>
);
const Snowflake = () => (
  <g stroke="var(--sec-test)" strokeWidth="1.8" strokeLinecap="round">
    {[0, 60, 120].map((a) => <path key={a} d="M12 2 V22 M9 4.6 L12 7 L15 4.6 M9 19.4 L12 17 L15 19.4" fill="none" transform={`rotate(${a} 12 12)`} />)}
  </g>
);
const Pine = () => (
  <g>
    <rect x="10.6" y="18" width="2.8" height="5" rx="1" fill={mix('var(--flame)', 70, 'var(--text)')} />
    <path d="M12 1 L19 10 H15.6 L21 18.6 H3 L8.4 10 H5 Z" fill={mix('var(--sec-auto)', 80, 'var(--text)')} />
    <path d="M12 1 L15 5 L12 4.4 L9 5 Z" fill="var(--surface)" />
  </g>
);
const Cloud = () => <path d="M5 18 C1.6 18 1.6 12.6 5.4 12.6 C5.6 8.4 11.6 7 13.4 10.8 C15.6 8.2 20.6 9.6 20 13.4 C23.4 14 23 18 19.6 18 Z" fill="var(--surface)" />;

const SETS = {
  fund: [Blossom, Lantern, Leaf, Blossom, Lantern],
  auto: [Spark, Chain, Cog, Spark, Chain],
  ui: [Palm, Shell, PixelWave, Shell, Palm],
  test: [Mushroom, Reeds, Leaf, Reeds, Mushroom],
  perf: [Snowflake, Pine, Cloud, Pine, Snowflake],
};

// Card: a small cluster along the top-right edge, beside the "World N" line, clear of the title and text.
const CARD_SPOTS = [
  { left: 82, top: 3, s: 28 }, { left: 70, top: 4, s: 18 }, { left: 93, top: 8, s: 18 }, { left: 58, top: 2, s: 14 },
];
// Path: both edges, from the foot of the climb (bottom) to the summit (top), getting a little smaller as it rises.
const PATH_SPOTS = Array.from({ length: 14 }, (_, i) => {
  const side = i % 2 ? 'right' : 'left';
  const top = 96 - i * 6.8;
  return { [side]: 1 + ((i * 7) % 5), top, s: 34 - i * 0.9 };
});

export function Scenery({ world, variant = 'card', className = '' }) {
  const reduced = useReducedMotion();
  const calm = useCalm();
  const set = SETS[world] ?? SETS.fund;
  const spots = variant === 'path' ? PATH_SPOTS : CARD_SPOTS;
  const still = reduced || calm;
  return (
    <div className={`art scenery-layer scenery-${variant} ${className}`} aria-hidden="true" data-world={world} data-variant={variant}>
      {spots.map((p, i) => {
        const Shape = set[i % set.length];
        const style = {
          width: p.s, height: p.s, top: `${p.top}%`,
          left: p.left != null ? `${p.left}%` : undefined, right: p.right != null ? `${p.right}%` : undefined,
        };
        const svg = <svg width="100%" height="100%" viewBox="0 0 24 24" focusable="false"><Shape /></svg>;
        if (still) return <span key={i} className="scenery-bit" style={style}>{svg}</span>;
        return (
          <motion.span
            key={i} className="scenery-bit" style={style}
            animate={{ y: [0, -4, 0], rotate: [0, i % 2 ? 4 : -4, 0] }}
            transition={{ duration: 3.4 + (i % 3) * 0.8, delay: (i % 4) * 0.4, repeat: 3, ease: 'easeInOut' }}
          >{svg}</motion.span>
        );
      })}
    </div>
  );
}
