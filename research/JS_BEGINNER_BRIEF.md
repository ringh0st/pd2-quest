# JS Quest beginner pass (one agent per section file)

The learner tried JS Quest and found some lessons hard to follow as a beginner. Your job: make one section file
(`src/data/js/<section>.json`) clear for someone who has **never programmed in JavaScript**, and add tap-to-explain
key terms for the JavaScript methods and built-ins the lessons use. Accuracy stays exactly as it is now (the content
was reviewed against MDN / Node / Jest docs): you are improving clarity, not changing what is taught.

Read first: `research/JS_CONTENT_BRIEF.md` (format and rules), `research/PLAIN_LANGUAGE_BRIEF.md`,
`research/CODE_MARKING_BRIEF.md`, `src/data/js/exam.json` (`notes`: version traps), and your whole section file.

## 1. Read every card as a beginner

For each lesson, read the cards in order as someone who knows what a computer program is but has never written
JavaScript. Rewrite a card when any of these is true:
- It uses a word or symbol that hasn't been explained yet in this lesson or an earlier lesson of this section (e.g.
  "callback", "coerce", "prototype", "scope", `=>`, `===`, `...`) and the card doesn't say what it means.
- It jumps a step (shows a result without saying why), packs two ideas into one card, or gives a rule with no tiny
  example.
- A code example's result isn't stated in words ("this logs `3`, because…").
- An analogy could mislead, or "Think of it like…" doesn't say where the comparison stops.
Keep each card ≤ 60 words, one idea per card, 6-9 cards per lesson; you may split a crowded card into two (stay ≤ 9)
or merge two thin ones. Keep card types, titles style and the trap/remember cards. Keep every fact exactly true.
Run any code you add or change in Node (scratch files outside the repo) and state its real output.

## 2. Key terms for JavaScript methods and built-ins

Every built-in method, object or operator a lesson's cards rely on gets a key term (the highlighted word a learner taps
to see a very simple meaning), e.g. `toUpperCase()`, `slice()`, `Math`, `Math.round()`, `parseInt()`, `typeof`,
`Array.isArray()`, `push()`, `map()`, `JSON.stringify()`, `Promise`, `setTimeout()`, `addEventListener()`,
`console.log()`, `require()`. Rules:
- The term must appear on a card **as its own code span**, exactly: highlighting only matches a whole code span, so write
  "`toUpperCase()` turns letters into capitals: `'hi'.toUpperCase()` gives `'HI'`" (the first span is the term).
  Give `match` the other spellings used on cards (`toUpperCase`, `.toUpperCase()`).
- `say` = what it does in plain words a 10-year-old could follow, with a tiny example written in plain text (no
  backticks; the meaning box shows plain text), 1-3 short sentences, ≤ 35 words (hard limit 45). Example:
  "Makes every letter in a piece of text a capital letter. 'hi' becomes 'HI'. The original text doesn't change."
- Keep the existing concept terms; a lesson may now have up to about 18 terms. Don't add a term for something the cards
  don't mention.
- Don't define a method by a newer one (e.g. never explain with `toSorted()`); exam-era (≤ ES2022) behaviour only.

## 3. Flashcards and question explanations

- Flashcards: make the front a plain question a beginner understands; back ≤ 40 words, plain.
- Questions: don't change stems, options, keys or snippets. Do rewrite `explain` and `wrong` text that a beginner
  couldn't follow (unexplained jargon, a skipped step), keeping it short and exactly as true.

## Checks (all must pass)

- `npm run validate` (your file OK: also checks every term really appears on a card), `npm test`,
  `node scripts/readability.mjs js/<section>` (avg ≤ 12 words/sentence, none over 25).
- Every changed or added code example run in Node, output stated correctly.
- Edit only your file. Scratch files go in `/tmp/claude-0/-home-user/5b8ecbda-753a-5014-8781-16f2f41efd69/scratchpad/js-beginner-<section>/`. Don't commit.

## Report

Per lesson: cards rewritten (what was unclear → what you did), terms added (names), flashcards changed; number of
`explain`/`wrong` texts reworded; anything you weren't sure about.
