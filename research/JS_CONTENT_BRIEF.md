# JS Quest content brief (shared by every JavaScript Developer writer agent)

The app (Dev Quest) holds several exams, each in `src/data/<exam>/`: PD1 Quest, PD2 Quest, App Builder Quest and now
JS Quest (`src/data/js/`) for the **Salesforce Certified JavaScript Developer** exam. JS Quest must use exactly the same
patterns, components and quality bar as the others: same JSON shape, same lesson card types, same key-term highlights,
same plain-language style, same fairness checks. The learner has ADHD; everything must be bite-sized, calm, plain and
100% exam-accurate.

## Your inputs (read first)

1. `research/JS_OUTLINE.md`: the official objectives per section, the lessons to write, and the facts with their
   official source for each (marked [read] or [check]: verify every [check] before you rely on it).
2. `src/data/js/exam.json`: official exam facts (60 questions, 105 min, 65% to pass, questions align to **Summer '22**),
   objectives (verbatim) and `notes`. Read the version traps: never make a feature newer than the exam the only right
   answer (ES2023+ array methods like `toSorted`/`findLast`, `Object.groupBy`, `Promise.withResolvers`, new Set methods,
   iterator helpers; Node's `--watch`, `--test`, `--env-file`; Jest 30 removals). ES2022 features (`at()`,
   `Object.hasOwn`, private `#fields`, top-level await) may appear but must not be the only key.
3. A model file for shape and style: `src/data/pd1/ui.json` (a PD1 file full of JavaScript snippets). Copy its top-level
   keys (`id`, `title`, `weight`, `summary`, `lessons`, `flashcards`, `questions`, and any others it has).
4. Style briefs (all apply): `research/CONTENT_SCHEMA.md`, `research/PLAIN_LANGUAGE_BRIEF.md`,
   `research/CODE_MARKING_BRIEF.md` (backticks for code in text), `research/HARD_PACK_BRIEF.md` (exam-hard questions),
   `research/ADHD_UX_SPEC.md`, and `research/PD1_CONTENT_BRIEF.md` for anything this file doesn't change.

## What's different from the Salesforce exams

This exam is about the **JavaScript language, the browser, Node.js and Jest**, not Salesforce features. The real exam is
full of short code snippets: "What is logged?", "Which two lines make this work?", "What is the value of x?".
- About **45% of questions** include a snippet (`"code"` with `"lang": "js"`; `"html"` for markup, `"json"` for package.json and other JSON, `"bash"` for
  npm/node commands). Always set `lang`; never leave it out (the app's default is Apex).
- Snippets are short (ideally ≤ 12 lines), valid, and their output must be exactly what a modern engine prints for the
  exam's era. Run every snippet you write with Node (`node -e` or a scratch file outside the repo) and check the key
  against the real output. Browser-only code (DOM, events): reason it through with the MDN page open, and keep it simple
  enough to be certain.
- `console.log` output: show it the way Node prints it (`[ 1, 2 ]`, `{ a: 1 }`, `'text'` inside arrays) only when the
  question is about the printed form; otherwise phrase options as values (`1, 2`), not console formatting.
- Explain every term in plain words the first time (closure, prototype, promise, event loop…).

## What to write: `src/data/js/<section>.json`

- **Lessons**: the outline's lessons for your section (ids `<section>-1`, `<section>-2`, ...), `minutes` 2-4,
  `objective` = the official objective text. 6-9 cards each, max 60 words per card: "In plain words" (text), "Think of it
  like…" (tip, with where the analogy stops), 1-3 cards with the real rule and a tiny code example (code with lang js),
  an Exam trap (trap), "Remember it" (tip). `check`: 2-3 question ids.
- **Key terms** (`terms` on every lesson, after `check`, exactly like `src/data/pd1/ui.json`): 8-10 important terms per
  lesson that appear in that lesson's card text (not titles), each `say` explained like to a 5-year-old (1-3 short
  sentences, max ~35 words, hard limit 45, plain text, 100% accurate). Use `match` for other spellings and exact backtick
  contents.
- **Flashcards**: 3-4 per lesson (ids `<section>-f1`...), front a real plain question, back ≤ 40 words.
- **Questions** (ids `<section>-q1`... for difficulty 1-2, `<section>-x1`... with `"pack": "hard"` for difficulty 3):
  - Volume by exam weight: types ≈ 140, objects ≈ 150, browser ≈ 100, debug ≈ 45, async ≈ 80, server ≈ 50,
    testing ≈ 45. At least 8 per lesson.
  - Difficulty mix: about 20% difficulty 1, 45% difficulty 2, 35% difficulty 3.
  - Real exam style: code to read with a twist, or a developer scenario ("A developer needs a function that…") asking
    which code or approach works. About 20% "Choose 2" (5 options). 4 options for single answer. No "all of the above",
    no joke answers.
  - Balance the correct-answer position. The key must not be the longest option more often than chance (tests enforce
    ≤ 32%) and code font must never single out the answer (tests check this).
  - `explain` 1-3 short plain sentences (first = the rule that decides it); `wrong[i]` one short plain reason per wrong
    option, `""` for correct ones; `source` = exact official page title (e.g. "MDN: Array.prototype.reduce()",
    "Node.js docs: Modules: CommonJS modules", "Jest docs: Mock Functions").
- ORIGINAL wording only. Never copy exam dumps or "practice exam" sites. Official references: MDN (read it from its
  source repo `github.com/mdn/content` if developer.mozilla.org is blocked), the ECMAScript spec, nodejs.org docs, Jest
  docs (`github.com/jestjs/jest` docs folder if jestjs.io is blocked), npm docs (`github.com/npm/cli` docs), and
  Salesforce's Trailhead Cert Prep modules for this credential.

## Checks (all must pass before you report)

- `npm run validate` (prints `src/data/js/<section>.json OK`; also checks key terms really appear in cards).
- `npm test` (a failure in a file you don't own may be another agent mid-write: re-run in a minute).
- `node scripts/readability.mjs js/<section>`: average ≤ 12 words per sentence, nothing over 25 (code doesn't count).
- Every snippet run in Node where possible, output matches the key.
- Adversarial self-review: for every question, try to prove the keyed answer wrong; fix or drop anything doubtful.

Keep 2-space JSON with a trailing newline. Edit only your own file. Keep scratch files out of the repo (use
`/tmp/claude-0/-home-user/5b8ecbda-753a-5014-8781-16f2f41efd69/scratchpad/js-<section>/`). Don't commit.

## Report

Counts (lessons, cards, terms, flashcards, questions by difficulty, % with a snippet, choose-2 count, answer-position
spread), objectives covered, anything you couldn't verify, anything you dropped in self-review.
