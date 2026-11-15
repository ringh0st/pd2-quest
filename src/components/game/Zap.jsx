// Zap, the mascot: a little lightning bolt with a face. Moods change the face; outfits from the shop
// are vector parts drawn inside Zap's own viewBox, so they stay put at every size.
import { motion } from 'motion/react';
import { useReducedMotion, useCalm } from '../../hooks/useMotionPrefs.js';
import { useStore } from '../../state/store.js';
import { OUTFITS } from '../../game/economy.js';

const MOUTHS = {
  happy: 'M40 66 Q50 74 60 66',
  cheer: 'M38 63 Q50 80 62 63 Z',
  think: 'M42 69 L58 67',
  sad: 'M41 71 Q50 64 59 71',
  sleepy: 'M44 68 Q50 71 56 68',
  wow: 'M46 66 a4 5 0 1 0 8 0 a4 5 0 1 0 -8 0',
};

const INK = '#2B1D00';

// Where each slot is anchored in Zap's viewBox (0 0 100 115):
// head = middle of the bolt's flat top edge (x 36 to 78 at y 4), eyes = midway between the two eyes.
const ANCHORS = { head: [57, 4], eyes: [49.5, 48.5] };

// Per-item fit on the anchor: shift, scale and tilt. Each drawing below is made around (0, 0),
// with y = 0 being where the hat meets the bolt (or the eye line for glasses).
const FIT = {
  cap: { dx: -1, dy: 1, scale: 1.15, rotate: -4 },
  shades: { dx: 0, dy: 0, scale: 1, rotate: -3.4 },
  top: { dx: 0, dy: 1, scale: 1.05, rotate: -5 },
  grad: { dx: 0, dy: 2, scale: 1.1, rotate: -4 },
  cowboy: { dx: 0, dy: 2, scale: 1.1, rotate: -3 },
  party: { dx: 2, dy: 1, scale: 1.05, rotate: 8 },
  crown: { dx: 0, dy: 1, scale: 1.05, rotate: -3 },
};

const line = { stroke: INK, strokeWidth: 2.5, strokeLinejoin: 'round', strokeLinecap: 'round' };

