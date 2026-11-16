// Pure study-reminder helpers (no DOM): next occurrence of a reminder and an RFC 5545 .ics for it.
// Times are "floating" local times (no time zone), so the event rings at the same clock time
// wherever the learner is.

export const REMINDER_DAYS = ['daily', 'weekdays'];
export const DEFAULT_REMINDER = { time: '19:00', days: 'daily', notify: false };
export const REMINDER_TITLE = 'Dev Quest: 5 minutes';
export const REMINDER_BODY = 'Got 5 minutes? A tiny round is ready whenever you are. No pressure.';

const pad = (n) => String(n).padStart(2, '0');

/** "HH:MM" to { h, m }, or null when it isn't a valid 24-hour time. */
export function parseTime(time) {
  const match = /^(\d{1,2}):(\d{2})$/.exec(String(time ?? ''));
  if (!match) return null;
  const h = Number(match[1]);
  const m = Number(match[2]);
  return h < 24 && m < 60 ? { h, m } : null;
}

/** Fills in defaults and drops anything invalid, so callers can trust the shape. */
export function normalizeReminder(raw) {
  const r = raw && typeof raw === 'object' ? raw : {};
  return {
    time: parseTime(r.time) ? r.time.padStart(5, '0') : DEFAULT_REMINDER.time,
    days: REMINDER_DAYS.includes(r.days) ? r.days : DEFAULT_REMINDER.days,
    notify: r.notify === true,
  };
}

const isWeekday = (date) => date.getDay() >= 1 && date.getDay() <= 5;

/** The first moment strictly after `from` (local time) when the reminder is due. */
export function nextOccurrence({ time, days }, from = new Date()) {
  const { h, m } = parseTime(time) ?? parseTime(DEFAULT_REMINDER.time);
  const at = new Date(from.getFullYear(), from.getMonth(), from.getDate(), h, m, 0, 0);
  for (let i = 0; i < 8; i++) {
    if (at > from && (days !== 'weekdays' || isWeekday(at))) return at;
    at.setDate(at.getDate() + 1);
    at.setHours(h, m, 0, 0); // keep the clock time across DST changes
  }
  return at;
}

export function rruleFor(days) {
  return days === 'weekdays' ? 'RRULE:FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR' : 'RRULE:FREQ=DAILY';
}

/** Local floating date-time, e.g. 20261116T090000. */
export function formatLocalDateTime(date) {
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}T${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
}

/** UTC date-time, e.g. 20261115T120000Z (for DTSTAMP). */
export function formatUtcDateTime(date) {
  return `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`;
}

/** Escapes a TEXT value (RFC 5545 §3.3.11). */
export function escapeText(text) {
  return String(text).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
}

const utf8Length = (char) => {
  const c = char.codePointAt(0);
  return c < 0x80 ? 1 : c < 0x800 ? 2 : c < 0x10000 ? 3 : 4;
};

/** Folds one content line to at most 75 octets per line, never splitting a character (§3.1). */
export function foldLine(line) {
  const parts = [];
  let current = '';
  let size = 0;
  for (const char of line) {
    const len = utf8Length(char);
    const limit = parts.length === 0 ? 75 : 74; // continuation lines start with one space
    if (size + len > limit) {
      parts.push(current);
      current = '';
      size = 0;
    }
    current += char;
    size += len;
  }
  parts.push(current);
  return parts.join('\r\n ');
}

/** A complete VCALENDAR with one recurring 5-minute event and an alarm at its start. */
export function buildReminderIcs({ time, days, url, now = new Date() }) {
  const r = normalizeReminder({ time, days });
  const start = nextOccurrence(r, now);
  const description = `${REMINDER_BODY}${url ? ` Open the app: ${url}` : ''}`;
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Dev Quest//Study reminder//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    'UID:pd2quest-study-reminder@pd2-quest', // stable, so re-adding can update the same event
    `DTSTAMP:${formatUtcDateTime(now)}`,
    `DTSTART:${formatLocalDateTime(start)}`,
    'DURATION:PT5M',
    rruleFor(r.days),
    `SUMMARY:${escapeText(REMINDER_TITLE)}`,
    `DESCRIPTION:${escapeText(description)}`,
    ...(url ? [`URL:${url}`] : []),
    'TRANSP:TRANSPARENT',
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    `DESCRIPTION:${escapeText(REMINDER_TITLE)}`,
    'TRIGGER:PT0S',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  return `${lines.map(foldLine).join('\r\n')}\r\n`;
}
