// The world bosses (one look per section id): friendly-menacing characters built from simple shapes on a 96-unit grid.
// mood: idle (gentle bob) | hit (squash and shake) | taunt (lean in, grin) | defeated (dizzy eyes, tilt, fade).
// With reduced motion or Calm mode the pose is shown still. Tiny sizes (under 40px) never move.
import { motion } from 'motion/react';
import { useReducedMotion, useCalm } from '../../hooks/useMotionPrefs.js';

const INK = '#2A2133';        // features sit on colored bodies, so one dark ink works in both themes
const WHITE = '#FFFFFF';
const body = (acc) => `color-mix(in srgb, ${acc} 72%, #fff)`;
const shade = (acc) => `color-mix(in srgb, ${acc} 82%, #000)`;
const light = (acc) => `color-mix(in srgb, ${acc} 35%, #fff)`;

/* ---------- shared face parts ---------- */

function Eye({ x, y, r = 5, mood, side = 1, look = 0 }) {
  if (mood === 'defeated') {
    // a little spiral
    const s = r * 0.95;
    return (
      <path
        d={`M${x} ${y} m-${s * 0.15} 0 a${s * 0.15} ${s * 0.15} 0 1 1 ${s * 0.3} 0 a${s * 0.4} ${s * 0.4} 0 1 1 -${s * 0.75} 0 a${s * 0.65} ${s * 0.65} 0 1 1 ${s * 1.25} 0`}
        fill="none" stroke={INK} strokeWidth={Math.max(1.2, r * 0.28)} strokeLinecap="round"
      />
    );
  }
  if (mood === 'hit') {
    // squeezed shut: > on the left, < on the right
    const w = r * 0.9;
    return <path d={`M${x - w * side} ${y - w * 0.7} L${x + w * 0.6 * side} ${y} L${x - w * side} ${y + w * 0.7}`} fill="none" stroke={INK} strokeWidth={Math.max(1.4, r * 0.34)} strokeLinecap="round" strokeLinejoin="round" />;
  }
  const pr = mood === 'taunt' ? r * 0.42 : r * 0.55;
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill={WHITE} />
      <circle cx={x + look * r * 0.3} cy={y + r * 0.12} r={pr} fill={INK} />
      <circle cx={x + look * r * 0.3 + pr * 0.4} cy={y - pr * 0.3} r={pr * 0.35} fill={WHITE} />
    </g>
  );
}

/** A slanted brow: angrier when taunting, worried when hit, gone when defeated. */
function Brow({ x, y, w = 9, mood, side = 1 }) {
  if (mood === 'defeated') return null;
  const tilt = mood === 'taunt' ? 3.6 : mood === 'hit' ? -2.4 : 2;
  return <path d={`M${x - (w / 2) * side} ${y - tilt} L${x + (w / 2) * side} ${y + tilt * 0.4}`} stroke={INK} strokeWidth="2.6" strokeLinecap="round" />;
}

function Mouth({ x, y, w = 14, mood }) {
  if (mood === 'defeated') {
    return <path d={`M${x - w / 2} ${y} q${w / 8} -3 ${w / 4} 0 t${w / 4} 0 t${w / 4} 0 t${w / 4} 0`} fill="none" stroke={INK} strokeWidth="2" strokeLinecap="round" />;
  }
  if (mood === 'hit') return <ellipse cx={x} cy={y + 1} rx={w * 0.2} ry={w * 0.26} fill={INK} />;
  if (mood === 'taunt') {
    return (
      <g>
        <path d={`M${x - w / 2} ${y - 2} Q${x} ${y + w * 0.62} ${x + w / 2} ${y - 2} Z`} fill={INK} />
        <path d={`M${x - w * 0.36} ${y - 0.6} l${w * 0.12} ${w * 0.18} l${w * 0.12} -${w * 0.16} l${w * 0.12} ${w * 0.18} l${w * 0.12} -${w * 0.18} l${w * 0.12} ${w * 0.17} l${w * 0.1} -${w * 0.16} Z`} fill={WHITE} />
      </g>
    );
  }
  // idle: a sly smirk
  return <path d={`M${x - w / 2} ${y} Q${x - w * 0.05} ${y + w * 0.32} ${x + w / 2} ${y - w * 0.12}`} fill="none" stroke={INK} strokeWidth="2.4" strokeLinecap="round" />;
}

