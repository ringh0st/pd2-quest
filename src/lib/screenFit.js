// iPhone home-screen app: some iOS versions give the page a viewport one status bar shorter than the screen,
// leaving an empty strip at the bottom that the page never reaches. This measures that strip and puts it in
// --screen-extra on <html>; with the "Fill the whole screen" setting on, the CSS stretches the app over it.
import { isIos, isStandalone } from './displayMode.js';

const root = document.documentElement;
const listeners = new Set();
let extra = 0;

const typing = () => /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName ?? '') || document.activeElement?.isContentEditable;

function safeTop() {
  const probe = document.createElement('div');
  probe.style.cssText = 'position:fixed;top:0;height:env(safe-area-inset-top,0px);visibility:hidden;pointer-events:none';
  document.body.appendChild(probe);
  const h = probe.getBoundingClientRect().height;
  probe.remove();
  return h;
}

function measure() {
  if (typing()) return; // the keyboard shrinks the viewport on purpose: keep the last good value
  const portrait = window.innerHeight >= window.innerWidth;
  const screenH = portrait ? Math.max(screen.width, screen.height) : Math.min(screen.width, screen.height);
  const gap = Math.round(screenH - window.innerHeight);
  // Under a see-through status bar the page should reach the bottom, so the whole gap is missing.
  // Under a normal status bar the page starts below it, and the missing part is the other half.
  const missing = safeTop() > 0 ? gap : gap / 2;
  const next = missing >= 20 && missing <= 90 ? missing : 0;
  if (next === extra) return;
  extra = next;
  root.style.setProperty('--screen-extra', `${extra}px`);
  if (extra) root.dataset.screenShort = ''; else delete root.dataset.screenShort;
  listeners.forEach((fn) => fn());
}

/** Starts measuring (installed iPhone app only). */
export function initScreenFit() {
  if (!isIos() || !isStandalone()) return;
  measure();
  window.addEventListener('resize', () => setTimeout(measure, 120));
  window.addEventListener('orientationchange', () => setTimeout(measure, 300));
  document.addEventListener('focusout', () => setTimeout(measure, 400));
}

/** True when this device has the short-viewport strip (so the setting is worth showing). */
export const screenIsShort = () => extra > 0;
export function subscribeScreenFit(fn) { listeners.add(fn); return () => listeners.delete(fn); }
