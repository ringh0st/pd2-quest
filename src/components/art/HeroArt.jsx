// Big moment art: hand-built vector illustrations for celebrations and empty/edge states.
// kind: trophy|chest|rocket|star|levelUp|streak|goal|badge|welcome|flag|calm|oops|empty|lock|placement|plan|install
// Each one pops in and plays one short flourish (2-3 loops at most). Reduced motion or Calm: static.
// Objects use fixed "toy" colours with a warm ink outline (they read on light and dark); the backdrop
// disc and theme-coloured parts use tokens, so the art follows the accent theme and dark mode.
import { useId } from 'react';
import { motion } from 'motion/react';
import { useReducedMotion, useCalm } from '../../hooks/useMotionPrefs.js';

const INK = '#3A2618';
const GOLD = '#FFC94D';
const GOLD_DARK = '#E0A100';
const GOLD_LIGHT = '#FFE08A';
const CREAM = '#FFF6E8';
const STEEL = '#B8C4D2';
const STEEL_DARK = '#7D8BA0';
const RED = '#E8553A';
const GREEN = '#5FBF7F';
const GREEN_DARK = '#3E9E62';
const TEAL = '#5CD0E8';
const WOOD = '#C0702F';
const WOOD_LIGHT = '#D9853F';

/** Backdrop tint per kind (a token, mixed into the surface by CSS). */
const TONE = {
  trophy: 'var(--gold)', chest: 'var(--gold)', rocket: 'var(--primary)', star: 'var(--gold)', levelUp: 'var(--primary)',
  streak: 'var(--flame-fill)', goal: 'var(--incorrect)', badge: 'var(--primary)', welcome: 'var(--gold)', flag: 'var(--correct)',
  calm: 'var(--sec-auto)', oops: 'var(--flame-fill)', empty: 'var(--text-muted)', lock: 'var(--gold)', placement: 'var(--correct)',
  plan: 'var(--primary)', install: 'var(--correct)',
};

/** Sparkle positions [x, y, scale] per kind. */
const SPARKLES = {
  trophy: [[22, 30, 1], [98, 26, 0.8], [102, 74, 0.6]],
  chest: [[24, 30, 0.8], [96, 24, 1], [104, 64, 0.6]],
  rocket: [[26, 26, 0.8], [94, 92, 0.6], [20, 70, 0.5]],
  star: [[20, 24, 0.8], [100, 28, 0.7], [98, 96, 0.6]],
  levelUp: [[22, 28, 0.8], [100, 32, 1], [102, 66, 0.5]],
  streak: [[24, 34, 0.7], [96, 30, 0.9]],
  goal: [[22, 24, 0.7], [100, 92, 0.6]],
  badge: [[22, 30, 0.9], [100, 26, 0.7], [100, 78, 0.5]],
  welcome: [[24, 28, 0.8], [98, 34, 0.6]],
  flag: [[100, 80, 0.8], [104, 18, 0.6]],
  install: [[22, 30, 0.7], [100, 26, 0.9]],
  plan: [[104, 18, 0.7]],
  placement: [[22, 26, 0.7], [100, 98, 0.5]],
};

function starPath(cx, cy, R, r, n = 5, turn = -90) {
  const pts = [];
  for (let i = 0; i < n * 2; i++) {
    const a = ((turn + (i * 180) / n) * Math.PI) / 180;
    const rad = i % 2 ? r : R;
    pts.push(`${(cx + Math.cos(a) * rad).toFixed(2)} ${(cy + Math.sin(a) * rad).toFixed(2)}`);
  }
  return `M${pts.join('L')}Z`;
}

function scallopPath(cx, cy, R, bump, n) {
  const pts = [];
  const steps = n * 8;
  for (let i = 0; i < steps; i++) {
    const a = (i / steps) * Math.PI * 2;
    const rad = R + bump * Math.cos(a * n);
    pts.push(`${(cx + Math.cos(a) * rad).toFixed(2)} ${(cy + Math.sin(a) * rad).toFixed(2)}`);
  }
  return `M${pts.join('L')}Z`;
}

const SPARK = 'M0 -7Q1.2 -1.2 7 0Q1.2 1.2 0 7Q-1.2 1.2 -7 0Q-1.2 -1.2 0 -7Z';

function Sparkle({ x, y, s, delay, fx }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <motion.path
        d={SPARK} fill={GOLD} stroke={INK} strokeWidth={1.4} strokeLinejoin="round"
        {...fx({ scale: [0, 1.3, 0.8, 1.15, 1], rotate: [0, 45, 0] }, { duration: 1.1, delay, repeat: 0 })}
      />
    </g>
  );
}