function Cheeks({ xs, y, mood }) {
  if (mood === 'defeated') return null;
  return xs.map((x) => <ellipse key={x} cx={x} cy={y} rx="3.6" ry="2.2" fill="var(--incorrect)" opacity="0.28" />);
}

/* ---------- the bosses ---------- */

/** The Sharing Sphinx: a stone sphinx in a striped headdress with a keyhole on its brow. */
function Sphinx({ mood }) {
  const acc = 'var(--sec-fund)';
  const stone = 'color-mix(in srgb, var(--gold) 55%, #fff)';
  const stoneDark = 'color-mix(in srgb, var(--gold-ledge) 85%, #000)';
  return (
    <>
      {/* plinth */}
      <rect x="8" y="76" width="80" height="13" rx="4" fill="color-mix(in srgb, var(--gold-ledge) 55%, #fff)" />
      <rect x="8" y="85" width="80" height="4" rx="2" fill="color-mix(in srgb, var(--gold-ledge) 80%, #000)" opacity="0.5" />
      <path d="M30 80 h10 M56 80 h10" stroke="color-mix(in srgb, var(--gold-ledge) 80%, #000)" strokeWidth="1.4" strokeLinecap="round" opacity="0.5" />
      {/* paws */}
      <rect x="18" y="68" width="22" height="12" rx="6" fill={stone} />
      <rect x="56" y="68" width="22" height="12" rx="6" fill={stone} />
      <path d="M24 74 v5 M30 74 v5 M62 74 v5 M68 74 v5" stroke={stoneDark} strokeWidth="1.6" strokeLinecap="round" opacity="0.6" />
      {/* headdress */}
      <path d="M48 10 C30 10 22 20 20 32 L12 70 H84 L76 32 C74 20 66 10 48 10 Z" fill={body(acc)} />
      <path d="M17 50 H79 M15 58 H81 M13.5 66 H82.5" stroke={shade(acc)} strokeWidth="3.4" opacity="0.6" />
      <path d="M22 26 C30 14 66 14 74 26" fill="none" stroke="var(--gold)" strokeWidth="5" strokeLinecap="round" />
      {/* face */}
      <path d="M30 28 C30 22 66 22 66 28 V50 C66 60 58 66 48 66 C38 66 30 60 30 50 Z" fill={stone} />
      {/* keyhole */}
      <circle cx="48" cy="29" r="3" fill={INK} />
      <path d="M46.6 30 L45.6 36 H50.4 L49.4 30 Z" fill={INK} />
      <Brow x={39} y={38} mood={mood} side={1} />
      <Brow x={57} y={38} mood={mood} side={-1} />
      <Eye x={39} y={44} r={4.6} mood={mood} side={1} />
      <Eye x={57} y={44} r={4.6} mood={mood} side={-1} />
      <Cheeks xs={[35, 61]} y={52} mood={mood} />
      <Mouth x={48} y={56} w={13} mood={mood} />
      {/* beard */}
      <rect x="44.5" y="64" width="7" height="9" rx="2" fill="var(--gold)" />
    </>
  );
}

/** One hydra head (its neck is drawn separately). */
function HydraHead({ x, y, s = 1, mood, look = 0 }) {
  const acc = 'var(--sec-auto)';
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {/* horns */}
      <path d="M-8 -9 L-11 -18 L-3 -11 Z M8 -9 L11 -18 L3 -11 Z" fill="var(--gold)" />
      <ellipse cx="0" cy="0" rx="13" ry="11.5" fill={body(acc)} />
      {/* snout */}
      <ellipse cx="0" cy="6" rx="9" ry="5.6" fill={light(acc)} />
      <circle cx="-3" cy="4.6" r="1" fill={INK} /><circle cx="3" cy="4.6" r="1" fill={INK} />
      <Brow x={-5.2} y={-6.6} w={6} mood={mood} side={1} />
      <Brow x={5.2} y={-6.6} w={6} mood={mood} side={-1} />
      <Eye x={-5.2} y={-2.2} r={3.4} mood={mood} side={1} look={look} />
      <Eye x={5.2} y={-2.2} r={3.4} mood={mood} side={-1} look={look} />
      <Mouth x={0} y={8.6} w={8} mood={mood} />
    </g>
  );
}

