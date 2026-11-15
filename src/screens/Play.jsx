// Hard challenges and Boss battles. Intro, then the run (hearts, helpers), then stars on the win screen.
import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { sectionById } from '../data/index.js';
import { levelById, nextLevelAfter, levelOpen } from '../state/gameSelectors.js';
import { WORLD_THEMES, HARD_SIZE, BOSS_HP, BOSS_HEARTS, starsFor } from '../game/worlds.js';
import { COINS } from '../game/economy.js';
import { shuffle } from '../engine/session.js';
import { useStore, saveStars, addCoins, earn, useHelper, refundHelper, getState, checkBadges } from '../state/store.js';
import { saveRun, loadRun, clearRun, questionsFor } from '../state/runSession.js';
import { useFeedback } from '../components/Feedback.jsx';
import { totalLessons } from '../state/selectors.js';
import { PracticeRunner } from '../components/PracticeRunner.jsx';
import { WinScreen } from '../components/game/WinScreen.jsx';
import { Zap } from '../components/game/Zap.jsx';
import { Stars } from '../components/game/Stars.jsx';
import { go } from '../hooks/useRoute.js';
import { useReducedMotion } from '../hooks/useMotionPrefs.js';
import { sfx } from '../audio/sfx.js';
import { haptic } from '../audio/haptics.js';
import { Icon } from '../components/icons/Icon.jsx';
import { BossArt } from '../components/art/BossArt.jsx';
import { useStudyScreen } from '../hooks/useStudyScreen.js';

/** A row of filled hearts, read out as a number. */
function HeartRow({ count }) {
  return (
    <span className="heart-row" role="img" aria-label={`${count} ${count === 1 ? 'heart' : 'hearts'}`}>
      {Array.from({ length: count }, (_, i) => <Icon key={i} name="heart" fill />)}
    </span>
  );
}

/** Three filled stars, read out as "3 stars". */
function ThreeStars() {
  return <span className="heart-row star-row" role="img" aria-label="3 stars"><Icon name="star" fill /><Icon name="star" fill /><Icon name="star" fill /></span>;
}

function pickQuestions(level) {
  const sec = sectionById[level.world];
  const practice = sec.questions.filter((q) => !q.mockOnly); // mock-only questions stay fresh for mocks
  const pool = level.kind === 'hard' ? practice.filter((q) => level.covers.includes(q.lesson)) : practice;
  // Version-specific items (e.g. "API version 67.0") never open a fight.
  const late = (q) => /API version \d/.test(q.q);
  const ramp = (list) => list.sort((a, b) => (a.difficulty ?? 2) - (b.difficulty ?? 2) || late(a) - late(b));
  if (level.kind === 'hard') {
    const tough = shuffle(pool.filter((q) => q.difficulty >= 2));
    const easy = shuffle(pool.filter((q) => q.difficulty < 2));
    return ramp([...tough, ...easy].slice(0, HARD_SIZE));
  }
  // Boss: a warm-up or two, then it gets harder (16 drawn, 8 hits needed).
  const tough = shuffle(pool.filter((q) => q.difficulty >= 2)).slice(0, 13);
  const warm = shuffle(pool.filter((q) => q.difficulty < 2)).slice(0, 3);
  return [...ramp(warm), ...ramp(tough)];
}

