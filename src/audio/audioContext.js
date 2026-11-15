// One shared Web Audio context for sound effects and music. Created lazily and resumed on the first
// tap (browsers block audio until the user interacts). Everything plays through `master`.
let ctx = null;
let master = null;

export function audio() {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 1;
    master.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  return { ctx, master };
}

/** Unlock audio on the first user gesture (iOS Safari needs this). */
export function unlockAudioOnFirstGesture() {
  const unlock = () => { audio(); window.removeEventListener('pointerdown', unlock, true); window.removeEventListener('keydown', unlock, true); };
  window.addEventListener('pointerdown', unlock, true);
  window.addEventListener('keydown', unlock, true);
}
