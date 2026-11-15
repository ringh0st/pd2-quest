// STUB (replaced by the illustrator): big celebration / state art.
// kind: trophy|chest|rocket|star|levelUp|streak|goal|badge|welcome|flag|calm|oops|empty|lock|placement|plan|install
export function HeroArt({ kind, size = 72, className = '' }) {
  return <svg className={`art hero-art ${className}`} width={size} height={size} viewBox="0 0 72 72" aria-hidden="true" data-kind={kind}><circle cx="36" cy="36" r="32" fill="var(--gold)" opacity="0.5" /></svg>;
}
