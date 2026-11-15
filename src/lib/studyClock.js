// Counts active study time: only while a study screen is open and the app is visible. Used to suggest
// a short break at a natural pause (end of a round), never in the middle of a question.
const KEY = 'pd2quest.studyclock.v1';
let open = 0;
let lastTick = 0;
let timer = null;
const subs = new Set();

function read() {
  try { const s = JSON.parse(sessionStorage.getItem(KEY) || 'null'); return s && typeof s.ms === 'number' ? s : { ms: 0, snoozeUntil: 0 }; } catch { return { ms: 0, snoozeUntil: 0 }; }
}
function write(s) { try { sessionStorage.setItem(KEY, JSON.stringify(s)); } catch { /* ignore */ } subs.forEach((f) => f()); }

function tick() {
  const now = Date.now();
  if (open > 0 && document.visibilityState === 'visible') {
    const s = read();
    s.ms += Math.min(now - lastTick, 5000); // never count long sleeps
    write(s);
  }
  lastTick = now;
}

/** A study screen is open (returns a release function). */
export function studyScreenOpen() {
  open += 1;
  lastTick = Date.now();
  if (!timer) timer = setInterval(tick, 1000);
  return () => {
    tick();
    open = Math.max(0, open - 1);
    if (!open && timer) { clearInterval(timer); timer = null; }
  };
}

export const studyMinutes = () => read().ms / 60000;
export function breakDue(limitMin) {
  if (!limitMin) return false;
  const s = read();
  return s.ms / 60000 >= limitMin && Date.now() >= s.snoozeUntil;
}
export function snoozeBreak(minutes = 10) { const s = read(); write({ ...s, snoozeUntil: Date.now() + minutes * 60000 }); }
export function tookBreak() { write({ ms: 0, snoozeUntil: 0 }); }
export function subscribeStudyClock(fn) { subs.add(fn); return () => subs.delete(fn); }
