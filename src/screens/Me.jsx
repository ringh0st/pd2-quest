import { useStore, unparkThought } from '../state/store.js';
import { levelFor, rankFor } from '../engine/xp.js';
import { liveStreak } from '../engine/streak.js';
import { sectionMastery, readiness, accuracy } from '../engine/mastery.js';
import { dayKey } from '../engine/dates.js';
import { sections } from '../data/index.js';
import { totalLessons } from '../state/selectors.js';
import { ProgressRing } from '../components/ProgressRing.jsx';
import { CountUp } from '../components/CountUp.jsx';
import { sfx } from '../audio/sfx.js';

function lastDays(n) {
  const out = [];
  for (let k = n - 1; k >= 0; k--) {
    const d = new Date(); d.setDate(d.getDate() - k);
    out.push({ key: dayKey(d.getTime()), label: d.toLocaleDateString(undefined, { weekday: 'narrow' }) });
  }
  return out;
}

export function Me() {
  const s = useStore();
  const lv = levelFor(s.xp);
  const streak = liveStreak(s.streak);
  const ready = readiness(sections, s.items);
  const acc = accuracy(s.items);
  const days = lastDays(7);
  const today = dayKey();

  return (
    <main className="screen" id="main">
      <div className="spread">
        <h1>😎 {s.name || 'Your progress'}</h1>
        <a className="icon-btn" href="#/settings" aria-label="Settings" onClick={() => sfx.tap()}>⚙️</a>
      </div>

      <section className="hero row" style={{ gap: 16 }} aria-label="Level">
        <ProgressRing value={lv.progress} size={96} stroke={11} color="var(--gold)" label={`Level ${lv.level}, ${Math.round(lv.progress * 100)}% to next`}>
          <div><div style={{ fontSize: 12, fontWeight: 700 }} className="muted">LEVEL</div><div style={{ fontSize: 30, fontWeight: 700 }}>{lv.level}</div></div>
        </ProgressRing>
        <div className="stack-s grow">
          <strong style={{ fontSize: 19 }}>{rankFor(lv.level)}</strong>
          <span className="muted small"><CountUp value={s.xp} /> XP total · {lv.span - lv.into} XP to level {lv.level + 1}</span>
        </div>
      </section>

      <div className="stat-row">
        <div className="stat"><span className="num">🔥{streak}</span><span className="lbl">Streak (best {s.streak.best})</span></div>
        <div className="stat"><span className="num">{acc ?? '–'}{acc != null && '%'}</span><span className="lbl">Accuracy</span></div>
        <div className="stat"><span className="num">{Object.keys(s.lessons).length}/{totalLessons()}</span><span className="lbl">Lessons</span></div>
      </div>

      <section className="card stack" aria-label="Last 7 days">
        <div className="spread"><strong>This week</strong><span className="small muted">🧊 {s.streak.freezes} freeze{s.streak.freezes === 1 ? '' : 's'}</span></div>
        <div className="week">
          {days.map((d) => {
            const xp = s.history[d.key] || 0;
            const lvl = xp === 0 ? '' : xp < s.dailyGoal / 2 ? 'lvl1' : xp < s.dailyGoal ? 'lvl2' : 'lvl3';
            return (
              <div className="day" key={d.key}>
                <div className={`cell ${lvl} ${d.key === today ? 'today' : ''}`} role="img" aria-label={`${d.key}: ${xp} XP`}>{xp >= s.dailyGoal ? '🔥' : ''}</div>
                <span aria-hidden="true">{d.label}</span>
              </div>
            );
          })}
        </div>
        <p className="small muted">Any study keeps your streak. Freezes cover missed days automatically. You earn one every 7 days.</p>
      </section>

      <section className="card stack" aria-label="Mastery by section">
        <div className="spread"><strong>🎓 Exam readiness</strong><strong>{ready}%</strong></div>
        {sections.map((sec) => {
          const m = Math.round(sectionMastery(sec, s.items) * 100);
          return (
            <a key={sec.id} href={`#/section/${sec.id}`} className="stack-s" style={{ color: 'inherit', textDecoration: 'none' }}>
              <div className="spread small"><span>{sec.emoji} {sec.title} <span className="muted">({sec.weight}%)</span></span><strong>{m}%</strong></div>
              <div className="bar"><span style={{ width: `${Math.max(2, m)}%`, background: sec.accent }} /></div>
            </a>
          );
        })}
        <p className="small muted">Mastery grows when you answer questions right across spaced reviews, not just once.</p>
      </section>

      <section className="card stack" aria-label="Parked thoughts">
        <strong>🅿️ Parked thoughts</strong>
        {s.parked.length === 0
          ? <p className="small muted">Nothing parked. When a distracting thought pops up mid-study, tap 🅿️ to drop it here.</p>
          : (
            <ul className="list-plain">
              {s.parked.map((p) => (
                <li key={p.id} className="spread">
                  <span className="grow">{p.text}</span>
                  <button className="btn small" onClick={() => { sfx.done(); unparkThought(p.id); }} aria-label={`Done: ${p.text}`}>✓ Done</button>
                </li>
              ))}
            </ul>
          )}
      </section>

      <div className="row">
        <a className="btn grow" href="#/resources" onClick={() => sfx.tap()}>📚 Resources</a>
        <a className="btn grow" href="#/settings" onClick={() => sfx.tap()}>⚙️ Settings</a>
      </div>
    </main>
  );
}
