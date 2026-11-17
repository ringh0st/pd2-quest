import { track, TRACKS, TRACK_IDS, switchTrack } from '../lib/track.js';
import { APP_NAME, APP_VERSION, STUDIO_NAME } from '../lib/appInfo.js';
import { useRef } from 'react';
import { useStore, updateSettings, setState, resetProgress, exportProgress, importProgress } from '../state/store.js';
import { FEEL_PRESETS, presetFor } from '../state/feelPresets.js';
import { InstallHelpButton } from '../components/InstallHelp.jsx';
import { Switch, Segmented } from '../components/Controls.jsx';
import { go } from '../hooks/useRoute.js';
import { useFeedback } from '../components/Feedback.jsx';
import { ReminderSettings } from '../components/ReminderSettings.jsx';
import { iconOption, LookSettings, ReadingSettings, SoundSettings } from '../components/settings/SettingsGroups.jsx';
import { Icon } from '../components/icons/Icon.jsx';


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
    a.download = `${track.id}-quest-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    showToast(<><Icon name="download" /> Backup saved</>);
  };
  const restore = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!confirm('Replace your current progress with this backup?')) return;
    showToast(importProgress(await file.text()) ? <><Icon name="ok" /> Progress restored</> : `That file isn’t a ${APP_NAME} backup`);
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
        <Segmented
          label="Studying for" value={track.id} onChange={(id) => id !== track.id && switchTrack(id)}
          options={TRACK_IDS.map((id) => [id, TRACKS[id].short])}
        />
        <p className="small muted">Each exam keeps its own progress, streak and coins. Settings are shared.</p>
        <Segmented label="Daily goal (XP)" value={s.dailyGoal} onChange={(v) => setState({ dailyGoal: v })} options={[[20, '20'], [50, '50'], [100, '100'], [150, '150']]} />
        <Switch
          label="Ask how sure I am" hint="Check · Sure or Check · Guessing in practice. Lucky guesses come back sooner."
          checked={st.askConfidence !== false} onChange={(v) => updateSettings({ askConfidence: v })}
        />
        <Segmented
          label="Break reminders" value={st.breakMinutes ?? 30} onChange={(v) => updateSettings({ breakMinutes: v })}
          options={[[0, 'Off'], [25, '25 min'], [30, '30 min'], [45, '45 min']]}
        />
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
        <LookSettings />
      </section>

      <section className="card stack" aria-labelledby="sound-title">
        <h2 className="pq-head" id="sound-title"><span className="pq-tile" data-tone="flame"><Icon name="bell" /></span><span>Sound &amp; feel</span></h2>
        <SoundSettings />
      </section>

      <section className="card stack">
        <h2 className="pq-head"><span className="pq-tile" data-tone="teal"><Icon name="book" /></span><span>Reading</span></h2>
        <ReadingSettings />
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
