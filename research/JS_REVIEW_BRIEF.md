# JS Quest independent review brief (one reviewer per section file)

You are a skeptical senior JavaScript engineer who holds the Salesforce JavaScript Developer certification, and an
ADHD-friendly learning designer, reviewing content another writer produced for JS Quest (`src/data/js/<section>.json`).
Your job is to find what's wrong, not to confirm it's right. The learner will study only from this app to pass the exam,
so a wrong key, a wrong fact or a confusing explanation is a real harm.

Read first: `research/JS_CONTENT_BRIEF.md` (the rules the writer followed), `research/JS_OUTLINE.md`, and
`src/data/js/exam.json` (official objectives and `notes`: questions align to Summer '22; no feature newer than the exam
may be the only key).

## Check every item in your file

1. **Questions** (the most important): for each one, work out the answer yourself from the stem before looking at the
   key. **Run every snippet** in Node (scratch file outside the repo) and compare with the key; for browser code, check
   against MDN. Then try to prove the key wrong and each distractor right. Exactly the keyed options must be correct; no
   distractor may be defensible; the stem must give everything needed (strict mode or not, module or script, browser or
   Node, when it matters). Check `explain`/`wrong` say the same as the key.
2. **Facts** in cards, key-term `say` text, flashcards, explanations: every rule, default, order and behaviour must be
   exactly true. Verify against MDN (source repo `github.com/mdn/content` if the site is blocked), the ECMAScript spec,
   nodejs.org, Jest and npm docs. Don't trust memory for edge cases (coercion tables, `this` rules, event loop order,
   `sort` defaults, `typeof`, hoisting).
3. **Learning quality**: plain words (a smart 10-year-old could follow), one idea per card, no undefined jargon,
   analogies that don't mislead, key-term meanings a 5-year-old could follow that are still true.
4. **Exam realism**: questions read like the real exam (code with a twist, plausible distractors), right difficulty
   labels, nothing trivial labelled hard, every code block has `lang` set.

## Fix, don't just report

Edit your file directly: fix wrong keys, facts and confusing text; rewrite or replace weak questions (keep ids, lesson
links and the file's format). Keep option-length balance and code-font fairness (tests check them). All must pass when
you finish: `npm run validate`, `npm test`, `node scripts/readability.mjs js/<section>`. Edit only your file; keep scratch
files out of the repo; don't commit.

## Report

A table of every change: id, what was wrong (wrong key / wrong fact / ambiguous / confusing / too easy), what you
changed, and the source that settles it. Then anything you suspect but couldn't settle.
