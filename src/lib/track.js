// Which exam the app is studying for. One app, one track at a time: PD1 Quest or PD2 Quest.
// The track is chosen on the opening screen and kept on this device; switching reloads the app,
// so every screen and every piece of saved progress belongs to one exam.
const TRACK_KEY = 'devquest.track';

// Everything that differs between the exams lives here or in the exam's content folder (src/data/<id>/:
// exam.json for the exam facts, one file per section). `sections` lists the section files in the
// official exam guide's order; a section id picks its world look (game/worlds.js) and accent colour.
export const TRACKS = {
  pd1: { id: 'pd1', name: 'PD1 Quest', short: 'PD1', exam: 'Salesforce Platform Developer I', prefix: 'pd1quest', sections: ['fund', 'auto', 'ui', 'test'] },
  pd2: { id: 'pd2', name: 'PD2 Quest', short: 'PD2', exam: 'Salesforce Platform Developer II', prefix: 'pd2quest', sections: ['fund', 'auto', 'ui', 'test', 'perf'] },
};
export const TRACK_IDS = Object.keys(TRACKS);

function readTrack() {
  try {
    const saved = localStorage.getItem(TRACK_KEY);
    if (saved && TRACKS[saved]) return saved;
  } catch { /* storage blocked: fall through */ }
  return 'pd2'; // everyone who used the app before tracks existed was studying PD2
}

/** True once a track was picked on this device (before that, the opening screen asks). */
export function hasChosenTrack() {
  try { return !!TRACKS[localStorage.getItem(TRACK_KEY)]; } catch { return false; }
}

export const currentTrack = typeof localStorage === 'undefined' ? 'pd2' : readTrack();
export const track = TRACKS[currentTrack];

/** A storage key for this track: PD2 keeps its original keys (so existing progress stays), PD1 gets its own. */
export const trackKey = (pd2Key) => pd2Key.replace(/^pd2quest/, track.prefix);

/** Remember the choice. Returns true when the app needs a reload to switch exams. */
export function chooseTrack(id) {
  if (!TRACKS[id]) return false;
  try { localStorage.setItem(TRACK_KEY, id); } catch { /* ignore */ }
  return id !== currentTrack;
}

const SKIP_SPLASH = 'devquest.skipSplash';
/** Switch exams: reload straight into the app (the opening screen was already seen). */
export function switchTrack(id) {
  if (!chooseTrack(id)) return;
  try { sessionStorage.setItem(SKIP_SPLASH, '1'); } catch { /* ignore */ }
  window.location.reload();
}
/** True once, right after a switch: the reload skips the opening screen. */
export function takeSkipSplash() {
  try { const v = sessionStorage.getItem(SKIP_SPLASH); sessionStorage.removeItem(SKIP_SPLASH); return v === '1'; } catch { return false; }
}
