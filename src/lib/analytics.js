// Visit counts (Cloudflare Web Analytics) only with the learner's permission: Finnish law (Traficom) treats analytics
// as not strictly necessary, so it needs consent even though it sets no cookies. Off until switched on in Settings.
// The page head (scripts/ownerTags.mjs) loads the beacon at start when this is on; switching it on loads it at once.
import site from '../../site.json';

const KEY = 'devquest.analytics';
export const hasAnalytics = () => !!site.cloudflareAnalyticsToken;
export function analyticsAllowed() { try { return localStorage.getItem(KEY) === 'on'; } catch { return false; } }

export function setAnalyticsAllowed(on) {
  try { if (on) localStorage.setItem(KEY, 'on'); else localStorage.removeItem(KEY); } catch { /* storage blocked */ }
  if (on && hasAnalytics() && !document.querySelector('script[data-cf-beacon]')) {
    const s = document.createElement('script');
    s.defer = true;
    s.src = 'https://static.cloudflareinsights.com/beacon.min.js';
    s.dataset.cfBeacon = JSON.stringify({ token: site.cloudflareAnalyticsToken });
    document.head.appendChild(s);
  }
  // Switching off takes effect from the next page load (the beacon can't be unloaded)
}
