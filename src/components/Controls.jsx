// Settings-style controls: an on/off switch and a segmented radio group (arrow keys move the choice).
import { useId } from 'react';
import { sfx } from '../audio/sfx.js';
import { haptic } from '../audio/haptics.js';

export function Switch({ label, hint, checked, onChange, disabled = false }) {
  const id = useId();
  return (
    <div className="switch-row">
      <div className="grow">
        <div id={id} style={{ fontWeight: 700 }}>{label}</div>
        {hint && <div className="small muted" id={`${id}-hint`}>{hint}</div>}
      </div>
      <button
        type="button" role="switch" aria-checked={checked} aria-labelledby={id} aria-describedby={hint ? `${id}-hint` : undefined} className="switch" disabled={disabled}
        onClick={() => { if (checked) sfx.toggleOff(); else sfx.toggleOn(); haptic('light'); onChange(!checked); }}
      />
    </div>
  );
}

export function Segmented({ label, options, value, onChange }) {
  const id = useId();
  const pickAt = (k, e) => {
    const [v] = options[(k + options.length) % options.length];
    sfx.select(); haptic('light'); onChange(v);
    const btns = e.currentTarget.parentElement.querySelectorAll('[role="radio"]');
    btns[(k + options.length) % options.length]?.focus();
  };
  return (
    <div className="field">
      <div className="label" id={id}>{label}</div>
      <div className="segmented" role="radiogroup" aria-labelledby={id}>
        {options.map(([v, text], k) => (
          <button
            key={String(v)} type="button" role="radio" aria-checked={value === v}
            tabIndex={value === v || (k === 0 && !options.some(([x]) => x === value)) ? 0 : -1}
            onClick={() => { sfx.select(); haptic('light'); onChange(v); }}
            onKeyDown={(e) => {
              if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); pickAt(k + 1, e); }
              if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); pickAt(k - 1, e); }
            }}
          >{text}</button>
        ))}
      </div>
    </div>
  );
}
