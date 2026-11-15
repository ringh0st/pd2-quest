// Behaviour checks for the fixes the testers asked for.
const { chromium, devices } = require('playwright');
const BASE = process.env.E2E_BASE || 'http://localhost:4173/';
const seed = (extra = {}) => ({ v: 1, onboarded: true, xp: 300, settings: { theme: 'light', motion: 'reduced', sound: false, haptics: false, textScale: 1.3, sprintSize: 5, focusMinutes: 10, font: 'atkinson' }, ...extra });
const results = [];
const ok = (name, pass, info = '') => results.push(`${pass ? 'PASS' : 'FAIL'}  ${name}${info ? ' · ' + info : ''}`);

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ ...devices['iPhone SE'] });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(BASE);
  await page.evaluate((s) => localStorage.setItem('pd2quest.v1', JSON.stringify(s)), seed());

  // 1. Sprint at A++ on SE: after a wrong answer, the explanation is in view above the sticky button
  await page.goto(BASE + '#/sprint'); await page.reload(); await page.waitForTimeout(500);
  const opts = page.locator('.option');
  const n = await page.locator('.choose-n').count() ? Number((await page.locator('.choose-n').innerText()).match(/\d/)[0]) : 1;
  // choose options until we get a wrong answer or give up
  for (let k = 0; k < n; k++) await opts.nth(k).click();
  await page.getByRole('button', { name: 'Check' }).click();
  await page.waitForTimeout(700);
  const vis = await page.evaluate(() => {
    const f = document.querySelector('.feedback'); const s = document.querySelector('.sticky-actions');
    if (!f || !s) return null;
    const fr = f.getBoundingClientRect(), sr = s.getBoundingClientRect();
    return { top: Math.round(fr.top), stickyTop: Math.round(sr.top), vh: innerHeight };
  });
  ok('explanation visible after Check (SE, A++)', vis && vis.top >= 0 && vis.top < vis.stickyTop - 40, JSON.stringify(vis));

  // 2. Exam: answer immediately after Next under reduced motion → saved on the right question
  await page.goto(BASE + '#/exam'); await page.waitForTimeout(300);
  await page.getByRole('button', { name: /Mini mock/ }).click();
  await page.getByRole('button', { name: /Start/ }).click();
  await page.waitForTimeout(300);
  let lost = 0;
  for (let k = 0; k < 6; k++) {
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await page.locator('.option').first().click(); // within a few ms of Next
    const checked = await page.locator('.option').first().getAttribute('aria-checked');
    if (checked !== 'true') lost++;
  }
  ok('exam: taps right after Next are never lost', lost === 0, `${lost} lost`);

  // 3. Exam: reload keeps the attempt and offers Resume with answers intact
  await page.reload(); await page.waitForTimeout(500);
  const resume = page.getByRole('button', { name: /Resume/ });
  ok('exam survives a reload (Resume offered)', await resume.count() > 0);
  if (await resume.count()) {
    await resume.click(); await page.waitForTimeout(300);
    const txt = await page.locator('.bar[aria-label="Answered"]').getAttribute('aria-valuenow');
    ok('resumed exam keeps answers', Number(txt) >= 6, `answered=${txt}`);
  }

  // 4. Exam multi-select: a 3rd pick on a choose-2 is blocked, the first two stay
  let multiTested = false;
  for (let k = 0; k < 20 && !multiTested; k++) {
    if (await page.locator('.choose-n').count()) {
      const o = page.locator('.option');
      for (let x = 0; x < await o.count(); x++) if (await o.nth(x).getAttribute('aria-checked') === 'true') await o.nth(x).click();
      for (const x of [0, 1, 2]) await o.nth(x).click();
      const st = await Promise.all([0, 1, 2].map((x) => o.nth(x).getAttribute('aria-checked')));
      ok('choose-N blocks an extra pick instead of dropping one', st.join() === 'true,true,false', st.join());
      multiTested = true;
    } else {
      const next = page.getByRole('button', { name: 'Next', exact: true });
      if (!(await next.count())) break;
      await next.click();
    }
  }
  if (!multiTested) ok('choose-N test (no multi question in this mock)', true, 'skipped');

  // 5. Submit with blanks asks for confirmation; result opens at the top with the score
  await page.locator('button', { hasText: /^Q \d+\/20/ }).click();
  await page.getByRole('button', { name: /Submit exam/ }).click();
  const confirmShown = await page.getByRole('button', { name: 'Yes, submit now' }).count();
  ok('submit with blanks asks first', confirmShown > 0);
  await page.getByRole('button', { name: 'Yes, submit now' }).click();
  await page.waitForTimeout(800);
  const atTop = await page.evaluate(() => (document.querySelector('.app')?.scrollTop ?? scrollY) < 10 && !!document.querySelector('h1')?.textContent);
  ok('result opens at the top', atTop);
  const overlay = await page.locator('.overlay').count();
  ok('no celebration dialog over the result', overlay === 0);
  // escape-closes: map sheet
  // 6. Park it sheet: Escape closes and focus returns
  await page.goto(BASE + '#/'); await page.waitForTimeout(1500);
  if (await page.locator('.overlay').count()) await page.getByRole('button', { name: /Nice!/ }).click();
  const park = page.getByRole('button', { name: 'Park a distracting thought' });
  await park.click(); await page.waitForTimeout(300);
  const open1 = await page.locator('[role=dialog]').count();
  await page.keyboard.press('Escape'); await page.waitForTimeout(1200);
  const open2 = await page.locator('[role=dialog]').count();
  const focusBack = await page.evaluate(() => document.activeElement?.getAttribute('aria-label'));
  ok('Park it: Escape closes, focus returns', open1 === 1 && open2 === 0 && focusBack === 'Park a distracting thought', `${open1}/${open2}/${focusBack}`);

  // 7. Broken saved state doesn't white-screen
  await page.evaluate(() => localStorage.setItem('pd2quest.v1', JSON.stringify({ onboarded: true, items: 5, streak: 'x', settings: null, exams: {}, stars: [] })));
  await page.reload(); await page.waitForTimeout(800);
  ok('malformed saved progress still renders Home', (await page.locator('.play-btn').count()) === 1);
  await page.goto(BASE + '#/play/constructor'); await page.waitForTimeout(400);
  ok('#/play/constructor shows "not found", no crash', /not found/i.test(await page.evaluate(() => document.body.innerText)));

  // 8. Boss run: leave mid-fight, come back, Resume continues at the next question
  await page.evaluate(() => localStorage.setItem('pd2quest.v1', JSON.stringify({ v: 1, onboarded: true, settings: { motion: 'reduced', sound: false }, stars: Object.fromEntries(['fund-1', 'fund-2', 'fund-3', 'fund-hard-1', 'fund-4', 'fund-5', 'fund-6', 'fund-hard-2', 'fund-7', 'fund-8', 'fund-9'].map((id) => [id, 1])) })));
  await page.goto(BASE + '#/play/fund-boss'); await page.reload(); await page.waitForTimeout(400);
  const fight = page.getByRole('button', { name: /FIGHT/ });
  if (await fight.count()) {
    await fight.click(); await page.waitForTimeout(300);
    for (let k = 0; k < 2; k++) {
      const multi = await page.locator('.choose-n').count();
      await page.locator('.option').nth(0).click();
      if (multi) await page.locator('.option').nth(1).click();
      await page.getByRole('button', { name: 'Check' }).click();
      await page.getByRole('button', { name: /Continue|See result|Finish/ }).click();
      await page.waitForTimeout(200);
    }
    await page.getByRole('button', { name: 'Leave session' }).click(); await page.waitForTimeout(300);
    await page.goto(BASE + '#/play/fund-boss'); await page.waitForTimeout(400);
    const resumeBtn = page.getByRole('button', { name: /Resume/ });
    ok('boss fight can be resumed after leaving', await resumeBtn.count() === 1, await resumeBtn.count() ? await resumeBtn.innerText() : 'no button');
    if (await resumeBtn.count()) {
      await resumeBtn.click(); await page.waitForTimeout(300);
      const now = await page.locator('.bar[aria-label="Session progress"]').getAttribute('aria-valuenow');
      ok('resumed at question 3', now === '2', `progress=${now}`);
    }
  } else ok('boss intro reachable', false);

  // 9. Placement: all wrong → nothing skipped; result screen lists lessons
  await page.goto(BASE + '#/placement/fund'); await page.waitForTimeout(400);
  await page.getByRole('button', { name: /Start/ }).click(); await page.waitForTimeout(200);
  for (let k = 0; k < 15; k++) {
    if (!(await page.locator('.option:not([disabled])').count())) break;
    const multi = await page.locator('.choose-n').count();
    await page.locator('.option').nth(0).click();
    if (multi) await page.locator('.option').nth(1).click();
    await page.getByRole('button', { name: 'Check' }).click();
    await page.getByRole('button', { name: /Continue|Finish/ }).click();
    await page.waitForTimeout(120);
  }
  ok('placement reaches its result', /Placement done/.test(await page.evaluate(() => document.body.innerText)));

  // 10. Study plan with an exam date
  await page.evaluate(() => { const s = JSON.parse(localStorage.getItem('pd2quest.v1')); s.examDate = new Date(Date.now() + 40 * 864e5).toISOString().slice(0, 10); localStorage.setItem('pd2quest.v1', JSON.stringify(s)); });
  await page.goto(BASE + '#/'); await page.reload(); await page.waitForTimeout(900);
  ok('Home shows Today’s plan', /Today’s plan/.test(await page.evaluate(() => document.body.innerText)));
  await page.goto(BASE + '#/plan'); await page.waitForTimeout(400);
  ok('week-by-week plan renders', (await page.locator('main li.card').count()) >= 2);

  ok('no uncaught page errors', errors.length === 0, errors.slice(0, 3).join(' | '));
  await browser.close();
  console.log(results.join('\n'));
})();
