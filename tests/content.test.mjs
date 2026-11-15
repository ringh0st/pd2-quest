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
