# PD1 Quest content brief (shared by every PD1 writer agent)

The app now holds two exams: PD2 Quest (done, in `src/data/pd2/`) and PD1 Quest (new, in `src/data/pd1/`).
PD1 must use exactly the same patterns, components and quality bar as PD2: same JSON shape, same lesson
card types, same key-term highlights, same plain-language style, same fairness checks. The learner has
ADHD; everything must be bite-sized, calm, plain and 100% exam-accurate.

## Your inputs (read first)

1. `research/PD1_OUTLINE.md`: the official PD1 objectives per domain, the lessons to write, and the exact
   facts with the official doc URL for each. Follow its lesson list for your domain.
2. `src/data/pd1/exam.json`: official exam facts, objectives (verbatim) and `notes` (read the notes: the exam
   targets Summer '25, so avoid questions that depend on API 67+ defaults (user mode / with sharing by default)
   unless the question states the API version; avoid the heap-size number).
3. The PD2 file for the same section id, e.g. `src/data/pd2/fund.json`: the model for shape and style. Copy its
   top-level keys (`id`, `title`, `weight`, `summary`, `lessons`, `flashcards`, `questions`, and any others it has).
4. Style and format briefs (all apply): `research/CONTENT_SCHEMA.md`, `research/PLAIN_LANGUAGE_BRIEF.md`,
   `research/CODE_MARKING_BRIEF.md`, `research/HARD_PACK_BRIEF.md` (for the exam-hard questions),
   `research/ADHD_UX_SPEC.md` (why it's bite-sized).

## What to write: `src/data/pd1/<section>.json`

- **Lessons**: the outline's lessons for your domain (ids `<section>-1`, `<section>-2`, ...), `minutes` 2-4,
  `objective` = the official objective text it covers. 6-9 cards each, max 60 words per card, in the PD2 shape:
  "In plain words" (text), "Think of it like…" (tip, with where the analogy stops), 1-3 cards with the real rule
  and a tiny example (text / code / list), an Exam trap (trap), "Remember it" (tip). `check`: 2-3 question ids
  from that lesson.
- **Key terms** (`terms` on every lesson, placed after `check`, exactly like `src/data/pd2/fund.json` lesson
  `fund-2`): 8-10 important terms per lesson that appear in that lesson's card text (not titles), each with a
  `say` explained like to a 5-year-old (1-3 short sentences, max ~35 words, hard limit 45, plain text, 100%
  accurate). Use `match` for other spellings and for exact backtick contents (e.g. `"Database.insert(recs, false)"`).
- **Flashcards**: about 3-4 per lesson (ids `<section>-f1`...), front a real plain question, back ≤ 40 words.
- **Questions** (ids `<section>-q1`... for difficulty 1-2, `<section>-x1`... with `"pack": "hard"` for difficulty 3):
  - Volume by exam weight: fund ≈ 105, auto ≈ 110, ui ≈ 100, test ≈ 80. At least 8 per lesson.
  - Difficulty mix for PD1 (easier than PD2): about 20% difficulty 1, 45% difficulty 2, 35% difficulty 3.
  - Real exam style: scenarios with business context; about 35% with a `code` snippet to read (Apex, SOQL,
    LWC JS/HTML, Visualforce, flow descriptions, test classes, sf CLI); about 20% "Choose 2" (5 options,
    answer length 2). 4 options for single answer. No "all of the above", no joke answers.
  - Balance the correct-answer position. The keyed option must not be the longest more often than chance
    (tests enforce ≤ 32% per section) and code font must never single out the answer (tests check this).
  - `explain` 1-3 short plain sentences (first sentence = the rule that decides it); `wrong[i]` one short plain
    reason per wrong option, `""` for correct ones; `source` = exact official doc page title.
- ORIGINAL wording only. Never copy exam dumps, "practice exam" sites or the old `pd1-react` questions.
  Verify every fact against developer.salesforce.com / help.salesforce.com / trailhead.salesforce.com (reachable;
  many pages need the headless Chrome: `require('playwright')`, `chromium.launch()`).

## Checks (all must pass before you report)

- `npm run validate` (prints `src/data/pd1/<section>.json OK`; it also checks key terms really appear in cards).
- `npm test` (option-length balance, code-font giveaways and more; a failure in a file you don't own may be
  another agent mid-write: re-run in a minute).
- `node scripts/readability.mjs pd1/<section>`: average ≤ 12 words per sentence, nothing over 25.
- Adversarial self-review: for every question, try to prove the keyed answer wrong; fix or drop anything doubtful.

Keep 2-space JSON with a trailing newline. Edit only your own file. Don't commit.

## Report

Counts (lessons, cards, terms, flashcards, questions by difficulty, % with code, choose-2 count, answer-position
spread), objectives covered, anything you couldn't verify, anything you dropped in self-review.
