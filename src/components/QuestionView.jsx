// One question: options are radio buttons (single answer) or checkboxes ("Choose N"), built on <button> for the big tap targets.
import { motion, useAnimate } from 'motion/react';
import { CodeBlock } from './CodeBlock.jsx';
import { Rich, isCodeOnly, singleCodeSpan } from '../lib/rich.jsx';
import { InlineCode } from './InlineCode.jsx';
import { sfx } from '../audio/sfx.js';
import { haptic } from '../audio/haptics.js';
import { useReducedMotion } from '../hooks/useMotionPrefs.js';
import { Icon } from './icons/Icon.jsx';
import { SpeakButton } from './SpeakButton.jsx';
import { cleanQuestion, questionSpeech } from '../lib/speechText.js';
import { useShortcuts } from '../hooks/useShortcuts.js';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { TypedAnswer } from './language/TypedAnswer.jsx';
import { OrderTiles } from './language/OrderTiles.jsx';
import { speakLanguage, speakingId, stopSpeaking, subscribeSpeech } from '../lib/speech.js';
import { track } from '../lib/track.js';
import { useCalm } from '../hooks/useMotionPrefs.js';
import { FeedbackButton } from './FeedbackButton.jsx';
import { AdminEditButton } from '../components/admin/AdminEditButton.jsx';
import { useContentVersion } from '../hooks/useContentVersion.js';

const LETTERS = 'ABCDEF';

// Arrow keys move between options like a native radio/checkbox group (Tab still works too).
function arrowNav(e) {
  if (!['ArrowDown', 'ArrowUp', 'ArrowRight', 'ArrowLeft'].includes(e.key)) return;
  const opts = [...e.currentTarget.querySelectorAll('.option:not(:disabled)')];
  const k = opts.indexOf(document.activeElement);
  if (k < 0) return;
  e.preventDefault();
  const d = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : -1;
  opts[(k + d + opts.length) % opts.length].focus();
}

/**
 * `shake` is a counter bumped when an extra pick is blocked on a "Choose N" question: the label pulses
 * once (imperatively, so it never replays on the next question). Wrong answers don't shake anything:
 * the red mark, the verdict and Zap already say it, and a shake can feel like being scolded.
 */
/**
 * Language tasks (`question.kind`): 'type' shows an answer box (`typed`, `onTyped`, `onSubmit`, `result`), 'order'
 * shows word tiles (`placed`, `onPlaced`), 'listen' adds a Finnish audio panel above the options.
 */
