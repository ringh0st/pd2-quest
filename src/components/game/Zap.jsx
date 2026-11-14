// Zap ⚡, the mascot: a little lightning bolt with a face. Moods change the face; hats come from the shop.
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

export function Zap({ mood = 'happy', size = 96, hat, bounce = true, label = 'Zap, your study buddy' }) {
  const reduced = useReducedMotion();
  const calm = useCalm();
  const equipped = useStore((s) => s.equipped.hat);
  const hatId = hat === undefined ? equipped : hat;
  const hatEmoji = OUTFITS.find((o) => o.id === hatId)?.emoji;
  const still = reduced || calm;
  const eyesClosed = mood === 'sleepy';
  const cheering = mood === 'cheer';

  return (
    <motion.div
      role="img" aria-label={label}
      style={{ position: 'relative', width: size, height: size * 1.15, flex: 'none' }}
      animate={still || !bounce ? {} : cheering ? { y: [0, -14, 0, -8, 0], rotate: [0, -6, 6, 0] } : { y: [0, -4, 0] }}
      transition={cheering ? { duration: 0.9 } : { duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
    >
      {hatEmoji && (
        <span aria-hidden="true" style={{ position: 'absolute', left: '50%', top: -size * 0.16, transform: 'translateX(-38%) rotate(-8deg)', fontSize: size * 0.42, lineHeight: 1, zIndex: 2 }}>{hatEmoji}</span>
      )}
      <svg viewBox="0 0 100 115" width={size} height={size * 1.15} aria-hidden="true" style={{ overflow: 'visible' }}>
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
          <g stroke="#2B1D00" strokeWidth="3" strokeLinecap="round" fill="none">
            <path d="M37 50 Q41 53 45 50" /><path d="M54 49 Q58 52 62 49" />
          </g>
        ) : (
          <motion.g
            style={{ originY: '50px' }}
            animate={still ? {} : { scaleY: [1, 1, 0.1, 1, 1] }}
            transition={{ duration: 4, repeat: Infinity, times: [0, 0.9, 0.93, 0.96, 1] }}
          >
            <ellipse cx="41" cy="49" rx="4.5" ry={mood === 'wow' ? 6.5 : 5.5} fill="#2B1D00" />
            <ellipse cx="58" cy="48" rx="4.5" ry={mood === 'wow' ? 6.5 : 5.5} fill="#2B1D00" />
            <circle cx="42.5" cy="47" r="1.6" fill="#fff" />
            <circle cx="59.5" cy="46" r="1.6" fill="#fff" />
          </motion.g>
        )}
        {mood === 'think' && <path d="M35 40 L46 42 M53 41 L64 38" stroke="#2B1D00" strokeWidth="2.5" strokeLinecap="round" />}
        <path d={MOUTHS[mood] || MOUTHS.happy} fill={mood === 'cheer' || mood === 'wow' ? '#7A2E00' : 'none'} stroke="#2B1D00" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
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