export function Play({ id }) {
  useStudyScreen();
  const level = levelById[id];
  const [phase, setPhase] = useState('intro');
  const [run, setRun] = useState(0);
  const [result, setResult] = useState(null);
  const [extraHeart, setExtraHeart] = useState(false);
  const [rematch, setRematch] = useState(false); // after a loss, the next try gets a free heart
  const [saved, setSaved] = useState(() => (level ? loadRun(level.id) : null)); // unfinished run to resume
  const [resuming, setResuming] = useState(null);
  const stars = useStore((s) => s.stars);
  const heartsHeld = useStore((s) => s.helpers.heart ?? 0);
  const { showToast } = useFeedback();
  const fresh = useMemo(() => (level ? pickQuestions(level) : []), [level, run]); // eslint-disable-line react-hooks/exhaustive-deps
  const questions = resuming ? questionsFor(resuming.runner) : fresh;

  if (!level || level.kind === 'lesson') return <main className="screen"><p>Level not found.</p><button className="btn" onClick={() => go('/map')}>Map</button></main>;
  if (!levelOpen(id, stars)) return <main className="screen" id="main"><h1 className="title-with-icon"><span className="ic-tile" aria-hidden="true"><Icon name="lock" /></span>Finish the level before this one first.</h1><button className="btn" onClick={() => go(`/world/${level.world}`)}><Icon name="back" /> Back to the map</button></main>;

  const theme = WORLD_THEMES[level.world];
  const isBoss = level.kind === 'boss';
  const baseHearts = (isBoss ? BOSS_HEARTS : 3) + (rematch ? 1 : 0);

  const totalHearts = baseHearts + (extraHeart ? 1 : 0);
  const start = () => {
    // A new run replaces a saved one; give back the heart that run had spent.
    if (saved) { if (saved.usedHeart) refundHelper('heart'); clearRun(level.id); setSaved(null); }
    const usedHeart = extraHeart && useHelper('heart');
    if (extraHeart && !usedHeart) setExtraHeart(false);
    setResuming(null);
    saveRun(level.id, { usedHeart, hearts: baseHearts + (usedHeart ? 1 : 0), runner: null });
    sfx.levelUp(); haptic('medium');
    setPhase('run');
  };
  const resume = () => {
    sfx.tap(); haptic('medium');
    setResuming(saved);
    setPhase('run');
  };
  const progress = (runner) => {
    const cur = resuming ?? loadRun(level.id) ?? {};
    saveRun(level.id, { usedHeart: !!cur.usedHeart, hearts: cur.hearts ?? totalHearts, runner });
  };
  const leave = () => {
    showToast('Saved. Resume any time from the level.');
    go(`/world/${level.world}`);
  };

  const done = (r) => {
    clearRun(level.id);
    const won = isBoss ? r.right >= BOSS_HP && !r.failed : !r.failed;
    const st = won ? starsFor(level.kind, isBoss ? { won, hearts: r.heartsLeft } : { right: r.firstRight, total: r.total }) : 0;
    const saved = st ? saveStars(level.id, st) : { coins: 0, before: getState().stars[level.id] ?? 0 };
    const firstClear = st > 0 && saved.before === 0;
    const bonus = firstClear ? (isBoss ? COINS.bossWin : COINS.hardWin) : 0;
    addCoins(bonus);
    if (st) earn(isBoss ? 40 : 20);
    checkBadges({ totalLessons: totalLessons() });
    setResult({ ...r, stars: st, prev: saved.before, coins: saved.coins + bonus, xp: (r.xp ?? 0) + (st ? (isBoss ? 40 : 20) : 0) });
    setPhase('done');
  };

  const retry = () => { setRematch(!result?.stars); setResult(null); setResuming(null); setSaved(null); setRun((x) => x + 1); setPhase('intro'); };

  if (phase === 'done') {
    return (
      <WinScreen
        kind={level.kind} title={isBoss ? theme.boss.name : `${theme.name} · ${level.title}`} worldId={level.world}
        stars={result.stars} prevStars={result.prev} coins={result.coins} xp={result.xp}
        detail={(isBoss
          ? (result.stars ? `“${theme.boss.defeat}”` : `${result.right}/${BOSS_HP} hits landed. Every miss is now in your review queue.`)
          : `${result.firstRight}/${result.total} right${result.stars ? '' : ' · need 3 to clear'}`)
          + (result.stars ? '' : ' Rematch bonus: your next try gets +1 free heart.')}
        next={result.stars ? nextLevelAfter(level.id) : null}
        onRetry={retry}
      />
    );
  }

  if (phase === 'intro') {
    return <LevelIntro level={level} theme={theme} best={stars[level.id] ?? 0} heartsHeld={heartsHeld} extraHeart={extraHeart} setExtraHeart={setExtraHeart} baseHearts={baseHearts} onStart={start} saved={saved?.runner ? saved : null} onResume={resume} />;
  }

  return (
    <main className={`screen focus play-screen ${isBoss ? 'boss-mode' : 'hard-mode'}`} id="main">
      <PracticeRunner
        key={`${run}-${resuming ? 'r' : 'n'}`}
        questions={questions}
        requeue={false}
        hearts={resuming?.hearts ?? totalHearts}
        initial={resuming?.runner ?? null}
        onProgress={progress}
        helpers
        onExit={leave}
        onDone={done}
        onAnswer={isBoss ? (right) => { if (right) { sfx.bossHit(); haptic('medium'); } } : undefined}
        shouldStop={isBoss ? (s) => s.right >= BOSS_HP : undefined}
        header={isBoss ? (st) => <BossPanel theme={theme} world={level.world} hits={st.stats.right} lastRight={st.revealed ? st.lastRight : null} /> : undefined}
      />
    </main>
  );
}

