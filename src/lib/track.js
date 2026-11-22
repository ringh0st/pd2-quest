// Which exam the app is studying for. One app, one track at a time (Developer I, Developer II, Builder, JavaScript, YKI).
// Track names are our own ("… Quest"); Salesforce's exam names appear only to say which exam a track prepares for.
// The track is chosen on the opening screen and kept on this device; switching reloads the app,
// so every screen and every piece of saved progress belongs to one exam.
const TRACK_KEY = 'devquest.track';

// Everything that differs between the exams lives here or in the exam's content folder (src/data/<id>/:
// exam.json for the exam facts, one file per section). `sections` lists the section files in the
// official exam guide's order; a section id picks its world look (game/worlds.js) and accent colour.
// `playground`: the exam's code runs in a browser, so code examples get "Try it" and there's a Playground screen.
export const TRACKS = {
  pd1: { id: 'pd1', name: 'Developer I Quest', short: 'PD1', exam: 'Salesforce Platform Developer I', prefix: 'pd1quest', sections: ['fund', 'auto', 'ui', 'test'] },
  pd2: { id: 'pd2', name: 'Developer II Quest', short: 'PD2', exam: 'Salesforce Platform Developer II', prefix: 'pd2quest', sections: ['fund', 'auto', 'ui', 'test', 'perf'] },
  pab: { id: 'pab', name: 'Builder Quest', short: 'App Builder', exam: 'Salesforce Platform App Builder', prefix: 'pabquest', sections: ['fund', 'data', 'logic', 'ui', 'deploy'] },
  js: { id: 'js', name: 'JavaScript Quest', short: 'JavaScript', exam: 'Salesforce JavaScript Developer', prefix: 'jsquest', playground: true, sections: ['types', 'objects', 'browser', 'debug', 'async', 'server', 'testing'] },
  // Finnish for the YKI intermediate test. Admin-only for now (`adminOnly`): only owners see it in the exam lists.
  // `lang`: the language being learned (read aloud with a Finnish voice; typed answers in lessons and practice).
  yki: { id: 'yki', name: 'YKI Quest', short: 'Finnish', exam: 'YKI Finnish, intermediate (grade 3)', prefix: 'ykiquest', adminOnly: true, lang: 'fi', sections: ['sounds', 'town'] }, // 'verbs' (world 3) is written; add it here to switch it on
};
export const TRACK_IDS = Object.keys(TRACKS);

const ADMIN_KEY = 'devquest.admin';
/** Remembered when an admin signs in (lib/auth.js), so admin-only exams show in the lists from the first screen. */
export function rememberAdmin(on) {
  try { if (on) localStorage.setItem(ADMIN_KEY, '1'); else localStorage.removeItem(ADMIN_KEY); } catch { /* ignore */ }
}
const isAdminHere = () => { try { return localStorage.getItem(ADMIN_KEY) === '1'; } catch { return false; } };
/** The exams this person can pick: admin-only ones only for admins (and always the one being studied). */
export function visibleTrackIds() {
  return TRACK_IDS.filter((id) => !TRACKS[id].adminOnly || isAdminHere() || id === currentTrack);
}

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
  // Start the other exam at its Home: the current screen (a lesson, the welcome screen…) belongs to this exam.
  window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}#/`);
  window.location.reload();
}
/** True once, right after a switch: the reload skips the opening screen. */
export function takeSkipSplash() {
  try { const v = sessionStorage.getItem(SKIP_SPLASH); sessionStorage.removeItem(SKIP_SPLASH); return v === '1'; } catch { return false; }
}
