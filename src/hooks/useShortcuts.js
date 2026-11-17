// Keyboard shortcuts for laptops and desktops. `onKey(event)` returns true when it used the key.
// Ignored while typing (text fields, editable text), with Ctrl, Alt or Cmd held, or while a dialog is open,
// so shortcuts never steal keys from the thing you're actually using.
import { useEffect, useRef } from 'react';

export function useShortcuts(onKey, on = true) {
  const handler = useRef(onKey);
  handler.current = onKey;
  useEffect(() => {
    if (!on) return undefined;
    const handle = (e) => {
      if (e.defaultPrevented || e.repeat || e.ctrlKey || e.metaKey || e.altKey) return;
      const t = e.target;
      if (t instanceof HTMLElement && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      if (document.querySelector('[role="dialog"][aria-modal="true"], dialog[open]')) return;
      if (handler.current(e)) e.preventDefault();
    };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [on]);
}

/** True when the key was pressed on a control that handles it itself (a button or link). */
export const onControl = (e) => e.target instanceof Element && !!e.target.closest('button, a, [role="button"], [role="radio"], [role="checkbox"]');
