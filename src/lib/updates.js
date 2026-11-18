// App updates without "open it twice": a new version found while the opening splash is up is applied
// at once (the reload is hidden behind the splash); later, a small banner offers it, but never in the
// middle of a lesson, practice or exam. Also checks for updates every 30 minutes.
import { registerSW } from 'virtual:pwa-register';

let applyUpdate = null;
let registration = null;
let waiting = false;
let splashUp = true;
const subs = new Set();
const emit = () => subs.forEach((f) => f());

export function initUpdates() {
  if (!('serviceWorker' in navigator)) return;
  applyUpdate = registerSW({
    immediate: true,
    onNeedRefresh() {
      waiting = true;
      if (splashUp) installUpdate(); // quietly reload behind the splash
      else emit();
    },
    onRegisteredSW(_url, reg) {
      registration = reg ?? null;
      if (reg) setInterval(() => reg.update().catch(() => {}), 30 * 60 * 1000);
    },
  });
}

/** The splash tells us when it is gone (after that, updates wait for the banner). */
export function setSplashUp(up) { splashUp = up; if (!up) emit(); }

export const updateReady = () => waiting && !splashUp;
export function subscribeUpdates(fn) { subs.add(fn); return () => subs.delete(fn); }
/**
 * Switches to the new version and reloads. The plugin's own update reloads only for a version it found itself;
 * one found by the 30-minute check or in another tab would wait forever. So: tell the waiting version to take
 * over directly, reload as soon as it does, and reload anyway after a few seconds.
 */
let reloading = false;
export function installUpdate() {
  const reload = () => { if (!reloading) { reloading = true; window.location.reload(); } };
  navigator.serviceWorker?.addEventListener('controllerchange', reload, { once: true });
  registration?.waiting?.postMessage({ type: 'SKIP_WAITING' });
  applyUpdate?.(true);
  setTimeout(reload, 3000);
}
