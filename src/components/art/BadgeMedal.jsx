// STUB (replaced by the illustrator): a badge medal. id: a badge id from src/game/badges.js.
export function BadgeMedal({ id, earned = true, size = 56, className = '' }) {
  return <svg className={`art badge-medal ${className}`} width={size} height={size} viewBox="0 0 56 56" aria-hidden="true" data-badge={id} data-earned={earned}><circle cx="28" cy="28" r="24" fill={earned ? 'var(--gold)' : 'var(--surface-3)'} /></svg>;
}
