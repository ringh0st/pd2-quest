// Copies the natural voice's files (Kokoro-82M, Apache-2.0) into public/voice/, so the app serves them from its own
// site: some browsers (iPhone Safari) can't download them from Hugging Face's CDN. Run before `npm run build`
// (CI does); the folder is git-ignored. The revision is pinned so every deploy ships the same model.
import { mkdir, stat, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

const REPO = 'https://huggingface.co/onnx-community/Kokoro-82M-v1.0-ONNX/resolve/1939ad2a8e416c0acfeecc08a694d14ef25f2231/';
const VOICES = ['af_heart', 'af_bella', 'am_michael']; // keep in sync with NATURAL_VOICES in src/lib/tts/naturalVoice.js
const FILES = ['config.json', 'tokenizer.json', 'tokenizer_config.json', 'onnx/model_quantized.onnx', ...VOICES.map((v) => `voices/${v}.bin`)];
const OUT = new URL('../public/voice/', import.meta.url).pathname;

for (const file of FILES) {
  const target = join(OUT, file);
  if (await stat(target).then((s) => s.size > 0, () => false)) continue;
  const response = await fetch(REPO + file);
  if (!response.ok) throw new Error(`${file}: HTTP ${response.status}`);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, Buffer.from(await response.arrayBuffer()));
  console.log(`voice: ${file}`);
}
