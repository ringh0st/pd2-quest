// Typed answers for the language exercises: forgiving about small things, specific about real mistakes.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeAnswer, checkTyped, diagnose, isTypedTask } from '../src/engine/answers.js';

test('capitals, spaces and a final full stop never count against you', () => {
  assert.equal(normalizeAnswer('  Asun   Helsingissä. '), 'asun helsingissä');
  assert.equal(checkTyped(['kirjastoon'], 'Kirjastoon!').right, true);
  assert.equal(checkTyped(['Minä asun Helsingissä', 'Asun Helsingissä'], 'asun helsingissä').right, true);
});

test('each typical Finnish mistake gets its own name', () => {
  assert.equal(diagnose('kylässä', 'kylassa'), 'harmony');           // dots: vowel harmony
  assert.equal(diagnose('kaupassa', 'kauppassa'), 'length');         // kk/k vs pp/p: consonant gradation length
  assert.equal(diagnose('kirjastoon', 'kirjastossa'), 'ending');     // right stem, wrong case
  assert.equal(diagnose('kadulla', 'katulla'), 'stem');              // t/d gradation, ending right
  assert.equal(diagnose('talossa', 'talossa'), null);
  const r = checkTyped(['kaupassa'], 'kauppassa');
  assert.deepEqual([r.right, r.expected, r.diagnosis], [false, 'kaupassa', 'length']);
});

test('only typed tasks are checked as text', () => {
  assert.equal(isTypedTask({ kind: 'type' }), true);
  assert.equal(isTypedTask({ kind: 'order' }), true);
  assert.equal(isTypedTask({ options: ['a', 'b'] }), false);
});
