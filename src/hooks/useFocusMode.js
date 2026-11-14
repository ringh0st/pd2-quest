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