/** The Recursion Hydra: three heads, each a smaller copy of the next. */
function Hydra({ mood }) {
  const acc = 'var(--sec-auto)';
  return (
    <>
      {/* tail */}
      <path d="M68 80 C80 80 86 72 84 64 C83 70 78 74 70 73 Z" fill={shade(acc)} />
      {/* necks */}
      <path d="M36 70 C30 58 18 52 18 38 L28 38 C28 50 40 54 44 66 Z" fill={shade(acc)} />
      <path d="M60 70 C66 58 78 52 78 38 L68 38 C68 50 56 54 52 66 Z" fill={shade(acc)} />
      <path d="M41 70 C40 50 44 40 43 28 H53 C52 40 56 50 55 70 Z" fill={body(acc)} />
      {/* body */}
      <ellipse cx="48" cy="76" rx="27" ry="13" fill={body(acc)} />
      <ellipse cx="48" cy="80" rx="17" ry="7" fill={light(acc)} />
      <path d="M36 66 l4 -5 4 5 M44 64 l4 -5 4 5 M52 66 l4 -5 4 5" fill="var(--gold)" />
      {/* feet */}
      <ellipse cx="30" cy="88" rx="7" ry="3.6" fill={shade(acc)} />
      <ellipse cx="66" cy="88" rx="7" ry="3.6" fill={shade(acc)} />
      <HydraHead x={22} y={36} s={0.78} mood={mood} look={-1} />
      <HydraHead x={74} y={36} s={0.78} mood={mood} look={1} />
      <HydraHead x={48} y={24} s={1.02} mood={mood} />
    </>
  );
}

/** The Re-render Kraken: a round-headed kraken with curling tentacles and a refresh loop on its brow. */
function Kraken({ mood }) {
  const acc = 'var(--sec-ui)';
  const tent = (d, k) => <path key={k} d={d} fill="none" stroke={shade(acc)} strokeWidth="8" strokeLinecap="round" />;
  return (
    <>
      {/* tentacles behind */}
      {[
        'M30 62 C20 70 10 70 10 80 C10 86 18 86 18 80',
        'M40 66 C36 76 30 82 34 88',
        'M56 66 C60 76 66 82 62 88',
        'M66 62 C76 70 86 70 86 80 C86 86 78 86 78 80',
      ].map(tent)}
      {/* suckers */}
      {[[12, 78], [34, 84], [62, 84], [84, 78]].map(([x, y]) => <circle key={x} cx={x} cy={y} r="1.6" fill={light(acc)} />)}
      {/* head */}
      <path d="M48 8 C28 8 18 22 18 40 C18 56 28 66 48 66 C68 66 78 56 78 40 C78 22 68 8 48 8 Z" fill={body(acc)} />
      <ellipse cx="34" cy="22" rx="6" ry="4" fill={light(acc)} opacity="0.7" />
      <circle cx="64" cy="18" r="2.4" fill={light(acc)} opacity="0.7" />
      <circle cx="70" cy="26" r="1.6" fill={light(acc)} opacity="0.7" />
      {/* refresh loop on the brow */}
      <path d="M44 22 A5 5 0 1 1 48 27" fill="none" stroke={INK} strokeWidth="2.2" strokeLinecap="round" />
      <path d="M41.6 19.6 L44 22.6 L47 20.4" fill="none" stroke={INK} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <Brow x={36} y={33} mood={mood} side={1} />
      <Brow x={60} y={33} mood={mood} side={-1} />
      <Eye x={36} y={40} r={6} mood={mood} side={1} />
      <Eye x={60} y={40} r={6} mood={mood} side={-1} />
      <Cheeks xs={[28, 68]} y={50} mood={mood} />
      <Mouth x={48} y={52} w={14} mood={mood} />
      {/* front tentacles */}
      {tent('M48 64 C48 74 44 80 48 88', 'f')}
    </>
  );
}

