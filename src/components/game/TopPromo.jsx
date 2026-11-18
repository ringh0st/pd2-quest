// Home: the Top players card, made to stand out (gold, medals, prizes), with your place this week when you've
// looked at the list, and the time left. Opens the full list.
import { motion } from 'motion/react';
import { Icon } from '../icons/Icon.jsx';
import { TopPlace } from './TopPlace.jsx';
import { lastMyPlace, periodEnds, timeLeft, TOP_PRIZES } from '../../lib/topList.js';
import { useReducedMotion, useCalm } from '../../hooks/useMotionPrefs.js';
import { sfx } from '../../audio/sfx.js';

export function TopPromo(props) {
  const reduced = useReducedMotion();
  const calm = useCalm();
  const mine = lastMyPlace();
  const left = timeLeft(periodEnds().week);
  return (
    <motion.a className="card link top-promo" href="#/top" onClick={() => sfx.tap()} {...props}>
      <span className="top-promo-head">
        <motion.span
          className="top-promo-trophy" aria-hidden="true"
          animate={reduced || calm ? undefined : { rotate: [0, -8, 8, -4, 0], scale: [1, 1.08, 1] }}
          transition={{ duration: 1.2, delay: 0.6, repeat: 1, repeatDelay: 4 }}
        >
          <Icon name="trophy" />
        </motion.span>
        <span className="grow">
          <strong className="top-promo-title">Top players</strong>
          <span className="top-promo-sub">
            {mine ? <>You’re <strong>#{mine.place}</strong> this week</> : 'Climb the weekly list'} · <span className="nowrap"><Icon name="timer" /> {left} left</span>
          </span>
        </span>
        <Icon name="chevron" />
      </span>
      <span className="top-promo-prizes" aria-label={`Top 3 win ${TOP_PRIZES.join(', ')} coins`}>
        {TOP_PRIZES.map((coins, k) => (
          <span key={k} className="top-promo-prize" aria-hidden="true"><TopPlace n={k + 1} size="s" /><Icon name="coin" />{coins}</span>
        ))}
      </span>
    </motion.a>
  );
}
