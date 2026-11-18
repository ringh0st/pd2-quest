import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildReminderIcs, foldLine, formatLocalDateTime, formatUtcDateTime, nextOccurrence, normalizeReminder, rruleFor, escapeText,
} from '../src/lib/reminderSchedule.js';

// Local times: 2026-11-15 is a Sunday, 2026-11-20 a Friday.
const at = (d, h, m = 0) => new Date(2026, 10, d, h, m);
const bytes = (s) => Buffer.byteLength(s, 'utf8');
const unfold = (ics) => ics.replace(/\r\n /g, '');

test('reminders: RRULE for daily and weekdays', () => {
  assert.equal(rruleFor('daily'), 'RRULE:FREQ=DAILY');
  assert.equal(rruleFor('weekdays'), 'RRULE:FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR');
  const daily = unfold(buildReminderIcs({ time: '09:00', days: 'daily', now: at(15, 8) }));
  const weekdays = unfold(buildReminderIcs({ time: '09:00', days: 'weekdays', now: at(15, 8) }));
  assert.match(daily, /\r\nRRULE:FREQ=DAILY\r\n/);
  assert.match(weekdays, /\r\nRRULE:FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR\r\n/);
});

test('reminders: DTSTART is local floating time on the first matching day', () => {
  assert.equal(formatLocalDateTime(at(16, 9, 5)), '20261116T090500');
  assert.equal(formatUtcDateTime(new Date(Date.UTC(2026, 10, 15, 12, 3, 4))), '20261115T120304Z');
  const daily = unfold(buildReminderIcs({ time: '09:00', days: 'daily', now: at(15, 8) }));
  assert.match(daily, /\r\nDTSTART:20261115T090000\r\n/); // later today
  const weekdays = unfold(buildReminderIcs({ time: '09:00', days: 'weekdays', now: at(15, 8) }));
  assert.match(weekdays, /\r\nDTSTART:20261116T090000\r\n/); // Sunday → Monday
  assert.match(daily, /\r\nDTSTAMP:\d{8}T\d{6}Z\r\n/);
});

test('reminders: ics has CRLF lines of at most 75 octets, alarm, summary and URL', () => {
  const url = 'https://example.github.io/pd2-quest/';
  const ics = buildReminderIcs({ time: '19:30', days: 'daily', url, appName: 'Nimbolt', now: at(15, 8) });
  assert.ok(ics.startsWith('BEGIN:VCALENDAR\r\nVERSION:2.0\r\n'));
  assert.ok(ics.endsWith('END:VCALENDAR\r\n'));
  assert.equal(ics.replace(/\r\n/g, '').includes('\n'), false, 'no bare LF');
  for (const line of ics.split('\r\n')) assert.ok(bytes(line) <= 75, `too long: ${line}`);
  const flat = unfold(ics);
  assert.match(flat, /BEGIN:VALARM\r\nACTION:DISPLAY\r\n/);
  assert.match(flat, /\r\nTRIGGER:PT0S\r\n/);
  assert.match(flat, /\r\nSUMMARY:Nimbolt: 5 minutes\r\n/);
  assert.match(flat, new RegExp(`\\r\\nURL:${url}\\r\\n`));
  assert.ok(flat.includes(url), 'description links to the app');
});

test('reminders: folding keeps multi-byte characters whole', () => {
  const line = `SUMMARY:${'⚡'.repeat(40)}`;
  const folded = foldLine(line);
  const parts = folded.split('\r\n');
  assert.ok(parts.length > 1);
  parts.forEach((p, i) => { assert.ok(bytes(p) <= 75); if (i) assert.ok(p.startsWith(' ')); });
  assert.equal(folded.replace(/\r\n /g, ''), line);
  assert.equal(foldLine('SHORT:ok'), 'SHORT:ok');
  assert.equal(escapeText('a,b;c\\d\ne'), 'a\\,b\\;c\\\\d\\ne');
});

test('reminders: next occurrence across days and weekends', () => {
  const daily = { time: '09:00', days: 'daily' };
  const weekdays = { time: '09:00', days: 'weekdays' };
  assert.deepEqual(nextOccurrence(daily, at(16, 8)), at(16, 9)); // later today
  assert.deepEqual(nextOccurrence(daily, at(16, 9)), at(17, 9)); // exactly now → tomorrow
  assert.deepEqual(nextOccurrence(daily, at(30, 22)), new Date(2026, 11, 1, 9)); // month rollover
  assert.deepEqual(nextOccurrence(weekdays, at(20, 10)), at(23, 9)); // Friday after → Monday
  assert.deepEqual(nextOccurrence(weekdays, at(21, 8)), at(23, 9)); // Saturday → Monday
  assert.deepEqual(nextOccurrence(weekdays, at(15, 8)), at(16, 9)); // Sunday → Monday
  assert.deepEqual(nextOccurrence(weekdays, at(18, 8)), at(18, 9)); // Wednesday, later today
  assert.deepEqual(nextOccurrence(weekdays, new Date(2026, 11, 31, 12)), new Date(2027, 0, 1, 9)); // year rollover (Fri)
});

test('reminders: settings are normalized and off by default', () => {
  assert.deepEqual(normalizeReminder(null), { time: '19:00', days: 'daily', notify: false });
  assert.deepEqual(normalizeReminder({ time: '7:05', days: 'weekdays', notify: true }), { time: '07:05', days: 'weekdays', notify: true });
  assert.deepEqual(normalizeReminder({ time: '25:00', days: 'sometimes', notify: 'yes' }), { time: '19:00', days: 'daily', notify: false });
});
