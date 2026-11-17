// Run against `npm run preview` (E2E_BASE overrides the URL).
const { chromium } = require('playwright');
const { launchForTrack, trackSections } = require('./track.cjs');
const fs = require('fs');
const axeSrc = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
const BASE = process.env.E2E_BASE || 'http://localhost:4173/';
(async () => {
  const S = (await trackSections())[0]; // the exam's first section
  const ROUTES = ['', 'map', `world/${S}`, `lesson/${S}-1`, `play/${S}-hard-1`, 'sprint', 'cards', 'exam', 'me', 'settings', 'shop', 'bolt', 'resources'];
  const b = await launchForTrack(chromium);
  const out = [];
  for (const theme of ['light', 'dark']) {
    const p = await (await b.newContext({ viewport: { width: 390, height: 844 } })).newPage();
    await p.goto(BASE);
    await p.evaluate((t) => localStorage.setItem('pd2quest.v1', JSON.stringify({ v: 1, onboarded: true, xp: 200, settings: { theme: t, motion: 'reduced', sound: false } })), theme);
    for (const r of [...ROUTES, 'exam-run']) {
      if (r === 'exam-run') {
        await p.goto(BASE + '#/exam'); await p.reload(); await p.waitForTimeout(400);
        await p.getByRole('button', { name: /Mini mock/ }).click();
        await p.getByRole('button', { name: /Start/ }).click(); await p.waitForTimeout(400);
      } else { await p.goto(BASE + '#/' + r); await p.reload(); await p.waitForTimeout(700); }
      await p.addScriptTag({ content: axeSrc });
      const res = await p.evaluate(async () => (await window.axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'] })).violations.map((v) => `${v.id} (${v.nodes.length}): ${v.nodes[0].target.join(' ')} ${v.nodes[0].failureSummary?.split('\n')[1] ?? ''}`));
      if (res.length) out.push(`${theme} #/${r}\n   ` + res.join('\n   '));
    }
  }
  await b.close();
  console.log(out.length ? out.join('\n') : 'axe: 0 violations on all screens, light and dark');
})();
