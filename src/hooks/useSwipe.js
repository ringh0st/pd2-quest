// A swipe (finger) or drag (mouse) left or right, without any movement on screen: used where animations are off
// (Reduce motion), so swiping still works there. Presses that start on a button, link or field are left alone.
import { useRef } from 'react';

const DISTANCE = 70; // px sideways before it counts

export function useSwipe(onSwipe, on = true) {
  const start = useRef(null);
  if (!on) return {};
  return {
    style: { touchAction: 'pan-y' }, // vertical scrolling stays with the browser; sideways comes here
    onPointerDown: (e) => {
      if (e.button !== 0 || e.target.closest('button, a, input, textarea, select, [role="button"]')) return;
      start.current = { x: e.clientX, y: e.clientY };
    },
    onPointerUp: (e) => {
      const s = start.current;
      start.current = null;
      if (!s) return;
      const dx = e.clientX - s.x;
      const dy = e.clientY - s.y;
      if (Math.abs(dx) < DISTANCE || Math.abs(dx) < Math.abs(dy) * 1.5) return;
      window.getSelection?.()?.removeAllRanges(); // a mouse drag over text also selects it
      onSwipe(dx < 0 ? 1 : -1);
    },
    onPointerCancel: () => { start.current = null; },
  };
}
