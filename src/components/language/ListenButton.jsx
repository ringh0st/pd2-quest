// A small "listen" button that reads Finnish (or another learned language) with the device's voice for it.
import { useId, useSyncExternalStore, useEffect } from 'react';
import { speakLanguage, speakingId, stopSpeaking, subscribeSpeech } from '../../lib/speech.js';
import { track } from '../../lib/track.js';
import { Icon } from '../icons/Icon.jsx';

export function ListenButton({ text, label = 'Listen', rate, className = '' }) {
  const id = useId();
  const playing = useSyncExternalStore(subscribeSpeech, speakingId, speakingId) === id;
  useEffect(() => () => { if (speakingId() === id) stopSpeaking(); }, [id]);
  return (
    <button
      type="button" className={`icon-btn listen-btn${playing ? ' on' : ''} ${className}`}
      onClick={(e) => { e.stopPropagation(); speakLanguage(id, text, { lang: track.lang || 'fi', rate }); }}
      aria-label={playing ? 'Stop' : `${label}: ${text}`} aria-pressed={playing}
    >
      <Icon name={playing ? 'stop' : 'speaker'} />
    </button>
  );
}
