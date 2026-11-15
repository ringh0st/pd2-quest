// A world's emblem: one hand-built vector badge per world, drawn on a 48-unit grid so it reads at 28px
// and holds detail at 96px. Colors come from tokens (the world's --sec-* accent plus shared tokens),
// so every emblem follows light and dark mode. world: fund|auto|ui|test|perf.

import { useId } from 'react';

const mix = (a, pct, b) => `color-mix(in srgb, ${a} ${pct}%, ${b})`;
const INK = '#2A2133'; // features drawn on colored fills, so one dark ink works in both themes

/** Rounded backdrop shared by every emblem: a soft accent disc with a darker rim at the bottom. */
function Backdrop({ accent }) {
  return (
    <>
      <circle cx="24" cy="25.5" r="22" fill={mix(accent, 45, 'var(--surface-3)')} />
      <circle cx="24" cy="24" r="22" fill={mix(accent, 20, 'var(--surface)')} />
      <circle cx="24" cy="24" r="17.5" fill={mix(accent, 10, 'var(--surface)')} />
    </>
  );
}

/** Sharing Shrine: a vermilion shrine gate guarding a golden shield. */
function Shrine() {
  const gate = 'var(--incorrect)';
  const gateDark = mix('var(--incorrect)', 70, '#000');
  return (
    <>
      <Backdrop accent="var(--sec-fund)" />
      {/* ground */}
      <ellipse cx="24" cy="39" rx="15" ry="3" fill={mix('var(--sec-fund)', 30, 'var(--surface-3)')} />
      {/* pillars */}
      <rect x="11.5" y="15" width="4" height="24" rx="1.2" fill={gate} />
      <rect x="32.5" y="15" width="4" height="24" rx="1.2" fill={gate} />
      <rect x="10.5" y="36.5" width="6" height="3" rx="1" fill={gateDark} />
      <rect x="31.5" y="36.5" width="6" height="3" rx="1" fill={gateDark} />
      {/* top beam with upturned ends */}
      <path d="M5.5 10.5 Q24 14.5 42.5 10.5 L41.5 14.6 Q24 17.6 6.5 14.6 Z" fill={gate} />
      <path d="M6 10.6 Q24 14.3 42 10.6 L42 12 Q24 15.6 6 12 Z" fill={gateDark} opacity="0.55" />
      {/* tie beam */}
      <rect x="9" y="19.2" width="30" height="3.2" rx="1" fill={gate} />
      <rect x="22.4" y="15.6" width="3.2" height="4" fill={gateDark} />
      {/* shield */}
      <path d="M24 23.4 L31 25.8 V30.5 C31 34.8 27.8 37.4 24 38.8 C20.2 37.4 17 34.8 17 30.5 V25.8 Z" fill="var(--gold)" />
      <path d="M24 23.4 L31 25.8 V30.5 C31 34.8 27.8 37.4 24 38.8 Z" fill="var(--gold-ledge)" />
      <path d="M20.8 30.6 L23.2 33 L27.6 28.3" fill="none" stroke={INK} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
    </>
  );
}

/** Gear path centred on (cx, cy): `teeth` square teeth around a ring. */
function gearPath(cx, cy, r, teeth, depth = 2.6) {
  const pts = [];
  const step = (Math.PI * 2) / teeth;
  for (let i = 0; i < teeth; i++) {
    const a = i * step;
    const w = step * 0.26;
    [[a - step / 2 + w, r], [a - w, r], [a - w * 0.7, r + depth], [a + w * 0.7, r + depth], [a + w, r], [a + step / 2 - w, r]]
      .forEach(([ang, rad]) => pts.push(`${(cx + Math.cos(ang) * rad).toFixed(2)} ${(cy + Math.sin(ang) * rad).toFixed(2)}`));
  }
  return `M${pts.join(' L')} Z`;
}

