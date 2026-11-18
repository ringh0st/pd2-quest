// Builds the public study site next to the app (runs after `vite build`): plain HTML pages at real URLs that search
// engines can read, made from the same content files as the app. The app itself uses #/ routes, which Google treats as
// one page, so these pages are how the lessons, key terms and sample questions get found.
//
//   guides/                                   all exams
//   guides/<exam>/                            exam hub: sections, weights, format
//   guides/<exam>/<section>/                  section: objectives, lessons, glossary, practice
//   guides/<exam>/<section>/<lesson>/         one lesson: its cards and key terms
//   guides/<exam>/<section>/glossary/         every key term of the section, in plain words
//   guides/<exam>/<section>/practice-questions/   about 1 in 10 of the section's questions, with answers and why
//   about/  privacy/  terms/                  trust pages (independent, original questions, no tracking)
//   sitemap.xml  robots.txt
//
// Every page links into the app at the same spot (#/go/…). Name, address and wording come from site.json, so a
// rename or a new domain is one edit. Usage: node scripts/build-site.mjs [outDir=dist]
import { mkdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { ownerTags } from './ownerTags.mjs';

const root = new URL('..', import.meta.url).pathname;
const outDir = join(root, process.argv[2] || 'dist');
const site = JSON.parse(readFileSync(join(root, 'site.json'), 'utf8'));
const { version } = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const BASE = site.url.endsWith('/') ? site.url : `${site.url}/`;
const TODAY = new Date().toISOString().slice(0, 10);
const SAMPLE_EVERY = 10; // publish about 1 in 10 questions; the full bank stays in the app

const EXAMS = ['pd1', 'pd2', 'pab', 'js'];
const TRACK_SECTIONS = { pd1: ['fund', 'auto', 'ui', 'test'], pd2: ['fund', 'auto', 'ui', 'test', 'perf'], pab: ['fund', 'data', 'logic', 'ui', 'deploy'], js: ['types', 'objects', 'browser', 'debug', 'async', 'server', 'testing'] };

// ---------- helpers ----------
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const slug = (s) => String(s).toLowerCase().normalize('NFKD').replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').slice(0, 70);
/** The app's light markdown: **bold** and `code`. */
const inline = (s) => esc(s).replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/`([^`]+)`/g, '<code>$1</code>');
const plain = (s) => String(s ?? '').replace(/\*\*|`/g, '');
const clip = (s, n = 155) => { const t = plain(s).replace(/\s+/g, ' ').trim(); return t.length > n ? `${t.slice(0, n - 1).replace(/\s+\S*$/, '')}…` : t; };
const appLink = (path) => `${BASE}#${path}`;
const url = (path) => `${BASE}${path}`;

const pages = []; // { path, html }
const add = (path, html) => pages.push({ path, html });

const CSS = `
:root{--bg:#FFF9F2;--surface:#fff;--text:#2B2118;--muted:#6B5E52;--primary:#B3125F;--soft:#F7E6EE;--gold:#8A5A00;--line:#EADFD3;--code:#F4ECE4}
@media(prefers-color-scheme:dark){:root{--bg:#161412;--surface:#211E1B;--text:#F6F1EA;--muted:#BDB2A6;--primary:#FF7AB6;--soft:#3A2230;--gold:#FFC94D;--line:#3A342E;--code:#2C2824}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--text);font:17px/1.6 system-ui,-apple-system,'Segoe UI',sans-serif}
a{color:var(--primary)}main,header .in,footer .in{max-width:760px;margin:0 auto;padding:0 18px}
header{border-bottom:1px solid var(--line);background:var(--surface)}header .in{display:flex;align-items:center;gap:12px;min-height:58px}
.brand{font-weight:800;font-size:19px;text-decoration:none;color:var(--primary)}.grow{flex:1}
.cta{display:inline-block;background:var(--primary);color:#fff;font-weight:800;text-decoration:none;padding:10px 16px;border-radius:12px}
@media(prefers-color-scheme:dark){.cta{color:#161412}}
.crumbs{font-size:14px;color:var(--muted);margin:18px 0 0}.crumbs a{color:var(--muted)}
h1{font-size:30px;line-height:1.2;margin:10px 0 6px}h2{font-size:22px;margin:28px 0 8px}h3{font-size:18px;margin:18px 0 6px}
.lead{color:var(--muted);margin-top:0}.card{background:var(--surface);border:1px solid var(--line);border-radius:16px;padding:16px 18px;margin:12px 0}
.kind{font-size:12px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:var(--muted)}
code,pre{font-variant-ligatures:none;font-feature-settings:'liga' 0,'calt' 0}code{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;background:var(--code);padding:1px 5px;border-radius:6px;font-size:.92em}
pre{background:var(--code);padding:12px 14px;border-radius:12px;overflow:auto}pre code{background:none;padding:0}
ul.links{padding-left:18px}ul.links li{margin:6px 0}dl dt{font-weight:800;margin-top:12px}dl dd{margin:2px 0 0}
details{margin-top:10px}summary{cursor:pointer;font-weight:700;color:var(--primary)}.ok{font-weight:800}
.note{font-size:14px;color:var(--muted)}footer{margin-top:40px;border-top:1px solid var(--line);padding:18px 0 34px;font-size:14px;color:var(--muted)}
.box{background:var(--soft);border-radius:16px;padding:14px 18px;margin:18px 0}`;