/* ---------- the illustrations ---------- */

function Trophy({ fx, uid }) {
  const cup = 'M34 26H86V44C86 62 74 74 60 74C46 74 34 62 34 44Z';
  return (
    <g strokeLinejoin="round" strokeLinecap="round">
      <ellipse cx="60" cy="106" rx="30" ry="5" fill={INK} opacity="0.14" />
      <path d="M36 34C18 34 20 62 44 63M84 34C102 34 100 62 76 63" fill="none" stroke={INK} strokeWidth="10" />
      <path d="M36 34C18 34 20 62 44 63M84 34C102 34 100 62 76 63" fill="none" stroke={GOLD_DARK} strokeWidth="5" />
      <path d="M53 72H67L70 88H50Z" fill={GOLD_DARK} stroke={INK} strokeWidth="2.5" />
      <rect x="44" y="86" width="32" height="9" rx="2" fill={GOLD} stroke={INK} strokeWidth="2.5" />
      <rect x="36" y="94" width="48" height="11" rx="3" fill="#8A5A2B" stroke={INK} strokeWidth="2.5" />
      <rect x="50" y="97" width="20" height="5" rx="1.5" fill={GOLD_LIGHT} />
      <clipPath id={`${uid}cup`}><path d={cup} /></clipPath>
      <path d={cup} fill={GOLD} />
      <g clipPath={`url(#${uid}cup)`}>
        <path d="M72 26H90V76H58C70 70 76 60 76 44Z" fill="#F2A81D" />
        <motion.rect
          x="30" y="18" width="9" height="64" fill="#FFFFFF" opacity="0.55" transform="skewX(-18)"
          {...fx({ x: [0, 64, 0] }, { duration: 1.3, delay: 0.45, repeat: 1, repeatDelay: 0.3 })}
        />
      </g>
      <path d={cup} fill="none" stroke={INK} strokeWidth="2.5" />
      <rect x="31" y="21" width="58" height="9" rx="4.5" fill={GOLD_LIGHT} stroke={INK} strokeWidth="2.5" />
      <path d={starPath(60, 46, 10, 4.4)} fill={CREAM} stroke="#C9921A" strokeWidth="1.6" />
    </g>
  );
}

function Chest({ fx, enter }) {
  return (
    <g strokeLinejoin="round" strokeLinecap="round">
      <ellipse cx="60" cy="104" rx="38" ry="5" fill={INK} opacity="0.14" />
      <motion.path d="M36 58L28 30H92L84 58Z" fill={GOLD_LIGHT} {...enter({ opacity: 0 }, { opacity: 0.75 }, { delay: 0.45, duration: 0.5, type: 'tween' })} />
      {/* lid: lifts and tips back */}
      <motion.g style={{ originX: 0, originY: 1 }} {...enter({ y: 0, rotate: 0 }, { y: -9, rotate: -11 }, { delay: 0.3, stiffness: 300, damping: 12 })}>
        <path d="M26 58V48C26 41 32 38 40 38H80C88 38 94 41 94 48V58Z" fill={WOOD_LIGHT} stroke={INK} strokeWidth="2.5" />
        <rect x="36" y="38" width="8" height="20" fill={GOLD} stroke={INK} strokeWidth="2" />
        <rect x="76" y="38" width="8" height="20" fill={GOLD} stroke={INK} strokeWidth="2" />
      </motion.g>
      {/* coins pop out */}
      {[[47, 52, 0.55], [61, 45, 0.65], [74, 53, 0.75]].map(([x, y, d]) => (
        <motion.g key={x} {...enter({ y: 24, scale: 0, opacity: 0 }, { y: 0, scale: 1, opacity: 1 }, { delay: d, stiffness: 420, damping: 13 })}>
          <circle cx={x} cy={y} r="8" fill={GOLD} stroke={INK} strokeWidth="2.2" />
          <circle cx={x} cy={y} r="4.2" fill="none" stroke="#C9921A" strokeWidth="1.6" />
        </motion.g>
      ))}
      <rect x="26" y="58" width="68" height="40" rx="6" fill={WOOD} stroke={INK} strokeWidth="2.5" />
      <path d="M28 72H92M28 85H92" stroke="#9C5420" strokeWidth="2" />
      <rect x="36" y="58" width="8" height="40" fill={GOLD} stroke={INK} strokeWidth="2" />
      <rect x="76" y="58" width="8" height="40" fill={GOLD} stroke={INK} strokeWidth="2" />
      <rect x="52" y="60" width="16" height="17" rx="3.5" fill={GOLD} stroke={INK} strokeWidth="2.2" />
      <circle cx="60" cy="67" r="2.4" fill={INK} />
      <path d="M60 68V72" stroke={INK} strokeWidth="2.4" />
    </g>
  );
}

