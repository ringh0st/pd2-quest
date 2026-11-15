// Week-by-week study plan built from the exam date (route #/plan).
import { usePlan } from '../components/plan/StudyPlanCard.jsx';
import { sectionById } from '../data/index.js';
import { go } from '../hooks/useRoute.js';
import { FINAL_DAYS } from '../engine/plan.js';
import { Icon } from '../components/icons/Icon.jsx';
import { HeroArt } from '../components/art/HeroArt.jsx';

export function Plan() {
  const plan = usePlan();
  return (
    <main className="screen" id="main">
      <div className="topbar">
        <button className="icon-btn" onClick={() => go('/')} aria-label="Back home"><Icon name="back" /></button>
        <div className="grow plan-head">
          <HeroArt kind="plan" size={48} />
          <h1>My study plan</h1>
        </div>
      </div>
      {plan.phase === 'no-date' || plan.phase === 'past' ? (
        <div className="card stack-s">
          <p>{plan.phase === 'past' ? 'Your exam date has passed.' : 'Add your exam date and the plan builds itself.'}</p>
          <a className="btn primary" href="#/settings">Set exam date</a>
        </div>
      ) : (
        <>
          <p className="muted">
            {plan.daysLeft} day{plan.daysLeft === 1 ? '' : 's'} to go · {plan.remaining} level{plan.remaining === 1 ? '' : 's'} left
            {plan.perDay ? ` · about ${plan.perDay} a day` : ''}. The last {FINAL_DAYS} days are for mocks and reviews.
          </p>
          <ol className="list-plain stack">
            {plan.weeks.map((w) => (
              <li key={w.week} className="card stack-s">
                <strong className="ic-label">Week {w.week}{w.kind === 'final' && <>: exam prep <Icon name="exam" style={{ color: 'var(--primary)' }} /></>}</strong>
                {w.kind === 'learn' ? (
                  <p className="small">
                    {w.levels} level{w.levels === 1 ? '' : 's'} in{' '}
                    {w.worlds.map((id, k) => (
                      <span key={id}>{k ? ', ' : ''}<Icon name={id} className="ic-sec" style={{ '--sec-accent': `var(--sec-${id})` }} /> {sectionById[id]?.short}</span>
                    ))}
                    {w.bosses ? <> · <Icon name="swords" className="ic-bad" /> {w.bosses} boss fight{w.bosses === 1 ? '' : 's'}</> : ''}
                  </p>
                ) : (
                  <ul className="small" style={{ margin: 0, paddingLeft: '1.2em' }}>
                    <li>Two or three timed full mocks, spread out</li>
                    <li>Review every miss; daily review sprints</li>
                    <li>Light day before the exam. Sleep beats cramming.</li>
                  </ul>
                )}
              </li>
            ))}
          </ol>
          <a className="card link row" href="#/resources">
            <span className="ic-tile sm" aria-hidden="true"><Icon name="book" /></span>
            <span className="grow small">Hands-on Trailhead tasks for each week are in Resources.</span>
            <Icon name="chevron" />
          </a>
        </>
      )}
    </main>
  );
}
