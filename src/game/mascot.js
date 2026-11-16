// Zap, your study buddy. Short, kind, a bit silly. Never shames.
// These lines fit every exam; each exam adds its own topic jokes in exam.json (`zap`, same keys), passed in as `extra`.
const LINES = {
  hello: [
    'Hey! One tiny lesson and we’re winning today.',
    'I charged my batteries. Did you charge yours? Coffee counts.',
    'Let’s go! Small steps, big brain.',
    'Psst… the boss is scared of you.',
  ],
  back: ['You’re back! Everything you learned is still here.', 'Welcome back! No guilt, just vibes.'],
  correct: ['Zap! Zap!', 'Nailed it!', 'Big brain!', 'You’re on fire!', 'Textbook!', 'Chef’s kiss!'],
  combo: ['COMBO! Don’t stop now!', 'You’re unstoppable!', 'Is this… a 0-bug run?!'],
  wrong: ['Oops! That one comes back later. That’s how it sticks.', 'Close! Read the why, it’s gold.', 'Even pros miss that one.', 'No worries, mistakes are free XP for the brain.'],
  boss: ['Boss time! Every right answer is a hit. Pow!', 'Hearts up, focus on, let’s go!'],
  win: ['WE DID IT!', 'Legendary!', 'That was beautiful.', 'Ship it! To production! On a Friday!'],
  // a pass with misses: warm, honest, points at the review
  okwin: ['Passed! The misses will come back for a rematch.', 'Good run. Replay for three stars while it’s fresh.', 'Progress! Read the whys and it sticks.'],
  lose: ['That boss got lucky. Rematch?', 'Not yet! Each try makes the next one easier.'],
  idle: [
    'Tiny steps still count as steps. Tap me again for a joke.',
    'I study in five-minute bites. Lightning is fast, not patient.',
  ],
  sleepy: ['Late study session? Short and sweet tonight, night owl.'],
};

export function zapSays(kind, rand = Math.random, extra = {}) {
  const list = [...(LINES[kind] ?? LINES.hello), ...(extra[kind] ?? [])];
  return list[Math.floor(rand() * list.length)];
}
