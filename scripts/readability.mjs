// Plain-language check for teaching text (lesson cards, flashcards, explanations, wrong-reasons).
// Usage: node scripts/readability.mjs [section ...]   e.g. node scripts/readability.mjs fund
// Code identifiers in `backticks` and code blocks are ignored. Targets (kid-simple, exam-exact):
//   average sentence ≤ 14 words · no sentence over 25 words · long words (4+ syllables, not code) rare.
import fs from 'node:fs';

const ids = process.argv.slice(2).length ? process.argv.slice(2) : ['fund', 'auto', 'ui', 'test', 'perf'];
const strip = (t) => String(t ?? '').replace(/`[^`]*`/g, 'X').replace(/\*\*/g, '').replace(/\b[\w$]+(\.[\w$]+)+\(?\)?/g, 'X');
const sentences = (t) => strip(t).split(/(?<=[.!?])\s+|\n+/).map((s) => s.trim()).filter((s) => /\w/.test(s));
const words = (s) => s.split(/\s+/).filter(Boolean);
const syl = (w) => (w.toLowerCase().replace(/[^a-z]/g, '').replace(/e$/, '').match(/[aeiouy]+/g) || []).length;

let worstAll = [];
for (const id of ids) {
  const d = JSON.parse(fs.readFileSync(new URL(`../src/data/${id.includes("/") ? id : `pd2/${id}`}.json`, import.meta.url)));
  const texts = [];
  for (const l of d.lessons) for (const c of l.cards) {
    if (c.body) texts.push([`${l.id} card`, c.body]);
    for (const it of c.items ?? []) texts.push([`${l.id} list`, it]);
  }
  for (const f of d.flashcards) texts.push([`${f.id} back`, f.back]);
  for (const q of d.questions) {
    texts.push([`${q.id} explain`, q.explain]);
    (q.wrong ?? []).forEach((w, i) => w && texts.push([`${q.id} wrong[${i}]`, w]));
  }
  let n = 0, wc = 0, long = 0, longW = 0, totalW = 0;
  const worst = [];
  for (const [where, t] of texts) for (const s of sentences(t)) {
    const w = words(s); n++; wc += w.length; totalW += w.length;
    const lw = w.filter((x) => /^[a-z]/i.test(x) && syl(x) >= 4).length; longW += lw;
    if (w.length > 25) { long++; worst.push([w.length, where, s.slice(0, 110)]); }
  }
  worst.sort((a, b) => b[0] - a[0]);
  worstAll.push(...worst.slice(0, 3).map((x) => [id, ...x]));
  console.log(`${id.padEnd(5)} sentences ${String(n).padStart(4)} · avg ${(wc / n).toFixed(1)} words · over 25 words: ${long} · long words ${(100 * longW / totalW).toFixed(1)}%`);
}
if (worstAll.length) { console.log('\nlongest sentences:'); for (const [id, len, where, s] of worstAll) console.log(`  ${id} ${where} (${len}): ${s}…`); }
