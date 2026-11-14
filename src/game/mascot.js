// Zap ⚡, your study buddy. Short, kind, a bit silly. Never shames.
const LINES = {
  hello: [
    'Hey! One tiny lesson and we’re winning today.',
    'Ready to bully some governor limits?',
    'I charged my batteries. Did you charge yours? ☕',
    'Let’s go! Small steps, big brain.',
    'Psst… the boss is scared of you.',
  ],
  back: ['You’re back! Everything you learned is still here.', 'Welcome back! No guilt, just vibes.'],
  correct: ['Zap! ⚡', 'Nailed it!', 'Big brain!', 'Bulkified brilliance!', 'Clean deploy!', 'You’re on fire!', 'Textbook!', 'Chef’s kiss 👌'],
  combo: ['COMBO! Don’t stop now!', 'You’re unstoppable!', 'Is this… a 0-bug run?!'],
  wrong: ['Oops! That one comes back later. That’s how it sticks.', 'Close! Read the why, it’s gold.', 'Even senior devs miss that one.', 'No worries, mistakes are free XP for the brain.'],
  boss: ['Boss time! Every right answer is a hit. 💥', 'Hearts up, focus on, let’s go!'],
  win: ['WE DID IT! 🎉', 'Legendary!', 'That was beautiful.', 'Ship it! 🚀'],
  lose: ['That boss got lucky. Rematch?', 'Not yet! Each try makes the next one easier.'],
  idle: [
    'Why do Apex devs love triggers? They never miss an event. 🥁',
    'I tried a SOQL joke in a loop… got 101 laughs and an exception.',
    'My favorite exercise? Bulkifying. 💪',
    'Don’t @ me. Unless it’s @AuraEnabled.',
    'I’m not lazy, I’m @future.',
    'with sharing, without sharing… I always share snacks.',
  ],
  sleepy: ['Late study session? Short and sweet tonight. 🌙'],
};

export function zapSays(kind, rand = Math.random) {
  const list = LINES[kind] || LINES.hello;
  return list[Math.floor(rand() * list.length)];
}
