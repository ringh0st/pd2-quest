// Lesson: swipe through 4-7 tiny cards, then 2-3 check questions, then a celebration.
import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { lessonById, sectionById, questionById } from '../data/index.js';
import { completeLesson, earn, getState, saveStars, checkBadges } from '../state/store.js';
import { XP } from '../engine/xp.js';
import { CodeBlock } from '../components/CodeBlock.jsx';
import { PracticeRunner } from '../components/PracticeRunner.jsx';
import { Rich } from '../lib/rich.jsx';
import { termMatcher, firstMentions } from '../lib/terms.js';
import { go } from '../hooks/useRoute.js';
import { useReducedMotion } from '../hooks/useMotionPrefs.js';
import { sfx } from '../audio/sfx.js';
import { haptic } from '../audio/haptics.js';
import { badgeContext } from '../state/selectors.js';
import { starsFor } from '../game/worlds.js';
import { nextLevelAfter } from '../state/gameSelectors.js';
import { WinScreen } from '../components/game/WinScreen.jsx';
import { ParkIt } from '../components/ParkIt.jsx';
import { Icon } from '../components/icons/Icon.jsx';
import { saveRun, loadRun, clearRun, questionsFor } from '../state/runSession.js';
import { useStudyScreen } from '../hooks/useStudyScreen.js';
import { SpeakButton } from '../components/SpeakButton.jsx';

const KIND_LABEL = {
  text: '', code: 'Code', list: '',
  tip: <span className="ic-label"><Icon name="idea" />Memory hook</span>,
  trap: <span className="ic-label"><Icon name="warn" />Exam trap</span>,
};

/** One clear label per card. Titled teaching cards get their own label instead of a doubled one. */
function cardLabel(card) {
  const t = card.title ?? '';
  if (t === 'In plain words') return { label: <span className="ic-label"><Icon name="chat" />In plain words</span>, title: null };
  if (t.startsWith('Think of it like')) return { label: <span className="ic-label"><Icon name="sparkles" />Picture it</span>, title: t };
  if (t === 'Remember it') return { label: KIND_LABEL.tip, title: null };
  return { label: KIND_LABEL[card.type] || '', title: t || null };
}

