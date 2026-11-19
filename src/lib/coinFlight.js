// Coins flying into the coin counter. The balance in the store is already updated when a reward is paid; while
// coins are "in flight" the counter shows the balance minus what hasn't landed yet, so it ticks up coin by coin as
// they arrive (components/game/CoinFlightLayer.jsx draws the flight). Nothing here changes the real balance.

const listeners = new Set();
let state = { pending: 0, landings: 0, flights: [] };
const emit = (patch) => { state = { ...state, ...patch }; listeners.forEach((l) => l()); };
export const coinFlightState = () => state;
export function subscribeCoinFlight(fn) { listeners.add(fn); return () => listeners.delete(fn); }

let safety = null;
// If a flight never finishes (screen closed mid-way), the counter still catches up
const armSafety = () => { clearTimeout(safety); safety = setTimeout(() => { if (state.pending) emit({ pending: 0, flights: [] }); }, 6000); };

/** Keeps `amount` coins off the counter until they fly in (call when the reward appears, before flyCoins). */
export function holdCoins(amount) {
  if (amount > 0) { emit({ pending: state.pending + amount }); armSafety(); }
}

/** Lands `amount` held coins (one coin of a flight arriving, or all at once). */
export function landCoins(amount) {
  emit({ pending: Math.max(0, state.pending - amount), landings: state.landings + 1 });
}

/** Sends held coins flying from an element (or a point) to the coin counter. */
export function flyCoins({ from, amount }) {
  if (!(amount > 0)) return;
  const r = from?.getBoundingClientRect?.();
  const origin = r ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : from ?? { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  emit({ flights: [...state.flights, { id: `${Date.now()}-${Math.random()}`, origin, amount }] });
  armSafety();
}

export function endFlight(id) { emit({ flights: state.flights.filter((f) => f.id !== id) }); }

/** How many coin sprites a reward of `amount` shows, and what each one is worth (the last takes the rest). */
export function coinSplit(amount) {
  const n = Math.max(3, Math.min(12, Math.round(amount / 10)));
  const each = Math.floor(amount / n);
  return Array.from({ length: n }, (_, i) => (i === n - 1 ? amount - each * (n - 1) : each));
}
