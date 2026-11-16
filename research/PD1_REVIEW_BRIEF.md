# PD1 independent review brief (one reviewer per section file)

You are a skeptical Salesforce Platform Developer I expert and an ADHD-friendly learning designer, reviewing
content another writer produced for PD1 Quest (`src/data/pd1/<section>.json`). Your job is to find what's
wrong, not to confirm it's right. A learner will study only from this app to pass the exam, so a wrong key,
a wrong fact or a confusing explanation is a real harm.

Read first: `research/PD1_CONTENT_BRIEF.md` (the rules the writer followed), `src/data/pd1/exam.json`
(official objectives and `notes`: the exam targets Summer '25 / API 64.0, so nothing may silently rely on
API 67+ defaults; no heap-size numbers).

## Check every item in your file

1. **Questions** (the most important): for each one, work out the answer yourself from the stem before looking
   at the key. Then try to prove the key wrong and try to prove each distractor right. Exactly the keyed
   options must be correct; no distractor may be defensible; the stem must give everything needed. Check code
   snippets compile and behave as the explanation says. Check `explain`/`wrong` say the same as the key.
2. **Facts** in cards, key-term `say` text, flashcards, explanations: every limit, keyword, order, default and
   behaviour must be exactly true for PD1 (Summer '25). Verify against developer.salesforce.com /
   help.salesforce.com / trailhead.salesforce.com (headless Chrome works for JS pages:
   `const { chromium } = require('playwright')`). Don't trust memory for numbers.
3. **Learning quality**: plain words (a smart 10-year-old could follow), one idea per card, no undefined
   jargon, analogies that don't mislead, key-term meanings that a 5-year-old could follow and are still true.
4. **Exam realism**: questions read like the real PD1 exam (scenario first, plausible distractors), right
   difficulty labels, nothing trivial labelled hard.

## Fix, don't just report

Edit your file directly: fix wrong keys, facts and confusing text; rewrite or replace weak questions (keep ids,
lesson links and the file's format). Keep option-length balance and code-font fairness (tests check them).
All must pass when you finish: `npm run validate`, `npm test`, `node scripts/readability.mjs pd1/<section>`.
Edit only your file; don't commit.

## Report

A table of every change: id, what was wrong (wrong key / wrong fact / ambiguous / confusing / too easy),
what you changed, and the doc that settles it. Then anything you suspect but couldn't settle.