function page({ path, title, description, crumbs = [], body, cta, jsonLd = [], noindex = false }) {
  const canonical = url(path);
  const crumbLd = crumbs.length ? [{
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [...crumbs, { name: title }].map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, ...(c.path !== undefined ? { item: url(c.path) } : {}) })),
  }] : [];
  const ld = [...crumbLd, ...jsonLd].map((o) => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, '\\u003c')}</script>`).join('\n');
  const fullTitle = `${title} | ${site.name}`;
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(fullTitle)}</title><meta name="description" content="${esc(description)}">
${noindex ? '<meta name="robots" content="noindex">' : `<link rel="canonical" href="${esc(canonical)}">`}<link rel="icon" type="image/svg+xml" href="${esc(url('icon.svg'))}">
<meta property="og:type" content="article"><meta property="og:site_name" content="${esc(site.name)}"><meta property="og:title" content="${esc(fullTitle)}">
<meta property="og:description" content="${esc(description)}"><meta property="og:url" content="${esc(canonical)}"><meta property="og:image" content="${esc(url('og.png'))}">
<meta name="twitter:card" content="summary_large_image">
${ownerTags(site).join('\n')}
${ld}
<style>${CSS}</style></head><body>
<header><div class="in"><a class="brand" href="${esc(url('guides/'))}">${esc(site.name)}</a><span class="grow"></span><a class="cta" href="${esc(cta || BASE)}">Open the app</a></div></header>
<main>
${crumbs.length ? `<p class="crumbs">${crumbs.map((c) => `<a href="${esc(url(c.path))}">${esc(c.name)}</a>`).join(' › ')}</p>` : ''}
${body}
<div class="box"><strong>Study this in the free app.</strong> Bite-size lessons, tap-to-explain key terms, hundreds of practice questions with explanations, flashcards and mock exams. Works on your phone, no account. <a href="${esc(cta || BASE)}">Open ${esc(site.name)} →</a></div>
</main>
<footer><div class="in">${esc(site.name)} is an independent study app by ${esc(site.studio)}. It is not affiliated with, sponsored by or endorsed by Salesforce, Inc. Salesforce, Trailhead and related names are trademarks of Salesforce, Inc., used here only to name the exams this app helps you prepare for. All questions are original and are not real exam questions.
<br><a href="${esc(url('about/'))}">About</a> · <a href="${esc(url('privacy/'))}">Privacy</a> · <a href="${esc(url('terms/'))}">Terms</a> · <a href="${esc(url('guides/'))}">All study guides</a> · v${esc(version)}</div></footer>
</body></html>
`;
}

function renderCard(card) {
  const head = card.title ? `<h3>${inline(card.title)}</h3>` : '';
  const kind = card.type === 'trap' ? '<div class="kind">Exam trap</div>' : card.type === 'tip' ? '<div class="kind">Memory hook</div>' : '';
  let content = '';
  if (card.type === 'code') {
    content = `<pre><code>${esc(card.code)}</code></pre>${card.body ? `<p>${inline(card.body)}</p>` : ''}`;
  } else {
    if (card.body) content += `<p>${inline(card.body)}</p>`;
    if (card.items?.length) content += `<ul>${card.items.map((it) => `<li>${inline(it)}</li>`).join('')}</ul>`;
  }
  return `<section class="card">${kind}${head}${content}</section>`;
}

