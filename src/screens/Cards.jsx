// Flashcards: due cards first, then up to 10 new ones. Tap to flip (3D), grade with 3 big buttons.
import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { allFlashcards, sectionById, sections } from '../data/index.js';
import { useStore, gradeCard, earn, getState } from '../state/store.js';
import { isDue } from '../engine/srs.js';
import { shuffle } from '../engine/session.js';
import { XP } from '../engine/xp.js';
import { Rich } from '../lib/rich.jsx';
import { go } from '../hooks/useRoute.js';
import { useReducedMotion } from '../hooks/useMotionPrefs.js';
import { useFeedback } from '../components/Feedback.jsx';
import { sfx } from '../audio/sfx.js';
import { haptic } from '../audio/haptics.js';
import { useFocusMode } from '../hooks/useFocusMode.js';
import { ParkIt } from '../components/ParkIt.jsx';

const NEW_PER_DECK = 10;

function buildDeck(sectionId) {
  const { cards } = getState();
  const pool = allFlashcards.filter((f) => !sectionId || f.section === sectionId);
  const due = shuffle(pool.filter((f) => isDue(cards[f.id])));
  const fresh = pool.filter((f) => !cards[f.id]?.seen).slice(0, NEW_PER_DECK);
  return [...due, ...shuffle(fresh)].slice(0, 20);
}

export function Cards({ query }) {
  const [sectionId, setSectionId] = useState(query.section || '');
  const [deck, setDeck] = useState(null);
  const [i, setI] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [tally, setTally] = useState({ again: 0, good: 0, easy: 0 });
  const reduced = useReducedMotion();
  const { celebrate, announce } = useFeedback();
  const cards = useStore((s) => s.cards);
  useFocusMode(!!deck);

  const counts = useMemo(() => {
    const pool = allFlashcards.filter((f) => !sectionId || f.section === sectionId);
    return { due: pool.filter((f) => isDue(cards[f.id])).length, fresh: pool.filter((f) => !cards[f.id]?.seen).length, total: pool.length };
  }, [cards, sectionId]);

  if (!deck) {
    return (
      <main className="screen" id="main">
        <h1>🃏 Flashcards</h1>
        <p className="muted">Quick recall. Flip, then be honest: “Again” brings it back sooner, which is how it sticks.</p>
        <div className="field">
          <label htmlFor="deck-sec">Deck</label>
          <select id="deck-sec" className="input" value={sectionId} onChange={(e) => setSectionId(e.target.value)}>
            <option value="">🎲 All sections (mixed)</option>
            {sections.map((s) => <option key={s.id} value={s.id}>{s.emoji} {s.title}</option>)}
          </select>
        </div>
        <div className="stat-row">
          <div className="stat"><span className="num">{counts.due}</span><span className="lbl">Due now</span></div>
          <div className="stat"><span className="num">{counts.fresh}</span><span className="lbl">New</span></div>
          <div className="stat"><span className="num">{counts.total}</span><span className="lbl">Total</span></div>
        </div>
        <button
          className="btn primary block big" disabled={!counts.due && !counts.fresh}
          onClick={() => { sfx.tap(); const d = buildDeck(sectionId); setDeck(d); setI(0); setFlipped(false); setTally({ again: 0, good: 0, easy: 0 }); }}
        >
          {counts.due || counts.fresh ? `Start ${Math.min(20, counts.due + Math.min(NEW_PER_DECK, counts.fresh))} cards ▶` : 'All caught up! 🎉'}
        </button>
      </main>
    );
  }

  if (i >= deck.length) {
    return (
      <main className="screen focus" id="main" style={{ justifyContent: 'center' }}>
        <motion.div className="celebrate-card" style={{ margin: '0 auto' }} initial={reduced ? { opacity: 0 } : { scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 400, damping: 22 }}>
          <div className="big-emoji" aria-hidden="true">🧠</div>
          <h1>Deck done!</h1>
          <p>{tally.good + tally.easy} known · {tally.again} to revisit</p>
          <span className="chip gold">+{deck.length * XP.flashcard} XP</span>
          <button className="btn primary block" autoFocus onClick={() => { setDeck(null); }}>Another deck</button>
          <button className="btn block" onClick={() => go('/')}>Done for now ✓</button>
        </motion.div>
      </main>
    );
  }

  const card = deck[i];
  const sec = sectionById[card.section];
  const grade = (g) => {
    gradeCard(card.id, g);
    earn(XP.flashcard);
    setTally((t) => ({ ...t, [g]: t[g] + 1 }));
    if (g === 'again') { sfx.wrong(); haptic('soft'); } else { sfx.correct(g === 'easy' ? 3 : 1); haptic('light'); }
    setFlipped(false);
    if (i + 1 >= deck.length) { sfx.done(); celebrate(40); }
    setI(i + 1);
  };
  const flip = () => { sfx.flip(); haptic('light'); setFlipped((f) => !f); announce(flipped ? card.front : card.back); };

  return (
    <main className="screen focus" id="main">
      <div className="quiz-top">
        <button className="icon-btn" onClick={() => setDeck(null)} aria-label="Leave deck">✕</button>
        <div className="bar" role="progressbar" aria-label="Deck progress" aria-valuemin={0} aria-valuemax={deck.length} aria-valuenow={i}>
          <span style={{ width: `${Math.max(3, (i / deck.length) * 100)}%` }} />
        </div>
        <span className="chip">{i + 1}/{deck.length}</span>
        <ParkIt />
      </div>
      <span className="chip" style={{ justifySelf: 'start' }}>{sec.emoji} {sec.title}{!cards[card.id]?.seen ? ' · ✨ new' : ''}</span>

      <AnimatePresence mode="wait">
        <motion.div
          key={card.id} className={`flip-scene ${reduced ? 'reduced' : ''}`}
          initial={reduced ? { opacity: 0 } : { opacity: 0, y: 30, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={reduced ? { opacity: 0 } : { opacity: 0, x: -60 }} transition={{ duration: 0.25 }}
        >
          <motion.button
            className="flip-card" onClick={flip}
            aria-label={flipped ? `Answer: ${card.back}. Tap to see the question again` : `Question: ${card.front}. Tap to reveal the answer`}
            animate={reduced ? {} : { rotateY: flipped ? 180 : 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
          >
            {(!reduced || !flipped) && (
              <div className="flip-face front" aria-hidden="true">
                <span className="small muted" style={{ fontWeight: 700 }}>QUESTION</span>
                <strong><Rich text={card.front} /></strong>
                <span className="small muted">Tap to flip ↻</span>
              </div>
            )}
            {(!reduced || flipped) && (
              <div className="flip-face back" aria-hidden="true">
                <span className="small muted" style={{ fontWeight: 700 }}>ANSWER</span>
                <p><Rich text={card.back} /></p>
              </div>
            )}
          </motion.button>
        </motion.div>
      </AnimatePresence>

      <div className="sticky-actions">
        {!flipped ? (
          <button className="btn primary block big" onClick={flip}>Show answer ↻</button>
        ) : (
          <div className="grade-row">
            <button className="btn" onClick={() => grade('again')}>🔁 Again</button>
            <button className="btn primary" onClick={() => grade('good')} autoFocus>👍 Got it</button>
            <button className="btn gold" onClick={() => grade('easy')}>⚡ Easy</button>
          </div>
        )}
      </div>
    </main>
  );
}
