// One question: options as toggle buttons (radio-like for single answer, checkbox-like for "Choose N").
import { motion } from 'motion/react';
import { CodeBlock } from './CodeBlock.jsx';
import { Rich } from '../lib/rich.jsx';
import { sfx } from '../audio/sfx.js';
import { haptic } from '../audio/haptics.js';
import { useReducedMotion } from '../hooks/useMotionPrefs.js';

const LETTERS = 'ABCDEF';

export function cleanQuestion(text) {
  return String(text).replace(/\s*\((choose|select) (\d|two|three)\)\s*$/i, '').trim();
}

export function QuestionView({ question, chosen, onToggle, revealed, nudge }) {
  const reduced = useReducedMotion();
  const multi = question.answer.length > 1;
  const correct = new Set(question.answer);

  return (
    <div className="stack">
      {multi && <div className="choose-n">Choose {question.answer.length} answers</div>}
      <h2 className="question" id={`q-${question.id}`}><Rich text={cleanQuestion(question.q)} /></h2>
      {question.code && <CodeBlock code={question.code} lang={question.lang} />}
      <motion.div
        className="options"
        role="group"
        aria-labelledby={`q-${question.id}`}
        animate={nudge && !reduced ? { x: [0, -6, 6, -6, 6, 0] } : { x: 0 }}
        transition={{ duration: 0.3 }}
      >
        {question.options.map((opt, i) => {
          const isChosen = chosen.includes(i);
          let cls = 'option';
          let mark = '';
          let srState = '';
          if (revealed) {
            if (correct.has(i)) { cls += ' is-right'; mark = '✓'; srState = ' (correct answer)'; }
            else if (isChosen) { cls += ' is-wrong'; mark = '✗'; srState = ' (your choice, incorrect)'; }
          }
          return (
            <motion.button
              key={i}
              type="button"
              className={cls}
              aria-pressed={isChosen}
              disabled={revealed}
              onClick={() => { sfx.tap(); haptic('light'); onToggle(i, multi); }}
              initial={reduced ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: reduced ? 0 : 0.04 * i, duration: 0.25, ease: [0.2, 0, 0, 1] }}
            >
              <span className="letter" aria-hidden="true">{LETTERS[i]}</span>
              <span><Rich text={opt} /><span className="sr-only">{srState}</span></span>
              <span className="mark" aria-hidden="true">{mark}</span>
            </motion.button>
          );
        })}
      </motion.div>
    </div>
  );
}