/** Async Forge: an anvil with two interlocking gears above it. */
function Forge() {
  const steel = mix('var(--text)', 70, 'var(--surface-3)');
  const steelTop = mix('var(--text)', 50, 'var(--surface-3)');
  return (
    <>
      <Backdrop accent="var(--sec-auto)" />
      {/* gears */}
      <path d={gearPath(18.5, 17, 6.4, 8)} fill="var(--sec-auto)" />
      <circle cx="18.5" cy="17" r="2.4" fill={mix('var(--sec-auto)', 20, 'var(--surface)')} />
      <path d={gearPath(29.6, 13.6, 4.6, 7, 2.2)} fill="var(--gold)" transform="rotate(12 29.6 13.6)" />
      <circle cx="29.6" cy="13.6" r="1.7" fill="var(--gold-ledge)" />
      {/* spark */}
      <path d="M36 21 l1 2.4 2.4 1 -2.4 1 -1 2.4 -1 -2.4 -2.4 -1 2.4 -1 Z" fill="var(--flame-fill)" />
      {/* anvil */}
      <path d="M8 27 H35 C38.5 27 41 28.6 42 31 H33.5 C31.5 31 30.5 32 30.5 33.5 V34.5 H17.5 V33.2 C17.5 31.6 16 30.8 14 30.4 L9.5 29.6 C8.5 29.4 8 28.6 8 27.6 Z" fill={steel} />
      <path d="M8 27 H35 C37 27 38.8 27.6 40 28.6 H8.6 C8.2 28.3 8 28 8 27.6 Z" fill={steelTop} />
      <path d="M15 34.5 H33 L35 39.5 H13 Z" fill={steel} />
      <rect x="11.5" y="38.5" width="25" height="3" rx="1.2" fill={mix('var(--text)', 85, 'var(--surface-3)')} />
    </>
  );
}

/** Pixel Bay: a sandy island with a palm, sitting in stepped pixel waves. */
function Bay() {
  const sea = 'var(--sec-test)';
  const leaf = 'var(--sec-auto)';
  return (
    <>
      <Backdrop accent="var(--sec-ui)" />
      {/* sun */}
      <circle cx="34" cy="13" r="4" fill="var(--gold)" />
      {/* island */}
      <path d="M9 34 C12 27.5 30 26.5 37 34 Z" fill="var(--gold)" />
      <path d="M9 34 C12 30.5 30 30 37 34 Z" fill="var(--gold-ledge)" opacity="0.5" />
      {/* trunk */}
      <path d="M21.6 31 C21.4 24 22.4 19.5 24.6 15.5 L26.4 16.3 C24.6 20 24 24.5 24.4 31 Z" fill={mix('var(--flame)', 75, 'var(--text)')} />
      {/* fronds */}
      <path d="M25.5 15.5 C21 12 15.5 13 13 17 C17 15.6 21 15.8 25.5 15.5 Z" fill={leaf} />
      <path d="M25.5 15.5 C24 10.5 19.5 8.6 16 9.6 C19.6 11 22.6 12.6 25.5 15.5 Z" fill={leaf} />
      <path d="M25.5 15.5 C28.5 11 33 10.4 36 12.2 C32.5 12.6 29 13.6 25.5 15.5 Z" fill={leaf} />
      <path d="M25.5 15.5 C30 15 34 17 35 21 C32 18.6 29 17 25.5 15.5 Z" fill={leaf} />
      <circle cx="25" cy="16.6" r="1.4" fill={mix('var(--flame)', 75, 'var(--text)')} />
      {/* pixel waves */}
      <path d="M5 35 h4 v-2 h4 v2 h6 v-2 h4 v2 h6 v-2 h4 v2 h6 v-2 h4 v2 V40 H5 Z" fill={sea} />
      <path d="M8 40 h4 v-2 h4 v2 h6 v-2 h4 v2 h6 v-2 h4 v2 h4 V43 C33 46.5 15 46.5 8 43 Z" fill={mix(sea, 60, 'var(--surface)')} />
      <rect x="14" y="36.2" width="2" height="1.6" fill="var(--surface)" opacity="0.8" />
      <rect x="30" y="36.2" width="2" height="1.6" fill="var(--surface)" opacity="0.8" />
    </>
  );
}

