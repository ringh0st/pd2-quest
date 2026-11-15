// STUB (replaced by the illustrator): a world's emblem. world: fund|auto|ui|test|perf.
export function WorldEmblem({ world, size = 48, className = '' }) {
  return <svg className={`art world-emblem ${className}`} width={size} height={size} viewBox="0 0 48 48" aria-hidden="true" data-world={world}><circle cx="24" cy="24" r="22" fill="var(--primary-soft)" /></svg>;
}
