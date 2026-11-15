// Is the app running installed (home-screen / standalone window)?
export function isStandalone() {
  try {
    return window.matchMedia?.('(display-mode: standalone)').matches === true || window.navigator.standalone === true;
  } catch {
    return false;
  }
}

/** iPhone / iPad (iPadOS reports itself as a Mac with touch). */
export function isIos() {
  try {
    const nav = window.navigator;
    return /iPad|iPhone|iPod/.test(nav.userAgent) || (nav.platform === 'MacIntel' && nav.maxTouchPoints > 1);
  } catch {
    return false;
  }
}
