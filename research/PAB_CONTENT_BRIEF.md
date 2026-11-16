# App Builder Quest content brief (shared by every PAB writer agent)

The app (Dev Quest) holds several exams, each in `src/data/<exam>/`: PD1 Quest, PD2 Quest and now App Builder Quest
(`src/data/pab/`). App Builder must use exactly the same patterns, components and quality bar as the others: same
JSON shape, same lesson card types, same key-term highlights, same plain-language style, same fairness checks.
The learner has ADHD; everything must be bite-sized, calm, plain and 100% exam-accurate.

## Your inputs (read first)

1. `research/PAB_OUTLINE.md`: the official objectives per section, the lessons to write, and the exact facts with
   the official doc URL for each (marked [read] or [check]: verify every [check] before you rely on it).
2. `src/data/pab/exam.json`: official exam facts (60 questions, 105 min, 73% to pass, questions align to Summer '26),
   objectives (verbatim) and `notes`. Read the notes: avoid features newer than the exam (Flow Test Mode replacing
   Debug, DevOps Center's rename, Agentforce flow-error help in beta) and teach roll-up summaries on master-detail only.
3. A model file for shape and style: `src/data/pd1/fund.json` (the PD1 file closest in spirit). Copy its top-level keys
   (`id`, `title`, `weight`, `summary`, `lessons`, `flashcards`, `questions`, and any others it has).
4. Style briefs (all apply): `research/CONTENT_SCHEMA.md`, `research/PLAIN_LANGUAGE_BRIEF.md`,
   `research/CODE_MARKING_BRIEF.md` (backticks for field API names, formulas, setting names), `research/HARD_PACK_BRIEF.md`
   (exam-hard questions), `research/ADHD_UX_SPEC.md`, and the PD1 brief `research/PD1_CONTENT_BRIEF.md` for anything
   this file doesn't change.

## What's different from the developer exams

App Builder is mostly **declarative** (clicks, not code). The learner may not be a developer:
- Explain every Salesforce term in plain words the first time (object, record, field, profile, permission set, role…).
- No Apex/LWC details beyond what the exam asks ("when is code needed instead of clicks?").
- Snippets to read are configuration, not code: formulas and validation rules with `"lang": "formula"` (the app highlights
  them: functions, field references, strings); flow descriptions, sharing settings, page layouts, sandbox plans and
  deployment steps as short structured text with `"lang": "text"`. About 25% of questions should include one.

## What to write: `src/data/pab/<section>.json`

- **Lessons**: the outline's lessons for your section (ids `<section>-1`, `<section>-2`, ...), `minutes` 2-4,
  `objective` = the official objective text. 6-9 cards each, max 60 words per card: "In plain words" (text),
  "Think of it like…" (tip, with where the analogy stops), 1-3 cards with the real rule and a tiny example
  (text / code with lang formula or text / list), an Exam trap (trap), "Remember it" (tip). `check`: 2-3 question ids.
- **Key terms** (`terms` on every lesson, after `check`, exactly like `src/data/pd1/fund.json`): 8-10 important
  terms per lesson that appear in that lesson's card text (not titles), each `say` explained like to a 5-year-old
  (1-3 short sentences, max ~35 words, hard limit 45, plain text, 100% accurate). Use `match` for other spellings and
  exact backtick contents.
- **Flashcards**: 3-4 per lesson (ids `<section>-f1`...), front a real plain question, back ≤ 40 words.
- **Questions** (ids `<section>-q1`... for difficulty 1-2, `<section>-x1`... with `"pack": "hard"` for difficulty 3):
  - Volume by exam weight: fund ≈ 72, data ≈ 80, logic ≈ 125, ui ≈ 70, deploy ≈ 55. At least 8 per lesson.
  - Difficulty mix: about 20% difficulty 1, 45% difficulty 2, 35% difficulty 3.
  - Real exam style: business scenarios ("Universal Containers"-style companies are fine, but invent your own names)
    asking which declarative tool or setting meets the requirement, with plausible distractors (another automation
    tool, another relationship type, another sharing feature). About 20% "Choose 2" (5 options). 4 options for single
    answer. No "all of the above", no joke answers.
  - Balance the correct-answer position. The key must not be the longest option more often than chance (tests enforce
    ≤ 32%) and code font must never single out the answer (tests check this).
  - `explain` 1-3 short plain sentences (first = the rule that decides it); `wrong[i]` one short plain reason per wrong
    option, `""` for correct ones; `source` = exact official page title.
- ORIGINAL wording only. Never copy exam dumps or "practice exam" sites. Verify facts on help.salesforce.com /
  trailhead.salesforce.com / developer.salesforce.com. help.salesforce.com needs headless Chrome: use
  `chromium.launch({ executablePath: '/usr/bin/google-chrome' })` from `require('playwright')`, open the page, wait
  ~10-40 s, and read the text including shadow roots.

## Checks (all must pass before you report)

- `npm run validate` (prints `src/data/pab/<section>.json OK`; also checks key terms really appear in cards).
- `npm test` (a failure in a file you don't own may be another agent mid-write: re-run in a minute).
- `node scripts/readability.mjs pab/<section>`: average ≤ 12 words per sentence, nothing over 25.
- Adversarial self-review: for every question, try to prove the keyed answer wrong; fix or drop anything doubtful.

Keep 2-space JSON with a trailing newline. Edit only your own file. Don't commit.

## Report

Counts (lessons, cards, terms, flashcards, questions by difficulty, % with a snippet, choose-2 count, answer-position
spread), objectives covered, anything you couldn't verify, anything you dropped in self-review.