const ART = {
  cap: (
    <>
      <path d="M2 1 L31 1 Q35 4 30 6 L2 5 Z" fill="#0E5A66" {...line} />
      <path d="M-18 2 C-19 -18 17 -18 17 2 Z" fill="#14808F" {...line} />
      <path d="M0 -12 Q-4 -6 -5 1" fill="none" stroke="#0E5A66" strokeWidth="2" strokeLinecap="round" />
      <path d="M-11 -6 l-3 3 l3 3 M-6 -6 l3 3 l-3 3" fill="none" stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" transform="translate(4 -2)" />
      <circle cx="0" cy="-13" r="2.4" fill="#0E5A66" {...line} strokeWidth="1.8" />
    </>
  ),
  shades: (
    <>
      <path d="M-17 -3 L-27 -6 M17 -3 L26 -7" {...line} fill="none" />
      <path d="M-3 -3 Q0 -6 3 -3" {...line} fill="none" />
      <rect x="-18" y="-7" width="15" height="12" rx="5" fill="#1E1B2E" {...line} />
      <rect x="3" y="-7" width="15" height="12" rx="5" fill="#1E1B2E" {...line} />
      <path d="M-14 -3 L-10 -5 M7 -3 L11 -5" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" opacity="0.75" />
    </>
  ),
  top: (
    <>
      <path d="M-13 0 L-12 -28 L12 -28 L13 0 Z" fill="#2A2433" {...line} />
      <path d="M-12.6 -9 L12.6 -9 L12.8 -4 L-12.8 -4 Z" fill="#B3125F" />
      <path d="M-8 -25 L-8 -12" stroke="#5A5068" strokeWidth="2.5" strokeLinecap="round" />
      <ellipse cx="0" cy="0" rx="23" ry="4" fill="#2A2433" {...line} />
    </>
  ),
  grad: (
    <>
      <path d="M-14 -1 L-14 -11 L14 -11 L14 -1 Q0 4 -14 -1 Z" fill="#2A2433" {...line} />
      <path d="M-26 -13 L0 -21 L26 -13 L0 -5 Z" fill="#3A3346" {...line} />
      <path d="M0 -13 L19 -11 L19 1" fill="none" stroke="#FFC94D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16.5 1 L21.5 1 L22.5 8 L15.5 8 Z" fill="#FFC94D" stroke="#8A5A00" strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx="0" cy="-13" r="2.2" fill="#FFC94D" stroke="#8A5A00" strokeWidth="1.2" />
    </>
  ),
  cowboy: (
    <>
      <path d="M-15 -2 Q-17 -19 -8 -22 Q0 -16 8 -22 Q17 -19 15 -2 Z" fill="#B9773B" {...line} />
      <path d="M-15.2 -7 Q0 -3 15.2 -7 L15 -3 Q0 1 -15 -3 Z" fill="#5B3415" />
      <path d="M-30 -7 Q-27 0 -16 -1 Q0 3 16 -1 Q27 0 30 -7 Q31 4 0 6 Q-31 4 -30 -7 Z" fill="#A0632E" {...line} />
      <path d="M0 -15 l1.5 3 l3.3 .5 l-2.4 2.3 l.6 3.3 l-3 -1.6 l-3 1.6 l.6 -3.3 l-2.4 -2.3 l3.3 -.5 Z" fill="#FFC94D" stroke="#8A5A00" strokeWidth="1" strokeLinejoin="round" />
    </>
  ),
  party: (
    <>
      <path d="M-14 0 L0 -32 L14 0 Z" fill="#FF6FA5" {...line} />
      <path d="M-9.6 -10 L8.8 -12 L7.1 -16 L-7.9 -14.3 Z M-5.3 -20 L4.6 -21.6 L3.2 -25 L-3.6 -23.9 Z" fill="#FFF3C4" />
      <circle cx="-4" cy="-5" r="2" fill="#5EE0B4" />
      <circle cx="6" cy="-5" r="2" fill="#5EE0B4" />
      <path d="M-14 0 L0 -32 L14 0 Z" fill="none" {...line} />
      <ellipse cx="0" cy="0" rx="15" ry="3" fill="#E04F87" {...line} />
      <circle cx="0" cy="-33" r="4.5" fill="#FFC94D" {...line} strokeWidth="2" />
    </>
  ),
  crown: (
    <>
      <path d="M-17 0 L-20 -19 L-9 -9 L0 -23 L9 -9 L20 -19 L17 0 Z" fill="#FFD24A" stroke="#6B4500" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M-17.5 -4 L17.5 -4 L17 0 L-17 0 Z" fill="#E0A100" />
      <circle cx="-20" cy="-19" r="2.2" fill="#FFF3C4" stroke="#6B4500" strokeWidth="1.4" />
      <circle cx="0" cy="-23" r="2.4" fill="#FFF3C4" stroke="#6B4500" strokeWidth="1.4" />
      <circle cx="20" cy="-19" r="2.2" fill="#FFF3C4" stroke="#6B4500" strokeWidth="1.4" />
      <path d="M0 -14 l3.5 4 l-3.5 4 l-3.5 -4 Z" fill="#B3125F" stroke="#6B4500" strokeWidth="1.2" strokeLinejoin="round" />
      <circle cx="-10" cy="-5" r="2" fill="#0B8F70" />
      <circle cx="10" cy="-5" r="2" fill="#0B8F70" />
    </>
  ),
};

export function outfitById(id) {
  return OUTFITS.find((o) => o.id === id);
}

/** The outfit part placed on Zap, in Zap's viewBox coordinates. */
function OutfitPart({ outfit, still }) {
  const art = ART[outfit.id];
  if (!art) return null;
  const [ax, ay] = ANCHORS[outfit.slot] ?? ANCHORS.head;
  const { dx = 0, dy = 0, scale = 1, rotate = 0 } = FIT[outfit.id] ?? {};
  return (
    <g transform={`translate(${ax + dx} ${ay + dy}) rotate(${rotate}) scale(${scale})`}>
      <motion.g
        key={outfit.id}
        initial={still ? false : { y: outfit.slot === 'eyes' ? -6 : -14, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 500, damping: 22 }}
      >{art}</motion.g>
    </g>
  );
}

