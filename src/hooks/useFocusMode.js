// Screens in a study session ask the shell to hide navigation (focus mode).
import { useEffect, useSyncExternalStore } from 'react';

let count = 0;
const subs = new Set();
const emit = () => subs.forEach((f) => f());

export function useFocusMode(on = true) {
  useEffect(() => {
    if (!on) return;
    count++; emit();
    return () => { count--; emit(); };
  }, [on]);
}

export function useIsFocusMode() {
  return useSyncExternalStore((f) => { subs.add(f); return () => subs.delete(f); }, () => count > 0);
}

// While a question flow is on screen, celebrations (level up, badges, streak toasts) wait until it ends.
let holds = 0;
const holdSubs = new Set();
const emitHold = () => holdSubs.forEach((f) => f());

export function useHoldCelebrations(on = true) {
  useEffect(() => {
    if (!on) return;
    holds++; emitHold();
    return () => { holds--; emitHold(); };
  }, [on]);
}

export function useIsHolding() {
  return useSyncExternalStore((f) => { holdSubs.add(f); return () => holdSubs.delete(f); }, () => holds > 0);
}
