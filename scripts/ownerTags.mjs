// Shared by the app's page head (vite.config.js) and the static study pages (build-site.mjs).

/** Search Console verification and privacy-friendly visit counts (opt-in): added only once their codes are in site.json. */
export function ownerTags({ googleSiteVerification, cloudflareAnalyticsToken }) {
  return [
    googleSiteVerification && `<meta name="google-site-verification" content="${googleSiteVerification}" />`,
    // Visit counts only with permission (Settings in the app; src/lib/analytics.js uses the same key)
    cloudflareAnalyticsToken && `<script>try{if(localStorage.getItem('devquest.analytics')==='on'){var s=document.createElement('script');s.defer=true;s.src='https://static.cloudflareinsights.com/beacon.min.js';s.setAttribute('data-cf-beacon',${JSON.stringify(JSON.stringify({ token: cloudflareAnalyticsToken }))});document.head.appendChild(s)}}catch(e){}</script>`,
  ].filter(Boolean);
}
