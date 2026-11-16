// Open the start menu (the opening screen's exam picker) from anywhere in the app, to change exams.
const listeners = new Set();
let requested = false;

export function openStartMenu() {
  requested = true;
  listeners.forEach((fn) => fn());
}

/** Called by the start menu when it closes. */
export function closeStartMenu() {
  requested = false;
  listeners.forEach((fn) => fn());
}

export const startMenuRequested = () => requested;
export function subscribeStartMenu(fn) { listeners.add(fn); return () => listeners.delete(fn); }
