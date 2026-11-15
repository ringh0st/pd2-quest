# Plain-language rewrite brief ("explain it like I'm 10, so I can score 100%")

The owner wants every piece of teaching in the app to be understandable by a 10-year-old, easy to digest,
and still 100% exam-accurate, because they want to pass PD2 with a perfect score.
Plain words must never cost precision: keep every exact name, keyword, limit and number the exam tests.

## What to rewrite (one section file per agent)

**1. Lessons (`lessons[].cards`): the main teaching.** Rebuild each lesson with this shape, 6-9 cards, each at most 60 words:
  1. **"In plain words"** (type `text`, title `In plain words`). What this thing is and why it exists, in everyday language with no jargon. Answer "what problem does it solve?"
  2. **"Think of it like…"** (type `tip`, title `Think of it like…`). One vivid everyday analogy (school, a kitchen, a library, a post office, a theme park queue, LEGO…). Then say in one line where the analogy stops working, if that matters for the exam.
  3. **The real thing**: 1-3 cards (`text`, `code` or `list`) with the exact rule, the keyword names and a tiny example. Define each Salesforce or Apex term in plain words the first time it appears, e.g. "**trigger** (code that runs by itself when a record is saved)".
  4. **Exam trap** (type `trap`): the classic wrong answer and why it's wrong, in one breath.
  5. **Memory hook** (type `tip`, title `Remember it`): a short rhyme, acronym or picture.
  Keep the existing useful content and facts; rewrite how they're said. You may merge, split or reorder cards. Keep `check` ids valid (2-3 questions from this lesson). Code cards: keep the code exact, and make the `body` a one-line plain explanation of what the code does.

**2. Flashcards (`flashcards[].front/back`).** The front is a real question in plain words ("What does `with sharing` do?", not a riddle-like noun phrase). The back is at most 40 words: the plain answer first, then the exact term or limit.

**3. Question explanations (`questions[].explain`)**, 1-3 short sentences:
  - The first sentence is the plain rule that decides the answer. Start with the idea, not the jargon.
  - Then why the right answer follows from it, with the exact keyword or limit.
  - It may end with a tiny "Think: …" picture if it helps.

**4. Wrong-answer reasons (`questions[].wrong[i]`)**: one short plain sentence each, naming the real reason that option fails. Keep `""` for correct options.

## Do NOT change

- Question stems (`q`), `options`, `answer`, `code`, `lang`, `difficulty`, `lesson`, `id`, `pack`, `source`. Questions must stay real-exam style. Option lengths are balanced and tested, so don't touch options.
- Facts: every number, limit, keyword, method name, order-of-execution step and behaviour must stay exactly true. If you notice an existing fact that's wrong, fix it, mark it `FACT-FIX` in your report, and cite the doc (developer.salesforce.com and help.salesforce.com are reachable; fetch with curl if WebFetch fails). Current facts used in this app: heap 10 MB sync / 25 MB async (older guides say 6/12); exam questions assume classic sharing behaviour unless they state an API version.

## Style

- Short sentences, mostly 15 words or fewer, never more than 25. Everyday words. Talk to "you". Active voice.
- One idea per card. Bold (`**…**`) the one key term or rule per card. Put code names in backticks.
- Friendly and a little fun, never babyish or condescending; the reader is a smart adult who wants it simple.
- No emoji anywhere (the app uses its own icons).
- Check with `node scripts/readability.mjs <section>` (target: average 12 words or fewer, nothing over 25), then `npm run validate && npm test`. All must pass; if a failure is in a file you don't own, re-run in a minute.
- Preserve the JSON formatting (2-space indent, and whatever trailing newline the file had). Don't commit.

## Report

Lessons rewritten, number of flashcards and explanations rewritten, any FACT-FIXes with sources, and anything you were unsure of.
