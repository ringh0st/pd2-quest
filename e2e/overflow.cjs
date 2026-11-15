// Overflow sweep: every route at 320px × text sizes × fonts; reports pages wider than the screen.
// Run against `npm run preview` (E2E_BASE overrides the URL).
const { chromium } = require('playwright');
const BASE = process.env.E2E_BASE || 'http://localhost:4173/';
const ROUTES = ['', 'map', 'world/fund', 'world/auto', 'world/test', 'lesson/fund-1', 'play/fund-hard-1', 'play/fund-boss', 'sprint', 'sprint?section=auto', 'sprint?section=test', 'sprint?hard=1', 'cards', 'exam', 'me', 'settings', 'resources', 'shop', 'bolt', 'plan', 'placement/fund', 'placement/lesson/fund-2'];
const seed = (scale, font) => ({
  v: 1, onboarded: true, name: 'Sam', xp: 900, coins: 400, stars: { 'fund-1': 3, 'fund-2': 2, 'fund-3': 3, 'fund-hard-1': 2 }, lessons: {},
  settings: { theme: 'light', calm: false, motion: 'reduced', sound: false, haptics: false, font, textScale: scale, sprintSize: 5, focusMinutes: 10 },
  unlockedWorlds: ['auto', 'ui', 'test', 'perf'], helpers: { fifty: 2, hint: 2, heart: 1 },
});
(async () => {
  const browser = await chromium.launch();
  const bad = [];
  for (const [w, h] of [[320, 568], [390, 844]]) {
    for (const scale of [1, 1.15, 1.3]) {
      for (const font of ['atkinson', 'lexend']) {
        if (w === 390 && font === 'lexend' && scale < 1.3) continue;
        const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
        const page = await ctx.newPage();
        page.on('pageerror', (e) => bad.push(`JS error ${w}/${scale}/${font}: ${e.message}`));
        await page.goto(BASE);
        await page.evaluate((s) => localStorage.setItem('pd2quest.v1', JSON.stringify(s)), seed(scale, font));
        for (const r of ROUTES) {
          // sprints vary by question: load each a few times
          const tries = r.startsWith('sprint') || r.startsWith('play') ? 3 : 1;
          for (let t = 0; t < tries; t++) {
            await page.goto(BASE + '#/' + r);
            await page.reload();
            await page.waitForTimeout(450);
            const m = await page.evaluate(() => {
              const sw = document.documentElement.scrollWidth, cw = document.documentElement.clientWidth;
              let widest = null;
              if (sw > cw + 1) {
                for (const el of document.querySelectorAll('body *')) {
                  const rr = el.getBoundingClientRect();
                  if (rr.right > cw + 1 && (!widest || rr.right > widest.r)) widest = { r: Math.round(rr.right), tag: el.tagName + '.' + (el.className?.baseVal ?? el.className) };
                }
              }
              return { sw, cw, widest };
            });
            // Exam: start a mini mock too
            if (m.sw > m.cw + 1) bad.push(`${w}px A×${scale} ${font} #/${r}: ${m.sw}>${m.cw} widest ${JSON.stringify(m.widest)}`);
          }
        }
        // exam run screen
        await page.goto(BASE + '#/exam'); await page.waitForTimeout(300);
        await page.getByRole('button', { name: /Mini mock/ }).click();
        await page.getByRole('button', { name: /Start/ }).click();
        for (let k = 0; k < 5; k++) {
          await page.waitForTimeout(150);
          const m = await page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
          if (m[0] > m[1] + 1) bad.push(`${w}px A×${scale} ${font} exam q${k + 1}: ${m[0]}>${m[1]}`);
          await page.getByRole('button', { name: 'Next', exact: true }).click();
        }
        await ctx.close();
      }
    }
  }
  await browser.close();
  console.log(bad.length ? bad.join('\n') : 'NO OVERFLOW on any route/size');
})();
