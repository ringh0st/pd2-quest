// Turns mono float samples into a playable WAV file (16-bit PCM) and returns an object URL for it.
// `pauseSeconds` of silence are added at the end, so sentences played one after another breathe.
export function wavUrl(samples, rate, pauseSeconds = 0) {
  const total = samples.length + Math.round(rate * pauseSeconds);
  const view = new DataView(new ArrayBuffer(44 + total * 2));
  const text = (at, s) => { for (let i = 0; i < s.length; i += 1) view.setUint8(at + i, s.charCodeAt(i)); };
  text(0, 'RIFF'); view.setUint32(4, 36 + total * 2, true); text(8, 'WAVE');
  text(12, 'fmt '); view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, 1, true);
  view.setUint32(24, rate, true); view.setUint32(28, rate * 2, true); view.setUint16(32, 2, true); view.setUint16(34, 16, true);
  text(36, 'data'); view.setUint32(40, total * 2, true);
  for (let i = 0; i < samples.length; i += 1) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(44 + i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  return URL.createObjectURL(new Blob([view.buffer], { type: 'audio/wav' }));
}