function Rocket({ fx, enter }) {
  return (
    <motion.g {...enter({ y: 26, x: -18, opacity: 0 }, { y: 0, x: 0, opacity: 1 }, { delay: 0.1, stiffness: 160, damping: 13 })}>
      <path d="M22 98L36 84M16 86L28 76M32 106L42 94" stroke="var(--text-muted)" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
      <g transform="rotate(38 60 60)" strokeLinejoin="round" strokeLinecap="round">
        <motion.g style={{ originX: 0.5, originY: 0 }} {...fx({ scaleY: [1, 1.3, 0.9, 1.2, 1], scaleX: [1, 0.9, 1.05, 0.92, 1] }, { duration: 0.5, repeat: 3 })}>
          <path d="M50 80C50 92 55 100 60 110C65 100 70 92 70 80Z" fill="#FF9248" stroke={INK} strokeWidth="2.2" />
          <path d="M54.5 80C55 88 57.5 94 60 100C62.5 94 65 88 65.5 80Z" fill={GOLD} />
        </motion.g>
        <rect x="49" y="74" width="22" height="8" rx="2.5" fill={STEEL_DARK} stroke={INK} strokeWidth="2.4" />
        <path d="M47 60L33 80L47 77ZM73 60L87 80L73 77Z" fill="var(--primary)" stroke={INK} strokeWidth="2.4" />
        <path d="M60 14C75 27 79 49 74 76H46C41 49 45 27 60 14Z" fill={CREAM} stroke={INK} strokeWidth="2.6" />
        <path d="M60 14C67 20 71.5 28 73.5 36H46.5C48.5 28 53 20 60 14Z" fill="var(--primary)" stroke={INK} strokeWidth="2.6" />
        <path d="M51 44C50.5 54 51 64 52 72" stroke="#FFFFFF" strokeWidth="3" opacity="0.8" />
        <circle cx="60" cy="50" r="8.5" fill={TEAL} stroke={INK} strokeWidth="2.6" />
        <path d="M56.5 47.5A4.5 4.5 0 0 1 61 45.5" stroke="#FFFFFF" strokeWidth="2" fill="none" />
        <path d="M60 76V68" stroke={INK} strokeWidth="2" opacity="0.4" />
      </g>
    </motion.g>
  );
}

function BigStar({ fx, enter }) {
  return (
    <g strokeLinejoin="round" strokeLinecap="round">
      <motion.g {...fx({ rotate: [0, 30], opacity: [0.4, 1, 0.7] }, { duration: 1.6, repeat: 0, ease: 'easeOut' })}>
        {Array.from({ length: 8 }, (_, i) => (
          <rect key={i} x="57" y="6" width="6" height="16" rx="3" fill={GOLD} opacity="0.85" transform={`rotate(${i * 45} 60 62)`} />
        ))}
      </motion.g>
      <motion.g {...enter({ scale: 0, rotate: -120 }, { scale: 1, rotate: 0 }, { stiffness: 260, damping: 11 })}>
        <path d={starPath(60, 64, 36, 17)} fill={GOLD} stroke={INK} strokeWidth="3" />
        <path d={starPath(60, 64, 24, 11.5)} fill={GOLD_LIGHT} />
        <ellipse cx="52.5" cy="62" rx="2.6" ry="3.4" fill={INK} />
        <ellipse cx="67.5" cy="62" rx="2.6" ry="3.4" fill={INK} />
        <path d="M54 70Q60 75 66 70" fill="none" stroke={INK} strokeWidth="2.6" />
        <circle cx="48" cy="69" r="2.6" fill="#FF9248" opacity="0.7" />
        <circle cx="72" cy="69" r="2.6" fill="#FF9248" opacity="0.7" />
      </motion.g>
    </g>
  );
}