/** A shop icon: just the outfit drawing, framed on its own. */
export function OutfitIcon({ id, size = 72 }) {
  const art = ART[id];
  if (!art) return null;
  return (
    <svg viewBox="-32 -39 64 48" width={size} height={size * 0.75} aria-hidden="true" focusable="false">{art}</svg>
  );
}

export function Zap({ mood = 'happy', size = 96, hat, bounce = true, label = 'Zap, your study buddy' }) {
  const reduced = useReducedMotion();
  const calm = useCalm();
  const equipped = useStore((s) => s.equipped.hat);
  const outfit = outfitById(hat === undefined ? equipped : hat);
  const still = reduced || calm;
  const eyesClosed = mood === 'sleepy';
  const cheering = mood === 'cheer';
  const fullLabel = label && outfit ? `${label}, wearing ${outfit.look}` : label;

  return (
    <motion.div
      {...(fullLabel ? { role: 'img', 'aria-label': fullLabel } : { 'aria-hidden': true })}
      style={{ position: 'relative', width: size, height: size * 1.15, flex: 'none' }}
      animate={still || !bounce ? {} : cheering ? { y: [0, -14, 0, -8, 0], rotate: [0, -6, 6, 0] } : { y: [0, -4, 0] }}
      transition={cheering ? { duration: 0.9 } : { duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
    >
      <svg viewBox="0 0 100 115" width={size} height={size * 1.15} aria-hidden="true" focusable="false" style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id="zapBody" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#FFE07A" />
            <stop offset="1" stopColor="#FFB020" />
          </linearGradient>
        </defs>
        <ellipse cx="50" cy="110" rx="26" ry="4" fill="rgb(0 0 0 / 0.18)" />
        <path d="M36 4 L78 4 L60 40 L84 40 L30 108 L42 60 L18 60 Z" fill="url(#zapBody)" stroke="#B87400" strokeWidth="4" strokeLinejoin="round" />
        <path d="M40 10 L66 10 L54 34" fill="none" stroke="#FFF6CC" strokeWidth="4" strokeLinecap="round" opacity="0.8" />
        {/* cheeks */}
        <circle cx="34" cy="60" r="5" fill="#FF8FA3" opacity="0.7" />
        <circle cx="64" cy="58" r="5" fill="#FF8FA3" opacity="0.7" />
        {/* eyes */}
        {eyesClosed ? (
          <g stroke={INK} strokeWidth="3" strokeLinecap="round" fill="none">
            <path d="M37 50 Q41 53 45 50" /><path d="M54 49 Q58 52 62 49" />
          </g>
        ) : (
          <motion.g
            style={{ originY: '50px' }}
            animate={still ? {} : { scaleY: [1, 1, 0.1, 1, 1] }}
            transition={{ duration: 4, repeat: Infinity, times: [0, 0.9, 0.93, 0.96, 1] }}
          >
            <ellipse cx="41" cy="49" rx="4.5" ry={mood === 'wow' ? 6.5 : 5.5} fill={INK} />
            <ellipse cx="58" cy="48" rx="4.5" ry={mood === 'wow' ? 6.5 : 5.5} fill={INK} />
            <circle cx="42.5" cy="47" r="1.6" fill="#fff" />
            <circle cx="59.5" cy="46" r="1.6" fill="#fff" />
          </motion.g>
        )}
        {mood === 'think' && <path d="M35 40 L46 42 M53 41 L64 38" stroke={INK} strokeWidth="2.5" strokeLinecap="round" />}
        <path d={MOUTHS[mood] || MOUTHS.happy} fill={mood === 'cheer' || mood === 'wow' ? '#7A2E00' : 'none'} stroke={INK} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        {outfit && <OutfitPart outfit={outfit} still={still} />}
      </svg>
    </motion.div>
  );
}

/** Zap with a speech bubble. */
export function ZapSays({ text, mood = 'happy', size = 72, align = 'left' }) {
  const reduced = useReducedMotion();
  return (
    <div className="zap-says" style={{ flexDirection: align === 'right' ? 'row-reverse' : 'row' }}>
      <Zap mood={mood} size={size} />
      <motion.p
        key={text}
        className={`bubble ${align}`}
        initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.8, x: align === 'right' ? 10 : -10 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 24 }}
        aria-live="polite"
      >{text}</motion.p>
    </div>
  );
}
