// Settings: which of the device's voices reads aloud. Automatic picks the most natural one the device has;
// "Try it" plays a sample. The list fills in once the browser has loaded its voices.
import { useEffect, useId, useState } from 'react';
import { canSpeak, englishVoices, onVoicesChanged, setPreferredVoice, speak } from '../lib/speech.js';
import { updateSettings } from '../state/store.js';
import { Icon } from './icons/Icon.jsx';

const SAMPLE = 'Hi! I will read your lessons and explanations out loud. Tap a word you don\'t know, and I\'ll explain it.';
const isApple = () => /iPhone|iPad|Macintosh/.test(navigator.userAgent);

export function VoicePicker({ value }) {
  const id = useId();
  const [voices, setVoices] = useState(() => englishVoices());
  useEffect(() => onVoicesChanged(() => setVoices(englishVoices())), []);
  if (!canSpeak()) return null;
  const best = voices[0];
  const choose = (uri) => { updateSettings({ voice: uri }); setPreferredVoice(uri); };
  const tryIt = () => { setPreferredVoice(value); speak(`voice-sample-${value}`, SAMPLE); };
  return (
    <div className="field voice-picker">
      <label htmlFor={id}>Read-aloud voice</label>
      <div className="voice-row">
        <select id={id} className="input" value={value} onChange={(e) => choose(e.target.value)}>
          <option value="">{best ? `Most natural (${best.name})` : 'Most natural on this device'}</option>
          {voices.map((v) => <option key={v.voiceURI} value={v.voiceURI}>{v.name} · {v.lang.replace('_', '-')}</option>)}
        </select>
        <button type="button" className="btn small" onClick={tryIt}><Icon name="speaker" /> Try it</button>
      </div>
      <p className="small muted">
        {isApple()
          ? 'For a much more natural voice: iPhone Settings → Accessibility → Spoken Content → Voices → English, download a Premium voice (like Ava or Zoe), then reopen the app.'
          : 'Voices marked Natural, Premium or Enhanced sound the most human. Your device or browser may let you download more.'}
      </p>
    </div>
  );
}
