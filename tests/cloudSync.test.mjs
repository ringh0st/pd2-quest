// Progress sync: when to upload, when to take the saved copy, and who wins when both changed.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { chooseSync, isFresh } from '../src/lib/cloudSync.js';

const fresh = { xp: 0, lessons: {}, items: {} };
const studied = (xp) => ({ xp, lessons: { 'fund-1': 1 }, items: {} });
const cloud = (xp, at = 't2') => ({ xp, updated_at: at, data: {} });

test('first sign-in: a new device takes the saved progress, a used one uploads when there is none', () => {
  assert.equal(isFresh(fresh), true);
  assert.equal(chooseSync(fresh, cloud(500), {}), 'download');
  assert.equal(chooseSync(studied(80), null, {}), 'upload');
  assert.equal(chooseSync(fresh, null, {}), 'none');
});

test('first sign-in on a device that already has progress: more XP wins', () => {
  assert.equal(chooseSync(studied(80), cloud(500), {}), 'download');
  assert.equal(chooseSync(studied(900), cloud(500), {}), 'upload');
});

test('after syncing: changes here upload, changes elsewhere download, nothing new does nothing', () => {
  assert.equal(chooseSync(studied(90), cloud(80, 't1'), { lastSync: 't1', dirty: true }), 'upload');
  assert.equal(chooseSync(studied(80), cloud(80, 't1'), { lastSync: 't1', dirty: false }), 'none');
  assert.equal(chooseSync(studied(80), cloud(120, 't2'), { lastSync: 't1', dirty: false }), 'download');
  assert.equal(chooseSync(studied(150), cloud(120, 't2'), { lastSync: 't1', dirty: true }), 'upload');
  assert.equal(chooseSync(studied(100), cloud(120, 't2'), { lastSync: 't1', dirty: true }), 'download');
});
