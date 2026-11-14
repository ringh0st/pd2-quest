import { sfx } from '../audio/sfx.js';
import { haptic } from '../audio/haptics.js';

export function Switch({ label, hint, checked, onChange }) {
  const id = 'sw-' + label.replace(/\W+/g, '-').toLowerCase();
  return (
    <div className="switch-row">
      <div className="grow">
        <div id={id} style={{ fontWeight: 700 }}>{label}</div>
        {hint && <div className="small muted">{hint}</div>}
      </div>
      <button
        type="button" role="switch" aria-checked={checked} aria-labelledby={id} className="switch"
        onClick={() => { sfx.tap(); haptic('light'); onChange(!checked); }}
      />
    </div>
  );
}

export function Segmented({ label, options, value, onChange }) {
  return (
    <div className="field">
      <div className="label" id={`seg-${label}`}>{label}</div>
      <div className="segmented" role="radiogroup" aria-labelledby={`seg-${label}`}>
        {options.map(([v, text]) => (
          <button
            key={String(v)} type="button" role="radio" aria-checked={value === v}
            onClick={() => { sfx.tap(); haptic('light'); onChange(v); }}
          >{text}</button>
        ))}
      </div>
    </div>
  );
}
