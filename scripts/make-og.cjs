// Makes public/og.png, the 1200×630 picture shown when a link to the app is shared (LinkedIn, Slack, X…).
// Uses the name and tagline from site.json; run `npm run og` again after a rename.
const { chromium } = require('playwright');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');

const root = join(__dirname, '..');
const site = JSON.parse(readFileSync(join(root, 'site.json'), 'utf8'));
const icon = readFileSync(join(root, 'public/icon.svg'), 'utf8');
const html = `<!doctype html><html><body style="margin:0;width:1200px;height:630px;display:grid;grid-template-columns:330px 1fr;align-items:center;gap:40px;padding:0 80px;box-sizing:border-box;
background:radial-gradient(120% 90% at 20% 30%,#3A2230,#161412 70%);color:#F6F1EA;font-family:system-ui,-apple-system,'Segoe UI',sans-serif">
<div style="width:300px;height:300px">${icon.replace('<svg', '<svg width="300" height="300"')}</div>
<div><div style="font-size:96px;font-weight:800;letter-spacing:-2px;color:#FF7AB6">${site.wordmark[0]}<span style="color:#FFC94D">${site.wordmark[1]}</span></div>
<div style="font-size:38px;font-weight:700;line-height:1.25;margin-top:12px">${site.tagline}</div>
<div style="font-size:28px;opacity:.75;margin-top:22px">PD1 · PD2 · App Builder · JavaScript · Free, no account</div></div></body></html>`;
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1200, height: 630 } });
  await p.setContent(html);
  await p.screenshot({ path: join(root, 'public/og.png') });
  await b.close();
  console.log('public/og.png written');
})();
