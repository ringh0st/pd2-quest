// The app scrolls inside its own container (.app), not the page. On iPhone Safari a page that
// scrolls makes the browser toolbar grow and shrink, which pushed the fixed bottom nav up and down.
export function scroller() {
  return document.querySelector('.app') || document.scrollingElement || document.documentElement;
}

export function scrollToTop(behavior = 'auto') {
  scroller().scrollTo({ top: 0, behavior });
}

/** Scroll so `el` sits in the middle of the visible area. */
export function scrollToCenter(el, behavior = 'auto') {
  const box = scroller();
  const r = el.getBoundingClientRect();
  const b = box.getBoundingClientRect();
  const top = Math.max(0, box.scrollTop + (r.top - b.top) + r.height / 2 - box.clientHeight / 2);
  box.scrollTo({ top, behavior });
}
