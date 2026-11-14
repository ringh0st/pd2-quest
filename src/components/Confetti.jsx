// Canvas confetti burst: capped particle count, one burst, aria-hidden, skipped for reduced motion.
import { useEffect, useRef } from 'react';

const COLORS = ['#FF7AB8', '#FFC94D', '#5CD0E8', '#FF9248', '#5EE0B4', '#FFFFFF'];

const EMOJI = { stars: ['⭐', '🌟', '✨'], bolts: ['⚡', '⚡', '✨'], hearts: ['💖', '💜', '💛', '💗'] };

export function Confetti({ fire, count = 40, origin = { x: 0.5, y: 0.35 }, kind = 'classic' }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!fire) return;
    const canvas = ref.current;
    if (!canvas) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = (canvas.width = window.innerWidth * dpr);
    const h = (canvas.height = window.innerHeight * dpr);
    const ctx = canvas.getContext('2d');
    const parts = Array.from({ length: count }, () => {
      const a = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.1;
      const v = (8 + Math.random() * 9) * dpr;
      return {
        x: origin.x * w, y: origin.y * h,
        vx: Math.cos(a) * v, vy: Math.sin(a) * v,
        r: (5 + Math.random() * 5) * dpr,
        rot: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 0.3,
        c: COLORS[(Math.random() * COLORS.length) | 0],
        shape: EMOJI[kind] ? 'emoji' : Math.random() < 0.3 ? 'circle' : 'rect',
        e: EMOJI[kind]?.[(Math.random() * EMOJI[kind].length) | 0],
      };
    });
    const start = performance.now();
    let raf;
    const tick = (t) => {
      const age = t - start;
      ctx.clearRect(0, 0, w, h);
      ctx.globalAlpha = Math.max(0, 1 - age / 1400);
      for (const p of parts) {
        p.vy += 0.35 * dpr; p.vx *= 0.985; p.vy *= 0.985;
        p.x += p.vx; p.y += p.vy; p.rot += p.vr;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.fillStyle = p.c;
        if (p.shape === 'emoji') { ctx.font = `${p.r * 2.4}px serif`; ctx.textAlign = 'center'; ctx.fillText(p.e, 0, p.r); }
        else if (p.shape === 'circle') { ctx.beginPath(); ctx.arc(0, 0, p.r / 2, 0, Math.PI * 2); ctx.fill(); }
        else ctx.fillRect(-p.r / 2, -p.r / 4, p.r, p.r / 2);
        ctx.restore();
      }
      if (age < 1400) raf = requestAnimationFrame(tick);
      else ctx.clearRect(0, 0, w, h);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [fire, count, origin.x, origin.y, kind]);
  return <canvas ref={ref} className="confetti" aria-hidden="true" style={{ width: '100%', height: '100%' }} />;
}