export function QuestionView({ question, chosen, onToggle, revealed, shake = 0, hidden = [], typed = '', onTyped, onSubmit, placed = [], onPlaced, result }) {
  const reduced = useReducedMotion();
  useContentVersion(); // admin edits re-render the question
  const calm = useCalm();
  const [labelRef, animateLabel] = useAnimate();
  const lastShake = useRef(shake);
  useEffect(() => {
    if (shake === lastShake.current) return;
    lastShake.current = shake;
    if (!reduced && !calm && labelRef.current) animateLabel(labelRef.current, { scale: [1, 1.08, 1] }, { duration: 0.28 });
  }, [shake, reduced, calm, animateLabel, labelRef]);
  const typedTask = question.kind === 'type' || question.kind === 'order';
  const multi = !typedTask && question.answer.length > 1;
  const correct = new Set(typedTask ? [] : question.answer);
  // Laptop keys: A–E or 1–5 pick an option (the same as tapping it)
  useShortcuts((e) => {
    const k = e.key.toLowerCase();
    const i = /^[1-6]$/.test(k) ? Number(k) - 1 : 'abcdef'.indexOf(k);
    if (typedTask || revealed || i < 0 || i >= question.options.length || hidden.includes(i)) return false;
    sfx.select(); haptic('light'); onToggle(i, multi);
    return true;
  });

  return (
    <div className="stack">
      {multi && (
        <div className="choose-n" aria-live="polite" ref={labelRef}>
          Choose {question.answer.length} answers{!revealed && chosen.length ? ` · ${chosen.length}/${question.answer.length} picked` : ''}
        </div>
      )}
      <div className="q-head">
        <h2 className="question" id={`q-${question.id}`} lang={question.kind === 'type' ? 'fi' : undefined}>
          {question.kind === 'type' ? <GapText text={question.q} filled={revealed ? (result?.right ? typed : result?.expected) : null} /> : <Rich text={cleanQuestion(question.q)} autoCode />}
        </h2>
        <SpeakButton
          label="Read the question and answers aloud"
          text={questionSpeech(question)}
        />
        <FeedbackButton kind="question" where={{ id: question.id }} label="Report a problem with this question" />
        <AdminEditButton kind="question" id={question.id} />
      </div>
      {question.code && <CodeBlock code={question.code} lang={question.lang} tryable={revealed} />}
      {question.kind === 'type' && question.hint && <p className="small muted q-hint"><Icon name="idea" /> {question.hint}</p>}
      {question.kind === 'listen' && <ListenPanel key={question.id} text={question.audio} revealed={revealed} />}
      {question.kind === 'type' && <TypedAnswer value={typed} onChange={onTyped} onSubmit={onSubmit} revealed={revealed} result={result} />}
      {question.kind === 'order' && <OrderTiles tiles={question.tiles} placed={placed} onChange={onPlaced} revealed={revealed} result={result} />}
      {!typedTask && <div
        className="options"
        role={multi ? 'group' : 'radiogroup'}
        aria-labelledby={`q-${question.id}`}
        onKeyDown={arrowNav}
      >
        {question.options.map((opt, i) => {
          const isChosen = chosen.includes(i);
          const gone = hidden.includes(i) && !revealed;
          let cls = gone ? 'option is-gone' : 'option';
          let mark = null;
          let srState = '';
          if (revealed) {
            if (correct.has(i)) { cls += ' is-right'; mark = <Icon name="check" />; srState = ' (correct answer)'; }
            else if (isChosen) { cls += ' is-wrong'; mark = <Icon name="close" />; srState = ' (your choice, incorrect)'; }
          }
          return (
            <motion.button
              key={i}
              type="button"
              className={cls}
              role={multi ? 'checkbox' : 'radio'}
              aria-checked={isChosen}
              disabled={revealed || gone}
              aria-hidden={gone || undefined}
              onClick={() => { sfx.select(); haptic('light'); onToggle(i, multi); }}
              initial={reduced ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: reduced ? 0 : 0.03 * i, duration: 0.2 }}
            >
              <span className="letter" aria-hidden="true">{LETTERS[i]}</span>
              <span>{singleCodeSpan(opt) != null ? <InlineCode text={singleCodeSpan(opt)} block /> : isCodeOnly(opt) ? <InlineCode text={opt} block /> : <Rich text={opt} autoCode />}<span className="sr-only">{srState}</span></span>
              <span className="mark" aria-hidden="true">{mark}</span>
            </motion.button>
          );
        })}
      </div>}
    </div>
  );
}

/** A gap sentence: "Olen ___ (kauppa)." with the gap drawn as a line, filled in after checking. */
function GapText({ text, filled }) {
  const [before, after = ''] = text.split('___');
  return <>{before}<span className={`gap${filled ? ' filled' : ''}`}>{filled ?? '\u00a0'}</span>{after}</>;
}

/** Listening: the text is read by a Finnish voice, at most twice (as in YKI), and shown only after answering. */
function ListenPanel({ text, revealed }) {
  const [plays, setPlays] = useState(0);
  const playing = useSyncExternalStore(subscribeSpeech, speakingId, speakingId) === 'listen-task';
  const left = 2 - plays;
  const play = () => { if (playing) return; setPlays((n) => n + 1); speakLanguage('listen-task', text, { lang: track.lang || 'fi', rate: 0.88 }); };
  useEffect(() => () => { if (speakingId() === 'listen-task') stopSpeaking(); }, []);
  return (
    <div className="listen-panel">
      <button type="button" className="btn primary listen-play" onClick={play} disabled={playing || (left <= 0 && !revealed)}>
        <Icon name={playing ? 'speaker' : 'play'} /> {playing ? 'Playing…' : plays === 0 ? 'Listen' : revealed ? 'Listen again' : `Listen again (${left} left)`}
      </button>
      {revealed && <p className="listen-text" lang="fi">“{text}”</p>}
      {!revealed && plays === 0 && <p className="small muted">You can listen twice, like in the YKI test.</p>}
    </div>
  );
}
