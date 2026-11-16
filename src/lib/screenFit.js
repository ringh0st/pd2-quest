// iPhone home-screen app: some iOS versions give the page a viewport shorter than the screen, leaving an
// empty strip at the bottom that the page never reaches. With "Fill the whole screen" on (Settings), the
// app is stretched over it by --screen-extra px: the measured strip ("auto"), or an amount the learner picks.
import { isIos, isStandalone } from './displayMode.js';

const root = document.documentElement;
const listeners = new Set();
const info = { installed: false, screenH: 0, pageH: 0, safeTop: 0, measured: 0 };
let snapshot = { ...info, extra: 0 };
let mode = 'off'; // 'off' | 'auto' | a number of px
let extra = 0;

const typing = () => /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName ?? '') || document.activeElement?.isContentEditable;

function safeTop() {
  const probe = document.createElement('div');
  probe.style.cssText = 'position:fixed;top:0;height:env(safe-area-inset-top,0px);visibility:hidden;pointer-events:none';
  document.body.appendChild(probe);
  const h = probe.getBoundingClientRect().height;
  probe.remove();
  return Math.round(h);
}

function measure() {
  if (typing()) return; // the keyboard shrinks the viewport on purpose: keep the last good value
  const portrait = window.innerHeight >= window.innerWidth;
  info.screenH = portrait ? Math.max(screen.width, screen.height) : Math.min(screen.width, screen.height);
  info.pageH = Math.round(Math.min(window.innerHeight, root.clientHeight, window.visualViewport?.height ?? Infinity));
  info.safeTop = safeTop();
  const gap = info.screenH - info.pageH;
  // Under a see-through status bar the page should reach the bottom, so the whole gap is missing.
  // Under a normal status bar the page starts below it, and the missing part is the other half.
  const missing = info.safeTop > 0 ? gap : gap / 2;
  info.measured = missing >= 20 && missing <= 100 ? Math.round(missing) : 0;
  apply();
}

function apply() {
  const next = mode === 'off' ? 0 : mode === 'auto' ? (info.measured || info.safeTop) : Number(mode) || 0;
  extra = next;
  root.style.setProperty('--screen-extra', `${extra}px`);
  if (extra > 0) root.dataset.screenFill = ''; else delete root.dataset.screenFill;
  snapshot = { ...info, extra };
  listeners.forEach((fn) => fn());
}

/** Starts measuring (installed iPhone app only). */
export function initScreenFit() {
  info.installed = isIos() && isStandalone();
  if (!info.installed) return;
  measure();
  window.addEventListener('resize', () => setTimeout(measure, 120));
  window.addEventListener('orientationchange', () => setTimeout(measure, 300));
  document.addEventListener('focusout', () => setTimeout(measure, 400));
}

/** From the settings: 'off', 'auto' or a number of px. Only does anything in the installed iPhone app. */
export function setScreenFill(next) {
  mode = info.installed ? next : 'off';
  if (info.installed) apply();
}

/** What the phone reports (shown under the switch, so a screenshot tells what is going on). */
export const screenFitInfo = () => snapshot;
export function subscribeScreenFit(fn) { listeners.add(fn); return () => listeners.delete(fn); }
