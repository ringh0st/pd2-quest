// Install prompt: captures Chromium's beforeinstallprompt early and remembers when the app was added.
import { isIos, isStandalone } from './displayMode.js';

const KEY = 'pd2quest.install.v1';

let deferredPrompt = null;
let installed = false;
const listeners = new Set();
const notify = () => listeners.forEach((fn) => fn());

/** Call once at startup (before React renders) so the event isn't missed. */
export function initInstallCapture() {
  if (typeof window === 'undefined' || window.__pd2InstallCapture) return;
  window.__pd2InstallCapture = true;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault(); // keep the browser's own mini-infobar away; the 📲 button offers it instead
    deferredPrompt = e;
    notify();
  });
  window.addEventListener('appinstalled', () => {
    installed = true;
    deferredPrompt = null;
    writeInstallState({ installed: true });
    notify();
  });
}

export function subscribeInstall(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** 'prompt' (Chromium button), 'ios' (Share → Add to Home Screen steps) or null (nothing to offer). */
export function installMode() {
  if (installed || isStandalone()) return null;
  if (deferredPrompt) return 'prompt';
  return isIos() ? 'ios' : null;
}

export function readInstallState() {
  try {
    const s = JSON.parse(localStorage.getItem(KEY) ?? 'null');
    return { installed: s?.installed === true };
  } catch {
    return { installed: false };
  }
}

function writeInstallState(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch { /* storage blocked: the button may show again next time */ }
}

/**
 * True once the app is on the home screen as far as we can tell: running standalone, the browser
 * reported an install (Android/desktop), or the learner tapped "I added it" (iPhone Safari never reports it).
 */
export function installDone() {
  return installed || isStandalone() || readInstallState().installed;
}

/** "✓ I added it": hide every install hint in this browser from now on. */
export function markInstalled() {
  installed = true;
  deferredPrompt = null;
  writeInstallState({ installed: true });
  notify();
}

/** Opens Chromium's install dialog. Resolves to 'accepted' | 'dismissed' | 'unavailable'. */
export async function promptInstall() {
  const e = deferredPrompt;
  if (!e) return 'unavailable';
  deferredPrompt = null; // a prompt event can be used only once
  try {
    await e.prompt();
    const { outcome } = await e.userChoice;
    if (outcome === 'accepted') markInstalled();
    else notify();
    return outcome;
  } catch {
    notify();
    return 'unavailable';
  }
}
