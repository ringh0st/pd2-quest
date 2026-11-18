// Shared by the app's page head (vite.config.js) and the static study pages (build-site.mjs).

/** Search Console verification and privacy-friendly visit counts: added only once their codes are in site.json. */
export function ownerTags({ googleSiteVerification, cloudflareAnalyticsToken }) {
  return [
    googleSiteVerification && `<meta name="google-site-verification" content="${googleSiteVerification}" />`,
    cloudflareAnalyticsToken && `<script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='${JSON.stringify({ token: cloudflareAnalyticsToken })}'></script>`,
  ].filter(Boolean);
}