function LevelUp({ fx, enter }) {
  return (
    <g strokeLinejoin="round" strokeLinecap="round">
      <motion.g {...enter({ y: 40, opacity: 0 }, { y: 0, opacity: 1 }, { stiffness: 240, damping: 13 })}>
        <motion.g {...fx({ y: [0, -9, 0] }, { duration: 0.7, delay: 0.5, repeat: 2 })}>
          <path d="M60 12L94 48H75V84H45V48H26Z" fill="var(--primary)" stroke={INK} strokeWidth="3" />
          <path d="M60 12L94 48H75V84H60Z" fill="var(--primary-ledge)" opacity="0.45" />
          <path d="M40 46L58 26" stroke="#FFFFFF" strokeWidth="4" opacity="0.45" />
        </motion.g>
      </motion.g>
      <path d="M30 84H10L17 93L10 102H32Z" fill={GOLD_DARK} stroke={INK} strokeWidth="2.5" />
      <path d="M90 84H110L103 93L110 102H88Z" fill={GOLD_DARK} stroke={INK} strokeWidth="2.5" />
      <path d="M20 80Q60 72 100 80V98Q60 90 20 98Z" fill={GOLD} stroke={INK} strokeWidth="2.8" />
      {[42, 60, 78].map((x, i) => <path key={x} d={starPath(x, 88 - (i === 1 ? 2 : 1), 4.6, 2)} fill="#8A5A00" />)}
    </g>
  );
}

function Streak({ fx, enter }) {
  return (
    <g strokeLinejoin="round" strokeLinecap="round">
      <ellipse cx="60" cy="108" rx="24" ry="4" fill={INK} opacity="0.14" />
      <motion.g {...enter({ scale: 0, y: 30 }, { scale: 1, y: 0 }, { stiffness: 300, damping: 12 })}>
        <motion.g style={{ originX: 0.5, originY: 1 }} {...fx({ scaleY: [1, 1.07, 0.96, 1.05, 1], scaleX: [1, 0.96, 1.03, 0.97, 1], skewX: [0, -3, 2, -1, 0] }, { duration: 0.9, repeat: 2 })}>
          <path d="M60 10C67 30 90 40 90 70C90 92 76 106 60 106C44 106 30 92 30 70C30 54 40 46 45 33C49 43 51 49 55 52C55 38 54 24 60 10Z" fill="#FF9248" stroke={INK} strokeWidth="3" />
          <path d="M60 44C67 56 77 63 77 80C77 94 69 102 60 102C51 102 43 94 43 80C43 70 49 65 51 57C54 63 56 65 58 67C58 59 57 51 60 44Z" fill={GOLD} />
          <ellipse cx="60" cy="88" rx="10" ry="11" fill="#FFF3C4" />
        </motion.g>
        <ellipse cx="53" cy="80" rx="2.6" ry="3.4" fill={INK} />
        <ellipse cx="67" cy="80" rx="2.6" ry="3.4" fill={INK} />
        <path d="M55 87Q60 92 65 87" fill="none" stroke={INK} strokeWidth="2.6" />
      </motion.g>
    </g>
  );
}

function Goal({ fx, enter }) {
  return (
    <g strokeLinejoin="round" strokeLinecap="round">
      <ellipse cx="54" cy="108" rx="30" ry="4" fill={INK} opacity="0.14" />
      <circle cx="54" cy="64" r="40" fill={RED} stroke={INK} strokeWidth="3" />
      <circle cx="54" cy="64" r="30" fill={CREAM} />
      <circle cx="54" cy="64" r="20" fill={RED} />
      <circle cx="54" cy="64" r="10" fill={CREAM} />
      <circle cx="54" cy="64" r="4" fill={RED} />
      <motion.g {...enter({ x: 46, y: -46, opacity: 0 }, { x: 0, y: 0, opacity: 1 }, { delay: 0.25, stiffness: 520, damping: 26 })}>
        <motion.g style={{ originX: 0, originY: 1 }} {...fx({ rotate: [0, -5, 4, -2, 0] }, { duration: 0.5, delay: 0.6, repeat: 1 })}>
          <path d="M55 63L98 20" stroke={INK} strokeWidth="8" />
          <path d="M55 63L98 20" stroke="#8A5A2B" strokeWidth="4" />
          <path d="M92 26L90 10L98 16ZM92 26L108 28L102 20Z" fill="var(--primary)" stroke={INK} strokeWidth="2.2" />
          <path d="M98 20L104 14" stroke={INK} strokeWidth="3" />
        </motion.g>
      </motion.g>
    </g>
  );
}

