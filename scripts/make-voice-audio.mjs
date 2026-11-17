// Records every read-aloud text with the natural voice (Kokoro-82M "Heart", Apache-2.0) ahead of time, so phones
// just play small audio files instead of running a speech model. Texts come from src/lib/speechText.js (the same
// functions the buttons use), and each clip is named by a hash of its text, so only new or changed texts are recorded.
//
//   node scripts/make-voice-audio.mjs <out-dir> [--shard=i/n] [--minutes=N] [--limit=N] [--prune] [--index]
//
// --shard records only every n-th missing clip (CI runs n jobs side by side); --minutes stops cleanly after N
// minutes; --limit records at most N clips (a quick try); --prune deletes clips no text uses; --index writes
// index.json (the list of recorded clips the app reads) and records nothing. Needs ffmpeg (AAC, mono, 32 kbps .m4a).
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, renameSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { KokoroTTS } from 'kokoro-js';
import { VOICE_SAMPLE, clipId, sectionSpeech, speakable } from '../src/lib/speechText.js';

const [outDir = 'voice-audio', ...flags] = process.argv.slice(2);
const flag = (name) => flags.find((f) => f.startsWith(`--${name}`))?.split('=')[1] ?? (flags.includes(`--${name}`) ? true : null);
const minutes = Number(flag('minutes')) || Infinity;
const limit = Number(flag('limit')) || Infinity;
const VOICE = 'af_heart';
const RATE = 24000;
const PAUSE = new Float32Array(Math.round(RATE * 0.18)); // a breath between sentences

const dataDir = new URL('../src/data/', import.meta.url).pathname;
const texts = new Map([[clipId(VOICE_SAMPLE), speakable(VOICE_SAMPLE)]]);
// Sorted, so every CI shard sees the same order.
for (const exam of readdirSync(dataDir).filter((d) => statSync(join(dataDir, d)).isDirectory()).sort()) {
  for (const file of readdirSync(join(dataDir, exam)).sort()) {
    if (file === 'exam.json' || !file.endsWith('.json')) continue;
    for (const text of sectionSpeech(JSON.parse(readFileSync(join(dataDir, exam, file), 'utf8')))) texts.set(clipId(text), speakable(text));
  }
}

mkdirSync(outDir, { recursive: true });
const have = new Set(readdirSync(outDir).filter((f) => f.endsWith('.m4a')).map((f) => f.slice(0, -4)));
if (flag('prune')) {
  const stale = [...have].filter((id) => !texts.has(id));
  stale.forEach((id) => rmSync(join(outDir, `${id}.m4a`)));
  console.log(`pruned ${stale.length} unused clips`);
}
if (flag('index')) {
  const recorded = [...texts.keys()].filter((id) => have.has(id) || existsSync(join(outDir, `${id}.m4a`))).sort();
  writeFileSync(join(outDir, 'index.json'), JSON.stringify(recorded));
  console.log(`index.json: ${recorded.length} of ${texts.size} texts recorded`);
  if (recorded.length < texts.size) console.log('some texts are not recorded yet');
  process.exit(0);
}
const [shard, shards] = String(flag('shard') || '0/1').split('/').map(Number);
const missing = [...texts].filter(([id]) => !have.has(id));
const todo = missing.filter((_, i) => i % shards === shard).slice(0, limit);
console.log(`${texts.size} texts, ${missing.length} not recorded, this run records ${todo.length}`);
if (!todo.length) process.exit(0);

/** The model downloads from Hugging Face, which can refuse several CI jobs at once: try a few times. */
async function loadModel() {
  for (let attempt = 1; ; attempt += 1) {
    try {
      return await KokoroTTS.from_pretrained('onnx-community/Kokoro-82M-v1.0-ONNX', { dtype: 'fp32', device: 'cpu' });
    } catch (error) {
      console.log(`loading the voice failed (try ${attempt}): ${error?.message || error}`);
      if (attempt === 5) throw error;
      await new Promise((r) => setTimeout(r, attempt * 20_000));
    }
  }
}
const tts = await loadModel();

/** Sentences short enough for the model (it reads at most ~510 tokens at once). */
function sentences(text) {
  return text
    .split(/(?<=[.!?])\s+/)
    .flatMap((s) => (s.length > 300 ? s.split(/(?<=[;:,])\s+/) : [s]))
    .map((s) => s.trim())
    .filter(Boolean);
}

function encode(samples, target) {
  return new Promise((resolve, reject) => {
    const tmp = `${target}.part.m4a`;
    const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'f32le', '-ar', String(RATE), '-ac', '1', '-i', 'pipe:0',
      '-c:a', 'aac', '-b:a', '32k', '-movflags', '+faststart', tmp]);
    ff.on('error', reject);
    ff.on('close', (code) => {
      if (code !== 0) { reject(new Error(`ffmpeg exited with ${code}`)); return; }
      renameSync(tmp, target);
      resolve();
    });
    ff.stdin.end(Buffer.from(samples.buffer, samples.byteOffset, samples.byteLength));
  });
}

const started = Date.now();
let done = 0;
for (const [id, text] of todo) {
  if (Date.now() - started > minutes * 60_000) { console.log('time limit reached'); break; }
  const parts = [];
  for (const sentence of sentences(text)) {
    parts.push((await tts.generate(sentence, { voice: VOICE })).audio, PAUSE);
  }
  const length = parts.reduce((n, p) => n + p.length, 0);
  const samples = new Float32Array(length);
  let at = 0;
  for (const p of parts) { samples.set(p, at); at += p.length; }
  await encode(samples, join(outDir, `${id}.m4a`));
  done += 1;
  if (done % 25 === 0) console.log(`${done}/${todo.length} in ${Math.round((Date.now() - started) / 60_000)} min`);
}
console.log(`recorded ${done} clips; ${todo.length - done} left`);
