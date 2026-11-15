// App updates without "open it twice": a new version found while the opening splash is up is applied
// at once (the reload is hidden behind the splash); later, a small banner offers it, but never in the
// middle of a lesson, practice or exam. Also checks for updates every 30 minutes.
import { registerSW } from 'virtual:pwa-register';

let applyUpdate = null;
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
      if (splashUp) applyUpdate?.(true); // quietly reload behind the splash
      else emit();
    },
    onRegisteredSW(_url, reg) {
      if (reg) setInterval(() => reg.update().catch(() => {}), 30 * 60 * 1000);
    },
  });
}

/** The splash tells us when it is gone (after that, updates wait for the banner). */
export function setSplashUp(up) { splashUp = up; if (!up) emit(); }

export const updateReady = () => waiting && !splashUp;
export function subscribeUpdates(fn) { subs.add(fn); return () => subs.delete(fn); }
export function installUpdate() { applyUpdate?.(true); }
