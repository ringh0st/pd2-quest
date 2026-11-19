// Writing desk (language tracks): guided writing like the YKI writing test. Pick a task, write with the points to
// cover and useful phrases at hand, then check yourself against a list and compare with a model answer.
// Tasks open when you've done the lesson they belong to.
import { useMemo, useRef, useState } from 'react';
import { allWriting, lessonById, sectionById } from '../data/index.js';
import { useStore, earn } from '../state/store.js';
import { writingState, saveWriting, wordCount } from '../lib/writingDrafts.js';
import { go } from '../hooks/useRoute.js';
import { Icon } from '../components/icons/Icon.jsx';
import { ListenButton } from '../components/language/ListenButton.jsx';
import { useFeedback } from '../components/Feedback.jsx';
import { sfx } from '../audio/sfx.js';

const TYPE = { informal: 'Informal message', formal: 'Formal message', opinion: 'Opinion text' };
const XP_FOR_TASK = 20;

export function WritingDesk({ id }) {
  const task = allWriting.find((w) => w.id === id);
  return task ? <WritingTask key={task.id} task={task} /> : <WritingList />;
}

function WritingList() {
  const lessons = useStore((s) => s.lessons);
  return (
    <main className="screen" id="main">
      <div className="topbar">
        <button className="icon-btn" onClick={() => go('/')} aria-label="Back"><Icon name="back" /></button>
        <h1 className="grow pq-head"><span className="pq-tile s"><Icon name="pen" /></span><span>Writing desk</span></h1>
      </div>
      <p className="small muted">Practice the YKI writing test: a situation, the points to cover, then check yourself against a model answer. A task opens when you finish its lesson.</p>
      {allWriting.length === 0 && <p className="card small muted">No writing tasks yet.</p>}
      <ol className="list-plain stack-s">
        {allWriting.map((w) => {
          const open = !!lessons[w.lesson];
          const st = writingState(w.id);
          return (
            <li key={w.id}>
              <a className={`card link row writing-item${open ? '' : ' locked'}`} href={open ? `#/write/${w.id}` : undefined} aria-disabled={!open || undefined} onClick={(e) => { if (!open) { e.preventDefault(); return; } sfx.tap(); }}>
                <span className="ic-tile" aria-hidden="true"><Icon name={st.done ? 'ok' : open ? 'pen' : 'lock'} /></span>
                <span className="grow">
                  <strong>{w.title}</strong><br />
                  <span className="small muted">{TYPE[w.type]} · {sectionById[w.section]?.short}{!open && ` · after “${lessonById[w.lesson]?.title}”`}{st.done ? ' · done' : st.text ? ' · draft saved' : ''}</span>
                </span>
                {open && <Icon name="chevron" />}
              </a>
            </li>
          );
        })}
      </ol>
    </main>
  );
}

