// Opens the exact spot a feedback report points at: #/go/<exam>/<kind>/<id>[/<card>] (see lib/feedbackLocation.js).
// Switches to the report's exam first if needed, then shows the lesson card, the question (answer it to see the
// explanation), the flashcard, or the screen.
import { useEffect } from 'react';
import { TRACKS, track, switchTrack } from '../lib/track.js';
import { lessonById, questionById, allFlashcards } from '../data/index.js';
import { PracticeRunner } from '../components/PracticeRunner.jsx';
import { Rich } from '../lib/rich.jsx';
import { Icon } from '../components/icons/Icon.jsx';
import { FeedbackButton } from '../components/FeedbackButton.jsx';
import { AdminEditButton } from '../components/admin/AdminEditButton.jsx';
import { useContentVersion } from '../hooks/useContentVersion.js';
import { go, replace } from '../hooks/useRoute.js';

const PENDING = 'devquest.goto';

/** After switching exams the app reloads at Home: this sends it on to the link that asked for the switch. */
export function resumePendingGoTo() {
  try {
    const to = sessionStorage.getItem(PENDING);
    if (!to) return;
    sessionStorage.removeItem(PENDING);
    replace(to);
  } catch { /* storage blocked */ }
}

export function GoTo({ parts, query = {} }) {
  useContentVersion(); // admin edits re-render the flashcard
  const [, exam, kind, rawId = '', n] = parts;
  const id = decodeURIComponent(rawId);
  const otherExam = TRACKS[exam] && exam !== track.id;

  useEffect(() => {
    if (otherExam) {
      const qs = new URLSearchParams(query).toString();
      try { sessionStorage.setItem(PENDING, `/${parts.join('/')}${qs ? `?${qs}` : ''}`); } catch { /* storage blocked */ }
      switchTrack(exam);
      return;
    }
    if ((kind === 'card' || kind === 'term') && lessonById[id]) replace(`/lesson/${id}?card=${Number(n) || 0}`);
    else if (kind === 'app') {
      const qs = new URLSearchParams(query).toString();
      replace(`/${parts.slice(3).join('/')}${qs ? `?${qs}` : ''}`);
    }
  }, [otherExam]); // eslint-disable-line react-hooks/exhaustive-deps

  if (otherExam || ((kind === 'card' || kind === 'term') && lessonById[id]) || kind === 'app') {
    return <main className="screen" id="main" aria-busy="true"><p className="muted">Opening…</p></main>;
  }
  if ((kind === 'question' || kind === 'explanation') && questionById[id]) {
    return (
      <main className="screen focus" id="main">
        <p className="small muted ic-label"><Icon name="target" /> Reported question {id}: answer it to see the explanation</p>
        <PracticeRunner questions={[questionById[id]]} requeue={false} onExit={(to) => go(to ?? '/')} onDone={() => go('/')} />
      </main>
    );
  }
  const card = kind === 'flashcard' && allFlashcards.find((f) => f.id === id);
  if (card) {
    return (
      <main className="screen" id="main">
        <div className="topbar">
          <button className="icon-btn" onClick={() => go('/cards')} aria-label="Back to flashcards"><Icon name="back" /></button>
          <h1 className="grow" style={{ fontSize: 'calc(20px * var(--text-scale))' }}>Flashcard {id}</h1>
          <FeedbackButton kind="flashcard" where={{ id }} />
          <AdminEditButton kind="flashcard" id={id} />
        </div>
        <section className="card stack">
          <span className="small muted" style={{ fontWeight: 700 }}>QUESTION</span>
          <strong><Rich text={card.front} autoCode /></strong>
          <span className="small muted" style={{ fontWeight: 700 }}>ANSWER</span>
          <p><Rich text={card.back} autoCode /></p>
        </section>
      </main>
    );
  }
  return (
    <main className="screen" id="main">
      <h1>Not found</h1>
      <p className="muted">“{id || parts.join('/')}” isn’t in this version of the app. It may have been renamed or removed.</p>
      <button className="btn primary" onClick={() => go('/')}>Home</button>
    </main>
  );
}
