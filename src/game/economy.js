// Coins: earned by playing, spent on cosmetics and a few capped helpers. No real money, no loot boxes.

export const COINS = {
  perNewStar: 10,       // only stars you didn't have before
  bossWin: 50,
  hardWin: 20,
  dailyQuest: 25,
  allQuestsBonus: 50,
  dailyBolt: 30,
  chestMin: 15,
  chestMax: 45,
};

export const HELPERS = {
  fifty: { id: 'fifty', name: '50/50', icon: 'scissors', price: 40, max: 5, about: 'Removes two wrong answers from one question.' },
  hint: { id: 'hint', name: 'Hint', icon: 'idea', price: 30, max: 5, about: 'Shows a clue from the lesson.' },
  heart: { id: 'heart', name: 'Extra heart', icon: 'heart', price: 60, max: 3, about: 'Start a Boss or Hard level with one more heart.' },
};

// Outfits are drawn as vector parts on Zap (src/components/game/Zap.jsx). `slot` says where they sit
// (head: on the bolt's top edge, eyes: over the eyes) and `look` is the screen-reader description.
export const OUTFITS = [
  { id: 'cap', name: 'Dev cap', price: 60, slot: 'head', look: 'a teal baseball cap' },
  { id: 'shades', name: 'Deploy shades', price: 90, slot: 'eyes', look: 'dark sunglasses' },
  { id: 'top', name: 'Fancy top hat', price: 120, slot: 'head', look: 'a tall black top hat' },
  { id: 'grad', name: 'Grad cap', price: 150, slot: 'head', look: 'a graduation cap with a gold tassel' },
  { id: 'cowboy', name: 'Bug wrangler', price: 180, slot: 'head', look: 'a brown cowboy hat' },
  { id: 'party', name: 'Party hat', price: 200, slot: 'head', look: 'a spotty party hat' },
  { id: 'crown', name: 'Quest crown', price: 400, slot: 'head', look: 'a gold crown with gems' },
];

// Accent themes: every pair checked for WCAG AA (on-primary ≥4.5:1 on primary, primary ≥3:1 on bg).
export const THEMES = [
  { id: 'magenta', name: 'Magenta', price: 0, light: ['#B3125F', '#7A0A40', '#FFFFFF', '#FBE3EE'], dark: ['#FF7AB8', '#B8467E', '#14111C', '#3A1E31'] },
  { id: 'mango', name: 'Mango', price: 150, light: ['#A63F00', '#6E2A00', '#FFFFFF', '#FDE6D6'], dark: ['#FFA45C', '#B8662A', '#14111C', '#3A2416'] },
  { id: 'mint', name: 'Mint', price: 150, light: ['#0B6E50', '#064A35', '#FFFFFF', '#DDF3EA'], dark: ['#5EE0B4', '#2F9C78', '#14111C', '#16332A'] },
  { id: 'lava', name: 'Lava', price: 200, light: ['#B4232E', '#7A141C', '#FFFFFF', '#FBE1E3'], dark: ['#FF8A8F', '#B85257', '#14111C', '#3A1A1D'] },
  { id: 'gold', name: 'Gold rush', price: 300, light: ['#7A5200', '#523700', '#FFFFFF', '#FBEFD2'], dark: ['#FFC94D', '#A8771A', '#14111C', '#352A12'] },
];

// Confetti styles: `icon` names the style for the Icon system; the vector pieces (shape and colours
// per style) live in src/components/Confetti.jsx (CONFETTI_STYLES) and are shared with the shop preview.
export const CONFETTI = [
  { id: 'classic', name: 'Classic', price: 0, icon: 'party' },
  { id: 'stars', name: 'Star shower', price: 100, icon: 'star' },
  { id: 'bolts', name: 'Lightning', price: 120, icon: 'bolt' },
  { id: 'hearts', name: 'Hearts', price: 120, icon: 'heart' },
];

export function canBuy(coins, item, owned = []) {
  return coins >= item.price && !owned.includes(item.id);
}

export function canBuyHelper(coins, helper, held = 0) {
  return coins >= helper.price && held < helper.max;
}

export function chestCoins(rand = Math.random) {
  const steps = (COINS.chestMax - COINS.chestMin) / 5;
  return COINS.chestMin + Math.floor(rand() * (steps + 1)) * 5;
}

/** Which 2 wrong options a 50/50 removes (stable for a question). */
export function fiftyFifty(question, rand = Math.random) {
  if (question.answer.length > 1) return [];
  const wrong = question.options.map((_, i) => i).filter((i) => !question.answer.includes(i));
  const out = [];
  while (out.length < 2 && wrong.length) out.push(wrong.splice(Math.floor(rand() * wrong.length), 1)[0]);
  return out.sort();
}
