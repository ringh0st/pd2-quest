# Exam-Hard pack brief (shared by all writer agents)

Goal: make PD2 Quest's question bank match the REAL Salesforce Platform Developer II exam in difficulty and style, and fill coverage gaps.

Network: developer.salesforce.com, help.salesforce.com and trailhead.salesforce.com ARE reachable now (curl/WebFetch). VERIFY every fact, limit number and code behaviour against the official docs (Apex Developer Guide, LWC Developer Guide, Visualforce Guide, SOQL/SOSL Reference, Platform Events Guide, Salesforce DX Guide, Apex Reference). Put the exact doc page title in `source`.

Format: follow /home/user/pd2-quest/research/CONTENT_SCHEMA.md exactly, plus:
- Append NEW questions to the `questions` array of your section file /home/user/pd2-quest/src/data/<id>.json. Do NOT edit or remove existing questions, lessons or flashcards (you may fix an existing question only if you find a factual error, and must list it in your report).
- New ids: `<id>-x1`, `<id>-x2`, ... (never reuse ids). Each new question gets `"pack": "hard"` and a valid `lesson` id from that file (pick the closest lesson).
- Difficulty: at least 80% `difficulty: 3`, rest 2.
- Real-exam style:
  - At least 55% must include a `code` snippet (Apex, LWC JS/HTML, Aura, Visualforce, SOQL, test classes, sf CLI, meta.xml) that the candidate must READ to answer: "what happens", "what is the bug", "which change fixes it", "how many queries/DML", "which line fails".
  - Longer scenarios (2-4 sentences) with realistic business context and some irrelevant detail, like the real exam.
  - Distractors must be plausible: things a developer who half-knows the topic would pick. No joke answers, no "all of the above".
  - ~25% "Choose 2" (5 options, answer length 2). Keep 4 options for single-answer.
  - Balance the correct-answer position.
- `explain`: 1-3 sentences, why the right answer is right. `wrong`: aligned with options, "" for correct ones, a specific reason for each wrong option.
- ORIGINAL wording only. Never copy exam dumps or leaked questions.
- After writing, VALIDATE: `cd /home/user/pd2-quest && npm run validate && npm test` must pass.

Then ADVERSARIAL SELF-REVIEW pass: for every new question, try hard to prove the keyed answer wrong (re-read the docs, check edge cases, check that exactly the keyed options are correct and no distractor is also defensible). Fix or delete anything doubtful. Report how many you fixed/dropped and why.

Final report: counts (total new, difficulty split, % with code, choose-2 count, answer-position spread), objectives covered with counts, doc pages used, any existing questions you corrected, anything you could not verify.
