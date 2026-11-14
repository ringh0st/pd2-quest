// Hard challenges and Boss battles. Intro → run (hearts, helpers) → stars on the win screen.
import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { sectionById } from '../data/index.js';
import { levelById, nextLevelAfter, levelOpen } from '../state/gameSelectors.js';
import { WORLD_THEMES, HARD_SIZE, BOSS_HP, BOSS_HEARTS, starsFor } from '../game/worlds.js';
import { COINS } from '../game/economy.js';
import { shuffle } from '../engine/session.js';
import { useStore, saveStars, addCoins, earn, useHelper, getState, checkBadges } from '../state/store.js';
import { totalLessons } from '../state/selectors.js';
import { PracticeRunner } from '../components/PracticeRunner.jsx';
import { WinScreen } from '../components/game/WinScreen.jsx';
import { Zap } from '../components/game/Zap.jsx';
import { Stars } from '../components/game/Stars.jsx';
import { go, back } from '../hooks/useRoute.js';
import { useReducedMotion } from '../hooks/useMotionPrefs.js';
import { sfx } from '../audio/sfx.js';
import { haptic } from '../audio/haptics.js';

function pickQuestions(level) {
  const sec = sectionById[level.world];
  const pool = level.kind === 'hard' ? sec.questions.filter((q) => level.covers.includes(q.lesson)) : sec.questions;
  const tough = shuffle(pool.filter((q) => q.difficulty >= 2));
  const easy = shuffle(pool.filter((q) => q.difficulty < 2));
  const ordered = [...tough, ...easy];
  return level.kind === 'hard' ? shuffle(ordered.slice(0, HARD_SIZE)) : ordered.slice(0, 16);
}