function Badge({ fx, enter }) {
  return (
    <motion.g style={{ originX: 0.5, originY: 0 }} {...enter({ scale: 0, rotate: -30 }, { scale: 1, rotate: 0 }, { stiffness: 280, damping: 12 })}>
      <motion.g style={{ originX: 0.5, originY: 0 }} {...fx({ rotate: [0, 7, -5, 3, 0] }, { duration: 1.2, delay: 0.5, repeat: 0 })}>
        <g strokeLinejoin="round">
          <path d="M44 64L32 106L44 99L52 110L60 70Z" fill="var(--primary)" stroke={INK} strokeWidth="2.5" />
          <path d="M76 64L88 106L76 99L68 110L60 70Z" fill="var(--primary-ledge)" stroke={INK} strokeWidth="2.5" />
          <path d={scallopPath(60, 52, 34, 3.2, 14)} fill={GOLD} stroke={INK} strokeWidth="2.8" />
          <circle cx="60" cy="52" r="24" fill={GOLD_LIGHT} stroke="#C9921A" strokeWidth="2" />
          <path d={starPath(60, 53, 15, 6.6)} fill="var(--primary)" stroke={INK} strokeWidth="2.4" />
          <path d="M44 40A20 20 0 0 1 58 30" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" opacity="0.7" />
        </g>
      </motion.g>
    </motion.g>
  );
}

function Welcome({ fx, enter }) {
  const skin = GOLD;
  return (
    <motion.g {...enter({ y: 30, opacity: 0 }, { y: 0, opacity: 1 }, { stiffness: 260, damping: 14 })}>
      <motion.path d="M90 22Q100 30 100 42M98 14Q112 26 110 44" fill="none" stroke="var(--text-muted)" strokeWidth="3" strokeLinecap="round"
        {...fx({ opacity: [0, 1, 0.3, 1] }, { duration: 1.2, delay: 0.3, repeat: 1 })} />
      <motion.path d="M30 22Q20 30 20 42M22 14Q8 26 10 44" fill="none" stroke="var(--text-muted)" strokeWidth="3" strokeLinecap="round"
        {...fx({ opacity: [0, 1, 0.3, 1] }, { duration: 1.2, delay: 0.5, repeat: 1 })} />
      <motion.g style={{ originX: 0.5, originY: 1 }} {...fx({ rotate: [0, 16, -10, 16, -6, 0] }, { duration: 1.3, delay: 0.25, repeat: 1 })}>
        <g strokeLinejoin="round" fill={skin} stroke={INK} strokeWidth="2.6">
          <rect x="22" y="58" width="28" height="12" rx="6" transform="rotate(-38 40 64)" />
          {[[40, 30], [51, 22], [62, 24], [73, 32]].map(([x, y]) => <rect key={x} x={x} y={y} width="11" height="40" rx="5.5" />)}
          <rect x="40" y="48" width="44" height="48" rx="16" />
        </g>
        <path d="M46 56H78" stroke={GOLD} strokeWidth="6" />
        <path d="M52 66Q58 72 66 66" fill="none" stroke="#C9921A" strokeWidth="2" strokeLinecap="round" />
        <rect x="44" y="92" width="36" height="14" rx="5" fill="var(--primary)" stroke={INK} strokeWidth="2.6" />
      </motion.g>
    </motion.g>
  );
}

function FinishFlag({ fx, uid }) {
  const flag = 'M36 22C52 15 64 29 80 22C88 18.5 94 19.5 100 22V64C94 61.5 88 60.5 80 64C64 71 52 57 36 64Z';
  const cells = [];
  for (let r = 0; r < 6; r++) for (let c = 0; c < 6; c++) if ((r + c) % 2 === 0) cells.push([36 + c * 11, 14 + r * 10.5]);
  return (
    <g strokeLinejoin="round" strokeLinecap="round">
      <ellipse cx="36" cy="106" rx="24" ry="6" fill={GREEN} stroke={INK} strokeWidth="2.5" />
      <rect x="30" y="16" width="6" height="90" rx="3" fill={STEEL} stroke={INK} strokeWidth="2.5" />
      <circle cx="33" cy="14" r="5.5" fill={GOLD} stroke={INK} strokeWidth="2.5" />
      <motion.g style={{ originX: 0, originY: 0.5 }} {...fx({ skewY: [0, -5, 3, -2, 0], scaleX: [1, 0.96, 1.02, 0.98, 1] }, { duration: 1.1, delay: 0.2, repeat: 2 })}>
        <clipPath id={`${uid}flag`}><path d={flag} /></clipPath>
        <path d={flag} fill={CREAM} />
        <g clipPath={`url(#${uid}flag)`} fill="#2B2420">
          {cells.map(([x, y]) => <rect key={`${x}-${y}`} x={x} y={y} width="11" height="10.5" />)}
        </g>
        <path d={flag} fill="none" stroke={INK} strokeWidth="3" />
      </motion.g>
    </g>
  );
}

