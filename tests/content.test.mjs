// Content quality guards: option length must not give the answer away.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const SECTIONS = ['fund', 'auto', 'ui', 'test', 'perf'];
const load = (id) => JSON.parse(fs.readFileSync(new URL(`../src/data/${id}.json`, import.meta.url)));

test('the correct option is the longest no more often than chance allows (≤ 32% per section)', () => {
  for (const id of SECTIONS) {
    const single = load(id).questions.filter((q) => q.answer.length === 1);
    const keyedLongest = single.filter((q) => {
      const len = q.options.map((o) => o.length);
      return len[q.answer[0]] === Math.max(...len);
    });
    const rate = keyedLongest.length / single.length;
    assert.ok(rate <= 0.32, `${id}: key is the longest option in ${Math.round(rate * 100)}% of single-answer questions`);
  }
});

test('in choose-N questions the keyed options are rarely just the N longest (≤ 30% per section)', () => {
  for (const id of SECTIONS) {
    const multi = load(id).questions.filter((q) => q.answer.length > 1);
    const tell = multi.filter((q) => {
      const top = q.options.map((o, i) => [o.length, i]).sort((a, b) => b[0] - a[0]).slice(0, q.answer.length).map((x) => x[1]);
      return [...top].sort().join() === [...q.answer].sort().join();
    });
    assert.ok(tell.length / multi.length <= 0.3, `${id}: ${tell.length}/${multi.length} choose-N keys are the longest options`);
  }
});

test('every wrong-reason list lines up with its options', () => {
  for (const id of SECTIONS) {
    for (const q of load(id).questions) {
      if (!q.wrong) continue;
      assert.equal(q.wrong.length, q.options.length, `${q.id}: wrong[] length`);
      q.answer.forEach((i) => assert.equal(q.wrong[i], '', `${q.id}: correct option ${i} has a wrong-reason`));
    }
  }
});

const ALL = SECTIONS.flatMap((id) => load(id).questions);
const longestGuess = (q) => q.options.map((o, i) => [o.length, i]).sort((a, b) => b[0] - a[0]).slice(0, q.answer.length).map((x) => x[1]).sort().join();
const blindScore = (list) => list.filter((q) => longestGuess(q) === [...q.answer].sort().join()).length / list.length;

test('a "pick the longest" strategy with zero knowledge scores at most 35%', () => {
  assert.ok(blindScore(ALL) <= 0.35, `whole bank: ${Math.round(blindScore(ALL) * 100)}%`);
  const hard = ALL.filter((q) => q.difficulty >= 3);
  assert.ok(blindScore(hard) <= 0.35, `exam-hard: ${Math.round(blindScore(hard) * 100)}%`);
});

test('few keys are far longer than every distractor (≤ 10%)', () => {
  const single = ALL.filter((q) => q.answer.length === 1);
  const far = single.filter((q) => {
    const key = q.options[q.answer[0]].length;
    return key > 1.3 * Math.max(...q.options.filter((_, i) => i !== q.answer[0]).map((o) => o.length));
  });
  assert.ok(far.length / single.length <= 0.1, `${far.length}/${single.length}: ${far.map((q) => q.id).join(' ')}`);
});
