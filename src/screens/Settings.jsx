import { useStore, updateSettings, setState, resetProgress } from '../state/store.js';
import { Switch, Segmented } from '../components/Controls.jsx';
import { back } from '../hooks/useRoute.js';
import { useFeedback } from '../components/Feedback.jsx';

export function Settings() {
  const s = useStore();
  const st = s.settings;
  const { showToast } = useFeedback();
  return (
    <main className="screen" id="main">
      <div className="topbar">
        <button className="icon-btn" onClick={() => back('/me')} aria-label="Back">←</button>
        <h1 className="grow">⚙️ Settings</h1>
      </div>

      <section className="card stack">
        <h2>🎯 Goals</h2>
        <Segmented label="Daily goal (XP)" value={s.dailyGoal} onChange={(v) => setState({ dailyGoal: v })} options={[[20, '20'], [50, '50'], [100, '100'], [150, '150']]} />
        <Segmented label="Questions per round" value={st.sprintSize} onChange={(v) => updateSettings({ sprintSize: v })} options={[[3, '3'], [5, '5'], [8, '8'], [10, '10']]} />
        <Segmented label="Focus timer (minutes)" value={st.focusMinutes} onChange={(v) => updateSettings({ focusMinutes: v })} options={[[0, 'Off'], [5, '5'], [10, '10'], [15, '15'], [25, '25']]} />
        <div className="field">
          <label htmlFor="exam-date">📅 Exam date (optional)</label>
          <input id="exam-date" className="input" type="date" value={s.examDate} onChange={(e) => setState({ examDate: e.target.value })} />
        </div>
        <div className="field">
          <label htmlFor="name">Your name (optional)</label>
          <input id="name" className="input" value={s.name} maxLength={24} onChange={(e) => setState({ name: e.target.value })} autoComplete="given-name" />
        </div>
      </section>

      <section className="card stack">
        <h2>🌈 Feel</h2>
        <Segmented label="Theme" value={st.theme} onChange={(v) => updateSettings({ theme: v })} options={[['system', 'Auto'], ['light', '☀️ Light'], ['dark', '🌙 Dark']]} />
        <Switch label="Calm mode" hint="Quieter colors, no confetti, no idle animations" checked={st.calm} onChange={(v) => updateSettings({ calm: v })} />
        <Segmented label="Motion" value={st.motion} onChange={(v) => updateSettings({ motion: v })} options={[['system', 'Auto'], ['full', 'Full'], ['reduced', 'Reduced']]} />
        <Switch label="Confetti" checked={st.confetti !== false} onChange={(v) => updateSettings({ confetti: v })} />
        <Switch label="Sounds" checked={st.sound} onChange={(v) => updateSettings({ sound: v })} />
        <Switch label="Haptics" hint="Vibration on Android, taps on iPhone" checked={st.haptics} onChange={(v) => updateSettings({ haptics: v })} />
      </section>

      <section className="card stack">
        <h2>🔤 Reading</h2>
        <Segmented label="Font" value={st.font} onChange={(v) => updateSettings({ font: v })} options={[['atkinson', 'Atkinson'], ['lexend', 'Lexend']]} />
        <Segmented label="Text size" value={st.textScale} onChange={(v) => updateSettings({ textScale: v })} options={[[0.9, 'A−'], [1, 'A'], [1.15, 'A+'], [1.3, 'A++']]} />
      </section>

      <section className="card stack">
        <h2>🧹 Data</h2>
        <p className="small muted">Your progress stays on this phone only. No account, no tracking.</p>
        <button className="btn" onClick={() => {
          if (confirm('Reset all progress? XP, streak and reviews will be cleared. Settings stay.')) { resetProgress(); showToast('Fresh start ✨'); }
        }}>Reset progress</button>
      </section>
      <p className="small muted center">PD2 Quest v{import.meta.env.VITE_APP_VERSION} · Original practice content, not affiliated with Salesforce.</p>
    </main>
  );
}
