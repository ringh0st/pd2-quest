import { exam, sectionById } from '../data/index.js';
import { go } from '../hooks/useRoute.js';
import { Icon } from '../components/icons/Icon.jsx';

const TYPE_ICON = { trailmix: 'compass', module: 'puzzle', doc: 'book', guide: 'checklist', video: 'play', trail: 'mountain' };

export function Resources() {
  return (
    <main className="screen" id="main">
      <div className="topbar">
        <button className="icon-btn" onClick={() => go('/map')} aria-label="Back"><Icon name="back" /></button>
        <h1 className="grow pq-head"><span className="pq-tile s"><Icon name="library" /></span><span>Free resources</span></h1>
      </div>
      <p className="muted small">Official, free Salesforce material. Opens in your browser. Exam facts last checked {exam.lastVerified}.</p>

      <section className="card stack">
        <h2 className="pq-head"><span className="pq-tile" data-tone="teal"><Icon name="plan" /></span><span>{exam.studyPlan.length}-week plan</span></h2>
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
        <h2 className="pq-head"><span className="pq-tile" data-tone="green"><Icon name="compass" /></span><span>Links</span></h2>
        <ul className="list-plain">
          {exam.resources.map((r) => (
            <li key={r.url}>
              <a className="card link tight row" href={r.url} target="_blank" rel="noopener noreferrer" style={{ alignItems: 'flex-start' }}>
                <span className="pq-tile s pq-res-icon"><Icon name={TYPE_ICON[r.type] || 'book'} /></span>
                <span className="grow">
                  <strong>{r.title}</strong>
                  <span className="sr-only"> (opens in new tab)</span><br />
                  <span className="small muted">{r.why}</span><br />
                  <span className="small muted">{r.section === 'all' ? 'All sections' : <><Icon name={r.section} /> {sectionById[r.section]?.title ?? ''}</>}</span>
                </span>
                <Icon name="chevron" className="pq-ext" />
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section className="card stack">
        <h2 className="pq-head"><span className="pq-tile" data-tone="gold"><Icon name="target" /></span><span>Exam-day tips</span></h2>
        <ul className="small" style={{ margin: 0, paddingLeft: '1.2em', display: 'grid', gap: 6 }}>{exam.tips.map((t) => <li key={t}>{t}</li>)}</ul>
      </section>
    </main>
  );
}
