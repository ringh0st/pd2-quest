// Shows queued big moments (level up, daily goal, streak) one at a time. Tap anywhere to close.
import { useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useStore, shiftEvent } from '../state/store.js';
import { rankFor } from '../engine/xp.js';
import { sfx } from '../audio/sfx.js';
import { haptic } from '../audio/haptics.js';
import { useFeedback } from './Feedback.jsx';
import { useReducedMotion } from '../hooks/useMotionPrefs.js';
import { useIsHolding } from '../hooks/useFocusMode.js';

function content(ev) {
  switch (ev.type) {
    case 'levelUp': return { emoji: '🚀', title: `Level ${ev.level}!`, body: `You're now a ${rankFor(ev.level)}. Your brain just leveled up too.`, big: true };
    case 'goal': return { emoji: '🎯', title: 'Daily goal smashed!', body: 'That was today’s goal. Anything more is bonus XP.', big: true };
    case 'chest': return ev.coins
      ? { emoji: '🎁', title: ev.title || 'Bonus chest!', body: `+${ev.coins} coins. Treat yourself in the shop.`, big: true }
      : { emoji: '🎁', title: `Lucky drop: +${ev.xp} XP`, body: 'Surprise bonus for finishing a round.', big: true };
    case 'badge': return { emoji: ev.badge.emoji, title: `Badge: ${ev.badge.name}`, body: ev.badge.about + '. Find it under Me → Badges.', big: true };
    default: return null;
  }
}

const STREAK_TEXT = {
  started: (n) => `🔥 Streak started: day ${n}`,
  extended: (n) => `🔥 ${n}-day streak!`,
  earnedFreeze: (n) => `🧊 ${n} days! You earned a streak freeze`,
  frozen: (n) => `🧊 A freeze saved your streak: day ${n}`,
  restarted: () => '👋 Welcome back! Your progress is all still here',
};

export function CelebrationLayer() {
  const queued = useStore((s) => s.events[0]);
  // Hold big moments until the learner is out of a question flow (no reward pile-ups mid-question).
  const holding = useIsHolding();
  const ev = holding ? null : queued;
  const { showToast, celebrate, announce } = useFeedback();
  const reduced = useReducedMotion();
  const card = ev && content(ev);

  useEffect(() => {
    if (!ev) return;
    if (ev.type === 'streak') {
      showToast(STREAK_TEXT[ev.event]?.(ev.count) ?? '');
      shiftEvent();
      return;
    }
    if (!card) { shiftEvent(); return; }
    if (ev.type === 'levelUp') sfx.levelUp(); else sfx.chest();
    haptic('celebrate');
    celebrate(ev.type === 'levelUp' ? 60 : 40);
    announce(`${card.title} ${card.body}`);
  }, [ev]);

  useEffect(() => {
    if (!card) return;
    const onKey = (e) => { if (e.key === 'Escape') shiftEvent(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [card]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <AnimatePresence>
      {card && (
        <motion.div
          key={ev.type + (ev.level || '')}
          className="overlay" onClick={() => shiftEvent()}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        >
          <motion.div
            className="celebrate-card" role="dialog" aria-modal="true" aria-label={card.title}
            initial={reduced ? { opacity: 0 } : { scale: 0.6, y: 40, opacity: 0 }}
            animate={reduced ? { opacity: 1 } : { scale: 1, y: 0, opacity: 1 }}
            exit={reduced ? { opacity: 0 } : { scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          >
            <motion.div
              className="big-emoji" aria-hidden="true"
              animate={reduced ? {} : { rotate: [0, -12, 12, -6, 0], scale: [1, 1.2, 1] }}
              transition={{ duration: 0.8, delay: 0.15 }}
            >{card.emoji}</motion.div>
            <h2>{card.title}</h2>
            <p className="muted">{card.body}</p>
            <button className="btn primary block" autoFocus onClick={() => shiftEvent()}>Let’s go!</button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