function renderQuestion(q, n) {
  const letters = 'ABCDEF';
  const multi = q.answer.length > 1;
  return `<section class="card" id="${esc(q.id)}"><div class="kind">Question ${n}${multi ? ` · choose ${q.answer.length}` : ''}</div>
<p>${inline(q.q)}</p>${q.code ? `<pre><code>${esc(q.code)}</code></pre>` : ''}
<ol type="A">${q.options.map((o) => `<li>${inline(o)}</li>`).join('')}</ol>
<details><summary>Show the answer and why</summary>
<p class="ok">Answer: ${q.answer.map((i) => `${letters[i]}. ${inline(q.options[i])}`).join(' and ')}</p>
<p>${inline(q.explain)}</p>
${q.wrong?.some(Boolean) ? `<ul>${q.wrong.map((w, i) => (w ? `<li><strong>${letters[i]}</strong>: ${inline(w)}</li>` : '')).join('')}</ul>` : ''}
${q.source ? `<p class="note">Checked against: ${esc(q.source)}</p>` : ''}
<p class="note"><a href="${esc(appLink(`/go/${q.exam}/question/${q.id}`))}">Try it in the app</a></p>
</details></section>`;
}

// ---------- content ----------
const sitemap = [];
const allExams = [];

for (const examId of EXAMS) {
  const exam = JSON.parse(readFileSync(join(root, 'src/data', examId, 'exam.json'), 'utf8'));
  const meta = site.exams[examId];
  const examPath = `guides/${meta.slug}/`;
  const sections = TRACK_SECTIONS[examId].map((id) => {
    const data = JSON.parse(readFileSync(join(root, 'src/data', examId, `${id}.json`), 'utf8'));
    const official = exam.sections.find((s) => s.id === id) || {};
    return { id, data, official, slug: slug(data.title || official.title || id) };
  });
  allExams.push({ examId, exam, meta, examPath, sections });

  // exam hub
  const totalQ = sections.reduce((n, s) => n + s.data.questions.length, 0);
  const totalL = sections.reduce((n, s) => n + s.data.lessons.length, 0);
  add(examPath, page({
    path: examPath,
    title: `${meta.title} study guide and practice questions`,
    description: clip(`Free ${meta.title} study guide: ${sections.length} exam sections, ${totalL} bite-size lessons and sample practice questions with explanations. ${exam.questions} questions, ${exam.minutes} minutes, ${exam.passing}% to pass.`),
    crumbs: [{ name: 'Study guides', path: 'guides/' }],
    cta: appLink(`/go/${examId}/app/`),
    body: `<h1>${esc(meta.title)} study guide</h1>
<p class="lead">${esc(exam.name)}${meta.aka ? ` (${esc(meta.aka)})` : ''}. Everything here is written from Salesforce’s official exam guide and documentation, in plain words.</p>
<div class="card"><strong>The exam:</strong> ${exam.questions} scored questions${exam.unscored ? ` (+ up to ${exam.unscored} unscored)` : ''}, ${exam.minutes} minutes, ${exam.passing}% to pass${exam.fee ? `. Fee: ${esc(exam.fee)}` : ''}.${exam.lastVerified ? ` <span class="note">Last checked against the official guide: ${esc(exam.lastVerified)}.</span>` : ''}</div>
<h2>Exam sections</h2>
<ul class="links">${sections.map((s) => `<li><a href="${esc(url(`${examPath}${s.slug}/`))}">${esc(s.data.title)}</a>${s.official.weight ? ` (${s.official.weight}% of the exam)` : ''}: ${s.data.lessons.length} lessons</li>`).join('')}</ul>
<h2>Free practice questions</h2>
<ul class="links">${sections.map((s) => `<li><a href="${esc(url(`${examPath}${s.slug}/practice-questions/`))}">${esc(s.data.title)} practice questions</a></li>`).join('')}</ul>`,
  }));
  sitemap.push(examPath);

  for (const s of sections) {
    const secPath = `${examPath}${s.slug}/`;
    const lessons = s.data.lessons.map((l) => ({ ...l, slug: slug(l.title) }));
    // section
    add(secPath, page({
      path: secPath,
      title: `${s.data.title}: ${meta.title} exam section`,
      description: clip(s.data.summary || `${s.data.title} for the ${meta.title} exam: official objectives, ${lessons.length} lessons, key terms and practice questions.`),
      crumbs: [{ name: 'Study guides', path: 'guides/' }, { name: meta.title, path: examPath }],
      cta: appLink(`/go/${examId}/app/world/${s.id}`),
      body: `<h1>${esc(s.data.title)}</h1>
<p class="lead">${s.official.weight ? `${s.official.weight}% of the ${esc(meta.title)} exam. ` : ''}${inline(s.data.summary || '')}</p>
${s.official.objectives?.length ? `<h2>Official objectives</h2><ul>${s.official.objectives.map((o) => `<li>${esc(o)}</li>`).join('')}</ul>` : ''}
<h2>Lessons</h2><ul class="links">${lessons.map((l) => `<li><a href="${esc(url(`${secPath}${l.slug}/`))}">${inline(l.title)}</a></li>`).join('')}</ul>
<h2>More for this section</h2><ul class="links"><li><a href="${esc(url(`${secPath}glossary/`))}">Key terms in plain words</a></li><li><a href="${esc(url(`${secPath}practice-questions/`))}">Practice questions with answers</a></li></ul>`,
    }));
    sitemap.push(secPath);

    // lessons
    lessons.forEach((l, k) => {
      const lPath = `${secPath}${l.slug}/`;
      const first = l.cards.find((c) => c.body)?.body || l.objective || l.title;
      const prev = lessons[k - 1], next = lessons[k + 1];
      add(lPath, page({
        path: lPath,
        title: `${plain(l.title)} (${meta.title})`,
        description: clip(first),
        crumbs: [{ name: 'Study guides', path: 'guides/' }, { name: meta.title, path: examPath }, { name: s.data.title, path: secPath }],
        cta: appLink(`/go/${examId}/card/${l.id}/0`),
        body: `<h1>${inline(l.title)}</h1>
${l.objective ? `<p class="lead">Exam objective: ${esc(l.objective)}</p>` : ''}
${l.cards.map(renderCard).join('\n')}
${l.terms?.length ? `<h2>Key terms</h2><dl>${l.terms.map((t) => `<dt>${esc(t.term)}</dt><dd>${esc(t.say)}</dd>`).join('')}</dl>` : ''}
<p>${prev ? `← <a href="${esc(url(`${secPath}${prev.slug}/`))}">${inline(prev.title)}</a>` : ''}${prev && next ? ' · ' : ''}${next ? `<a href="${esc(url(`${secPath}${next.slug}/`))}">${inline(next.title)}</a> →` : ''}</p>`,
      }));
      sitemap.push(lPath);
    });

    // glossary
    const terms = lessons.flatMap((l) => (l.terms || []).map((t) => ({ ...t, lesson: l })));
    const seen = new Set();
    const uniq = terms.filter((t) => { const k = t.term.toLowerCase(); if (seen.has(k)) return false; seen.add(k); return true; })
      .sort((a, b) => a.term.localeCompare(b.term, 'en', { sensitivity: 'base' }));
    const gPath = `${secPath}glossary/`;
    add(gPath, page({
      path: gPath,
      title: `${s.data.title} key terms explained simply (${meta.title})`,
      description: clip(`${uniq.length} key terms from ${s.data.title}, each explained in one or two plain sentences, for the ${meta.title} exam.`),
      crumbs: [{ name: 'Study guides', path: 'guides/' }, { name: meta.title, path: examPath }, { name: s.data.title, path: secPath }],
      cta: appLink(`/go/${examId}/app/world/${s.id}`),
      body: `<h1>${esc(s.data.title)}: key terms</h1><p class="lead">Each term in plain words, with the lesson it comes from.</p>
<dl>${uniq.map((t) => `<dt>${esc(t.term)}</dt><dd>${esc(t.say)} <span class="note">(<a href="${esc(url(`${secPath}${t.lesson.slug}/`))}">${esc(plain(t.lesson.title))}</a>)</span></dd>`).join('')}</dl>`,
    }));
    sitemap.push(gPath);

    // sample practice questions
    const sample = [...s.data.questions].sort((a, b) => a.id.localeCompare(b.id, 'en', { numeric: true })).filter((_, i) => i % SAMPLE_EVERY === 0)
      .map((q) => ({ ...q, exam: examId }));
    const pPath = `${secPath}practice-questions/`;
    add(pPath, page({
      path: pPath,
      title: `${s.data.title} practice questions with answers (${meta.title})`,
      description: clip(`${sample.length} free ${meta.title} practice questions on ${s.data.title}, with the answer and why each option is right or wrong. Original questions, not exam dumps.`),
      crumbs: [{ name: 'Study guides', path: 'guides/' }, { name: meta.title, path: examPath }, { name: s.data.title, path: secPath }],
      cta: appLink(`/go/${examId}/app/sprint?section=${s.id}`),
      body: `<h1>${esc(s.data.title)} practice questions</h1>
<p class="lead">${sample.length} sample questions from ${esc(site.name)}’s bank of ${s.data.questions.length} for this section. They are original, written from the official documentation (each says which page it was checked against), and are not real exam questions.</p>
${sample.map((q, i) => renderQuestion(q, i + 1)).join('\n')}`,
    }));
    sitemap.push(pPath);
  }
}

