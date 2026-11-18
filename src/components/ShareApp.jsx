// "Tell a study buddy": the phone's share sheet where there is one, otherwise the link is copied.
import { Icon } from './icons/Icon.jsx';
import { useFeedback } from './Feedback.jsx';
import { sfx } from '../audio/sfx.js';
import { BRAND_NAME } from '../lib/appInfo.js';
import { SITE_URL, SHARE_TEXT } from '../lib/siteLinks.js';

export function ShareApp({ className = 'btn' }) {
  const { showToast } = useFeedback();
  const share = async () => {
    sfx.tap();
    const data = { title: BRAND_NAME, text: SHARE_TEXT, url: SITE_URL };
    if (navigator.share) {
      try { await navigator.share(data); return; } catch (e) { if (e?.name === 'AbortError') return; }
    }
    try { await navigator.clipboard.writeText(`${SHARE_TEXT} ${SITE_URL}`); showToast('Link copied. Paste it to a friend!', 'check'); }
    catch { showToast(SITE_URL); }
  };
  return (
    <button type="button" className={className} onClick={share}>
      <Icon name="share" /> Tell a study buddy
    </button>
  );
}
