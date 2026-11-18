// Admin edits: only known fields, sane answers, applied in place and fully undoable.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cleanPatch, applyPatch, restore } from '../src/lib/contentPatch.js';

test('patches keep only the fields each kind can change, in the right shape', () => {
  assert.deepEqual(cleanPatch('card', { body: 'New', id: 'x', type: 'trap' }), { body: 'New' });
  assert.deepEqual(cleanPatch('flashcard', { front: 'F', back: 'B', section: 'z' }), { front: 'F', back: 'B' });
  assert.equal(cleanPatch('card', { nope: 1 }), null);
  assert.equal(cleanPatch('unknown', { body: 'x' }), null);
  assert.deepEqual(cleanPatch('question', { answer: [2, 0, 2] }, { options: ['a', 'b', 'c'] }), { answer: [0, 2] });
});

test('a question never ends up with an answer that points nowhere', () => {
  assert.equal(cleanPatch('question', { answer: [5] }, { options: ['a', 'b'] }), null);
  assert.equal(cleanPatch('question', { options: ['only one'] }, { options: ['a', 'b'], answer: [0] }), null);
  assert.equal(cleanPatch('question', { options: ['a', 'b'] }, { options: ['a', 'b', 'c'], answer: [2] }), null);
  assert.deepEqual(cleanPatch('question', { options: ['a', 'b'], answer: [1] }, { options: ['a', 'b', 'c'], answer: [2] }), { options: ['a', 'b'], answer: [1] });
});

test('applying edits in place keeps the original, and restore brings it back exactly', () => {
  const originals = new Map();
  const q = { id: 'q1', q: 'Old?', options: ['a', 'b'], answer: [0], explain: 'because' };
  assert.equal(applyPatch(q, 'k', 'question', { q: 'New?', answer: [1] }, originals), true);
  assert.deepEqual([q.q, q.answer, q.explain], ['New?', [1], 'because']);
  applyPatch(q, 'k', 'question', { explain: 'second edit' }, originals); // a newer edit replaces the older one
  assert.deepEqual([q.q, q.answer, q.explain], ['Old?', [0], 'second edit']);
  restore(q, 'k', originals);
  assert.deepEqual(q, { id: 'q1', q: 'Old?', options: ['a', 'b'], answer: [0], explain: 'because' });
  const card = { type: 'text', body: 'x' };
  applyPatch(card, 'c', 'card', { title: 'Added' }, originals);
  restore(card, 'c', originals);
  assert.deepEqual(card, { type: 'text', body: 'x' }); // a field the card didn't have is removed again
});
