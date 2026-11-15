// STUB (replaced by the illustrator): decorative background scenery for a world (absolutely positioned layer).
export function Scenery({ world, variant = 'card', className = '' }) {
  return <div className={`art scenery-layer ${className}`} aria-hidden="true" data-world={world} data-variant={variant} />;
}