function Calm({ fx }) {
  return (
    <g strokeLinejoin="round" strokeLinecap="round">
      <ellipse cx="60" cy="104" rx="34" ry="5" fill={INK} opacity="0.1" />
      <motion.g style={{ originX: 0, originY: 1 }} {...fx({ rotate: [0, -5, 3, -2, 0] }, { duration: 2.6, delay: 0.2, repeat: 1 })}>
        <path d="M32 92L20 104" stroke={INK} strokeWidth="5" />
        <path d="M32 92L20 104" stroke={GREEN_DARK} strokeWidth="2" />
        <path d="M32 92C28 56 52 26 96 20C98 62 74 92 32 92Z" fill={GREEN} />
        <path d="M32 92C52 70 72 46 96 20C98 62 74 92 32 92Z" fill={GREEN_DARK} />
        <path d="M32 92C28 56 52 26 96 20C98 62 74 92 32 92Z" fill="none" stroke={INK} strokeWidth="3" />
        <path d="M32 92C52 70 72 46 94 22M48 74L44 56M60 62L58 44M72 48L72 34M56 68L74 70M68 54L84 56" fill="none" stroke="#2E7A4A" strokeWidth="2.2" />
      </motion.g>
      <path d="M76 70C76 70 70 78 70 82A6 6 0 0 0 82 82C82 78 76 70 76 70Z" fill="#BFEFF7" stroke={INK} strokeWidth="2" />
      <path d="M73.5 81A2.5 2.5 0 0 0 75 84" stroke="#FFFFFF" strokeWidth="1.6" fill="none" />
    </g>
  );
}

function Oops({ fx, enter }) {
  return (
    <g strokeLinejoin="round" strokeLinecap="round">
      <ellipse cx="60" cy="106" rx="34" ry="5" fill={INK} opacity="0.12" />
      <g transform="rotate(-32 60 62)">
        <motion.g {...fx({ rotate: [0, 9, -6, 4, 0] }, { duration: 0.8, delay: 0.25, repeat: 1 })}>
          <rect x="30" y="55" width="54" height="13" rx="6.5" fill={STEEL} stroke={INK} strokeWidth="2.6" />
          <path d="M36 58.5H78" stroke="#FFFFFF" strokeWidth="2.4" opacity="0.7" />
          <circle cx="90" cy="61.5" r="16" fill={STEEL} stroke={INK} strokeWidth="2.6" />
          <path d="M93 54H108V69H93Z" className="ha-disc" />
          <path d="M108 54H93V69H108" fill="none" stroke={INK} strokeWidth="2.6" />
          <circle cx="28" cy="61.5" r="11" fill={STEEL} stroke={INK} strokeWidth="2.6" />
          <circle cx="28" cy="61.5" r="4.5" className="ha-disc" stroke={INK} strokeWidth="2.2" />
        </motion.g>
      </g>
      <motion.g {...enter({ y: -30, opacity: 0 }, { y: 0, opacity: 1 }, { delay: 0.35, stiffness: 400, damping: 9 })}>
        <path d={starPath(84, 94, 10, 10 * 0.866, 6, 0)} fill={STEEL_DARK} stroke={INK} strokeWidth="2.4" />
        <circle cx="84" cy="94" r="3.6" className="ha-disc" stroke={INK} strokeWidth="2" />
      </motion.g>
      <path d="M30 24C30 24 25 31 25 34A5 5 0 0 0 35 34C35 31 30 24 30 24Z" fill="#BFEFF7" stroke={INK} strokeWidth="2" />
    </g>
  );
}

function Empty({ fx }) {
  return (
    <g strokeLinejoin="round" strokeLinecap="round">
      <ellipse cx="60" cy="106" rx="38" ry="5" fill={INK} opacity="0.12" />
      {[[50, 34, 0], [66, 28, 0.35], [58, 20, 0.7]].map(([x, y, d]) => (
        <motion.circle key={x} cx={x} cy={y} r="3.5" fill="var(--text-muted)" opacity="0.5"
          {...fx({ y: [8, -6], opacity: [0, 0.6, 0] }, { duration: 1.4, delay: d, repeat: 2, ease: 'easeOut' }, { opacity: 0.45 })} />
      ))}
      <path d="M28 56L40 44H80L92 56Z" fill="#9C6A3A" stroke={INK} strokeWidth="2.5" />
      <motion.path d="M40 44L28 56L10 46L22 34Z" fill="#E8B57E" stroke={INK} strokeWidth="2.5" style={{ originX: 1, originY: 1 }}
        {...fx({ rotate: [0, -10, 0] }, { duration: 0.8, delay: 0.2, repeat: 1 })} />
      <motion.path d="M80 44L92 56L110 46L98 34Z" fill="#E8B57E" stroke={INK} strokeWidth="2.5" style={{ originX: 0, originY: 1 }}
        {...fx({ rotate: [0, 10, 0] }, { duration: 0.8, delay: 0.3, repeat: 1 })} />
      <path d="M28 56H92V96C92 98.5 90.5 100 88 100H32C29.5 100 28 98.5 28 96Z" fill="#D9A066" stroke={INK} strokeWidth="2.5" />
      <rect x="48" y="68" width="24" height="12" rx="3" fill={CREAM} stroke={INK} strokeWidth="2" />
      <path d="M53 74H67" stroke={INK} strokeWidth="2" opacity="0.4" />
    </g>
  );
}