export function Play({ id }) {
  const level = levelById[id];
  const [phase, setPhase] = useState('intro');
  const [run, setRun] = useState(0);
  const [result, setResult] = useState(null);
  const [extraHeart, setExtraHeart] = useState(false);
  const stars = useStore((s) => s.stars);
  const heartsHeld = useStore((s) => s.helpers.heart ?? 0);
  const questions = useMemo(() => (level ? pickQuestions(level) : []), [level, run]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!level || level.kind === 'lesson') return <main className="screen"><p>Level not found.</p><button className="btn" onClick={() => go('/map')}>Map</button></main>;
  if (!levelOpen(id, stars)) return <main className="screen"><p>🔒 Finish the level before this one first.</p><button className="btn" onClick={() => go(`/world/${level.world}`)}>Back to the map</button></main>;

  const theme = WORLD_THEMES[level.world];
  const isBoss = level.kind === 'boss';
  const baseHearts = isBoss ? BOSS_HEARTS : 3;

  const start = () => {
    if (extraHeart && !useHelper('heart')) setExtraHeart(false);
    sfx.levelUp(); haptic('medium');
    setPhase('run');
  };

  const done = (r) => {
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

  const retry = () => { setResult(null); setRun((x) => x + 1); setPhase('intro'); };

  if (phase === 'done') {
    return (
      <WinScreen
        kind={level.kind} title={isBoss ? theme.boss.name : `${theme.name} · ${level.title}`} worldId={level.world}
        stars={result.stars} prevStars={result.prev} coins={result.coins} xp={result.xp}
        detail={isBoss
          ? (result.stars ? `“${theme.boss.defeat}”` : `${result.right}/${BOSS_HP} hits landed. Every miss is now in your review queue.`)
          : `${result.firstRight}/${result.total} right${result.stars ? '' : ' · need 3 to clear'}`}
        next={result.stars ? nextLevelAfter(level.id) : null}
        onRetry={retry}
      />
    );
  }

  if (phase === 'intro') {
    return <LevelIntro level={level} theme={theme} best={stars[level.id] ?? 0} heartsHeld={heartsHeld} extraHeart={extraHeart} setExtraHeart={setExtraHeart} baseHearts={baseHearts} onStart={start} />;
  }

  return (
    <main className={`screen focus play-screen ${isBoss ? 'boss-mode' : 'hard-mode'}`} id="main">
      <PracticeRunner
        key={run}
        questions={questions}
        requeue={false}
        hearts={baseHearts + (extraHeart ? 1 : 0)}
        helpers
        onExit={() => back(`/world/${level.world}`)}
        onDone={done}
        shouldStop={isBoss ? (s) => s.right >= BOSS_HP : undefined}
        header={isBoss ? (st) => <BossPanel theme={theme} hits={st.stats.right} lastRight={st.revealed ? st.lastRight : null} /> : undefined}
      />
    </main>
  );
}

function LevelIntro({ level, theme, best, heartsHeld, extraHeart, setExtraHeart, baseHearts, onStart }) {
  const reduced = useReducedMotion();
  const isBoss = level.kind === 'boss';
  return (
    <main className={`screen focus level-intro world-${level.world}`} id="main" style={{ justifyContent: 'center' }}>
      <div className="topbar">
        <button className="icon-btn" onClick={() => back(`/world/${level.world}`)} aria-label="Back to map">←</button>
      </div>
      <motion.div className="celebrate-card" style={{ margin: '0 auto' }} initial={reduced ? { opacity: 0 } : { y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 24 }}>
        <motion.span
          className={`stamp ${isBoss ? 'boss' : 'hard'}`}
          initial={reduced ? false : { scale: 3, rotate: -25, opacity: 0 }} animate={{ scale: 1, rotate: -6, opacity: 1 }}
          transition={{ delay: 0.25, type: 'spring', stiffness: 420, damping: 14 }}
        >{isBoss ? '👹 BOSS FIGHT' : '💀 HARD LEVEL'}</motion.span>
        {isBoss ? (
          <>
            <motion.div
              className="boss-avatar" aria-hidden="true"
              initial={reduced ? false : { y: -120, scale: 0.4 }} animate={{ y: 0, scale: 1 }}
              transition={{ delay: 0.5, type: 'spring', stiffness: 260, damping: 12 }}
            >{theme.boss.emoji}</motion.div>
            <h1>{theme.boss.name}</h1>
            <p className="bubble boss-bubble">“{theme.boss.taunt}”</p>
            <p className="small">Land <strong>{BOSS_HP} correct hits</strong> before you run out of hearts. Stars = hearts left.</p>
          </>
        ) : (
          <>
            <Zap mood="think" size={80} />
            <h1>{theme.name}: {level.title}</h1>
            <p className="small">{HARD_SIZE} tough questions from the last 3 lessons. ★★★ = all right · need 3 to clear · {baseHearts} hearts.</p>
          </>
        )}
        {best > 0 && <p className="small muted">Your best: <Stars count={best} size={16} /></p>}
        {heartsHeld > 0 && (
          <label className="switch-row" style={{ width: '100%', minHeight: 44 }}>
            <span>❤️ Use an extra heart <span className="muted small">(you have {heartsHeld})</span></span>
            <input type="checkbox" checked={extraHeart} onChange={(e) => setExtraHeart(e.target.checked)} style={{ width: 24, height: 24 }} />
          </label>
        )}
        <p className="small muted">✂️ 50/50 and 💡 Hint helpers work here.</p>
        <button className="btn primary block big" autoFocus onClick={onStart}>{isBoss ? 'FIGHT! ⚔️' : 'Let’s go! 💪'}</button>
      </motion.div>
    </main>
  );
}

function BossPanel({ theme, hits, lastRight }) {
  const reduced = useReducedMotion();
  const hp = Math.max(0, BOSS_HP - hits);
  const hitNow = lastRight === true;
  const missNow = lastRight === false;
  return (
    <div className="boss-panel" aria-label={`${theme.boss.name}: ${hp} of ${BOSS_HP} health left`} role="img">
      <motion.div
        className="boss-face" aria-hidden="true"
        key={hits + (hitNow ? '-hit' : '') + (missNow ? '-miss' : '')}
        animate={reduced ? {} : hitNow ? { x: [0, -12, 12, -8, 8, 0], rotate: [0, -10, 10, 0], scale: [1, 0.85, 1] } : missNow ? { scale: [1, 1.3, 1], y: [0, -10, 0] } : { y: [0, -3, 0] }}
        transition={{ duration: hitNow || missNow ? 0.5 : 2, repeat: hitNow || missNow ? 0 : Infinity }}
      >
        {theme.boss.emoji}
        <AnimatePresence>
          {hitNow && (
            <motion.span key={hits} className="dmg" initial={{ opacity: 1, y: 0 }} animate={{ opacity: 0, y: -40 }} transition={{ duration: 0.9 }}>💥 -1</motion.span>
          )}
          {missNow && (
            <motion.span key={'m' + hits} className="dmg miss" initial={{ opacity: 1, y: 0 }} animate={{ opacity: 0, y: -40 }} transition={{ duration: 0.9 }}>HA!</motion.span>
          )}
        </AnimatePresence>
      </motion.div>
      <div className="grow stack-s">
        <div className="spread small"><strong>{theme.boss.name}</strong><span>{hp}/{BOSS_HP} HP</span></div>
        <div className="bar boss-hp"><motion.span animate={{ width: `${(hp / BOSS_HP) * 100}%` }} transition={{ type: 'spring', stiffness: 200, damping: 20 }} /></div>
      </div>
    </div>
  );
}
