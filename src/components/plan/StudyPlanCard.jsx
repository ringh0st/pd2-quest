// "Today's plan": 1-3 small tasks from the exam date, plus a kind on-track line.
import { useStore, setState, pushEvent } from '../../state/store.js';
import { studyPlan } from '../../engine/plan.js';
import { dayKey } from '../../engine/dates.js';
import { allLevels, routeForLevel } from '../../state/gameSelectors.js';
import { dueQuestionCount } from '../../state/selectors.js';
import { exam } from '../../data/index.js';
import { sfx } from '../../audio/sfx.js';

const STATUS = {
  'on-track': { emoji: '🟢', text: 'On track. Steady wins it.' },
  'bit-behind': { emoji: '🟡', text: 'A bit behind. One extra level a day catches up.' },
  tight: { emoji: '🟠', text: 'Tight on time. Focus on weak spots and mocks; skip what you know with placement.' },
  final: { emoji: '🏁', text: 'Final week: mocks and reviews, no new topics.' },
  'final-catchup': { emoji: '🏁', text: 'Final week: mocks first, then any levels left.' },
};

export function usePlan() {
  const s = useStore();
  return studyPlan({ today: dayKey(), examDate: s.examDate, levels: allLevels, stars: s.stars, exams: s.exams, dueReviews: dueQuestionCount(s.items), fullLength: exam.questions });
}

export function StudyPlanCard() {
  const plan = usePlan();
  const outcome = useStore((s) => s.examOutcome);

  if (plan.phase === 'no-date') {
    return (
      <a className="card link row" href="#/settings" onClick={() => sfx.tap()}>
        <span aria-hidden="true" style={{ fontSize: 24 }}>📅</span>
        <span className="grow"><strong>Booked your exam?</strong><br /><span className="small muted">Add the date and you’ll get a daily plan that fits.</span></span>
        <span aria-hidden="true">›</span>
      </a>
    );
  }

  if (plan.phase === 'past') {
    if (outcome === 'passed') return null;
    return (
      <section className="card stack-s" aria-labelledby="plan-past">
        <strong id="plan-past">📅 Exam day has passed. How did it go?</strong>
        <div className="row wrap">
          <button className="btn primary grow" onClick={() => { setState({ examOutcome: 'passed' }); pushEvent({ type: 'passed' }); sfx.levelUp(); }}>🎉 I passed!</button>
          <a className="btn grow" href="#/settings">Pick a new date</a>
        </div>
        <p className="small muted">Not this time? Retakes are common. Set a new date and the plan rebuilds around it.</p>
      </section>
    );
  }

  const st = STATUS[plan.status];
  return (
    <section className="card stack-s plan-card" aria-labelledby="plan-title">
      <div className="spread">
        <strong id="plan-title">🗓️ Today’s plan</strong>
        <span className="chip">{plan.daysLeft === 0 ? 'Exam today!' : `${plan.daysLeft} day${plan.daysLeft === 1 ? '' : 's'} left`}</span>
      </div>
      {plan.today.length ? (
        <ol className="list-plain stack-s">
          {plan.today.map((t, k) => (
            <li key={k}>
              <a className="plan-task" href={`#${t.kind === 'levels' ? routeForLevel(t.level) : t.to}`} onClick={() => sfx.tap()}>
                <span aria-hidden="true">{t.kind === 'levels' ? '▶' : t.kind === 'reviews' ? '🔁' : '🏁'}</span>
                <span className="grow">{t.label}</span>
                <span aria-hidden="true">›</span>
              </a>
            </li>
          ))}
        </ol>
      ) : <p className="small">Nothing left but you! Rest, hydrate, and good luck. 🍀</p>}
      {st && <p className="small"><span aria-hidden="true">{st.emoji}</span> {st.text}</p>}
      <a className="small" href="#/plan">See the week-by-week plan →</a>
    </section>
  );
}
