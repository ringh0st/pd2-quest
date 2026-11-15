// Zap, the mascot: a chubby spark spirit with a lightning crest. Moods change the face, arms and crest;
// outfits from the shop are vector parts drawn inside Zap's own viewBox, so they stay put at every size.
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
// head = top of the round head (y 34, the crest hides under a hat), eyes = midway between the two eyes.
const ANCHORS = { head: [50, 37], eyes: [50, 62] };

// Per-item fit on the anchor: shift, scale and tilt. Each drawing below is made around (0, 0),
// with y = 0 being where the hat meets the bolt (or the eye line for glasses).
const FIT = {
  cap: { dx: -2, dy: 0, scale: 1.25, rotate: -6 },
  shades: { dx: 0, dy: 0, scale: 1.3, rotate: 0 },
  top: { dx: 0, dy: 0, scale: 1.05, rotate: -6 },
  grad: { dx: 0, dy: 1, scale: 1.15, rotate: -5 },
  cowboy: { dx: 0, dy: 1, scale: 1.2, rotate: -4 },
  party: { dx: 3, dy: 0, scale: 1.05, rotate: 10 },
  crown: { dx: 0, dy: 0, scale: 1.05, rotate: -4 },
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

// ---- Zap's body: a chubby spark spirit with a lightning crest ----
const GOLD = { light: '#FFE58A', mid: '#FFC93D', deep: '#F59E0B', rim: '#C27A06' };

const MOUTH = {
  happy: <path d="M44 74 Q50 79.5 56 74" fill="none" stroke={INK} strokeWidth="2.6" strokeLinecap="round" />,
  cheer: (
    <g>
      <path d="M42 72 Q50 85 58 72 Z" fill="#8A2A12" stroke={INK} strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M45.5 78.5 Q50 81.5 54.5 78.5" fill="#FF8A8A" />
    </g>
  ),
  sad: <path d="M45 78 Q50 73.5 55 78" fill="none" stroke={INK} strokeWidth="2.6" strokeLinecap="round" />,
  think: <path d="M46 76 Q50 75 55 77" fill="none" stroke={INK} strokeWidth="2.6" strokeLinecap="round" />,
  sleepy: <ellipse cx="50" cy="76" rx="2.6" ry="2" fill="#8A2A12" stroke={INK} strokeWidth="1.8" />,
  wow: <ellipse cx="50" cy="76.5" rx="3.6" ry="4.6" fill="#8A2A12" stroke={INK} strokeWidth="2.2" />,
};

/** Eyes: big glossy ovals that blink; mood changes their shape. */
function Eyes({ mood, still }) {
  if (mood === 'sleepy') {
    return (
      <g stroke={INK} strokeWidth="2.8" strokeLinecap="round" fill="none">
        <path d="M34 63 Q39 66.5 44 63" /><path d="M56 63 Q61 66.5 66 63" />
      </g>
    );
  }
  if (mood === 'cheer') {
    return (
      <g stroke={INK} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none">
        <path d="M34 64 Q39 57 44 64" /><path d="M56 64 Q61 57 66 64" />
      </g>
    );
  }
  const big = mood === 'wow';
  const look = mood === 'think' ? -2.5 : 0; // glance up while thinking
  const ry = big ? 8.2 : 7;
  return (
    <motion.g
      style={{ originY: '62px' }}
      animate={still ? {} : { scaleY: [1, 1, 0.08, 1, 1] }}
      transition={{ duration: 4.2, repeat: Infinity, times: [0, 0.9, 0.93, 0.96, 1] }}
    >
      {[39, 61].map((cx) => (
        <g key={cx}>
          <ellipse cx={cx} cy={62} rx={big ? 6.4 : 5.6} ry={ry} fill={INK} />
          <circle cx={cx + 1.8} cy={62 + look - 3} r={big ? 2.6 : 2.2} fill="#fff" />
          <circle cx={cx - 1.6} cy={62 + look + 2.6} r="1.1" fill="#fff" opacity="0.8" />
        </g>
      ))}
      {mood === 'sad' && <path d="M33 55.5 Q38 54.5 43 51.5 M67 55.5 Q62 54.5 57 51.5" fill="none" stroke={INK} strokeWidth="2.4" strokeLinecap="round" />}
    </motion.g>
  );
}

/** Arms: little nubs that wave, rise in a cheer, droop when sad, and rub the chin when thinking. */
function Arms({ mood, still }) {
  const armL = { happy: 'M22 78 Q14 80 13 88', cheer: 'M22 72 Q12 62 12 52', sad: 'M22 80 Q17 88 18 95', think: 'M22 78 Q15 84 17 92', sleepy: 'M22 80 Q16 86 17 93', wow: 'M22 74 Q11 70 9 62' };
  const armR = { happy: 'M78 78 Q86 80 87 88', cheer: 'M78 72 Q88 62 88 52', sad: 'M78 80 Q83 88 82 95', think: 'M76 80 Q70 86 60 84', sleepy: 'M78 80 Q84 86 83 93', wow: 'M78 74 Q89 70 91 62' };
  const waving = mood === 'happy' && !still;
  return (
    <g fill="none" strokeLinecap="round">
      <path d={armL[mood] ?? armL.happy} stroke={GOLD.rim} strokeWidth="8.5" />
      <path d={armL[mood] ?? armL.happy} stroke={GOLD.mid} strokeWidth="5" />
      <motion.g
        style={{ originX: '78px', originY: '78px' }}
        animate={waving ? { rotate: [0, -14, 6, -10, 0] } : {}}
        transition={{ duration: 1.6, delay: 0.6, repeat: 2, repeatDelay: 3 }}
      >
        <path d={armR[mood] ?? armR.happy} stroke={GOLD.rim} strokeWidth="8.5" />
        <path d={armR[mood] ?? armR.happy} stroke={GOLD.mid} strokeWidth="5" />
      </motion.g>
    </g>
  );
}

/** The lightning crest on top of the head. Hidden under a hat except for a little tuft. */
function Crest({ mood, hatted, still }) {
  if (hatted) return <path d="M70 34 L76 26 L74 32 L80 29" fill="none" stroke={GOLD.rim} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />;
  const droop = mood === 'sad' || mood === 'sleepy';
  return (
    <motion.g
      style={{ originX: '50px', originY: '36px' }}
      animate={still ? {} : mood === 'cheer' ? { scale: [1, 1.12, 1], rotate: [0, -6, 6, 0] } : { rotate: [0, 3, 0, -3, 0] }}
      transition={mood === 'cheer' ? { duration: 0.7, repeat: 2 } : { duration: 3.4, repeat: 2, ease: 'easeInOut' }}
    >
      <path
        d={droop ? 'M44 37 L36 21 L48 24 L42 9 L66 30 L54 27 L60 37 Z' : 'M42 37 L45 17 L54 21 L52 0 L71 27 L59 24 L62 37 Z'}
        fill={GOLD.mid} stroke={GOLD.rim} strokeWidth="3.4" strokeLinejoin="round"
      />
      <path d={droop ? 'M46 30 L42 23' : 'M48.5 31 L50 21 M55.5 13 L54.5 8'} stroke="#FFF6CC" strokeWidth="2.6" strokeLinecap="round" opacity="0.9" />
    </motion.g>
  );
}

/** Little sparks that orbit when Zap is excited. */
function Sparks({ show, still }) {
  if (!show) return null;
  const pts = [[14, 40], [86, 38], [10, 66], [92, 64]];
  return pts.map(([x, y], i) => (
    <motion.path
      key={i}
      d={`M${x} ${y - 5} L${x + 2} ${y} L${x} ${y + 5} L${x - 2} ${y} Z`}
      fill={i % 2 ? GOLD.light : '#FF9EC4'}
      stroke={GOLD.rim} strokeWidth="1"
      initial={still ? false : { opacity: 0, scale: 0.2 }}
      animate={still ? { opacity: 1 } : { opacity: [0, 1, 0], scale: [0.2, 1.1, 0.6] }}
      transition={{ duration: 1.1, delay: i * 0.12, repeat: 2, repeatDelay: 0.4 }}
      style={{ originX: `${x}px`, originY: `${y}px` }}
    />
  ));
}

export function Zap({ mood = 'happy', size = 96, hat, bounce = true, label = 'Zap, your study buddy' }) {
  const reduced = useReducedMotion();
  const calm = useCalm();
  const equipped = useStore((s) => s.equipped.hat);
  const outfit = outfitById(hat === undefined ? equipped : hat);
  const still = reduced || calm;
  const cheering = mood === 'cheer';
  const fullLabel = label && outfit ? `${label}, wearing ${outfit.look}` : label;
  const hatted = outfit?.slot === 'head';
  const gid = `zap${mood}${size}`.replace(/\W/g, '');

  return (
    <motion.div
      {...(fullLabel ? { role: 'img', 'aria-label': fullLabel } : { 'aria-hidden': true })}
      style={{ position: 'relative', width: size, height: size * 1.15, flex: 'none' }}
      animate={still || !bounce ? {} : cheering ? { y: [0, -14, 0, -8, 0] } : mood === 'sad' ? { y: [0, 1.5, 0] } : { y: [0, -3.5, 0] }}
      transition={cheering ? { duration: 0.9 } : { duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
    >
      <svg viewBox="0 0 100 115" width={size} height={size * 1.15} aria-hidden="true" focusable="false" style={{ overflow: 'visible' }}>
        <defs>
          <radialGradient id={`${gid}b`} cx="0.38" cy="0.32" r="0.75">
            <stop offset="0" stopColor={GOLD.light} />
            <stop offset="0.6" stopColor={GOLD.mid} />
            <stop offset="1" stopColor={GOLD.deep} />
          </radialGradient>
          <radialGradient id={`${gid}g`} cx="0.5" cy="0.5" r="0.5">
            <stop offset="0.55" stopColor="#FFD54A" stopOpacity="0.38" />
            <stop offset="1" stopColor="#FFD54A" stopOpacity="0" />
          </radialGradient>
        </defs>
        {/* glow + ground shadow */}
        <circle cx="50" cy="70" r="48" fill={`url(#${gid}g)`} />
        <ellipse cx="50" cy="110" rx="24" ry="3.6" fill="rgb(0 0 0 / 0.16)" />
        <Sparks show={cheering || mood === 'wow'} still={still} />
        <Crest mood={mood} hatted={hatted} still={still} />
        {/* feet */}
        <ellipse cx="39" cy="104" rx="8" ry="5" fill={GOLD.deep} stroke={GOLD.rim} strokeWidth="3" />
        <ellipse cx="61" cy="104" rx="8" ry="5" fill={GOLD.deep} stroke={GOLD.rim} strokeWidth="3" />
        <Arms mood={mood} still={still} />
        {/* body: a soft, slightly pear-shaped blob */}
        <path
          d="M50 34 C71 34 82 50 82 70 C82 91 68 104 50 104 C32 104 18 91 18 70 C18 50 29 34 50 34 Z"
          fill={`url(#${gid}b)`} stroke={GOLD.rim} strokeWidth="3.6"
        />
        {/* shine + belly bolt */}
        <path d="M30 52 Q33 42 43 39" fill="none" stroke="#FFF8D6" strokeWidth="4" strokeLinecap="round" opacity="0.85" />
        <path d="M52 84 L47 92 L52 92 L48 100" fill="none" stroke={GOLD.rim} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.45" />
        {/* cheeks */}
        <ellipse cx="30" cy="72" rx="5.5" ry="3.6" fill="#FF8FA3" opacity="0.65" />
        <ellipse cx="70" cy="72" rx="5.5" ry="3.6" fill="#FF8FA3" opacity="0.65" />
        <Eyes mood={mood} still={still} />
        {MOUTH[mood] ?? MOUTH.happy}
        {mood === 'sleepy' && (
          <motion.text x="74" y="38" fontSize="13" fontWeight="700" fill={GOLD.rim} fontFamily="system-ui, sans-serif"
            animate={still ? {} : { y: [38, 32, 38], opacity: [0.4, 1, 0.4] }} transition={{ duration: 2.4, repeat: 2 }}>z</motion.text>
        )}
        {mood === 'sad' && <path d="M66 68 Q68 73 66 75 Q64 73 66 68 Z" fill="#8FD3FF" stroke="#4A9BC7" strokeWidth="1" />}
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
