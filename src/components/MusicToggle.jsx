// One-tap background music switch for the top bar (Settings and the in-lesson settings have it too).
// Music needs sound on, so turning music on also turns sound on.
import { useStore, updateSettings } from '../state/store.js';
import { Icon } from './icons/Icon.jsx';
import { sfx } from '../audio/sfx.js';
import { haptic } from '../audio/haptics.js';

export function MusicToggle() {
  const on = useStore((s) => s.settings.sound && s.settings.music);
  return (
    <button
      type="button"
      className={`icon-btn music-toggle${on ? '' : ' off'}`}
      role="switch"
      aria-checked={on}
      aria-label="Background music"
      title={on ? 'Turn background music off' : 'Turn background music on'}
      onClick={() => { haptic('light'); if (on) updateSettings({ music: false }); else { updateSettings({ music: true, sound: true }); sfx.tap(); } }}
    >
      <Icon name={on ? 'music' : 'mute'} />
    </button>
  );
}
