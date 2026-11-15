// Badge medals: one design system for every badge in src/game/badges.js.
// A medal = ribbon tails + a body shape (rosette | shield | hex | star) + a central Icon glyph.
// Each badge has its own glyph and colour pair (`tone`). Unearned medals are greyed AND carry a lock,
// so they are told apart by more than colour.
import { Icon } from '../icons/Icon.jsx';
import { BADGES } from '../../game/badges.js';

const INK_EDGE = '#3A2618';

/** Fixed "metal" pairs: they are objects, so they read the same on light and dark. */
const TONES = {
  gold: { rim: '#F5B729', ledge: '#C98A0E', face: '#FFE08A', ink: '#5C3A00', ribbon: '#E8553A', ribbon2: '#B83A22' },
  rose: { rim: '#EC5C9E', ledge: '#B53574', face: '#FFC9E0', ink: '#5E0B36', ribbon: '#FFB938', ribbon2: '#D18A12' },
  teal: { rim: '#23A9C2', ledge: '#157C91', face: '#B2EAF4', ink: '#053A45', ribbon: '#FF8F4A', ribbon2: '#D0662A' },
  mint: { rim: '#2DB888', ledge: '#1D8762', face: '#B8F0D8', ink: '#063D29', ribbon: '#F5B729', ribbon2: '#C98A0E' },
  flame: { rim: '#F7843A', ledge: '#C35B1A', face: '#FFD6B2', ink: '#5A2000', ribbon: '#23A9C2', ribbon2: '#157C91' },
  berry: { rim: '#D84468', ledge: '#A12A49', face: '#FFC8D4', ink: '#520B1E', ribbon: '#2DB888', ribbon2: '#1D8762' },
  plum: { rim: '#9A6AD6', ledge: '#6E46A6', face: '#E6D7F8', ink: '#2E1158', ribbon: '#F5B729', ribbon2: '#C98A0E' },
  steel: { rim: '#8796AC', ledge: '#5F6D82', face: '#E0E6EE', ink: '#1F2937', ribbon: '#EC5C9E', ribbon2: '#B53574' },
};

const CX = 32;
const CY = 27;

function polar(n, radiusAt, turn = -90) {
  const pts = [];
  for (let i = 0; i < n; i++) {
    const a = ((turn + (i * 360) / n) * Math.PI) / 180;
    const r = radiusAt(i, a);
    pts.push(`${(CX + Math.cos(a) * r).toFixed(2)} ${(CY + Math.sin(a) * r).toFixed(2)}`);
  }
  return `M${pts.join('L')}Z`;
}

const SHAPES = {
  rosette: { body: polar(112, (i, a) => 21.5 + 1.9 * Math.cos((a + Math.PI / 2) * 14)), face: 'circle' },
  shield: { body: 'M32 3.5L51 9.5V25C51 38 43 46 32 51C21 46 13 38 13 25V9.5Z', face: 'scaled' },
  hex: { body: polar(6, () => 23.5), face: 'scaled' },
  star: { body: polar(16, (i) => (i % 2 ? 19 : 24.5), -90), face: 'circle' },
};

const ITEM = Object.fromEntries(BADGES.map((b) => [b.id, b]));

/** <BadgeMedal id="combo5" earned size={56} /> · decorative unless `label` is given. */
export function BadgeMedal({ id, earned = true, size = 56, className = '', label }) {
  const badge = ITEM[id] ?? { icon: 'medal', tone: 'gold', shape: 'rosette' };
  const t = TONES[badge.tone] ?? TONES.gold;
  const shape = SHAPES[badge.shape] ?? SHAPES.rosette;
  const off = !earned;
  const c = off
    ? { rim: 'var(--surface-3)', ledge: 'var(--border)', face: 'var(--surface-2)', ink: 'var(--text-muted)', ribbon: 'var(--surface-3)', ribbon2: 'var(--surface-3)', edge: 'var(--border)' }
    : { ...t, edge: INK_EDGE };
  const faceTransform = `translate(${CX} ${CY}) scale(0.74) translate(${-CX} ${-CY})`;

  return (
    <svg
      className={`art badge-medal${off ? ' locked' : ''} ${className}`} width={size} height={size} viewBox="0 0 64 64"
      data-badge={id} data-earned={earned} focusable="false"
      role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : true}
    >
      <g strokeLinejoin="round" strokeWidth="1.6" stroke={c.edge}>
        {/* ribbon tails */}
        <path d="M24 38L16 61L22.5 57.5L27 63L33 42Z" fill={c.ribbon} />
        <path d="M40 38L48 61L41.5 57.5L37 63L31 42Z" fill={c.ribbon2} />
        {/* ledge, body, face */}
        <path d={shape.body} fill={c.ledge} transform="translate(0 2)" />
        <path d={shape.body} fill={c.rim} />
        {shape.face === 'circle'
          ? <circle cx={CX} cy={CY} r="15.5" fill={c.face} strokeWidth="1.2" stroke={off ? c.edge : c.ledge} />
          : <path d={shape.body} transform={faceTransform} fill={c.face} strokeWidth="1.5" stroke={off ? c.edge : c.ledge} />}
      </g>
      {!off && <path d="M20.5 22A12.5 12.5 0 0 1 28 14.5" fill="none" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" opacity="0.75" />}
      <g transform={`translate(${CX - 10} ${CY - 10})`} style={{ color: c.ink }} opacity={off ? 0.55 : 1}>
        <Icon name={badge.icon} size={20} strokeWidth={2.4} />
      </g>
      {off && (
        <g>
          <circle cx="49" cy="46" r="9.5" fill="var(--text-muted)" stroke="var(--surface)" strokeWidth="2.5" />
          <g transform="translate(43.5 40.5)" style={{ color: 'var(--surface)' }}>
            <Icon name="lock" size={11} strokeWidth={2.8} />
          </g>
        </g>
      )}
    </svg>
  );
}
