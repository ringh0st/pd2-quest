// The setting controls shared by the Settings screen and the quick settings sheet in lessons, practice and
// flashcards (QuickSettings.jsx), so both always show the same options and change the same values.
import { useStore, updateSettings } from '../../state/store.js';
import { Switch, Segmented } from '../Controls.jsx';
import { VoicePicker } from '../VoicePicker.jsx';
import { Icon } from '../icons/Icon.jsx';
import { sfx, setSoundEnabled } from '../../audio/sfx.js';
import { haptic, setHapticsEnabled } from '../../audio/haptics.js';

/** Segmented option with its icon over the word. */
export const iconOption = (value, icon, text) => [value, <span className="pq-seg"><Icon name={icon} />{text}</span>];

export function SoundSettings({ voice = true }) {
  const st = useStore((s) => s.settings);
  return (
    <>
      <Switch
        label="Sound effects" hint="Taps, right and wrong answers, stars, Boss hits"
        checked={st.sound} onChange={(v) => { updateSettings({ sound: v }); if (v) { setSoundEnabled(true); sfx.toggleOn(); } }}
      />
      <Switch
        label="Music" hint={st.sound ? 'Soft background music in lessons and practice (never in mock exams)' : 'Turn on sound effects to hear music'}
        disabled={!st.sound} checked={st.sound && st.music !== false} onChange={(v) => updateSettings({ music: v })}
      />
      <Switch
        label="Vibration" hint="Buzzes on Android; light taps on iPhone"
        checked={st.haptics} onChange={(v) => { updateSettings({ haptics: v }); if (v) { setHapticsEnabled(true); haptic('success'); } }}
      />
      {voice && <VoicePicker value={st.voice ?? ''} />}
    </>
  );
}

export function ReadingSettings() {
  const st = useStore((s) => s.settings);
  return (
    <>
      <Segmented label="Font" value={st.font} onChange={(v) => updateSettings({ font: v })} options={[['atkinson', 'Atkinson'], ['lexend', 'Lexend']]} />
      <Segmented label="Text size" value={st.textScale} onChange={(v) => updateSettings({ textScale: v })} options={[[0.9, 'A−'], [1, 'A'], [1.15, 'A+'], [1.3, 'A++']]} />
    </>
  );
}

export function LookSettings({ confetti = true }) {
  const st = useStore((s) => s.settings);
  return (
    <>
      <Segmented label="Theme" value={st.theme} onChange={(v) => updateSettings({ theme: v })} options={[iconOption('system', 'phone', 'Auto'), iconOption('light', 'sun', 'Light'), iconOption('dark', 'moon', 'Dark')]} />
      <Switch label="Calm mode" hint="Quieter colors, no confetti, no idle animations" checked={st.calm} onChange={(v) => updateSettings({ calm: v })} />
      <Segmented label="Motion" value={st.motion} onChange={(v) => updateSettings({ motion: v })} options={[['system', 'Auto'], ['full', 'Full'], ['reduced', 'Reduced']]} />
      {confetti && <Switch label="Confetti" hint={st.calm ? 'Off while Calm mode is on' : undefined} disabled={st.calm} checked={!st.calm && st.confetti !== false} onChange={(v) => updateSettings({ confetti: v })} />}
    </>
  );
}
