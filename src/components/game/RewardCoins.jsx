// "+50" coins on a result screen: the coins are held off the counter when it appears, then burst out of this chip
// and fly into the counter after `delay` ms (lib/coinFlight.js). Leaving early lands them at once.
import { useEffect, useRef } from 'react';
import { holdCoins, flyCoins, landCoins } from '../../lib/coinFlight.js';
import { Icon } from '../icons/Icon.jsx';
import { sfx } from '../../audio/sfx.js';

export function RewardCoins({ coins, delay = 700 }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!(coins > 0)) return undefined;
    holdCoins(coins);
    let flown = false;
    const t = setTimeout(() => { flown = true; sfx.coin(); flyCoins({ from: ref.current, amount: coins }); }, delay);
    return () => { clearTimeout(t); if (!flown) landCoins(coins); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps -- once, for the reward shown
  return <span ref={ref} className="chip gold reward-coins"><Icon name="coin" /> +{coins}<span className="sr-only"> coins</span></span>;
}
