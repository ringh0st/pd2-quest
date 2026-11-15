import { APP_NAME, APP_VERSION, STUDIO_NAME } from '../lib/appInfo.js';
import { useRef } from 'react';
import { useStore, updateSettings, setState, resetProgress, exportProgress, importProgress } from '../state/store.js';
import { FEEL_PRESETS, presetFor } from '../state/feelPresets.js';
import { InstallHelpButton } from '../components/InstallHelp.jsx';
import { Switch, Segmented } from '../components/Controls.jsx';
import { go } from '../hooks/useRoute.js';
import { useFeedback } from '../components/Feedback.jsx';
import { ReminderSettings } from '../components/ReminderSettings.jsx';
import { Icon } from '../components/icons/Icon.jsx';
import { sfx, setSoundEnabled } from '../audio/sfx.js';
import { haptic, setHapticsEnabled } from '../audio/haptics.js';

/** Segmented option with its icon over the word. */
export const iconOption = (value, icon, text) => [value, <span className="pq-seg"><Icon name={icon} />{text}</span>];

export function Settings() {
  const s = useStore();
  const st = s.settings;
  const { showToast } = useFeedback();
  const fileRef = useRef(null);
  const preset = presetFor(st);
  const backup = () => {
    const blob = new Blob([exportProgress()], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `pd2-quest-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    showToast(<><Icon name="download" /> Backup saved</>);
  };
  const restore = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!confirm('Replace your current progress with this backup?')) return;
    showToast(importProgress(await file.text()) ? <><Icon name="ok" /> Progress restored</> : 'That file isn’t a PD2 Quest backup');
  };
  return (
    <main className="screen" id="main">
      <div className="topbar">
        <button className="icon-btn" onClick={() => go('/me')} aria-label="Back"><Icon name="back" /></button>
        <h1 className="grow pq-head"><span className="pq-tile s" data-tone="muted"><Icon name="settings" /></span><span>Settings</span></h1>
      </div>
      <InstallHelpButton />

      <section className="card stack">
        <h2 className="pq-head"><span className="pq-tile"><Icon name="target" /></span><span>Goals</span></h2>
        <Segmented label="Daily goal (XP)" value={s.dailyGoal} onChange={(v) => setState({ dailyGoal: v })} options={[[20, '20'], [50, '50'], [100, '100'], [150, '150']]} />
        <Segmented label="Questions per round" value={st.sprintSize} onChange={(v) => updateSettings({ sprintSize: v })} options={[[3, '3'], [5, '5'], [8, '8'], [10, '10']]} />
        <Segmented label="Focus timer (minutes)" value={st.focusMinutes} onChange={(v) => updateSettings({ focusMinutes: v })} options={[[0, 'Off'], [5, '5'], [10, '10'], [15, '15'], [25, '25']]} />
        <div className="field">
          <label htmlFor="exam-date" className="pq-label"><Icon name="plan" /> Exam date (optional, tap to pick)</label>
          <input id="exam-date" className="input" type="date" value={s.examDate} onChange={(e) => setState({ examDate: e.target.value })} />
        </div>
        <div className="field">
          <label htmlFor="name">Your name (optional)</label>
          <input id="name" className="input" value={s.name} maxLength={24} onChange={(e) => setState({ name: e.target.value })} autoComplete="given-name" />
        </div>
      </section>

      <ReminderSettings />

      <section className="card stack">
        <h2 className="pq-head"><span className="pq-tile" data-tone="gold"><Icon name="palette" /></span><span>Feel</span></h2>
        <Segmented
          label="How do you like it?" value={preset ?? 'custom'}
          onChange={(v) => FEEL_PRESETS[v] && updateSettings(FEEL_PRESETS[v].settings)}
          options={Object.entries(FEEL_PRESETS).map(([k, p]) => iconOption(k, p.icon, p.label))}
        />
        {!preset && <p className="small muted">Custom mix. Tap a preset to reset all of these at once.</p>}
        <Segmented label="Theme" value={st.theme} onChange={(v) => updateSettings({ theme: v })} options={[iconOption('system', 'phone', 'Auto'), iconOption('light', 'sun', 'Light'), iconOption('dark', 'moon', 'Dark')]} />
        <Switch label="Calm mode" hint="Quieter colors, no confetti, no idle animations" checked={st.calm} onChange={(v) => updateSettings({ calm: v })} />
        <Segmented label="Motion" value={st.motion} onChange={(v) => updateSettings({ motion: v })} options={[['system', 'Auto'], ['full', 'Full'], ['reduced', 'Reduced']]} />
        <Switch label="Confetti" hint={st.calm ? 'Off while Calm mode is on' : undefined} disabled={st.calm} checked={!st.calm && st.confetti !== false} onChange={(v) => updateSettings({ confetti: v })} />
      </section>

      <section className="card stack" aria-labelledby="sound-title">
        <h2 className="pq-head" id="sound-title"><span className="pq-tile" data-tone="flame"><Icon name="bell" /></span><span>Sound &amp; feel</span></h2>
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
      </section>

      <section className="card stack">
        <h2 className="pq-head"><span className="pq-tile" data-tone="teal"><Icon name="book" /></span><span>Reading</span></h2>
        <Segmented label="Font" value={st.font} onChange={(v) => updateSettings({ font: v })} options={[['atkinson', 'Atkinson'], ['lexend', 'Lexend']]} />
        <Segmented label="Text size" value={st.textScale} onChange={(v) => updateSettings({ textScale: v })} options={[[0.9, 'A−'], [1, 'A'], [1.15, 'A+'], [1.3, 'A++']]} />
      </section>

      <section className="card stack">
        <h2 className="pq-head"><span className="pq-tile" data-tone="flame"><Icon name="database" /></span><span>Data</span></h2>
        <p className="small muted">Your progress stays on this phone only. No account, no tracking. Save a backup now and then, because a browser can clear site data.</p>
        <div className="pq-btn-grid">
          <button className="btn" onClick={backup}><Icon name="download" /> Save backup</button>
          <button className="btn" onClick={() => fileRef.current?.click()}><Icon name="upload" /> Restore</button>
          <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={restore} aria-label="Choose a backup file" />
        </div>
        <button className="btn" onClick={() => {
          if (confirm('Reset all progress? XP, streak and reviews will be cleared. Settings stay.')) { resetProgress(); showToast(<><Icon name="sparkles" /> Fresh start</>); }
        }}><Icon name="retry" /> Reset progress</button>
      </section>
      <p className="small muted center">{APP_NAME} v{APP_VERSION} · by {STUDIO_NAME} · Original practice content, not affiliated with Salesforce.</p>
    </main>
  );
}
