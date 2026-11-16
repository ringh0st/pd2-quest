# More questions brief (append to an existing section file)

Goal: grow a section's question bank toward the real exam's variety, with the same quality bar as the existing
questions. You append NEW questions to one existing file; you never edit or remove anything already there.

## Read first

- The exam's content brief: `research/PD1_CONTENT_BRIEF.md` (PD1) or `research/PAB_CONTENT_BRIEF.md` (App Builder).
  All its question rules apply (style, difficulty labels, snippets, Choose 2, option-length fairness, code font,
  `explain`/`wrong`/`source`, official sources only, no dumps).
- The exam's outline (`research/PD1_OUTLINE.md` or `research/PAB_OUTLINE.md`) and `src/data/<exam>/exam.json`
  (objectives and `notes`, e.g. version cut-offs).
- Your whole section file: its lessons, terms and every existing question, so you don't repeat a scenario or test
  the same fact the same way twice.

## What to add

- The number of new questions your task names, spread so that lessons with the fewest questions get the most
  (every lesson gets at least 3 new ones). Each new question has a valid `lesson` id from the file.
- New ids continue the file's numbering: `<section>-q<n>` for difficulty 1-2, `<section>-x<n>` with `"pack": "hard"`
  for difficulty 3. Check the highest existing number of each kind first; never reuse an id.
- Mix: about 15% difficulty 1, 45% difficulty 2, 40% difficulty 3; about 20% Choose 2 (5 options); the same share of
  snippets as the file already has. Prefer the kinds the real exam favours: realistic scenarios with a twist,
  "which TWO", "what happens", "what is the best way". New angles on each objective: edge cases, limits, order of
  events, what breaks, what to choose when two tools both seem to fit.
- Keep the file's overall answer positions balanced and its option-length fairness within the tests' limits.

## Checks (all must pass)

- `npm run validate` and `npm test` (a failure in a file you don't own may be another agent mid-write: re-run).
- `node scripts/readability.mjs <exam>/<section>`.
- Adversarial self-review of every new question: try to prove the key wrong and each distractor right; verify every
  fact on the official page (help.salesforce.com needs headless Chrome:
  `require('playwright').chromium.launch({ executablePath: '/usr/bin/google-chrome' })`, wait 10-40 s, read text
  including shadow roots). Fix or drop anything doubtful.

Keep 2-space JSON with the file's trailing newline. Edit only your file. Don't commit.

## Report

New question count by lesson and difficulty, Choose 2 count, snippet count, objectives strengthened, facts you
couldn't verify, anything dropped.
