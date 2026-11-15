// One question: options are radio buttons (single answer) or checkboxes ("Choose N"), built on <button> for the big tap targets.
import { motion } from 'motion/react';
import { CodeBlock } from './CodeBlock.jsx';
import { Rich, isCodeOnly, singleCodeSpan } from '../lib/rich.jsx';
import { InlineCode } from './InlineCode.jsx';
import { sfx } from '../audio/sfx.js';
import { haptic } from '../audio/haptics.js';
import { useReducedMotion } from '../hooks/useMotionPrefs.js';
import { Icon } from './icons/Icon.jsx';

const LETTERS = 'ABCDEF';

export function cleanQuestion(text) {
  // The UI already shows "Choose N answers", so drop "(Choose 2)" / "Choose 2." / "Select two." from the stem.
  return String(text).replace(/\s*\(?(choose|select) (\d|two|three)(\s+answers)?[.)]?\s*$/i, '').trim();
}

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

export function QuestionView({ question, chosen, onToggle, revealed, nudge, shake = 0, hidden = [] }) {
  const reduced = useReducedMotion();
  const multi = question.answer.length > 1;
  const correct = new Set(question.answer);

  return (
    <div className="stack">
      {multi && (
        <div className="choose-n" aria-live="polite">
          Choose {question.answer.length} answers{!revealed && chosen.length ? ` · ${chosen.length}/${question.answer.length} picked` : ''}
        </div>
      )}
      <h2 className="question" id={`q-${question.id}`}><Rich text={cleanQuestion(question.q)} autoCode /></h2>
      {question.code && <CodeBlock code={question.code} lang={question.lang} />}
      <motion.div
        className="options"
        role={multi ? 'group' : 'radiogroup'}
        aria-labelledby={`q-${question.id}`}
        onKeyDown={arrowNav}
        // a new keyframe list (alternating by `shake`) replays the wiggle without remounting the options
        animate={(nudge || shake) && !reduced ? { x: shake % 2 ? [0, 6, -6, 6, -6, 0] : [0, -6, 6, -6, 6, 0] } : { x: 0 }}
        transition={{ duration: 0.3 }}
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
              initial={reduced ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: reduced ? 0 : 0.04 * i, duration: 0.25, ease: [0.2, 0, 0, 1] }}
            >
              <span className="letter" aria-hidden="true">{LETTERS[i]}</span>
              <span>{singleCodeSpan(opt) != null ? <InlineCode text={singleCodeSpan(opt)} block /> : isCodeOnly(opt) ? <InlineCode text={opt} block /> : <Rich text={opt} autoCode />}<span className="sr-only">{srState}</span></span>
              <span className="mark" aria-hidden="true">{mark}</span>
            </motion.button>
          );
        })}
      </motion.div>
    </div>
  );
}
