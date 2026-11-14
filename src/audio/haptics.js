// Haptics by importance. Android: Vibration API. iPhone Safari has none, but iOS 18+ ticks when a
// native switch toggles, so we click the label of a hidden one.
const PATTERNS = {
  light: { android: 8, ticks: 1 },
  medium: { android: 18, ticks: 1 },
  soft: { android: 30, ticks: 1 },
  double: { android: [10, 60, 10], ticks: 2 },
  success: { android: [12, 40, 12, 40, 24], ticks: 3 },
  celebrate: { android: [15, 30, 15, 30, 15, 30, 60], ticks: 5 },
};
const TICK_GAP_MS = 80;
let iosLabel = null;
let enabled = true;

export function setHapticsEnabled(on) { enabled = on; }

const isIos = () =>
  typeof navigator !== 'undefined' &&
  (/iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));

function iosTick() {
  if (!iosLabel) {
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.setAttribute('switch', '');
    input.id = 'pd2-haptic-switch';
    input.tabIndex = -1;
    input.setAttribute('aria-hidden', 'true');
    input.style.display = 'none';
    iosLabel = document.createElement('label');
    iosLabel.htmlFor = input.id;
    iosLabel.setAttribute('aria-hidden', 'true');
    iosLabel.style.display = 'none';
    document.body.append(input, iosLabel);
  }
  iosLabel.click();
}

export function haptic(strength) {
  if (!enabled) return;
  const p = PATTERNS[strength];
  if (!p || typeof navigator === 'undefined') return;
  try {
    if (navigator.vibrate) navigator.vibrate(p.android);
    else if (isIos()) for (let i = 0; i < p.ticks; i++) setTimeout(iosTick, i * TICK_GAP_MS);
  } catch { /* never let haptics break the app */ }
}