function Padlock({ fx, enter }) {
  return (
    <g strokeLinejoin="round" strokeLinecap="round">
      <ellipse cx="60" cy="108" rx="30" ry="4" fill={INK} opacity="0.14" />
      <motion.g style={{ originX: 0.5, originY: 0 }} {...fx({ rotate: [0, -9, 8, -5, 4, 0] }, { duration: 0.7, delay: 0.35, repeat: 1 })}>
        <motion.g {...enter({ y: -8 }, { y: 0 }, { delay: 0.2, stiffness: 600, damping: 14 })}>
          <path d="M42 56V40C42 28 50 20 60 20C70 20 78 28 78 40V56" fill="none" stroke={INK} strokeWidth="13" />
          <path d="M42 56V40C42 28 50 20 60 20C70 20 78 28 78 40V56" fill="none" stroke={STEEL} strokeWidth="7" />
        </motion.g>
        <rect x="28" y="50" width="64" height="54" rx="13" fill={GOLD} stroke={INK} strokeWidth="3" />
        <path d="M74 52H79C86 52 90 56 90 63V91C90 98 86 102 79 102H74Z" fill={GOLD_DARK} opacity="0.55" />
        <path d="M36 62V90" stroke="#FFFFFF" strokeWidth="4" opacity="0.5" />
        <circle cx="60" cy="72" r="6.5" fill={INK} />
        <path d="M57 74L55 89H65L63 74Z" fill={INK} />
      </motion.g>
    </g>
  );
}

function CompassArt({ enter }) {
  return (
    <g strokeLinejoin="round" strokeLinecap="round">
      <ellipse cx="60" cy="108" rx="32" ry="4" fill={INK} opacity="0.14" />
      <circle cx="60" cy="17" r="6" fill="none" stroke={INK} strokeWidth="5" />
      <circle cx="60" cy="17" r="6" fill="none" stroke={GOLD_DARK} strokeWidth="2" />
      <circle cx="60" cy="63" r="42" fill={GOLD_DARK} stroke={INK} strokeWidth="3" />
      <circle cx="60" cy="63" r="34" fill={CREAM} stroke={INK} strokeWidth="2.2" />
      {[0, 90, 180, 270].map((a) => <rect key={a} x="58" y="31" width="4" height="9" rx="2" fill={INK} transform={`rotate(${a} 60 63)`} />)}
      {[45, 135, 225, 315].map((a) => <circle key={a} cx="60" cy="34.5" r="2" fill={INK} opacity="0.45" transform={`rotate(${a} 60 63)`} />)}
      <motion.g {...enter({ rotate: -140 }, { rotate: 24 }, { delay: 0.2, stiffness: 70, damping: 6 })}>
        <path d="M60 35L68 63H52Z" fill={RED} stroke={INK} strokeWidth="2.2" />
        <path d="M60 91L68 63H52Z" fill={STEEL} stroke={INK} strokeWidth="2.2" />
      </motion.g>
      <circle cx="60" cy="63" r="4.5" fill={GOLD} stroke={INK} strokeWidth="2" />
    </g>
  );
}

function PlanArt({ enter }) {
  const cells = [];
  for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) cells.push([31 + c * 16, 55 + r * 14, r * 4 + c]);
  return (
    <g strokeLinejoin="round" strokeLinecap="round">
      <ellipse cx="60" cy="108" rx="36" ry="4" fill={INK} opacity="0.14" />
      <rect x="22" y="26" width="76" height="76" rx="12" fill={CREAM} stroke={INK} strokeWidth="3" />
      <path d="M22 39C22 31.8 27.8 26 35 26H85C92.2 26 98 31.8 98 39V46H22Z" fill="var(--primary)" stroke={INK} strokeWidth="3" />
      <rect x="38" y="16" width="8" height="18" rx="4" fill={STEEL} stroke={INK} strokeWidth="2.5" />
      <rect x="74" y="16" width="8" height="18" rx="4" fill={STEEL} stroke={INK} strokeWidth="2.5" />
      {cells.map(([x, y, i]) => i !== 6 && (
        <rect key={i} x={x} y={y} width="10" height="9" rx="2.5" fill={i < 6 ? GOLD : '#E6D9C6'} stroke={i < 6 ? '#C9921A' : 'none'} strokeWidth="1.4" />
      ))}
      <motion.g {...enter({ scale: 0 }, { scale: 1 }, { delay: 0.35, stiffness: 420, damping: 11 })}>
        <circle cx="68" cy="73.5" r="11" fill="#2DB888" stroke={INK} strokeWidth="2.5" />
        <motion.path d="M62.5 73.5L66.5 77.5L74 69.5" fill="none" stroke="#FFFFFF" strokeWidth="3.4"
          {...enter({ pathLength: 0 }, { pathLength: 1 }, { delay: 0.6, type: 'tween', duration: 0.35 })} />
      </motion.g>
    </g>
  );
}

