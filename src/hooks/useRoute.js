// Hash router: #/path/param?x=1. Works on GitHub Pages without server rewrites.
import { useSyncExternalStore } from 'react';

function parse() {
  const raw = window.location.hash.replace(/^#/, '') || '/';
  const [path, query = ''] = raw.split('?');
  const parts = path.split('/').filter(Boolean);
  return { path: '/' + parts.join('/'), parts, query: Object.fromEntries(new URLSearchParams(query)) };
}

let current = typeof window !== 'undefined' ? parse() : { path: '/', parts: [], query: {} };
const subs = new Set();
if (typeof window !== 'undefined') {
  window.addEventListener('hashchange', () => {
    current = parse();
    subs.forEach((f) => f());
    window.scrollTo({ top: 0 });
  });
}

export function useRoute() {
  return useSyncExternalStore((f) => { subs.add(f); return () => subs.delete(f); }, () => current);
}

export function go(to) {
  window.location.hash = to;
}

/** Navigate without leaving the old screen in history (e.g. onboarding → first lesson). */
export function replace(to) {
  window.location.replace(`${window.location.pathname}${window.location.search}#${to}`);
}
