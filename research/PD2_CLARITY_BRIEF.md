# PD2 clarity pass: brief

The owner studies for Salesforce Platform Developer II with this app and feels the lessons are sometimes **too short**:
a card states a fact but doesn't explain it well enough to understand and remember. Your job: make every lesson in your
section **simple, clear and complete**, while keeping the app's ADHD-friendly, bite-size style.

## What to do, lesson by lesson

1. Read the whole lesson (all cards, terms, and its check questions) as a learner would.
2. For each idea, make sure the cards together answer: **what it is** (plain words), **why it matters / what problem it
   solves**, **when to use it vs. the alternative**, and **a small concrete example** (code or a scenario). Add the
   **exam angle** where useful (a "trap" card: the common wrong answer and why it's wrong).
3. **Expand thin cards** (under ~30 words) when they leave the reader asking "so what?" or "how?". Use the space up to
   the limit: a card may have **at most 65 words** (body + items). Prefer short sentences.
4. **Add cards** where a step is missing (a lesson may have **4–9 cards**). Typical additions: "Why it matters", an
   example, a comparison (`items` list or a short table-like list), a trap. Keep one idea per card.
5. **Simplify**: short sentences, define a term the first time it appears (or rely on the lesson's `terms` list),
   avoid unexplained jargon and acronyms, avoid long noun stacks. Explain *why*, not only *what*.
6. **Accuracy first**: every fact must be correct for current Salesforce (Winter '27 / API 6x era). Check anything you
   change or add against official docs: developer.salesforce.com (Apex Developer Guide, LWC Developer Guide, SOQL/SOSL
   reference, Execution Governors and Limits, Platform Events/CDC guides) and help.salesforce.com — both reachable from
   this session (use curl/WebFetch). Don't invent limits or numbers; if unsure, leave the number out.
7. **Questions**: keep the question bank, but where an `explain` is unclear, too terse or doesn't say *why* the answer
   is right, rewrite it (max ~60 words). Fix any factual error you find in questions/options/wrong reasons. Don't
   change which option is correct unless it's actually wrong (then fix and say so in your report).
8. **Flashcards**: make any unclear `back` clearer (max 40 words).

## Format rules (the validator enforces them)

- Card types: `text`, `tip`, `trap`, `list` (with `items`), `code` (with `code` and `lang`, optional short `body`).
  Look at existing cards for the exact shape. Titles like "In plain words", "Think of it like…", "Remember it" have
  special labels; reuse them where natural.
- Each lesson's `terms` (key words with a plain meaning, max 45 words) must each appear in the card text
  (`body`/`items`) exactly as written (or via its `match` list). If you rewrite a card, keep the term words in it, or
  update the term. Every term must still appear somewhere in the lesson's cards.
- Keep all `id`s unchanged. Don't remove lessons or questions. `check` question ids stay valid.
- Inserting new cards in the middle of a lesson is fine.
- Write in plain, friendly English. Use `**bold**` for the key idea and backticks for code identifiers.

## Before you finish

Run `cd /home/user/pd2-quest && node scripts/validate-content.mjs src/data/pd2/<section>.json` until it prints OK, and
`cd /home/user/pd2-quest && node --test tests/content.test.mjs` (must pass). Do not edit other files; do not commit.

Report: cards before → after, how many cards you expanded / added / rewrote, questions whose explanation you rewrote,
any factual errors you fixed (with the official source), and anything you were unsure about.
