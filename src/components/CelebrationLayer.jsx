// Big moments (level up, daily goal, badges, chests, streaks) gathered into ONE summary card.
// Never shown during a question flow or over a result screen (those hold celebrations), never
// stacked, shown a beat after the screen settles, and closed if you navigate away.
// In Calm mode the summary is a quiet toast instead of a dialog.
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useStore, takeEvents } from '../state/store.js';
import { rankFor } from '../engine/xp.js';
import { sfx } from '../audio/sfx.js';
import { haptic } from '../audio/haptics.js';
import { useFeedback } from './Feedback.jsx';
import { useReducedMotion, useCalm } from '../hooks/useMotionPrefs.js';
import { useIsHolding } from '../hooks/useFocusMode.js';
import { useRoute } from '../hooks/useRoute.js';

const SETTLE_MS = 900;

function line(ev) {
  switch (ev.type) {
    case 'levelUp': return { emoji: '🚀', title: `Level ${ev.level}!`, body: `You’re now a ${rankFor(ev.level)}.`, rank: 3 };
    case 'goal': return { emoji: '🎯', title: 'Daily goal smashed!', body: 'Anything more today is bonus XP.', rank: 2 };
    case 'chest': return ev.coins
      ? { emoji: '🎁', title: ev.title || 'Bonus chest!', body: `+${ev.coins} coins for the shop.`, rank: 1 }
      : { emoji: '🎁', title: `Lucky drop: +${ev.xp} XP`, body: 'Surprise bonus for finishing a round.', rank: 1 };
    case 'passed': return { emoji: '🏆', title: 'Platform Developer II!', body: 'You did it. Zap is so proud. Go celebrate!', rank: 4 };
    case 'badge': return { emoji: ev.badge.emoji, title: `Badge: ${ev.badge.name}`, body: `${ev.badge.about}.`, rank: 2 };
    case 'streak': {
      const n = ev.count;
      const t = {
        started: { emoji: '🔥', title: `Streak started: day ${n}` },
        extended: { emoji: '🔥', title: `${n}-day streak!` },
        earnedFreeze: { emoji: '🧊', title: `${n} days! You earned a streak freeze` },
        frozen: { emoji: '🧊', title: `A freeze saved your streak: day ${n}` },
        restarted: { emoji: '👋', title: 'Welcome back! A fresh streak starts today' },
      }[ev.event];
      return t ? { ...t, body: '', rank: 0, small: true } : null;
    }
    default: return null;
  }
}

export function CelebrationLayer() {
  const events = useStore((s) => s.events);
  const holding = useIsHolding();
  const calm = useCalm();
  const { path } = useRoute();
  const { showToast, celebrate, announce } = useFeedback();
  const reduced = useReducedMotion();
  const [shown, setShown] = useState(null); // { items, count }
  const shownPath = useRef(path);

  // Wait until no flow holds celebrations, then a beat more, then show everything queued at once.
  useEffect(() => {
    if (holding || shown || !events.length) return;
    const t = setTimeout(() => {
      const items = events.map(line).filter(Boolean).sort((a, b) => b.rank - a.rank);
      const count = events.length;
      if (!items.length) { takeEvents(count); return; }
      const onlySmall = items.every((x) => x.small);
      if (calm || onlySmall) {
        showToast(items.slice(0, 2).map((x) => `${x.emoji} ${x.title}`).join(' · '));
        takeEvents(count);
        return;
      }
      shownPath.current = path;
      setShown({ items, count });
      const top = items[0];
      if (top.title.startsWith('Level')) sfx.levelUp(); else sfx.chest();
      haptic('celebrate');
      celebrate(top.rank >= 3 ? 60 : 40);
      announce(items.map((x) => `${x.title} ${x.body}`).join('. '));
    }, SETTLE_MS);
    return () => clearTimeout(t);
  }, [holding, shown, events, calm, path]); // eslint-disable-line react-hooks/exhaustive-deps

  const close = () => {
    if (!shown) return;
    takeEvents(shown.count);
    setShown(null);
  };

  // Navigating away closes it: a reward never follows you onto another screen.
  useEffect(() => { if (shown && path !== shownPath.current) close(); }, [path]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!shown) return;
    const onKey = (e) => { if (e.key === 'Escape') close(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [shown]); // eslint-disable-line react-hooks/exhaustive-deps

  const top = shown?.items[0];
  const rest = shown?.items.slice(1) ?? [];

  return (
    <AnimatePresence>
      {shown && (
        <motion.div
          key="celebration" className="overlay" onClick={close}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        >
          <motion.div
            className="celebrate-card" role="dialog" aria-modal="true" aria-labelledby="celebrate-title"
            onClick={(e) => e.stopPropagation()}
            initial={reduced ? { opacity: 0 } : { scale: 0.6, y: 40, opacity: 0 }}
            animate={reduced ? { opacity: 1 } : { scale: 1, y: 0, opacity: 1 }}
            exit={reduced ? { opacity: 0 } : { scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          >
            <motion.div
              className="big-emoji" aria-hidden="true"
              animate={reduced ? {} : { rotate: [0, -12, 12, -6, 0], scale: [1, 1.2, 1] }}
              transition={{ duration: 0.8, delay: 0.15 }}
            >{top.emoji}</motion.div>
            <h2 id="celebrate-title">{top.title}</h2>
            {top.body && <p className="muted">{top.body}</p>}
            {rest.length > 0 && (
              <ul className="list-plain stack-s celebrate-list">
                {rest.map((x, k) => (
                  <motion.li key={k} initial={reduced ? false : { opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + k * 0.12 }}>
                    <span aria-hidden="true">{x.emoji}</span> <strong>{x.title}</strong>{x.body ? <span className="muted small"> · {x.body}</span> : null}
                  </motion.li>
                ))}
              </ul>
            )}
            <button className="btn primary block" autoFocus onClick={close}>Nice! Keep going</button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
