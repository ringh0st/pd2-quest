// The app's own dropdown (instead of the browser's plain <select>): a button showing the choice, and a list that
// opens under it (or above it, when there's no room below). Follows the ARIA "select-only combobox" pattern:
// - Button: Enter, Space, ↓ or ↑ opens the list.
// - List: ↑ ↓ Home End move, typing a letter jumps to it, Enter or Space picks, Escape or Tab closes.
// - Clicking or tapping outside closes it. Screen readers hear the button's label, the choice and each option.
// `options`: [{ value, label, group? }]. Options with the same `group` sit under that heading, in order.
import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { sfx } from '../audio/sfx.js';
import { haptic } from '../audio/haptics.js';
import { Icon } from './icons/Icon.jsx';

export function Dropdown({ id, labelId, value, options, onChange }) {
  const own = useId();
  const buttonId = id ?? `${own}-button`;
  const listId = `${own}-list`;
  const optionId = (k) => `${own}-o${k}`;
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [up, setUp] = useState(false);
  const rootRef = useRef(null);
  const buttonRef = useRef(null);
  const listRef = useRef(null);
  const typed = useRef({ text: '', at: 0 });
  const chosenAt = Math.max(0, options.findIndex((o) => o.value === value));
  const chosen = options[chosenAt];

  const openList = (at = chosenAt) => {
    // Open upwards when the list wouldn't fit below the button (near the bottom of the screen)
    const box = buttonRef.current?.getBoundingClientRect();
    setUp(!!box && window.innerHeight - box.bottom < 280 && box.top > window.innerHeight - box.bottom);
    setActive(at);
    setOpen(true);
    sfx.tap(); haptic('light');
  };
  const close = (refocus = true) => {
    setOpen(false);
    if (refocus) buttonRef.current?.focus();
  };
  const pick = (k) => {
    const o = options[k];
    if (!o) return;
    sfx.select(); haptic('light');
    if (o.value !== value) onChange(o.value);
    close();
  };

  // The list takes the focus when it opens; the active option stays in view
  useLayoutEffect(() => { if (open) listRef.current?.focus({ preventScroll: true }); }, [open]);
  useLayoutEffect(() => {
    if (open) document.getElementById(optionId(active))?.scrollIntoView({ block: 'nearest' });
  }, [open, active]); // eslint-disable-line react-hooks/exhaustive-deps

  // Clicking or tapping anywhere else closes it
  useEffect(() => {
    if (!open) return undefined;
    const away = (e) => { if (!rootRef.current?.contains(e.target)) close(false); };
    document.addEventListener('pointerdown', away);
    return () => document.removeEventListener('pointerdown', away);
  }, [open]);

  const jumpToLetter = (key) => {
    const now = Date.now();
    typed.current = { text: (now - typed.current.at < 700 ? typed.current.text : '') + key.toLowerCase(), at: now };
    const start = typed.current.text.length > 1 ? active : active + 1;
    for (let n = 0; n < options.length; n += 1) {
      const k = (start + n) % options.length;
      if (String(options[k].label).toLowerCase().startsWith(typed.current.text)) { setActive(k); return; }
    }
  };

  const onButtonKey = (e) => {
    if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) { e.preventDefault(); openList(); }
  };
  const onListKey = (e) => {
    const last = options.length - 1;
    const keys = {
      ArrowDown: () => setActive((k) => Math.min(last, k + 1)),
      ArrowUp: () => setActive((k) => Math.max(0, k - 1)),
      Home: () => setActive(0),
      End: () => setActive(last),
      PageDown: () => setActive((k) => Math.min(last, k + 5)),
      PageUp: () => setActive((k) => Math.max(0, k - 5)),
      Enter: () => pick(active),
      ' ': () => pick(active),
      Escape: () => close(),
      Tab: () => close(false),
    };
    if (keys[e.key]) {
      if (e.key !== 'Tab') e.preventDefault();
      keys[e.key]();
    } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      jumpToLetter(e.key);
    }
  };

  // Options with their group headings (a heading only where the group changes)
  const rows = [];
  options.forEach((o, k) => {
    if (o.group && o.group !== options[k - 1]?.group) rows.push({ heading: o.group, key: `g-${o.group}` });
    rows.push({ option: o, k, key: `o-${k}` });
  });

  return (
    <div className={`dropdown${open ? ' open' : ''}`} ref={rootRef}>
      <button
        ref={buttonRef} id={buttonId} type="button" className="input dropdown-button"
        aria-haspopup="listbox" aria-expanded={open} aria-controls={open ? listId : undefined}
        aria-labelledby={labelId ? `${labelId} ${buttonId}` : undefined}
        onClick={() => (open ? close() : openList())} onKeyDown={onButtonKey}
      >
        <span className="dropdown-value">{chosen?.label ?? ''}</span>
        <Icon name="down" className="dropdown-chevron" />
      </button>
      {open && (
        <ul
          ref={listRef} id={listId} role="listbox" tabIndex={0} className={`dropdown-list${up ? ' up' : ''}`}
          aria-labelledby={labelId} aria-activedescendant={optionId(active)} onKeyDown={onListKey}
        >
          {rows.map((r) => (r.heading ? (
            <li key={r.key} role="presentation" className="dropdown-group">{r.heading}</li>
          ) : (
            <li
              key={r.key} id={optionId(r.k)} role="option" aria-selected={r.k === chosenAt}
              className={`dropdown-option${r.k === active ? ' active' : ''}`}
              onPointerMove={() => setActive(r.k)} onClick={() => pick(r.k)}
            >
              <span className="grow">{r.option.label}</span>
              {r.k === chosenAt && <Icon name="check" className="dropdown-check" />}
            </li>
          )))}
        </ul>
      )}
    </div>
  );
}
