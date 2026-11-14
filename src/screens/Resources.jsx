import { exam, sectionById } from '../data/index.js';
import { back } from '../hooks/useRoute.js';

const TYPE_EMOJI = { trailmix: '🧭', module: '🎒', doc: '📘', guide: '📋', video: '🎬', trail: '🥾' };

export function Resources() {
  return (
    <main className="screen" id="main">
      <div className="topbar">
        <button className="icon-btn" onClick={() => back('/map')} aria-label="Back">←</button>
        <h1 className="grow">📚 Free resources</h1>
      </div>
      <p className="muted small">Official, free Salesforce material. Opens in your browser. Exam facts last checked {exam.lastVerified}.</p>

      <section className="card stack">
        <h2>🗓️ {exam.studyPlan.length}-week plan</h2>
        <ol className="list-plain">
          {exam.studyPlan.map((w) => (
            <li key={w.week}>
              <details>
                <summary style={{ cursor: 'pointer', fontWeight: 700, minHeight: 32 }}>Week {w.week}: {w.focus}</summary>
                <ul className="small" style={{ paddingLeft: '1.2em' }}>{w.tasks.map((t) => <li key={t}>{t}</li>)}</ul>
              </details>
            </li>
          ))}
        </ol>
      </section>

      <section className="stack">
        <h2>🔗 Links</h2>
        <ul className="list-plain">
          {exam.resources.map((r) => (
            <li key={r.url}>
              <a className="card link tight row" href={r.url} target="_blank" rel="noopener noreferrer" style={{ alignItems: 'flex-start' }}>
                <span aria-hidden="true" style={{ fontSize: 22 }}>{TYPE_EMOJI[r.type] || '🔗'}</span>
                <span className="grow">
                  <strong>{r.title}</strong>
                  <span className="sr-only"> (opens in new tab)</span><br />
                  <span className="small muted">{r.why}</span><br />
                  <span className="small muted">{r.section === 'all' ? 'All sections' : `${sectionById[r.section]?.emoji ?? ''} ${sectionById[r.section]?.title ?? ''}`}</span>
                </span>
                <span aria-hidden="true">↗</span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section className="card stack">
        <h2>🎯 Exam-day tips</h2>
        <ul className="small" style={{ margin: 0, paddingLeft: '1.2em', display: 'grid', gap: 6 }}>{exam.tips.map((t) => <li key={t}>{t}</li>)}</ul>
      </section>
    </main>
  );
}
