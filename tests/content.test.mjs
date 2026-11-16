// Content quality guards: option length must not give the answer away.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { TRACKS } from '../src/lib/track.js';

// Every exam's sections, as "exam/section" (e.g. "pd2/fund").
const SECTIONS = Object.values(TRACKS)
  .flatMap((t) => t.sections.map((id) => `${t.id}/${id}`))
  .filter((id) => fs.existsSync(new URL(`../src/data/${id}.json`, import.meta.url)));
const load = (id) => JSON.parse(fs.readFileSync(new URL(`../src/data/${id}.json`, import.meta.url)));
// Length as displayed: `code` and **bold** marks are not shown, so they don't count.
const shown = (o) => o.replace(/`|\*\*/g, '').length;

test('the correct option is the longest no more often than chance allows (≤ 32% per section)', () => {
  for (const id of SECTIONS) {
    const single = load(id).questions.filter((q) => q.answer.length === 1);
    const keyedLongest = single.filter((q) => {
      const len = q.options.map(shown);
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
      const top = q.options.map((o, i) => [shown(o), i]).sort((a, b) => b[0] - a[0]).slice(0, q.answer.length).map((x) => x[1]);
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
const longestGuess = (q) => q.options.map((o, i) => [shown(o), i]).sort((a, b) => b[0] - a[0]).slice(0, q.answer.length).map((x) => x[1]).sort().join();
const blindScore = (list) => list.filter((q) => longestGuess(q) === [...q.answer].sort().join()).length / list.length;

test('a "pick the longest" strategy with zero knowledge scores at most 35%', () => {
  assert.ok(blindScore(ALL) <= 0.35, `whole bank: ${Math.round(blindScore(ALL) * 100)}%`);
  const hard = ALL.filter((q) => q.difficulty >= 3);
  assert.ok(blindScore(hard) <= 0.35, `exam-hard: ${Math.round(blindScore(hard) * 100)}%`);
});

test('few keys are far longer than every distractor (≤ 10%)', () => {
  const single = ALL.filter((q) => q.answer.length === 1);
  const far = single.filter((q) => {
    const key = shown(q.options[q.answer[0]]);
    return key > 1.3 * Math.max(...q.options.filter((_, i) => i !== q.answer[0]).map(shown));
  });
  assert.ok(far.length / single.length <= 0.1, `${far.length}/${single.length}: ${far.map((q) => q.id).join(' ')}`);
});

test('the code font does not single out the answer', () => {
  let lone = 0, loneKey = 0;
  for (const q of ALL.filter((x) => x.answer.length === 1)) {
    const code = q.options.map((o) => o.includes('`'));
    if (code.filter(Boolean).length === 1) { lone++; if (code[q.answer[0]]) loneKey++; }
  }
  assert.ok(loneKey / Math.max(1, lone) <= 0.34, `a lone code-font option is the answer in ${loneKey}/${lone}`);
  const giveaways = ALL.filter((q) => {
    const code = new Set(q.options.flatMap((o, i) => (o.includes('`') ? [i] : [])));
    return code.size > 0 && code.size < q.options.length && code.size === q.answer.length && q.answer.every((a) => code.has(a));
  });
  assert.ok(giveaways.length / ALL.length <= 0.02, `${giveaways.length} questions where exactly the answers are in code font: ${giveaways.map((q) => q.id).join(' ')}`);
});