export function Lesson({ id }) {
  useStudyScreen();
  const lesson = lessonById[id];
  // Pick up where you left off: the card you were on, or the quick check mid-way.
  const [saved] = useState(() => (lesson ? loadRun(lesson.id) : null));
  const [phase, setPhase] = useState(() => (saved?.phase === 'check' && saved.runner ? 'check' : 'cards')); // cards | check | done
  const [i, setI] = useState(() => (saved?.phase === 'cards' ? Math.min(saved.i ?? 0, (lesson?.cards.length ?? 1) - 1) : 0));
  const [resumeRunner, setResumeRunner] = useState(() => (saved?.phase === 'check' ? saved.runner : null));
  const [dir, setDir] = useState(1);
  const [summary, setSummary] = useState(null);
  const reduced = useReducedMotion();
  const [term, setTerm] = useState(null); // index into lesson.terms, shown under the card
  const matcher = useMemo(() => termMatcher(lesson?.terms), [lesson]);

  if (!lesson) return <main className="screen"><p>Lesson not found.</p></main>;
  const sec = sectionById[lesson.section];
  const cards = lesson.cards;
  const card = cards[i];
  const checks = resumeRunner ? questionsFor(resumeRunner) : lesson.check.map((q) => questionById[q]).filter(Boolean);

  const move = (d) => {
    const n = i + d;
    if (n < 0) return;
    sfx.flip(); haptic('light');
    if (n >= cards.length) {
      earn(5);
      if (checks.length) saveRun(lesson.id, { phase: 'check', runner: null });
      setPhase(checks.length ? 'check' : 'done');
      if (!checks.length) finish({ right: 0, total: 0 });
      return;
    }
    setDir(d); setI(n); setTerm(null);
    saveRun(lesson.id, { phase: 'cards', i: n });
  };

  const finish = (result) => {
    clearRun(lesson.id);
    const firstTime = !getState().lessons[lesson.id];
    completeLesson(lesson.id);
    if (firstTime) earn(XP.lessonDone);
    const stars = starsFor('lesson', { right: result.firstRight ?? 0, total: result.total ?? 0 });
    const saved = saveStars(lesson.id, stars);
    checkBadges(badgeContext());
    setSummary({ ...result, firstTime, stars, ...saved });
    setPhase('done');
  };
  const restart = () => { clearRun(lesson.id); setResumeRunner(null); setI(0); setDir(1); setSummary(null); setPhase('cards'); };

  if (phase === 'check') {
    return (
      <main className="screen focus" id="main">
        <h1 className="small muted center" style={{ fontSize: 'var(--fs-small)' }}>Quick check · {checks.length} questions</h1>
        <PracticeRunner
          questions={checks} requeue={false} initial={resumeRunner}
          onProgress={(runner) => saveRun(lesson.id, { phase: 'check', runner })}
          onExit={() => go(`/world/${sec.id}`)} onDone={finish}
        />
      </main>
    );
  }

  if (phase === 'done') {
    return (
      <WinScreen
        kind="lesson" title={lesson.title} worldId={sec.id}
        stars={summary.stars} prevStars={summary.before} coins={summary.coins}
        xp={(summary.firstTime ? XP.lessonDone : 0) + (summary.xp ?? 0) + 5}
        detail={summary.total ? `${summary.firstRight}/${summary.total} right on first try${summary.firstRight === summary.total ? '' : ' · misses come back for review'}` : null}
        next={nextLevelAfter(lesson.id)}
        onRetry={restart}
      />
    );
  }

  const cardTexts = [card.type !== 'code' ? card.body : null, ...(card.items ?? []), card.type === 'code' ? card.body : null];
  const claims = matcher ? firstMentions(cardTexts, matcher) : new Map();
  const pickTerm = (k) => {
    sfx.tap(); haptic('light'); setTerm(k);
    // the meaning opens under the card: bring it into view above the sticky buttons
    if (k !== null) requestAnimationFrame(() => document.getElementById('term-panel')?.scrollIntoView({ block: 'nearest', behavior: reduced ? 'auto' : 'smooth' }));
  };
  const glossary = (owner) => (matcher ? { matcher, claims, owner, active: term, onTerm: pickTerm } : undefined);
  const shownTerm = term !== null && claims.has(term) ? lesson.terms[term] : null;

  return (
    <main className="screen focus" id="main">
      <div className="quiz-top">
        <button className="icon-btn" onClick={() => go(`/world/${sec.id}`)} aria-label="Close lesson"><Icon name="close" /></button>
        <div className="bar" role="progressbar" aria-label="Lesson progress" aria-valuemin={0} aria-valuemax={cards.length} aria-valuenow={i + 1}>
          <span style={{ width: `${((i + 1) / (cards.length + 1)) * 100}%` }} />
        </div>
        <span className="chip"><span className="sr-only">Card </span>{i + 1}/{cards.length}</span>
        <ParkIt />
      </div>
      <div>
        <p className="small muted ic-label" style={{ fontWeight: 700 }}><Icon name={sec.id} className="ic-sec" style={{ '--sec-accent': `var(--sec-${sec.id})` }} />{sec.title}</p>
        <h1 style={{ fontSize: 'calc(22px * var(--text-scale))' }}>{lesson.title}</h1>
        {/* stays in the layout (just hidden) after the first card, so the cards don't jump up */}
        <a
          className="small test-out-link" href={`#/placement/lesson/${lesson.id}`} onClick={() => sfx.tap()}
          style={i === 0 ? undefined : { visibility: 'hidden' }} aria-hidden={i === 0 ? undefined : true} tabIndex={i === 0 ? undefined : -1}
        >
          Know this already? Test out in 4 questions <Icon name="next" />
        </a>
      </div>

      <div className="lesson-stage" aria-live="polite">
        <AnimatePresence mode="popLayout" initial={false} custom={dir}>
          <motion.article
            key={i}
            className={`lesson-card is-${card.type}`}
            custom={dir}
            initial={reduced ? { opacity: 0 } : { opacity: 0, x: dir * 80, rotate: dir * 3 }}
            animate={{ opacity: 1, x: 0, rotate: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, x: dir * -80, rotate: dir * -3 }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            drag={reduced ? false : 'x'}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.6}
            onDragEnd={(_, info) => { if (info.offset.x < -70) move(1); else if (info.offset.x > 70) move(-1); }}
          >
            {cardLabel(card).label && <div className="kind">{cardLabel(card).label}</div>}
            <div className="lesson-card-tools">
              <SpeakButton
                label="Read this card aloud"
                text={[card.title, card.body, ...(card.items ?? []), card.type === 'code' ? 'There is a code example on this card.' : ''].filter(Boolean).join('. ')}
              />
            </div>
            {cardLabel(card).title && <h2><Rich text={cardLabel(card).title} /></h2>}
            {card.body && card.type !== 'code' && <p><Rich text={card.body} glossary={glossary(0)} /></p>}
            {card.type === 'list' && <ul>{card.items.map((it, k) => <li key={k}><Rich text={it} glossary={glossary(1 + k)} /></li>)}</ul>}
            {card.type === 'code' && <><CodeBlock code={card.code} lang={card.lang} />{card.body && <p className="small"><Rich text={card.body} glossary={glossary(cardTexts.length - 1)} /></p>}</>}
          </motion.article>
        </AnimatePresence>
      </div>

      {matcher && (
        <section id="term-panel" className="term-panel" aria-live="polite" aria-label="What this word means">
          {shownTerm ? (
            <motion.div key={term} className="term-box" initial={reduced ? { opacity: 0 } : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18 }}>
              <div className="term-head">
                <Icon name="idea" className="ic-gold" />
                <strong className="grow">{shownTerm.term}</strong>
                <SpeakButton label={`Read “${shownTerm.term}” aloud`} text={`${shownTerm.term}. ${shownTerm.say}`} />
                <button type="button" className="icon-btn" onClick={() => setTerm(null)} aria-label="Close the meaning"><Icon name="close" /></button>
              </div>
              <p>{shownTerm.say}</p>
            </motion.div>
          ) : claims.size > 0 ? (
            <p className="small muted term-hint"><span className="term-sample">Underlined words</span> are key terms. Tap one to see what it means.</p>
          ) : null}
        </section>
      )}

      <div className="dots" aria-hidden="true">{cards.map((_, k) => <span key={k} className={k === i ? 'on' : ''} />)}</div>
      <p className="small muted center">Swipe or tap the buttons</p>
      <div className="sticky-actions" style={{ gridTemplateColumns: '1fr 2fr' }}>
        <button className="btn" onClick={() => move(-1)} disabled={i === 0}><Icon name="back" /> Back</button>
        <button className="btn primary" onClick={() => move(1)}>{i + 1 >= cards.length
          ? (checks.length ? <>Quick check <Icon name="bolt" fill /></> : <>Finish <Icon name="party" /></>)
          : <>Next <Icon name="next" /></>}</button>
      </div>
    </main>
  );
}
