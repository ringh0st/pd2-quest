// STUB (replaced by the illustrator): a world's boss character. mood: idle|hit|taunt|defeated.
export function BossArt({ world, size = 96, mood = 'idle', className = '' }) {
  return <svg className={`art boss-art ${className}`} width={size} height={size} viewBox="0 0 96 96" aria-hidden="true" data-world={world} data-mood={mood}><rect x="8" y="8" width="80" height="80" rx="24" fill="var(--incorrect-bg)" /></svg>;
}
