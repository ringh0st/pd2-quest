// Runs playground code in a sandboxed frame (scripts only, no access to the app, its storage or progress)
// and collects what it prints. The frame lives inside `hostRef`; for page examples it is shown as a preview.
import { useCallback, useEffect, useRef, useState } from 'react';
import { buildFrame, errorLine, explainError } from '../lib/playground/prepare.js';

const TOP_LEVEL_LIMIT_MS = 4000; // the code itself (the loop guard normally stops loops at 2 s)
const TOTAL_LIMIT_MS = 10000;    // timers and promises after it

/**
 * status: 'ready' | 'running' | 'done' | 'stopped' | 'timeout'
 * lines: [{ level: 'log' | 'info' | 'warn' | 'error' | 'pass' | 'fail', text, line?, hint? }]
 */
export function useCodeRunner(hostRef) {
  const [status, setStatus] = useState('ready');
  const [lines, setLines] = useState([]);
  const run = useRef(null);

  const finish = useCallback((next, keepFrame = true) => {
    const r = run.current;
    if (!r) return;
    clearTimeout(r.topTimer); clearTimeout(r.allTimer);
    cancelAnimationFrame(r.flushFrame);
    r.flush();
    if (!keepFrame) { r.frame.remove(); window.removeEventListener('message', r.onMessage); run.current = null; }
    setStatus(next);
  }, []);

  const dispose = useCallback(() => {
    const r = run.current;
    if (!r) return;
    clearTimeout(r.topTimer); clearTimeout(r.allTimer);
    cancelAnimationFrame(r.flushFrame);
    window.removeEventListener('message', r.onMessage);
    r.frame.remove();
    run.current = null;
  }, []);

  const start = useCallback(({ code, html = '', showPage = false }) => {
    dispose();
    const host = hostRef.current;
    if (!host) return;
    const token = Math.random().toString(36).slice(2);
    const { srcdoc, offset } = buildFrame({ code, html, token });
    const frame = document.createElement('iframe');
    frame.setAttribute('sandbox', 'allow-scripts');
    frame.setAttribute('title', 'Page preview of your code');
    frame.className = showPage ? 'pg-frame' : 'pg-frame pg-frame-hidden';
    if (!showPage) frame.setAttribute('aria-hidden', 'true');
    if (!showPage) frame.tabIndex = -1;

    let buffer = [];
    const r = { frame, flushFrame: 0, topTimer: 0, allTimer: 0, ended: false };
    r.flush = () => {
      if (!buffer.length) return;
      const batch = buffer;
      buffer = [];
      setLines((prev) => [...prev, ...batch]);
    };
    const queue = (item) => {
      buffer.push(item);
      if (!r.flushFrame) r.flushFrame = requestAnimationFrame(() => { r.flushFrame = 0; r.flush(); });
    };
    r.onMessage = (e) => {
      if (e.source !== frame.contentWindow || !e.data || e.data.pg !== token) return;
      const m = e.data;
      if (m.type === 'log') queue({ level: m.level, text: String(m.text) });
      else if (m.type === 'clear') { buffer = []; setLines([]); }
      else if (m.type === 'error') {
        const loop = m.message === '__PLAYGROUND_LOOP__';
        queue({
          level: 'error',
          text: loop ? 'Stopped: a loop ran too long' : `${m.promise ? 'Uncaught (in promise) ' : ''}${m.name}: ${m.message}`,
          line: errorLine(m, offset),
          hint: explainError(m.name, m.message),
        });
      } else if (m.type === 'sync') clearTimeout(r.topTimer);
      else if (m.type === 'idle' && !r.ended) { r.ended = true; finish('done'); }
    };
    window.addEventListener('message', r.onMessage);
    r.topTimer = setTimeout(() => {
      queue({ level: 'error', text: 'Stopped: the code ran for over 4 seconds', hint: 'Something kept it busy, maybe an endless loop or a very big calculation.' });
      r.ended = true; finish('timeout', false);
    }, TOP_LEVEL_LIMIT_MS);
    r.allTimer = setTimeout(() => {
      if (r.ended) return;
      queue({ level: 'warn', text: 'Stopped after 10 seconds: a timer or promise was still waiting.', hint: 'A setInterval keeps running until clearInterval is called.' });
      r.ended = true; finish('timeout', false);
    }, TOTAL_LIMIT_MS);
    run.current = r;
    setLines([]);
    setStatus('running');
    frame.srcdoc = srcdoc;
    host.replaceChildren(frame);
  }, [dispose, finish, hostRef]);

  const stop = useCallback(() => {
    if (!run.current) return;
    run.current.ended = true;
    finish('stopped', false);
  }, [finish]);

  const reset = useCallback(() => { dispose(); setLines([]); setStatus('ready'); hostRef.current?.replaceChildren(); }, [dispose, hostRef]);

  useEffect(() => dispose, [dispose]);
  return { status, lines, start, stop, reset };
}
