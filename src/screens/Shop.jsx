// Shop: dress up Zap, pick an accent theme or confetti style, stock up on helpers. Coins only.
// Every item is tried on first (big live preview) and only bought with a second, explicit tap.
import { useCallback, useId, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { useStore, buy, equip, checkBadges } from '../state/store.js';
import { OUTFITS, THEMES, CONFETTI, HELPERS } from '../game/economy.js';
import { Zap, OutfitIcon } from '../components/game/Zap.jsx';
import { CoinChip } from '../components/game/CoinChip.jsx';
import { Sheet } from '../components/Sheet.jsx';
import { go } from '../hooks/useRoute.js';
import { useFeedback } from '../components/Feedback.jsx';
import { useReducedMotion, useCalm } from '../hooks/useMotionPrefs.js';
import { totalLessons } from '../state/selectors.js';
import { sfx } from '../audio/sfx.js';
import { haptic } from '../audio/haptics.js';

const TABS = [
  { id: 'outfits', icon: '🎩', label: 'Outfits' },
  { id: 'themes', icon: '🎨', label: 'Themes' },
  { id: 'confetti', icon: '🎊', label: 'Confetti' },
  { id: 'helpers', icon: '🧰', label: 'Helpers' },
];

/** Normalises every shop entry into one shape the grid and the try-on sheet share. */
function entriesFor(tab) {
  if (tab === 'outfits') return OUTFITS.map((o) => ({ kind: 'outfit', slot: 'hat', key: o.id, id: o.id, ownId: o.id, name: o.name, price: o.price, data: o }));
  if (tab === 'themes') return THEMES.map((t) => ({ kind: 'theme', slot: 'theme', key: t.id, id: t.id, ownId: 'theme-' + t.id, name: t.name, price: t.price, data: t }));
  if (tab === 'confetti') return CONFETTI.map((c) => ({ kind: 'confetti', slot: 'confetti', key: c.id, id: c.id, ownId: 'confetti-' + c.id, name: c.name, price: c.price, data: c }));
  return Object.values(HELPERS).map((h) => ({ kind: 'helper', key: h.id, id: h.id, ownId: h.id, name: h.name, price: h.price, data: h }));
}

function statusOf(entry, s) {
  if (entry.kind === 'helper') {
    const held = s.helpers[entry.id] ?? 0;
    return { held, full: held >= entry.data.max, owned: false, on: false };
  }
  const owned = entry.price === 0 || s.owned.includes(entry.ownId);
  return { owned, on: s.equipped[entry.slot] === entry.id };
}

function statusText(entry, st) {
  if (entry.kind === 'helper') return st.full ? `${st.held} owned (max ${entry.data.max}) · Full` : `${st.held} owned (max ${entry.data.max})`;
  if (st.on) return entry.kind === 'outfit' ? 'Wearing ✓' : 'In use ✓';
  if (st.owned) return 'Owned';
  return `🪙 ${entry.price}`;
}

function ItemArt({ entry, size = 56 }) {
  if (entry.kind === 'outfit') return <OutfitIcon id={entry.id} size={size} />;
  if (entry.kind === 'theme') {
    const th = entry.data;
    return <span className="shop-swatch" aria-hidden="true" style={{ background: `linear-gradient(135deg, ${th.light[0]} 50%, ${th.dark[0]} 50%)` }} />;
  }
  return <span className="shop-emoji" aria-hidden="true">{entry.kind === 'confetti' ? entry.data.sample : entry.data.emoji}</span>;
}

export function Shop() {
  const s = useStore();
  const [tab, setTab] = useState('outfits');
  const [pick, setPick] = useState(null);
  const { showToast, celebrate, announce } = useFeedback();
  const reduced = useReducedMotion();
  const tabRefs = useRef({});
  const uid = useId();
  const tabId = (id) => `${uid}-tab-${id}`;
  const panelId = `${uid}-panel`;
  const current = OUTFITS.find((o) => o.id === s.equipped.hat);

  const choose = (id) => { sfx.tap(); setTab(id); };
  const onTabKey = (e) => {
    const i = TABS.findIndex((t) => t.id === tab);
    const n = { ArrowRight: i + 1, ArrowDown: i + 1, ArrowLeft: i - 1, ArrowUp: i - 1, Home: 0, End: TABS.length - 1 }[e.key];
    if (n === undefined) return;
    e.preventDefault();
    const next = TABS[(n + TABS.length) % TABS.length].id;
    choose(next);
    tabRefs.current[next]?.focus();
  };

  const open = (entry) => {
    sfx.flip();
    setPick(entry);
    if (entry.kind !== 'helper') announce(entry.kind === 'outfit' ? `Trying on ${entry.name}.` : `Previewing ${entry.name}.`);
  };
  const close = useCallback(() => setPick(null), []);

  const purchase = (entry) => {
    buy({ ...entry.data, id: entry.ownId, price: entry.price }, entry.kind === 'helper' ? 'helper' : 'item');
    sfx.chest(); haptic('success'); celebrate(30);
    if (entry.kind !== 'helper') equip(entry.slot, entry.id);
    showToast(`🛍️ Got ${entry.name}!`);
    announce(entry.kind === 'helper' ? `Bought one ${entry.name}.` : `Bought ${entry.name}. ${entry.kind === 'outfit' ? 'Zap is wearing it.' : 'Now in use.'}`);
    checkBadges({ totalLessons: totalLessons() });
    close();
  };
  const use = (entry) => {
    equip(entry.slot, entry.id);
    sfx.tap(); haptic('light');
    if (entry.kind === 'confetti') setTimeout(() => celebrate(30), 50);
    announce(entry.kind === 'outfit' ? `Zap is wearing ${entry.name}.` : `${entry.name} is now in use.`);
    close();
  };
  const takeOff = () => {
    equip('hat', null); sfx.tap();
    announce('Outfit taken off.');
    close();
  };

  const entries = entriesFor(tab);

  return (
    <main className="screen" id="main">
      <div className="topbar">
        <button className="icon-btn" onClick={() => go('/')} aria-label="Back">←</button>
        <h1 className="grow">🛍️ Shop</h1>
        <CoinChip link={false} />
      </div>

      <div className="shop-stage">
        <Zap size={96} mood="happy" />
        <p className="small muted">Tap anything to try it on first. Earn coins with new stars, Hard levels, Bosses and daily quests.</p>
        {current && <button className="btn ghost small" onClick={takeOff}>Take off {current.name}</button>}
      </div>

      <div className="segmented shop-tabs" role="tablist" aria-label="Shop sections">
        {TABS.map((t) => (
          <button
            key={t.id} id={tabId(t.id)} ref={(el) => { tabRefs.current[t.id] = el; }}
            role="tab" aria-selected={tab === t.id} aria-controls={panelId} tabIndex={tab === t.id ? 0 : -1}
            onClick={() => choose(t.id)} onKeyDown={onTabKey}
          ><span aria-hidden="true">{t.icon}</span> {t.label}</button>
        ))}
      </div>

      <div id={panelId} role="tabpanel" aria-labelledby={tabId(tab)}>
        <motion.ul key={tab} className="list-plain shop-grid2" initial={reduced ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          {entries.map((entry) => {
            const st = statusOf(entry, s);
            const text = statusText(entry, st);
            const wide = entry.kind === 'helper';
            return (
              <li key={entry.key} className={wide ? 'wide' : undefined}>
                <button className={`card tight shop-card${st.on ? ' on' : ''}${wide ? ' wide' : ''}`} onClick={() => open(entry)}>
                  <ItemArt entry={entry} />
                  <span className="shop-card-text">
                    <strong>{entry.name}</strong>
                    {wide && <span className="small muted">{entry.data.about}</span>}
                    <span className={`chip${st.on ? ' primary' : ''}`}>{text}</span>
                    {wide && !st.full && <span className="chip gold">🪙 {entry.price}</span>}
                  </span>
                  <span className="sr-only">{wide ? (st.full ? ', details' : ', buy one') : ', try it on'}</span>
                </button>
              </li>
            );
          })}
        </motion.ul>
      </div>
      <p className="small muted center">No real money, ever. Everything here is earned by studying.</p>

      <Sheet open={!!pick} onClose={close} labelledBy={`${uid}-try`}>
        {pick && <TryOn entry={pick} s={s} titleId={`${uid}-try`} onBuy={purchase} onUse={use} onTakeOff={takeOff} onCancel={close} />}
      </Sheet>
    </main>
  );
}

function TryOn({ entry, s, titleId, onBuy, onUse, onTakeOff, onCancel }) {
  const st = statusOf(entry, s);
  const short = Math.max(0, entry.price - s.coins);
  const helper = entry.kind === 'helper';
  const needsBuying = helper ? !st.full : !st.owned;
  const title = helper ? `Buy ${entry.name}?` : entry.kind === 'outfit' ? `Try on: ${entry.name}` : `Preview: ${entry.name}`;

  return (
    <div className="stack tryon">
      <h2 id={titleId} className="center">{title}</h2>
      <Preview entry={entry} />
      <p className="center small" aria-live="polite">
        {helper
          ? <>{entry.data.about} You have {st.held} (max {entry.data.max}).</>
          : entry.kind === 'outfit' ? <>Zap is trying on {entry.data.look}.</> : entry.kind === 'theme' ? <>Buttons, bars and the map use this colour.</> : <>Wins burst with {entry.name.toLowerCase()} confetti.</>}
      </p>

      {needsBuying && (
        <p className="center tryon-price">
          <span>Price: <strong>🪙 {entry.price}</strong></span>
          <span className="small muted">You have 🪙 {s.coins}{short === 0 && <> · 🪙 {s.coins - entry.price} left after</>}</span>
        </p>
      )}

      <div className="stack-s">
        {needsBuying && short === 0 && (
          <button className="btn gold block" data-autofocus onClick={() => onBuy(entry)} aria-label={`Buy ${entry.name} for ${entry.price} coins`}>Buy for 🪙 {entry.price}</button>
        )}
        {needsBuying && short > 0 && (
          <>
            <p className="center tryon-short" role="status"><strong>Need 🪙 {short} more.</strong> Play lessons to earn coins.</p>
            <a className="btn primary block" href="#/" onClick={onCancel}>▶ Play to earn coins</a>
          </>
        )}
        {helper && st.full && <p className="center" role="status"><strong>Full ✓</strong> You already hold the most allowed.</p>}
        {!helper && st.owned && !st.on && (
          <button className="btn primary block" data-autofocus onClick={() => onUse(entry)}>{entry.kind === 'outfit' ? 'Wear it' : 'Use it'}</button>
        )}
        {!helper && st.on && (
          <>
            <p className="center" role="status"><strong>{entry.kind === 'outfit' ? 'Equipped ✓' : 'In use ✓'}</strong></p>
            {entry.kind === 'outfit' && <button className="btn block" onClick={onTakeOff}>Take it off</button>}
          </>
        )}
        <button className="btn ghost block" onClick={onCancel}>{needsBuying ? 'Cancel' : 'Close'}</button>
      </div>
    </div>
  );
}

function Preview({ entry }) {
  const dark = typeof document !== 'undefined' && document.documentElement.dataset.theme === 'dark';
  if (entry.kind === 'outfit') {
    return <div className="tryon-stage"><Zap size={150} mood="wow" hat={entry.id} label="Preview of Zap" /></div>;
  }
  if (entry.kind === 'theme') {
    const [p, ledge, on, soft] = dark ? entry.data.dark : entry.data.light;
    return (
      <div className="tryon-stage theme" style={{ '--primary': p, '--primary-ledge': ledge, '--on-primary': on, '--primary-soft': soft }}>
        <Zap size={110} mood="happy" label={`Preview of Zap in the ${entry.name} theme`} />
        <div className="tryon-sample" aria-hidden="true">
          <span className="btn primary small">▶ Start lesson</span>
          <span className="bar"><span style={{ width: '62%' }} /></span>
          <span className="chip primary">Next level</span>
        </div>
      </div>
    );
  }
  if (entry.kind === 'confetti') return <div className="tryon-stage"><ConfettiPreview sample={entry.data.sample} name={entry.name} /></div>;
  return <div className="tryon-stage"><span className="shop-emoji big" aria-hidden="true">{entry.data.emoji}</span></div>;
}

const BITS = [[-62, -38], [58, -46], [-44, 30], [66, 22], [-8, -64], [30, 52], [-74, -2], [80, -14]];

function ConfettiPreview({ sample, name }) {
  const reduced = useReducedMotion();
  const calm = useCalm();
  const still = reduced || calm;
  return (
    <div className="tryon-confetti" role="img" aria-label={`Preview of Zap cheering with ${name} confetti`}>
      <Zap size={110} mood="cheer" label="" bounce={!still} />
      {BITS.map(([x, y], i) => (
        <motion.span
          key={`${sample}-${i}`} aria-hidden="true" className="tryon-bit"
          initial={still ? false : { x: 0, y: 0, opacity: 0, scale: 0.4 }}
          animate={{ x, y, opacity: 1, scale: 1, rotate: still ? 0 : (i % 2 ? 20 : -20) }}
          transition={{ duration: 0.6, delay: i * 0.04, ease: 'easeOut' }}
        >{sample}</motion.span>
      ))}
    </div>
  );
}
