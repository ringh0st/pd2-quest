// One-tap sensory presets: sound, haptics, confetti, motion and the focus timer together.
export const FEEL_PRESETS = {
  calm: { label: '🌿 Calm', settings: { calm: true, sound: false, haptics: false, confetti: false, motion: 'reduced', focusMinutes: 0 } },
  balanced: { label: '🙂 Balanced', settings: { calm: false, sound: true, haptics: true, confetti: false, motion: 'system', focusMinutes: 10 } },
  party: { label: '🎉 Party', settings: { calm: false, sound: true, haptics: true, confetti: true, motion: 'full', focusMinutes: 10 } },
};

/** Which preset the current settings match exactly, or null when customised. */
export function presetFor(settings) {
  const hit = Object.entries(FEEL_PRESETS).find(([, p]) => Object.entries(p.settings).every(([k, v]) => (settings[k] ?? (k === 'confetti' ? true : undefined)) === v));
  return hit ? hit[0] : null;
}
