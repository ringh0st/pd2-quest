// Opt-in study reminders: a downloadable .ics (works everywhere) plus, for the installed app,
// local notifications that fire only while the app is open or still alive in the background.
// Off by default. Never tied to streaks.
import { buildReminderIcs, nextOccurrence, normalizeReminder, REMINDER_BODY, reminderTitle } from './reminderSchedule.js';
import { BRAND_NAME } from './appInfo.js';
import { isStandalone } from './displayMode.js';

const KEY = 'pd2quest.reminders.v1';
const LATE_LIMIT_MS = 60 * 60 * 1000; // a timer that wakes up more than an hour late stays quiet

export function readReminder() {
  try {
    return normalizeReminder(JSON.parse(localStorage.getItem(KEY) ?? 'null'));
  } catch {
    return normalizeReminder(null);
  }
}

export function saveReminder(patch) {
  const next = normalizeReminder({ ...readReminder(), ...patch });
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch { /* storage blocked: the reminder just won't be remembered */ }
  startReminderLoop();
  return next;
}

export function appUrl() {
  try {
    return new URL('.', location.href).href.split('#')[0];
  } catch {
    return '';
  }
}

/** Downloads the .ics. On iOS Safari, opening a text/calendar file shows the add-event sheet. */
export function downloadReminderIcs({ time, days }) {
  const ics = buildReminderIcs({ time, days, url: appUrl(), appName: BRAND_NAME });
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'pd2-quest-reminder.ics';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 10_000);
}

/** Phone notifications are only offered in the installed app with the Notification API. */
export function canOfferNotifications() {
  return typeof window !== 'undefined' && 'Notification' in window && isStandalone();
}

export function notificationPermission() {
  try {
    return window.Notification?.permission ?? 'unsupported';
  } catch {
    return 'unsupported';
  }
}

/** Call from a click handler only. Resolves to 'granted' | 'denied' | 'default' | 'unsupported'. */
export async function requestNotificationPermission() {
  if (!('Notification' in window)) return 'unsupported';
  try {
    return await Notification.requestPermission();
  } catch {
    return notificationPermission();
  }
}

async function showReminderNotification() {
  const options = { body: REMINDER_BODY, tag: 'pd2quest-study', icon: 'icon-192.png', badge: 'icon-192.png', data: { url: appUrl() } };
  try {
    const reg = 'serviceWorker' in navigator
      ? await Promise.race([navigator.serviceWorker.ready, new Promise((resolve) => setTimeout(resolve, 3000))])
      : null;
    if (reg?.showNotification) return await reg.showNotification(reminderTitle(BRAND_NAME), options);
    new Notification(reminderTitle(BRAND_NAME), options);
  } catch { /* the browser refused: nothing else to do */ }
}

let timer = null;
let listening = false;

/** Safe to call any time (also when reminders are off); it re-reads the saved settings. */
export function startReminderLoop() {
  if (typeof window === 'undefined') return;
  clearTimeout(timer);
  timer = null;
  if (!listening) {
    listening = true;
    // Timers are paused while a phone sleeps: re-plan whenever the app comes back.
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') startReminderLoop(); });
  }
  const r = readReminder();
  if (!r.notify || notificationPermission() !== 'granted') return;
  const due = nextOccurrence(r, new Date());
  timer = setTimeout(() => {
    if (Date.now() - due.getTime() < LATE_LIMIT_MS) showReminderNotification();
    startReminderLoop();
  }, Math.max(1000, due.getTime() - Date.now()));
}
