// Prints a chunk of questions WITHOUT answers, for blind solving. Usage: node scripts/blind.mjs <chunkIndex> [size=20]
import { readFileSync } from 'node:fs';
const k = Number(process.argv[2] ?? 0); const size = Number(process.argv[3] ?? 20);
const all = ['fund', 'auto', 'ui', 'test', 'perf'].flatMap((id) => JSON.parse(readFileSync(`src/data/${id}.json`, 'utf8')).questions.map((q) => ({ ...q, section: id })));
const chunk = all.slice(k * size, k * size + size);
for (const q of chunk) {
  console.log(`\n=== ${q.id} [${q.section}] ${q.answer.length > 1 ? `(Choose ${q.answer.length})` : ''}`);
  console.log(q.q);
  if (q.code) console.log('```' + (q.lang || '') + '\n' + q.code + '\n```');
  q.options.forEach((o, i) => console.log(`  ${i}) ${o}`));
}
console.error(`chunk ${k}: ${chunk.length} questions (of ${all.length})`);