function Install({ fx, enter }) {
  return (
    <g strokeLinejoin="round" strokeLinecap="round">
      <ellipse cx="60" cy="110" rx="28" ry="4" fill={INK} opacity="0.14" />
      <rect x="35" y="10" width="50" height="98" rx="11" fill="#5B6B80" stroke={INK} strokeWidth="3" />
      <rect x="40.5" y="21" width="39" height="76" rx="4.5" fill={CREAM} />
      <rect x="53" y="14.5" width="14" height="3" rx="1.5" fill={INK} opacity="0.6" />
      <rect x="52" y="100.5" width="16" height="3" rx="1.5" fill={CREAM} opacity="0.7" />
      <motion.g {...fx({ y: [0, 7, 0] }, { duration: 0.65, delay: 0.3, repeat: 2 })}>
        <path d="M60 32V58M50 49L60 59L70 49" fill="none" stroke="var(--primary)" strokeWidth="6" />
      </motion.g>
      <path d="M48 64V70H72V64" fill="none" stroke={INK} strokeWidth="3.5" />
      <motion.g {...enter({ scale: 0, opacity: 0 }, { scale: 1, opacity: 1 }, { delay: 1.3, stiffness: 420, damping: 12 })}>
        <rect x="51" y="76" width="18" height="16" rx="5" fill={GOLD} stroke={INK} strokeWidth="2.2" />
        <path d="M61.5 79L56.5 85H60L58.5 89.5L63.5 83H60Z" fill={INK} />
      </motion.g>
    </g>
  );
}

const ART = {
  trophy: Trophy, chest: Chest, rocket: Rocket, star: BigStar, levelUp: LevelUp, streak: Streak, goal: Goal, badge: Badge,
  welcome: Welcome, flag: FinishFlag, calm: Calm, oops: Oops, empty: Empty, lock: Padlock, placement: CompassArt, plan: PlanArt,
  install: Install,
};

export const HERO_KINDS = Object.keys(ART);

/**
 * <HeroArt kind="trophy" size={110} /> · decorative (aria-hidden) unless `label` is given.
 * Pops in, plays one short flourish, then rests. Static with reduced motion or Calm mode.
 */
export function HeroArt({ kind, size = 72, className = '', label }) {
  const reduced = useReducedMotion();
  const calm = useCalm();
  const still = reduced || calm;
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '') + 'ha';
  const Art = ART[kind] ?? ART.star;

  /** A short loop: `keyframes` normally, `rest` (default: none) when motion is off. */
  const fx = (keyframes, transition = {}, rest = {}) => (still
    ? { initial: false, animate: rest }
    : { animate: keyframes, transition: { duration: 0.9, repeat: 2, ease: 'easeInOut', ...transition } });
  /** An entrance from `from` to `to`; with motion off it simply shows `to`. */
  const enter = (from, to, transition = {}) => ({
    initial: still ? false : from,
    animate: to,
    transition: { type: 'spring', stiffness: 260, damping: 14, ...transition },
  });

  return (
    <svg
      className={`art hero-art ${className}`} width={size} height={size} viewBox="0 0 120 120" data-kind={kind}
      role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : true} focusable="false"
      style={{ '--ha-tone': TONE[kind] ?? 'var(--gold)' }}
    >
      <circle cx="60" cy="60" r="57" className="ha-disc" />
      <motion.g {...enter({ scale: 0.5, opacity: 0 }, { scale: 1, opacity: 1 }, { stiffness: 380, damping: 18 })}>
        <Art fx={fx} enter={enter} uid={uid} />
      </motion.g>
      {(SPARKLES[kind] ?? []).map(([x, y, s], i) => <Sparkle key={i} x={x} y={y} s={s} delay={0.35 + i * 0.18} fx={fx} />)}
    </svg>
  );
}
