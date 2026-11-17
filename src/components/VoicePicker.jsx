// Settings: which voice reads aloud. The natural voice is recorded ahead of time (lib/naturalVoice.js); device voices
// are the phone's own. "Try it" plays a sample. Device voices fill in once the browser has loaded them.
import { useEffect, useId, useState } from 'react';
import { canSpeak, englishVoices, onVoicesChanged, setPreferredVoice, speak } from '../lib/speech.js';
import { NATURAL_VOICE, isNaturalVoice } from '../lib/naturalVoice.js';
import { VOICE_SAMPLE } from '../lib/speechText.js';
import { updateSettings } from '../state/store.js';
import { Icon } from './icons/Icon.jsx';
import { Dropdown } from './Dropdown.jsx';

const isApple = () => /iPhone|iPad|Macintosh/.test(navigator.userAgent);

export function VoicePicker({ value }) {
  const id = useId();
  const [voices, setVoices] = useState(() => englishVoices());
  useEffect(() => onVoicesChanged(() => setVoices(englishVoices())), []);
  if (!canSpeak() && !voices.length) return null;
  const best = voices[0];
  const natural = isNaturalVoice(value);
  const selected = natural ? NATURAL_VOICE : value;
  const choose = (next) => { updateSettings({ voice: next }); setPreferredVoice(next); };
  const tryIt = () => speak(`voice-sample-${selected}`, VOICE_SAMPLE);
  return (
    <div className="field voice-picker">
      <label htmlFor={id} id={`${id}-label`}>Read-aloud voice</label>
      <div className="voice-row">
        <Dropdown
          id={id} labelId={`${id}-label`} value={selected} onChange={choose}
          options={[
            { value: NATURAL_VOICE, label: 'Natural voice · Heart (sounds the most human)', group: 'Natural' },
            { value: '', label: best ? `Automatic (${best.name})` : 'Automatic', group: 'This device' },
            ...voices.map((v) => ({ value: v.voiceURI, label: `${v.name} · ${v.lang.replace('_', '-')}`, group: 'This device' })),
          ]}
        />
        <button type="button" className="btn small" onClick={tryIt}>
          <Icon name="speaker" /> Try it
        </button>
      </div>
      <p className="small muted">
        {natural
          ? 'Recorded with a natural voice. Each part plays from the internet when you tap it. Brand-new text uses your phone’s voice until it’s recorded.'
          : isApple()
            ? 'For a better device voice, download a Premium voice in iPhone Settings → Accessibility → Spoken Content → Voices.'
            : 'The natural voice sounds the most human.'}
      </p>
    </div>
  );
}
