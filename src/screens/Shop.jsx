// Shop: dress up Zap, pick an accent theme or confetti style, stock up on helpers. Coins only, all items shown before buying.
import { useState } from 'react';
import { motion } from 'motion/react';
import { useStore, buy, equip, checkBadges } from '../state/store.js';
import { OUTFITS, THEMES, CONFETTI, HELPERS, canBuy, canBuyHelper } from '../game/economy.js';
import { Zap } from '../components/game/Zap.jsx';
import { CoinChip } from '../components/game/CoinChip.jsx';
import { back } from '../hooks/useRoute.js';
import { useFeedback } from '../components/Feedback.jsx';
import { useReducedMotion } from '../hooks/useMotionPrefs.js';
import { totalLessons } from '../state/selectors.js';
import { sfx } from '../audio/sfx.js';
import { haptic } from '../audio/haptics.js';

const TABS = [['outfits', '🎩 Outfits'], ['themes', '🎨 Themes'], ['confetti', '🎊 Confetti'], ['helpers', '🧰 Helpers']];

export function Shop() {
  const s = useStore();
  const [tab, setTab] = useState('outfits');
  const [preview, setPreview] = useState(undefined);
  const { showToast, celebrate } = useFeedback();
  const reduced = useReducedMotion();

  const purchase = (item, kind, after) => {
    buy(item, kind);
    sfx.chest(); haptic('success'); celebrate(30);
    showToast(`🛍️ Got ${item.name}!`);
    checkBadges({ totalLessons: totalLessons() });
    after?.();
  };
  const tooPoor = (price) => <span className="small muted">Need 🪙{price - s.coins} more</span>;

  return (
    <main className="screen" id="main">
      <div className="topbar">
        <button className="icon-btn" onClick={() => back('/')} aria-label="Back">←</button>
        <h1 className="grow">🛍️ Shop</h1>
        <CoinChip link={false} />
      </div>

      <div className="shop-stage">
        <Zap size={110} mood={preview !== undefined ? 'wow' : 'happy'} hat={preview} />
        <p className="small muted">{preview !== undefined ? 'Trying it on… looking good!' : 'Earn coins with new stars, Hard levels, Bosses and daily quests.'}</p>
      </div>

      <div className="segmented" role="tablist" aria-label="Shop sections">
        {TABS.map(([id, label]) => (
          <button key={id} role="tab" aria-selected={tab === id} onClick={() => { sfx.tap(); setTab(id); setPreview(undefined); }}>{label}</button>
        ))}
      </div>

      <motion.ul key={tab} className="list-plain shop-grid" initial={reduced ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        {tab === 'outfits' && (
          <>
            <li className="card tight shop-item">
              <span className="shop-icon" aria-hidden="true">🙂</span>
              <strong>No hat</strong>
              <button className="btn small" aria-pressed={!s.equipped.hat} onClick={() => { equip('hat', null); sfx.tap(); }}>{!s.equipped.hat ? 'Wearing ✓' : 'Wear'}</button>
            </li>
            {OUTFITS.map((o) => {
              const own = s.owned.includes(o.id);
              const on = s.equipped.hat === o.id;
              return (
                <li key={o.id} className="card tight shop-item">
                  <button className="shop-icon as-btn" onClick={() => { sfx.flip(); setPreview(o.id); }} aria-label={`Try on ${o.name}`}>{o.emoji}</button>
                  <strong>{o.name}</strong>
                  {own
                    ? <button className="btn small" aria-pressed={on} onClick={() => { equip('hat', o.id); sfx.tap(); setPreview(undefined); }}>{on ? 'Wearing ✓' : 'Wear'}</button>
                    : canBuy(s.coins, o, s.owned)
                      ? <button className="btn gold small" onClick={() => purchase(o, 'item', () => { equip('hat', o.id); setPreview(undefined); })}>🪙 {o.price}</button>
                      : <><span className="chip">🪙 {o.price}</span>{tooPoor(o.price)}</>}
                </li>
              );
            })}
          </>
        )}
        {tab === 'themes' && THEMES.map((th) => {
          const own = th.price === 0 || s.owned.includes('theme-' + th.id);
          const on = s.equipped.theme === th.id;
          const item = { ...th, id: 'theme-' + th.id };
          return (
            <li key={th.id} className="card tight shop-item">
              <span className="shop-icon swatch" aria-hidden="true" style={{ background: `linear-gradient(135deg, ${th.light[0]}, ${th.dark[0]})` }} />
              <strong>{th.name}</strong>
              {own
                ? <button className="btn small" aria-pressed={on} onClick={() => { equip('theme', th.id); sfx.tap(); }}>{on ? 'Using ✓' : 'Use'}</button>
                : canBuy(s.coins, item, s.owned)
                  ? <button className="btn gold small" onClick={() => purchase(item, 'item', () => equip('theme', th.id))}>🪙 {th.price}</button>
                  : <><span className="chip">🪙 {th.price}</span>{tooPoor(th.price)}</>}
            </li>
          );
        })}
        {tab === 'confetti' && CONFETTI.map((c) => {
          const own = c.price === 0 || s.owned.includes('confetti-' + c.id);
          const on = s.equipped.confetti === c.id;
          const item = { ...c, id: 'confetti-' + c.id };
          return (
            <li key={c.id} className="card tight shop-item">
              <span className="shop-icon" aria-hidden="true">{c.sample}</span>
              <strong>{c.name}</strong>
              {own
                ? <button className="btn small" aria-pressed={on} onClick={() => { equip('confetti', c.id); sfx.tap(); setTimeout(() => celebrate(30), 50); }}>{on ? 'Using ✓' : 'Use'}</button>
                : canBuy(s.coins, item, s.owned)
                  ? <button className="btn gold small" onClick={() => purchase(item, 'item', () => equip('confetti', c.id))}>🪙 {c.price}</button>
                  : <><span className="chip">🪙 {c.price}</span>{tooPoor(c.price)}</>}
            </li>
          );
        })}
        {tab === 'helpers' && Object.values(HELPERS).map((h) => {
          const held = s.helpers[h.id] ?? 0;
          return (
            <li key={h.id} className="card tight shop-item wide">
              <span className="shop-icon" aria-hidden="true">{h.emoji}</span>
              <div className="grow">
                <strong>{h.name}</strong> <span className="chip">{held}/{h.max}</span>
                <p className="small muted">{h.about}</p>
              </div>
              {held >= h.max
                ? <span className="small muted">Full</span>
                : canBuyHelper(s.coins, h, held)
                  ? <button className="btn gold small" onClick={() => purchase(h, 'helper')}>🪙 {h.price}</button>
                  : <span className="chip">🪙 {h.price}</span>}
            </li>
          );
        })}
      </motion.ul>
      <p className="small muted center">No real money, ever. Everything here is earned by studying.</p>
    </main>
  );
}