/** The Flaky Test Toad: a squat toad on a lily pad, with a pass mark and a fail mark on its belly. */
function Toad({ mood }) {
  const acc = 'color-mix(in srgb, var(--sec-test) 55%, var(--sec-auto))';
  return (
    <>
      {/* lily pad */}
      <path d="M48 82 L62 76 C80 78 88 84 80 88 C70 92 26 92 16 88 C8 84 16 78 34 76 Z" fill="var(--sec-auto)" />
      {/* back legs */}
      <ellipse cx="20" cy="74" rx="12" ry="9" fill={shade(acc)} />
      <ellipse cx="76" cy="74" rx="12" ry="9" fill={shade(acc)} />
      {/* body */}
      <path d="M48 30 C24 30 12 46 14 62 C16 76 30 84 48 84 C66 84 80 76 82 62 C84 46 72 30 48 30 Z" fill={body(acc)} />
      <ellipse cx="48" cy="70" rx="20" ry="12" fill={light(acc)} />
      {/* flaky spots */}
      <circle cx="24" cy="50" r="3.2" fill={shade(acc)} opacity="0.55" />
      <circle cx="72" cy="48" r="2.6" fill={shade(acc)} opacity="0.55" />
      <circle cx="78" cy="58" r="2" fill={shade(acc)} opacity="0.55" />
      {/* pass and fail marks */}
      <path d="M38 69 l3 3 6 -6" fill="none" stroke="var(--correct)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M52 66 l6 6 M58 66 l-6 6" stroke="var(--incorrect)" strokeWidth="2.6" strokeLinecap="round" />
      {/* front feet */}
      <path d="M26 82 h12 M58 82 h12" stroke={shade(acc)} strokeWidth="6" strokeLinecap="round" />
      {/* eye bumps */}
      <circle cx="32" cy="30" r="11" fill={body(acc)} />
      <circle cx="64" cy="30" r="11" fill={body(acc)} />
      <Eye x={32} y={30} r={7} mood={mood} side={1} />
      <Eye x={64} y={30} r={7} mood={mood} side={-1} />
      <Brow x={32} y={18} w={10} mood={mood} side={1} />
      <Brow x={64} y={18} w={10} mood={mood} side={-1} />
      <Cheeks xs={[26, 70]} y={52} mood={mood} />
      <Mouth x={48} y={50} w={30} mood={mood} />
    </>
  );
}