function LevelIntro({ level, theme, best, heartsHeld, extraHeart, setExtraHeart, baseHearts, onStart, saved, onResume }) {
  const reduced = useReducedMotion();
  const isBoss = level.kind === 'boss';
  return (
    <main className={`screen focus level-intro world-${level.world}`} id="main" style={{ justifyContent: 'center' }}>
      <div className="topbar">
        <button className="icon-btn" onClick={() => go(`/world/${level.world}`)} aria-label="Back to map"><Icon name="back" /></button>
      </div>
      <motion.div className="celebrate-card" style={{ margin: '0 auto' }} initial={reduced ? { opacity: 0 } : { y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 24 }}>
        <motion.span
          className={`stamp ${isBoss ? 'boss' : 'hard'}`}
          initial={reduced ? false : { scale: 3, rotate: -25, opacity: 0 }} animate={{ scale: 1, rotate: -6, opacity: 1 }}
          transition={{ delay: 0.25, type: 'spring', stiffness: 420, damping: 14 }}
        ><Icon name={isBoss ? 'swords' : 'skull'} /> {isBoss ? 'BOSS FIGHT' : 'HARD LEVEL'}</motion.span>
        {isBoss ? (
          <>
            <motion.div
              className="boss-avatar" aria-hidden="true"
              initial={reduced ? false : { y: -120, scale: 0.4 }} animate={{ y: 0, scale: 1 }}
              transition={{ delay: 0.5, type: 'spring', stiffness: 260, damping: 12 }}
            ><BossArt world={level.world} size={128} mood="taunt" /></motion.div>
            <h1>{theme.boss.name}</h1>
            <p className="bubble boss-bubble">“{theme.boss.taunt}”</p>
            <p className="small">Land <strong>{BOSS_HP} correct hits</strong> before you run out of hearts. Stars = hearts left.</p>
          </>
        ) : (
          <>
            <Zap mood="think" size={80} />
            <h1>{theme.name}: {level.title}</h1>
            <p className="small">{HARD_SIZE} tough questions from the last 3 lessons. <ThreeStars /> = all right · need 3 to clear · {baseHearts} hearts.</p>
          </>
        )}
        {best > 0 && <p className="small muted">Your best: <Stars count={best} size={16} /></p>}
        {heartsHeld > 0 && (
          <label className="switch-row" style={{ width: '100%', minHeight: 44 }}>
            <span className="with-icon"><Icon name="heart" fill className="ic-bad heart-fill" /> Use an extra heart <span className="muted small">(you have {heartsHeld})</span></span>
            <input type="checkbox" checked={extraHeart} onChange={(e) => setExtraHeart(e.target.checked)} style={{ width: 24, height: 24 }} />
          </label>
        )}
        <p className="small muted with-icon helpers-note"><Icon name="scissors" /> 50/50 and <Icon name="idea" /> Hint helpers work here.</p>
        {saved ? (
          <>
            <button className="btn primary block big" autoFocus onClick={onResume}>
              <Icon name="play" fill /> Resume <span className="small resume-meta" style={{ fontWeight: 400 }}>
                Q{saved.runner.idx + 1} · <HeartRow count={Math.max(0, saved.runner.heartsLeft ?? 0)} />{isBoss ? ` · ${saved.runner.stats.right}/${BOSS_HP} hits` : ''}
              </span>
            </button>
            <button className="btn block" onClick={onStart}>Start over{saved.usedHeart ? ' (your extra heart comes back)' : ''}</button>
          </>
        ) : (
          <button className="btn primary block big" autoFocus onClick={onStart}>{isBoss ? <><Icon name="swords" /> FIGHT!</> : <><Icon name="muscle" /> Let’s go!</>}</button>
        )}
      </motion.div>
    </main>
  );
}

function BossPanel({ theme, world, hits, lastRight }) {
  const hp = Math.max(0, BOSS_HP - hits);
  const hitNow = lastRight === true;
  const missNow = lastRight === false;
  return (
    <div className="boss-panel" aria-label={`${theme.boss.name}: ${hp} of ${BOSS_HP} health left`} role="img">
      <div className="boss-face" aria-hidden="true">
        {/* keyed per answer so each hit replays the squash */}
        <BossArt key={hits + (hitNow ? '-hit' : '') + (missNow ? '-miss' : '')} world={world} size={72} mood={hp === 0 ? 'defeated' : hitNow ? 'hit' : missNow ? 'taunt' : 'idle'} />
        <AnimatePresence>
          {hitNow && (
            <motion.span key={hits} className="dmg" initial={{ opacity: 1, y: 0 }} animate={{ opacity: 0, y: -40 }} transition={{ duration: 0.9 }}><Icon name="bolt" fill /> -1</motion.span>
          )}
          {missNow && (
            <motion.span key={'m' + hits} className="dmg miss" initial={{ opacity: 1, y: 0 }} animate={{ opacity: 0, y: -40 }} transition={{ duration: 0.9 }}>HA!</motion.span>
          )}
        </AnimatePresence>
      </div>
      <div className="grow stack-s">
        <div className="spread small"><strong>{theme.boss.name}</strong><span>{hp}/{BOSS_HP} HP</span></div>
        <div className="bar boss-hp"><motion.span animate={{ width: `${(hp / BOSS_HP) * 100}%` }} transition={{ type: 'spring', stiffness: 200, damping: 20 }} /></div>
      </div>
    </div>
  );
}