// all guides
add('guides/', page({
  path: 'guides/',
  title: 'Free Salesforce certification study guides',
  description: clip(`Free, bite-size study guides and practice questions for the Salesforce Platform Developer (PD1), Platform Developer II, Platform App Builder and JavaScript Developer exams.`),
  body: `<h1>Free Salesforce certification study guides</h1>
<p class="lead">${esc(site.tagline)}. Plain-language lessons, key terms explained simply and original practice questions with explanations.</p>
${allExams.map(({ meta, examPath, exam, sections }) => `<div class="card"><h2 style="margin-top:0"><a href="${esc(url(examPath))}">${esc(meta.title)}</a></h2><p class="note">${exam.questions} questions · ${exam.minutes} min · ${exam.passing}% to pass</p><ul class="links">${sections.map((s) => `<li><a href="${esc(url(`${examPath}${s.slug}/`))}">${esc(s.data.title)}</a></li>`).join('')}</ul></div>`).join('')}`,
}));
sitemap.unshift('guides/');

// trust pages
const trust = (path, title, description, body) => { add(path, page({ path, title, description, crumbs: [], body: `<h1>${esc(title)}</h1>${body}` })); sitemap.push(path); };
trust('about/', `About ${site.name}`, clip(`${site.name} is a free, independent, ADHD-friendly study app for Salesforce certification exams, with original questions checked against the official documentation.`), `
<p class="lead">${esc(site.tagline)}.</p>
<h2>What it is</h2><p>${esc(site.name)} turns each Salesforce certification exam into short lessons, key terms explained in plain words, flashcards with spaced repetition, practice questions with explanations, and mock exams at the real exam’s length and pace. It is designed for people with ADHD and anyone who learns better in small steps: calm mode, one idea per card, a place to park distracting thoughts, and read-aloud.</p>
<h2>Where the content comes from</h2><p>Every lesson and question is original. It is written from Salesforce’s official exam guides and documentation (Salesforce Help, the Apex and Lightning developer guides, Trailhead) and, for the JavaScript exam, MDN and the official Node.js and Jest docs. Each question names the page it was checked against. It does not use, and never will use, real exam questions or “dumps”: they break Salesforce’s certification rules and can cost candidates their credentials.</p>
<h2>Not affiliated with Salesforce</h2><p>${esc(site.name)} is an independent project by ${esc(site.studio)}. It is not affiliated with, sponsored by or endorsed by Salesforce, Inc. Salesforce, Trailhead, Agentforce and the certification names are trademarks of Salesforce, Inc. and are used only to say which exams this app helps you prepare for.</p>
<h2>Found a mistake?</h2><p>${esc(site.contactNote)} Every report goes to the person who fixes the content, with the exact card or question it is about.</p>`);
trust('privacy/', 'Privacy', clip(`${site.name} has no ads and no tracking. An account is optional; without one your progress stays on your device. What we store if you sign in with Google or send feedback.`), `
<p class="lead">Short version: no ads, no tracking cookies, and an account is optional. Without one, your progress stays on your device.</p>
<h2>What stays on your device</h2><p>Your progress, settings, notes and streaks are saved in your browser’s storage on your device. Without an account we never receive them. Clearing your browser data or removing the app deletes them; use Settings → Save backup to keep a copy.</p>
<h2>If you sign in with Google (optional)</h2><p>Signing in lets your progress follow you to other devices. Google tells us your name, email address and profile picture; we use them only to show who is signed in and to keep your account. We then save your study progress for each exam (lessons done, answers and review schedule, XP, streaks and rewards) with our database provider (Supabase), where only your account can read it. Your settings stay on each device. We don’t use your Google account for anything else, never post anything, and never share or sell your data. You can delete your account and everything saved to it at any time on the Me screen (Delete my account).</p>
<h2>Feedback you send</h2><p>If you use “Report a problem” or “Send feedback”, we receive what you write, what you were looking at (for example a lesson card or a question id), the app version, your device type and screen size, and a random id for your device (so several reports from one device can be grouped; it says nothing about who you are). An email address is sent only if you type one in, and is used only to reply to you. If you’re signed in, the report is also linked to your account. Feedback is stored with our database provider (Supabase) and is readable only by us.</p>
${site.cloudflareAnalyticsToken ? `<h2>Visit counts</h2><p>We count visits with Cloudflare Web Analytics, which uses no cookies, does not track you across sites and does not identify you. It tells us things like how many people opened a page and which country and kind of device they used.</p>` : ''}
<h2>Top players lists</h2><p>The weekly and monthly Top lists show the name you chose in the app (or “Learner” and a few random characters if you didn’t choose one) and the XP you earned in that period. To keep the score, the app gives your device an anonymous account the first time you earn XP; it holds only that name and your daily points, nothing about you. You can hide yourself from the lists at any time on the Top players screen.</p>
<h2>Read-aloud</h2><p>The natural voice plays recorded audio files from this website. The device voice uses your phone’s own speech feature. Neither sends us anything.</p>
<h2>Your rights</h2><p>You can delete your account and its saved progress yourself (Me → Delete my account). You can also ask us to delete feedback you sent: send a note through the app saying which report, and include the email you used if any. ${esc(site.name)} is not intended for children under 13.</p>
<p class="note">Last updated ${TODAY}.</p>`);
trust('terms/', 'Terms of use', clip(`Terms for using ${site.name}: a free study aid, provided as is, independent of Salesforce, with original content you may use for personal study.`), `
<h2>A study aid, not a guarantee</h2><p>${esc(site.name)} helps you prepare for Salesforce certification exams. Using it does not guarantee that you will pass. Salesforce changes its products and exams; always check the official exam guide and documentation, especially limits and recent releases.</p>
<h2>Accuracy</h2><p>We check content against official documentation and fix reported mistakes quickly, but it is provided “as is”, without warranty. Please report anything that looks wrong.</p>
<h2>Your use</h2><p>The lessons and questions are original work by ${esc(site.studio)}. You may use them for your own study. Please don’t copy them in bulk or republish them. Don’t submit real exam content through feedback: sharing exam questions breaks Salesforce’s certification agreement.</p>
<h2>Independent</h2><p>${esc(site.name)} is not affiliated with, sponsored by or endorsed by Salesforce, Inc. Salesforce and related marks belong to Salesforce, Inc.</p>
<p class="note">Last updated ${TODAY}.</p>`);

// GitHub Pages shows this for any address that doesn't exist (not in the sitemap)
writeFileSync(join(outDir, '404.html'), page({
  path: '404.html', title: 'Page not found', noindex: true,
  description: `This page doesn’t exist. Open ${site.name} or browse the study guides.`,
  body: `<h1>This page wandered off</h1><p class="lead">The address may be old or mistyped. Nothing is lost: your progress lives in the app on your device.</p>
<ul class="links"><li><a href="${esc(BASE)}">Open ${esc(site.name)}</a></li><li><a href="${esc(url('guides/'))}">Browse the study guides</a></li></ul>`,
}));

// ---------- write ----------
for (const p of pages) {
  const dir = join(outDir, p.path);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'index.html'), p.html);
}
const urls = ['', ...sitemap];
writeFileSync(join(outDir, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((p) => `  <url><loc>${esc(url(p))}</loc><lastmod>${TODAY}</lastmod></url>`).join('\n')}
</urlset>
`);
writeFileSync(join(outDir, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${url('sitemap.xml')}\n`);
try { statSync(join(outDir, 'index.html')); } catch { console.warn('note: no app index.html in', outDir); }
console.log(`site: ${pages.length} pages, sitemap with ${urls.length} URLs → ${outDir}`);