/** The Governor: a stern, boxy limit-enforcer robot with a speed gauge on its chest. */
function Governor({ mood }) {
  const acc = 'var(--sec-perf)';
  const metal = 'color-mix(in srgb, var(--text-muted) 35%, #fff)';
  const metalDark = 'color-mix(in srgb, var(--text-muted) 75%, #fff)';
  const needle = mood === 'defeated' ? -70 : mood === 'hit' ? 10 : mood === 'taunt' ? 62 : 40;
  return (
    <>
      {/* antenna */}
      <path d="M48 6 V16" stroke={metalDark} strokeWidth="3" strokeLinecap="round" />
      <circle cx="48" cy="6" r="4" fill={mood === 'defeated' ? metalDark : acc} />
      {/* head */}
      <rect x="22" y="14" width="52" height="34" rx="9" fill={metal} />
      <rect x="16" y="24" width="8" height="14" rx="3" fill={metalDark} />
      <rect x="72" y="24" width="8" height="14" rx="3" fill={metalDark} />
      {/* visor */}
      <rect x="28" y="22" width="40" height="15" rx="7" fill={INK} />
      <g>
        {mood === 'defeated' || mood === 'hit'
          ? <><Eye x={38} y={29.5} r={4.2} mood={mood} side={1} /><Eye x={58} y={29.5} r={4.2} mood={mood} side={-1} /></>
          : <><rect x="33" y="27" width="10" height="5" rx="2.5" fill={acc} /><rect x="53" y="27" width="10" height="5" rx="2.5" fill={acc} /></>}
      </g>
      {/* stern brows on the visor rim (straight bars, tilted in a taunt) */}
      {mood !== 'defeated' && (
        <>
          <rect x="31" y="18" width="14" height="3.2" rx="1.6" fill={INK} transform={`rotate(${mood === 'taunt' ? 12 : mood === 'hit' ? -8 : 6} 38 19.6)`} />
          <rect x="51" y="18" width="14" height="3.2" rx="1.6" fill={INK} transform={`rotate(${mood === 'taunt' ? -12 : mood === 'hit' ? 8 : -6} 58 19.6)`} />
        </>
      )}
      {/* mouth grille */}
      <rect x="36" y="39" width="24" height="6" rx="3" fill={metalDark} />
      <path d="M42 39 v6 M48 39 v6 M54 39 v6" stroke={metal} strokeWidth="1.4" />
      {/* body */}
      <rect x="20" y="50" width="56" height="34" rx="10" fill={body(acc)} />
      <rect x="10" y="54" width="10" height="22" rx="5" fill={shade(acc)} />
      <rect x="76" y="54" width="10" height="22" rx="5" fill={shade(acc)} />
      <rect x="26" y="84" width="14" height="6" rx="2" fill={metalDark} />
      <rect x="56" y="84" width="14" height="6" rx="2" fill={metalDark} />
      {/* chest gauge */}
      <path d="M33 77 A15 15 0 0 1 63 77 Z" fill={WHITE} />
      <path d="M36.5 77 A11.5 11.5 0 0 1 41 68" fill="none" stroke="var(--correct)" strokeWidth="3" />
      <path d="M42 67.3 A11.5 11.5 0 0 1 54 67.3" fill="none" stroke="var(--gold)" strokeWidth="3" />
      <path d="M55 68 A11.5 11.5 0 0 1 59.5 77" fill="none" stroke="var(--incorrect)" strokeWidth="3" />
      <path d="M48 77 V66" stroke={INK} strokeWidth="2.4" strokeLinecap="round" transform={`rotate(${needle} 48 77)`} />
      <circle cx="48" cy="77" r="2.6" fill={INK} />
    </>
  );
}

const BOSSES = { fund: Sphinx, auto: Hydra, ui: Kraken, test: Toad, perf: Governor };

// Poses: the moving version for each mood, and the still pose shown with reduced motion or Calm mode.
const MOVES = {
  idle: { animate: { y: [0, -3, 0] }, transition: { duration: 2.4, repeat: Infinity, ease: 'easeInOut' } },
  hit: { animate: { x: [0, -6, 6, -4, 4, 0], scaleX: [1, 1.14, 0.94, 1.04, 1], scaleY: [1, 0.82, 1.06, 0.97, 1] }, transition: { duration: 0.5 } },
  taunt: { animate: { rotate: -6, scale: 1.04 }, transition: { type: 'spring', stiffness: 260, damping: 12 } },
  defeated: { animate: { rotate: 14, y: 4, opacity: 0.6 }, transition: { duration: 0.7, ease: 'easeOut' } },
};
const STILL = {
  idle: undefined,
  hit: { transform: 'scale(1.1, 0.88)' },
  taunt: { transform: 'rotate(-6deg) scale(1.04)' },
  defeated: { transform: 'rotate(14deg) translateY(4px)', opacity: 0.6 },
};
const ORIGIN = { transformOrigin: '48px 86px', transformBox: 'view-box' };

export function BossArt({ world, size = 96, mood = 'idle', className = '' }) {
  const reduced = useReducedMotion();
  const calm = useCalm();
  const Art = BOSSES[world] ?? Sphinx;
  const m = MOVES[mood] ? mood : 'idle';
  const still = reduced || calm || size < 40;
  return (
    <svg className={`art boss-art ${className}`} width={size} height={size} viewBox="0 0 96 96" aria-hidden="true" focusable="false" data-world={world} data-mood={m}>
      {/* ground shadow */}
      <ellipse cx="48" cy="91" rx="30" ry="3.4" fill="var(--text)" opacity="0.12" />
      {still ? (
        <g style={{ ...ORIGIN, ...STILL[m] }}><Art mood={m} /></g>
      ) : (
        <motion.g key={m} style={ORIGIN} animate={MOVES[m].animate} transition={MOVES[m].transition}>
          <Art mood={m} />
        </motion.g>
      )}
    </svg>
  );
}
