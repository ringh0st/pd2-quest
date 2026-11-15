// Small speaker button: reads the given text aloud; tap again to stop. Hidden where speech isn't available.
import { useEffect, useId, useSyncExternalStore } from 'react';
import { canSpeak, speak, speakingId, stopSpeaking, subscribeSpeech } from '../lib/speech.js';
import { Icon } from './icons/Icon.jsx';

export function SpeakButton({ text, label = 'Read aloud' }) {
  const id = useId();
  const playing = useSyncExternalStore(subscribeSpeech, () => speakingId() === id, () => false);
  // stop when this button goes away (next question, leaving the screen)
  useEffect(() => () => { if (speakingId() === id) stopSpeaking(); }, [id]);
  if (!canSpeak()) return null;
  return (
    <button
      type="button" className={`speak-btn${playing ? ' on' : ''}`}
      aria-label={playing ? 'Stop reading' : label} aria-pressed={playing}
      onClick={(e) => { e.stopPropagation(); speak(id, text); }}
    >
      <Icon name={playing ? 'pause' : 'speaker'} />
    </button>
  );
}
