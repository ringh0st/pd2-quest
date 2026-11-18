// How many feedback reports are still "new" (for the Admin tab's badge). Checked when the owner is signed in,
// again when the app comes back to the front, and when the inbox changes a report's status.
import { useEffect, useState } from 'react';
import { supabase } from '../lib/auth.js';

const CHANGED = 'devquest:feedback-changed';
export const announceFeedbackChanged = () => window.dispatchEvent(new Event(CHANGED));

export function useNewFeedbackCount(on) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!on) { setCount(0); return undefined; }
    let alive = true;
    const load = async () => {
      try {
        const client = await supabase();
        const { count: n, error } = await client.from('feedback').select('id', { count: 'exact', head: true }).eq('status', 'new');
        if (!error && alive) setCount(n ?? 0);
      } catch { /* offline: keep the last number */ }
    };
    const onVisible = () => { if (document.visibilityState === 'visible') load(); };
    load();
    window.addEventListener(CHANGED, load);
    document.addEventListener('visibilitychange', onVisible);
    return () => { alive = false; window.removeEventListener(CHANGED, load); document.removeEventListener('visibilitychange', onVisible); };
  }, [on]);
  return count;
}
