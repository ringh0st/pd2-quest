import { readFileSync, existsSync } from 'node:fs';
import { TRACKS } from '../src/lib/track.js';
import { termMatcher, firstMentions } from '../src/lib/terms.js';
// Validates section content files (all of them when no path is given). Exits 1 on any error.
// Every exam's section files (src/data/<exam>/<section>.json; exam.json holds the exam facts, not a section).
const allSectionFiles = () => Object.values(TRACKS)
  .flatMap((t) => t.sections.map((id) => `src/data/${t.id}/${id}.json`))
  .filter((file) => existsSync(file));
const files = process.argv.slice(2).length ? process.argv.slice(2) : allSectionFiles();
let failed = false;
const itemText = (it) => (typeof it === 'string' ? it : [it?.fi, it?.en].filter(Boolean).join(' '));
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
    const texts = l.cards.flatMap((c) => [c.body, ...(c.items ?? []).filter((it) => typeof it === 'string')]); // as the app highlights them
    const hit = new Set(); texts.forEach((t) => firstMentions([t], matcher).forEach((_, k) => hit.add(k)));
    l.terms.forEach((t, k) => { if (!hit.has(k)) err.push(`${l.id} term never appears in the cards: ${t.term}`); });
  }
  for (const c of l.cards) {
    const w = ((c.body||'')+' '+(c.items||[]).map(itemText).join(' ')).split(/\s+/).length; if (w > 65 + (c.type === 'examples' ? 40 : 0)) err.push(`${l.id} card words ${w}: ${(c.title||c.body||'').slice(0,30)}`);
    if (c.type === 'examples' && !(c.items?.length >= 1 && c.items.every((it) => it?.fi && it?.en))) err.push(`${l.id} examples need items with fi and en`);
    if (c.type === 'table' && !(Array.isArray(c.rows) && c.rows.length >= 1 && c.rows.length <= 8 && c.rows.every((r) => Array.isArray(r) && r.length <= 6))) err.push(`${l.id} table rows`);
  }
}
const diff = {1:0,2:0,3:0}, pos=[0,0,0,0,0]; let multi=0;
const kinds = { choose: 0, type: 0, order: 0, listen: 0 };
for (const q of d.questions) {
  if (!lids.has(q.lesson)) err.push('bad lesson ' + q.id);
  if (!q.explain) err.push('no explain ' + q.id);
  // language tasks (YKI): typed form in context, and sentence building
  if (q.kind === 'type') {
    if ((q.q.match(/___/g) || []).length !== 1) err.push('type needs one ___ gap ' + q.id);
    if (!Array.isArray(q.answer) || !q.answer.length || q.answer.some((a) => typeof a !== 'string' || !a.trim())) err.push('type answers ' + q.id);
    diff[q.difficulty]++; kinds.type++; continue;
  }
  if (q.kind === 'order') {
    const norm = (x) => x.replace(/[.!?]$/, '').trim().toLowerCase();
    if (!Array.isArray(q.tiles) || q.tiles.length < 3 || q.tiles.length > 8) err.push('order tiles ' + q.id);
    else if (!Array.isArray(q.answer) || !q.answer.length) err.push('order answers ' + q.id);
    else for (const a of q.answer) { if (norm(a).split(/\s+/).sort().join(' ') !== q.tiles.map(norm).sort().join(' ')) err.push(`order answer must use exactly the tiles ${q.id}: ${a}`); }
    diff[q.difficulty]++; kinds.order++; continue;
  }
  if (q.kind === 'listen') { if (typeof q.audio !== 'string' || !q.audio.trim() || q.audio.split(/\s+/).length > 60) err.push('listen audio ' + q.id); kinds.listen++; }
  else if (q.kind) err.push('unknown kind ' + q.kind + ' ' + q.id);
  else kinds.choose++;
  if (q.options.length !== q.wrong.length) err.push('wrong len ' + q.id);
  if (q.answer.length > 1) { multi++; if (q.options.length !== 5) err.push('multi 5 opts ' + q.id); } else if (q.options.length !== 4) err.push('4 opts '+q.id);
  for (const a of q.answer) { if (a < 0 || a >= q.options.length) err.push('range ' + q.id); pos[a]++; }
  q.wrong.forEach((w, i) => { if (q.answer.includes(i) !== (w === '')) err.push('wrong align ' + q.id + ' ' + i); });
  if (q.code && !q.lang) err.push('lang '+q.id);
  diff[q.difficulty]++;
}
const fids=new Set(d.flashcards.map(f=>f.id)); if (fids.size!==d.flashcards.length) err.push('dup fid');
for (const f of d.flashcards) if (f.back.split(/\s+/).length>40) err.push('fc long '+f.id+' '+f.back.split(/\s+/).length);
// writing tasks (YKI): guided writing with model answer and self-check
for (const w of d.writing ?? []) {
  if (!w.id || !lids.has(w.lesson)) err.push('writing lesson ' + w.id);
  if (!['informal', 'formal', 'opinion'].includes(w.type)) err.push('writing type ' + w.id);
  if (!w.situation || !w.model || !(w.points?.length >= 2) || !(w.checklist?.length >= 2)) err.push('writing incomplete ' + w.id);
}
console.log({lessons:d.lessons.length, flashcards:d.flashcards.length, questions:d.questions.length, writing: d.writing?.length ?? 0, diff, multi, pos, ...(kinds.type + kinds.order + kinds.listen ? { kinds } : {})});
console.log(file, err.length ? err : 'OK');
if (err.length) failed = true;
}
process.exit(failed ? 1 : 0);
