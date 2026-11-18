// Playground: which code can run, the endless-loop guard, the page for DOM examples, and the console's printing.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { TRACKS } from '../src/lib/track.js';
import { canTryCode, guardLoops, needsAsyncWrap, starterHtml, explainError, errorLine, buildFrame } from '../src/lib/playground/prepare.js';
import { installRuntime } from '../src/lib/playground/runtime.js';

// Every code example in the JavaScript exam's content
const examples = TRACKS.js.sections.flatMap((id) => {
  const found = [];
  const walk = (o) => {
    if (Array.isArray(o)) o.forEach(walk);
    else if (o && typeof o === 'object') { if (typeof o.code === 'string') found.push(o); Object.values(o).forEach(walk); }
  };
  walk(JSON.parse(fs.readFileSync(new URL(`../src/data/js/${id}.json`, import.meta.url))));
  return found;
});

test('most JavaScript examples can be tried, and every one still parses with the loop guard (same line count)', () => {
  const runnable = examples.filter((e) => canTryCode(e.code, e.lang));
  assert.ok(runnable.length >= examples.length * 0.8, `only ${runnable.length} of ${examples.length} can be tried`);
  for (const { code } of runnable) {
    const guarded = guardLoops(code);
    assert.equal(guarded.split('\n').length, code.split('\n').length);
    assert.doesNotThrow(() => new Function(needsAsyncWrap(code) ? `(async () => {\n${guarded}\n})` : guarded), code);
  }
});

test('server, module and other-language code gets no Try button', () => {
  assert.equal(canTryCode("const fs = require('fs');", 'js'), false);
  assert.equal(canTryCode("import { LightningElement } from 'lwc';", 'js'), false);
  assert.equal(canTryCode('export default 1;', 'js'), false);
  assert.equal(canTryCode('function f() { ... }', 'js'), false);
  assert.equal(canTryCode('System.debug(1);', 'apex'), false);
  assert.equal(canTryCode('console.log(1)', 'js'), true);
  assert.equal(canTryCode('const x = await Promise.resolve(1);', 'js'), true);
});

test('loops get a guard; strings, comments and regexes are left alone', () => {
  assert.equal(guardLoops('for (let i = 0; i < 3; i++) { x(); }'), 'for (let i = 0; i < 3; i++) {__lg(); x(); }');
  assert.equal(guardLoops('while (a) {\n}'), 'while (a) {__lg();\n}');
  assert.equal(guardLoops('do { a(); } while (b);'), 'do {__lg(); a(); } while (b);');
  assert.equal(guardLoops('for await (const x of xs) { y(x); }'), 'for await (const x of xs) {__lg(); y(x); }');
  for (const keep of ["const s = 'while (x) {';", '// for (;;) {', 'const r = /for\\(/;', 'a.for(1)', 'const t = `do {`;']) assert.equal(guardLoops(keep), keep);
});

test('DOM examples get the elements they look up', () => {
  assert.match(starterHtml("document.querySelector('#save').addEventListener('click', f)"), /id="save"/);
  assert.match(starterHtml("btn.addEventListener('click', f)"), /<button id="btn">/);
  assert.match(starterHtml("outer.addEventListener('click', a); inner.addEventListener('click', b)"), /id="outer"[^]*id="inner"[^]*<\/div>/);
  assert.equal(starterHtml("const btn = document.createElement('button'); btn.click();"), '');
  assert.equal(starterHtml('console.log(1)'), '');
});

test('errors are explained in plain words and point at the editor line', () => {
  assert.match(explainError('ReferenceError', 'total is not defined'), /Nothing called total/);
  assert.match(explainError('TypeError', 'Assignment to constant variable.'), /const/);
  assert.match(explainError('TypeError', "Cannot read properties of undefined (reading 'name')"), /\.name/);
  assert.equal(explainError('Error', 'my own message'), null);
  const { offset } = buildFrame({ code: 'a\nb', token: 't' });
  assert.equal(errorLine({ line: offset + 2 }, offset), 2);
  assert.equal(errorLine({ stack: `at about:srcdoc:${offset + 1}:5` }, offset), 1);
  assert.equal(errorLine({ line: 1 }, offset), null);
});

test('the console prints values like the browser, and the mini Jest reports results', async () => {
  const msgs = [];
  const scope = { setTimeout, clearTimeout, setInterval, clearInterval, performance };
  installRuntime(scope, (m) => msgs.push(m));
  const texts = () => msgs.filter((m) => m.type === 'log').map((m) => m.text);
  const o = { a: 1, list: [1, 'x'], m: new Map([['k', 1]]) };
  o.self = o;
  scope.console.log('n', -0, 10n, undefined, null);
  scope.console.log(o);
  scope.console.log('%s is %d', 'Ada', 36);
  assert.deepEqual(texts(), ['n -0 10n undefined null', "{ a: 1, list: [ 1, 'x' ], m: Map(1) { 'k' => 1 }, self: [Circular] }", 'Ada is 36']);
  scope.test('ok', () => scope.expect({ a: [1] }).toEqual({ a: [1] }));
  scope.test('no', () => scope.expect(1).toBe(2));
  scope.__done();
  await new Promise((r) => setTimeout(r, 150));
  const out = texts();
  assert.ok(out.includes('✓ ok'));
  assert.ok(out.some((t) => t.startsWith('✕ no')));
  assert.ok(out.includes('Tests: 1 failed, 1 passed, 2 total'));
  assert.ok(msgs.some((m) => m.type === 'idle'));
});
