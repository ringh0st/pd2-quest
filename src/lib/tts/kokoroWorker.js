// Runs the on-device neural voice (Kokoro, 82M parameters, open source) off the main thread.
// The model downloads once (about 90 MB) and the browser keeps it in its cache; text is spoken sentence by
// sentence so the first words play while the rest is still being made.
import { KokoroTTS, env } from 'kokoro-js';
// The speech engine's runtime ships with the app (no third-party CDN), so it works offline once cached.
import ortModule from '../../../node_modules/@huggingface/transformers/dist/ort-wasm-simd-threaded.jsep.mjs?url';
import ortWasm from '../../../node_modules/@huggingface/transformers/dist/ort-wasm-simd-threaded.jsep.wasm?url';

env.wasmPaths = { mjs: new URL(ortModule, self.location.href).href, wasm: new URL(ortWasm, self.location.href).href };

const MODEL = 'onnx-community/Kokoro-82M-v1.0-ONNX';
const cancelled = new Set();
let ready = null;

function load() {
  ready ??= KokoroTTS.from_pretrained(MODEL, {
    dtype: 'q8',
    device: 'wasm',
    progress_callback: (p) => {
      if (p.status === 'progress' && p.total > 1_000_000) postMessage({ type: 'progress', loaded: p.loaded, total: p.total });
    },
  }).catch((error) => { ready = null; throw error; });
  return ready;
}

/** Sentences of a speakable size (long ones are split at ; : or , so the first sound comes quickly). */
function sentences(text) {
  return String(text)
    .split(/(?<=[.!?])\s+/)
    .flatMap((s) => (s.length > 240 ? s.split(/(?<=[;:,])\s+/) : [s]))
    .map((s) => s.trim())
    .filter(Boolean);
}

self.onmessage = async ({ data }) => {
  if (data.type === 'cancel') { cancelled.add(data.job); return; }
  if (data.type === 'load') {
    try { await load(); postMessage({ type: 'ready' }); } catch (error) { postMessage({ type: 'error', message: String(error?.message || error) }); }
    return;
  }
  if (data.type === 'speak') {
    const { job, text, voice } = data;
    try {
      const tts = await load();
      for (const sentence of sentences(text)) {
        if (cancelled.has(job)) break;
        const audio = await tts.generate(sentence, { voice });
        if (cancelled.has(job)) break;
        const samples = audio.audio;
        postMessage({ type: 'chunk', job, samples, rate: audio.sampling_rate }, [samples.buffer]);
      }
      postMessage({ type: 'done', job });
    } catch (error) {
      postMessage({ type: 'failed', job, message: String(error?.message || error) });
    } finally {
      cancelled.delete(job);
    }
  }
};
