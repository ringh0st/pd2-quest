import { useEffect, useState } from 'react';
import { useStore } from '../state/store.js';

function systemReduced() {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}

/** true when motion should be minimal: system setting, in-app setting, or calm mode */
export function useReducedMotion() {
  const motion = useStore((s) => s.settings.motion);
  const [sys, setSys] = useState(systemReduced);
  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (!mq) return;
    const fn = () => setSys(mq.matches);
    mq.addEventListener('change', fn);
    return () => mq.removeEventListener('change', fn);
  }, []);
  if (motion === 'reduced') return true;
  if (motion === 'full') return false;
  return sys;
}

export function useCalm() {
  return useStore((s) => s.settings.calm);
}
