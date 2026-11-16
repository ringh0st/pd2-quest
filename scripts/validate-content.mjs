import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { termMatcher, firstMentions } from '../src/lib/terms.js';
// Validates section content files (all of them when no path is given). Exits 1 on any error.
// Every exam's section files (src/data/<exam>/<section>.json; exam.json holds the exam facts, not a section).
const allSectionFiles = () => ['pd1', 'pd2']
  .filter((exam) => existsSync(`src/data/${exam}`))
  .flatMap((exam) => readdirSync(`src/data/${exam}`).filter((f) => f.endsWith('.json') && f !== 'exam.json').sort().map((f) => `src/data/${exam}/${f}`));
const files = process.argv.slice(2).length ? process.argv.slice(2) : allSectionFiles();
let failed = false;
for (const file of files) {
const d = JSON.parse(readFileSync(file));
const err = [];
const qids = new Set(d.questions.map(q => q.id));
const lids = new Set(d.lessons.map(l => l.id));
if (qids.size !== d.questions.length) err.push('dup qid');
for (const l of d.lessons) {
  if (l.cards.length < 4 || l.cards.length > 9) err.push(l.id + ' cards ' + l.cards.length);
  if (l.check.length < 2 || l.check.length > 3) err.push(l.id + ' check count');
  for (const c of l.check) { if (!qids.has(c)) err.push('missing check ' + c); else if (d.questions.find(q=>q.id===c).lesson!==l.id) err.push('check lesson mismatch '+c); }
  if (l.terms) {
    // key terms: well formed, short and simple, unique, and each one really shows up (highlighted) on a card
    const seenT = new Set();
    for (const t of l.terms) {
      if (typeof t.term !== 'string' || !t.term || typeof t.say !== 'string' || !t.say) { err.push(`${l.id} bad term ${JSON.stringify(t).slice(0, 40)}`); continue; }
      if (t.match && !Array.isArray(t.match)) err.push(`${l.id} term match not a list: ${t.term}`);
      for (const m of [t.term, ...(t.match ?? [])]) { if (seenT.has(m.toLowerCase())) err.push(`${l.id} term listed twice: ${m}`); seenT.add(m.toLowerCase()); }
      const words = t.say.split(/\s+/).length; if (words > 45) err.push(`${l.id} term "${t.term}" meaning ${words} words (max 45)`);
    }
    const matcher = termMatcher(l.terms);
    const texts = l.cards.flatMap((c) => [c.body, ...(c.items ?? [])]);
    const hit = new Set(); texts.forEach((t) => firstMentions([t], matcher).forEach((_, k) => hit.add(k)));
    l.terms.forEach((t, k) => { if (!hit.has(k)) err.push(`${l.id} term never appears in the cards: ${t.term}`); });
  }
  for (const c of l.cards) { const w = ((c.body||'')+' '+(c.items||[]).join(' ')).split(/\s+/).length; if (w > 65) err.push(`${l.id} card words ${w}: ${(c.title||c.body).slice(0,30)}`); }
}
const diff = {1:0,2:0,3:0}, pos=[0,0,0,0,0]; let multi=0;
for (const q of d.questions) {
  if (!lids.has(q.lesson)) err.push('bad lesson ' + q.id);
  if (q.options.length !== q.wrong.length) err.push('wrong len ' + q.id);
  if (q.answer.length > 1) { multi++; if (q.options.length !== 5) err.push('multi 5 opts ' + q.id); } else if (q.options.length !== 4) err.push('4 opts '+q.id);
  for (const a of q.answer) { if (a < 0 || a >= q.options.length) err.push('range ' + q.id); pos[a]++; }
  q.wrong.forEach((w, i) => { if (q.answer.includes(i) !== (w === '')) err.push('wrong align ' + q.id + ' ' + i); });
  if (q.code && !q.lang) err.push('lang '+q.id);
  diff[q.difficulty]++;
}
const fids=new Set(d.flashcards.map(f=>f.id)); if (fids.size!==d.flashcards.length) err.push('dup fid');
for (const f of d.flashcards) if (f.back.split(/\s+/).length>40) err.push('fc long '+f.id+' '+f.back.split(/\s+/).length);
console.log({lessons:d.lessons.length, flashcards:d.flashcards.length, questions:d.questions.length, diff, multi, pos});
console.log(file, err.length ? err : 'OK');
if (err.length) failed = true;
}
process.exit(failed ? 1 : 0);
