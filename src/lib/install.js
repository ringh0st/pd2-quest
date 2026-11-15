// Install prompt: captures Chromium's beforeinstallprompt early and caps how often the card shows.
import { isIos, isStandalone } from './displayMode.js';

const KEY = 'pd2quest.install.v1';
export const MAX_INSTALL_SHOWS = 2;
const SNOOZE_MS = 3 * 24 * 60 * 60 * 1000; // "Not now" keeps it away for a few days

let deferredPrompt = null;
let installed = false;
const listeners = new Set();
const notify = () => listeners.forEach((fn) => fn());

/** Call once at startup (before React renders) so the event isn't missed. */
export function initInstallCapture() {
  if (typeof window === 'undefined' || window.__pd2InstallCapture) return;
  window.__pd2InstallCapture = true;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault(); // keep the browser's own mini-infobar away; our card asks at a calm moment
    deferredPrompt = e;
    notify();
  });
  window.addEventListener('appinstalled', () => {
    installed = true;
    deferredPrompt = null;
    writeInstallState({ ...readInstallState(), installed: true });
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
    return { shows: Number(s?.shows) || 0, snoozedAt: Number(s?.snoozedAt) || 0, installed: s?.installed === true };
  } catch {
    return { shows: 0, snoozedAt: 0, installed: false };
  }
}

function writeInstallState(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch { /* storage blocked: the card may show again, still capped per session */ }
}

let countedThisSession = false;
let hiddenThisSession = false;

/** True while the card may appear: not installed, under the show cap, not snoozed. */
export function installCardAllowed(now = Date.now()) {
  const s = readInstallState();
  if (s.installed || hiddenThisSession) return false;
  if (countedThisSession) return true; // this session's show already counted: keep it steady
  return s.shows < MAX_INSTALL_SHOWS && now - s.snoozedAt > SNOOZE_MS;
}

/** Counts one show per app session. */
export function markInstallCardShown() {
  if (countedThisSession) return;
  countedThisSession = true;
  const s = readInstallState();
  writeInstallState({ ...s, shows: s.shows + 1 });
}

export function snoozeInstallCard() {
  writeInstallState({ ...readInstallState(), snoozedAt: Date.now() });
  hiddenThisSession = true;
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
    if (outcome === 'accepted') {
      installed = true;
      writeInstallState({ ...readInstallState(), installed: true });
    } else {
      snoozeInstallCard();
    }
    notify();
    return outcome;
  } catch {
    notify();
    return 'unavailable';
  }
}
