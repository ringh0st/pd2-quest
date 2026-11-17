// Settings: which voice reads aloud. Natural voices run on this device (a one-time download, then offline);
// device voices are the phone's own. "Try it" plays a sample. Device voices fill in once the browser has loaded them.
import { useEffect, useId, useState, useSyncExternalStore } from 'react';
import { canSpeak, englishVoices, onVoicesChanged, setPreferredVoice, speak } from '../lib/speech.js';
import { NATURAL_VOICES, isNaturalVoice, loadNaturalVoice, naturalVoiceState, subscribeNaturalVoice } from '../lib/tts/naturalVoice.js';
import { updateSettings } from '../state/store.js';
import { Icon } from './icons/Icon.jsx';

const SAMPLE = 'Hi! I will read your lessons and explanations out loud. Tap a word you don\'t know, and I\'ll explain it.';
const isApple = () => /iPhone|iPad|Macintosh/.test(navigator.userAgent);

export function VoicePicker({ value }) {
  const id = useId();
  const [voices, setVoices] = useState(() => englishVoices());
  const natural = useSyncExternalStore(subscribeNaturalVoice, naturalVoiceState, naturalVoiceState);
  useEffect(() => onVoicesChanged(() => setVoices(englishVoices())), []);
  if (!canSpeak() && !voices.length) return null;
  const best = voices[0];
  const wantsNatural = isNaturalVoice(value);
  const choose = (next) => { updateSettings({ voice: next }); setPreferredVoice(next); };
  const tryIt = () => { setPreferredVoice(value); speak(`voice-sample-${value}`, SAMPLE); };
  return (
    <div className="field voice-picker">
      <label htmlFor={id}>Read-aloud voice</label>
      <div className="voice-row">
        <select id={id} className="input" value={value} onChange={(e) => choose(e.target.value)}>
          <optgroup label="Natural voice (on this phone, free)">
            {NATURAL_VOICES.map((v) => <option key={v.id} value={v.id}>{v.name} · {v.about}</option>)}
          </optgroup>
          <optgroup label="This device">
            <option value="">{best ? `Automatic (${best.name})` : 'Automatic'}</option>
            {voices.map((v) => <option key={v.voiceURI} value={v.voiceURI}>{v.name} · {v.lang.replace('_', '-')}</option>)}
          </optgroup>
        </select>
        <button type="button" className="btn small" onClick={tryIt} disabled={wantsNatural && natural.status !== 'ready'}>
          <Icon name="speaker" /> Try it
        </button>
      </div>
      {wantsNatural ? <NaturalStatus state={natural} /> : (
        <p className="small muted">
          {isApple()
            ? 'Natural voices sound the most human. Device voices: for a better one, download a Premium voice in iPhone Settings → Accessibility → Spoken Content → Voices.'
            : 'Natural voices sound the most human. They download once and then work offline.'}
        </p>
      )}
    </div>
  );
}

function NaturalStatus({ state }) {
  if (state.status === 'ready') {
    return (
      <p className="small muted">
        <Icon name="ok" className="ic-ok" /> Natural voice ready. It works offline now.
        {state.last && <span> {state.last}</span>}
      </p>
    );
  }
  if (state.status === 'loading') {
    const pct = Math.round(state.progress * 100);
    return (
      <div className="stack-s" aria-live="polite">
        <div className="bar" role="progressbar" aria-label="Downloading the natural voice" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}>
          <span style={{ width: `${Math.max(4, pct)}%` }} />
        </div>
        <p className="small muted">
          {pct >= 100 ? 'Setting up the natural voice on this phone…' : `Downloading the natural voice… ${pct ? `${pct}%` : ''} (about 90 MB, only once; Wi-Fi is best)`}
        </p>
      </div>
    );
  }
  return (
    <div className="stack-s">
      {state.status === 'error' && (
        <p className="small" role="alert">
          The natural voice didn’t work this time. Your phone’s voice reads aloud instead. Check the connection and try again.
          {state.error && <span className="muted"> ({state.error})</span>}
          {state.last && <span className="muted"> {state.last}</span>}
        </p>
      )}
      <button type="button" className="btn small" onClick={loadNaturalVoice}><Icon name="download" /> Get the natural voice (about 90 MB, once)</button>
      <p className="small muted">Until it’s ready, your phone’s own voice reads aloud.</p>
    </div>
  );
}