/** Bug Swamp: a lily pad with a magnifying glass held over a little bug. */
function Swamp() {
  const pad = 'var(--sec-auto)';
  return (
    <>
      <Backdrop accent="var(--sec-test)" />
      {/* water ripples */}
      <ellipse cx="24" cy="35" rx="18" ry="5.5" fill={mix('var(--sec-test)', 35, 'var(--surface)')} />
      {/* lily pad with its notch */}
      <path d="M24 31 L32.5 27.4 C38 30 38.5 38 24 39.6 C9.5 38 10 28.6 18 27 C20.5 26.6 22.6 26.6 24 31 Z" fill={pad} />
      <path d="M24 31 L32.5 27.4 C35.4 28.8 36.6 31.4 35.6 33.8 C31 36.6 17 36.6 12.6 33.4 C12.6 30.4 14.6 27.8 18 27 C20.5 26.6 22.6 26.6 24 31 Z" fill={mix(pad, 70, 'var(--surface)')} />
      {/* bug */}
      <ellipse cx="22" cy="29.8" rx="4.2" ry="3.2" fill="var(--incorrect)" />
      <path d="M22 26.6 V33" stroke={INK} strokeWidth="0.9" />
      <circle cx="17.9" cy="29.4" r="1.7" fill={INK} />
      <path d="M17 28 l-1.6 -2 M18.4 27.8 l0.2 -2.4" stroke={INK} strokeWidth="0.8" strokeLinecap="round" />
      <circle cx="23.6" cy="28.6" r="0.8" fill={INK} /><circle cx="20.6" cy="31" r="0.7" fill={INK} />
      {/* magnifying glass */}
      <path d="M30.4 21.6 L38.6 13.4" stroke={mix('var(--flame)', 75, 'var(--text)')} strokeWidth="4" strokeLinecap="round" />
      <circle cx="24" cy="28" r="8.6" fill="none" stroke={mix('var(--text)', 70, 'var(--surface-3)')} strokeWidth="2.6" />
      <circle cx="24" cy="28" r="7.3" fill="var(--surface)" opacity="0.22" />
      <path d="M19.4 24.6 A5.6 5.6 0 0 1 23 22.2" fill="none" stroke="var(--surface)" strokeWidth="1.5" strokeLinecap="round" opacity="0.9" />
    </>
  );
}

/** Turbo Peaks: a snowy peak with a speed gauge in front of it. */
function Peaks() {
  const rock = mix('var(--text-muted)', 80, 'var(--surface-3)');
  return (
    <>
      <Backdrop accent="var(--sec-perf)" />
      {/* back peak and main peak */}
      <path d="M26 33 L34.5 14.5 L43 33 Z" fill={mix('var(--text-muted)', 50, 'var(--surface-3)')} />
      <path d="M5 34 L19.5 8.5 L34 34 Z" fill={rock} />
      <path d="M19.5 8.5 L24.5 17.3 L21.8 16 L19.5 18.8 L17 15.8 L14.6 17.2 Z" fill="var(--surface)" />
      <path d="M34.5 14.5 L37.6 21.3 L35.6 20.4 L33.8 22 L31.6 20.6 Z" fill="var(--surface)" />
      {/* gauge */}
      <path d="M11 40 A13 13 0 0 1 37 40 Z" fill="var(--surface)" />
      <path d="M13.6 40 A10.4 10.4 0 0 1 17.6 31.8" fill="none" stroke="var(--correct)" strokeWidth="3" />
      <path d="M18.4 31.2 A10.4 10.4 0 0 1 29.6 31.2" fill="none" stroke="var(--gold)" strokeWidth="3" />
      <path d="M30.4 31.8 A10.4 10.4 0 0 1 34.4 40" fill="none" stroke="var(--sec-perf)" strokeWidth="3" />
      <path d="M24 40 L31.4 32.4" stroke={INK} strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="24" cy="40" r="2.4" fill={INK} />
      <rect x="10" y="39.6" width="28" height="2.6" rx="1.2" fill={mix('var(--sec-perf)', 60, 'var(--text)')} />
    </>
  );
}

const EMBLEMS = { fund: Shrine, auto: Forge, ui: Bay, test: Swamp, perf: Peaks };

export function WorldEmblem({ world, size = 48, className = '' }) {
  const Art = EMBLEMS[world] ?? Shrine;
  const clip = `emblem-${useId().replace(/:/g, '')}`;
  return (
    <svg className={`art world-emblem ${className}`} width={size} height={size} viewBox="0 0 48 48" aria-hidden="true" focusable="false" data-world={world}>
      <defs><clipPath id={clip}><circle cx="24" cy="24.75" r="22.75" /></clipPath></defs>
      <g clipPath={`url(#${clip})`}><Art /></g>
    </svg>
  );
}