function WritingTask({ task }) {
  const [state, setState] = useState(() => writingState(task.id));
  const [phase, setPhase] = useState(state.done ? 'review' : 'write'); // write | check | review
  const ref = useRef(null);
  const { showToast } = useFeedback();
  const words = wordCount(state.text);
  const [min, max] = task.words ?? [0, 0];
  const update = (patch) => setState(saveWriting(task.id, patch));
  const insert = (text, asWord = true) => {
    const el = ref.current;
    const v = state.text;
    const start = el?.selectionStart ?? v.length;
    const end = el?.selectionEnd ?? v.length;
    const add = (asWord && start > 0 && !/\s$/.test(v.slice(0, start)) ? ' ' : '') + text;
    update({ text: v.slice(0, start) + add + v.slice(end) });
    requestAnimationFrame(() => { el?.focus(); el?.setSelectionRange(start + add.length, start + add.length); });
  };
  const ticks = useMemo(() => new Set(state.ticks), [state.ticks]);
  const finish = () => {
    if (!state.done) { earn(XP_FOR_TASK); sfx.done(); showToast(`Saved! +${XP_FOR_TASK} XP`, 'check'); }
    update({ done: state.done ?? new Date().toISOString() });
    setPhase('review');
  };

  return (
    <main className="screen focus" id="main">
      <div className="topbar">
        <button className="icon-btn" onClick={() => go('/write')} aria-label="Back to the writing desk"><Icon name="back" /></button>
        <h1 className="grow pq-head" style={{ fontSize: 'calc(20px * var(--text-scale))' }}><span>{task.title}</span></h1>
      </div>
      <section className="card stack-s">
        <span className="chip">{TYPE[task.type]}</span>
        <p>{task.situation}</p>
        <strong className="small">Cover these points:</strong>
        <ul className="writing-points">{task.points.map((p) => <li key={p}>{p}</li>)}</ul>
        {task.words && <p className="small muted">Aim for about {min}–{max} words (guidance; the YKI test sets no word count).</p>}
      </section>

      {phase === 'write' && (
        <>
          {task.phrases?.length > 0 && (
            <div className="phrase-bank" role="group" aria-label="Useful phrases: tap to add">
              {task.phrases.map((p) => <button key={p} type="button" className="chip-btn" lang="fi" onClick={() => insert(p)}>{p}</button>)}
            </div>
          )}
          <label htmlFor="writing-text" className="sr-only">Your text</label>
          <textarea
            id="writing-text" ref={ref} className="input writing-text" lang="fi" rows={9} value={state.text}
            onChange={(e) => update({ text: e.target.value })} placeholder="Kirjoita tähän… (write here)" spellCheck={false}
          />
          <div className="writing-tools">
            <div className="typed-keys" role="group" aria-label="Finnish letters">
              {['ä', 'ö', 'Ä', 'Ö'].map((ch) => <button key={ch} type="button" className="pg-key" onPointerDown={(e) => e.preventDefault()} onClick={() => insert(ch, false)} aria-label={`Type ${ch}`}>{ch}</button>)}
            </div>
            <span className={`small writing-count${task.words && words >= min ? ' ok' : ''}`} aria-live="polite">{words} words</span>
          </div>
          <button type="button" className="btn primary block big" disabled={words < 3} onClick={() => { sfx.tap(); setPhase('check'); }}><Icon name="checklist" /> I’m done: check myself</button>
        </>
      )}

      {phase !== 'write' && (
        <section className="card stack-s">
          <strong>Your text</strong>
          <p className="writing-mine" lang="fi">{state.text}</p>
          {phase === 'review' && <button type="button" className="btn small" onClick={() => setPhase('write')}><Icon name="pen" /> Edit my text</button>}
        </section>
      )}

      {phase === 'check' && (
        <section className="card stack-s">
          <strong>Check yourself</strong>
          <p className="small muted">Tick what you did. Anything left? Go back and add it: that’s how the writing grade goes up.</p>
          <ul className="list-plain stack-s">
            {[...task.points.map((p) => `I wrote about: ${p}`), ...task.checklist].map((c) => (
              <li key={c}>
                <label className="check-row">
                  <input type="checkbox" checked={ticks.has(c)} onChange={() => update({ ticks: ticks.has(c) ? state.ticks.filter((x) => x !== c) : [...state.ticks, c] })} />
                  <span>{c}</span>
                </label>
              </li>
            ))}
          </ul>
          <div className="edit-actions">
            <button type="button" className="btn" onClick={() => setPhase('write')}><Icon name="pen" /> Improve it</button>
            <button type="button" className="btn primary" onClick={finish}><Icon name="check" /> Finish</button>
          </div>
        </section>
      )}

      {phase === 'review' && (
        <section className="card stack-s">
          <div className="spread"><strong>Model answer</strong><ListenButton text={task.model} label="Listen to the model answer" /></div>
          <p className="writing-model" lang="fi">{task.model}</p>
          <p className="small muted">Compare: did you cover the same points? Borrow a phrase or two for next time.</p>
          <button type="button" className="btn primary block" onClick={() => go('/write')}>Back to the writing desk</button>
        </section>
      )}
    </main>
  );
}
