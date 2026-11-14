# PD2 Quest content schema (one JSON file per exam section)

File: /home/user/pd2-quest/src/data/<sectionId>.json  — must be valid JSON (validate with `node -e "JSON.parse(require('fs').readFileSync(process.argv[1]))" <file>`).

```json
{
  "id": "perf",                       // sectionId
  "title": "Performance",
  "weight": 18,                       // exam weight %
  "emoji": "⚡",
  "summary": "One punchy sentence.",
  "lessons": [
    {
      "id": "perf-1",
      "title": "Short catchy title",
      "minutes": 3,                   // 2-4 min each; bite-sized
      "objective": "Which exam objective this covers (from the official exam guide)",
      "cards": [                      // 4-7 swipeable cards per lesson, each SHORT (max ~60 words)
        { "type": "text",  "title": "optional", "body": "Plain text. Use **bold** for key words. Short sentences." },
        { "type": "code",  "title": "optional", "lang": "apex|js|html|soql|xml", "code": "...", "body": "1-2 line explanation" },
        { "type": "tip",   "body": "Memory hook / mnemonic" },
        { "type": "trap",  "body": "Common exam trap" },
        { "type": "list",  "title": "optional", "items": ["short", "bullets"] }
      ],
      "check": ["perf-q1", "perf-q2"] // 2-3 question ids from this file that test this lesson
    }
  ],
  "flashcards": [ { "id": "perf-f1", "front": "Question/term (short)", "back": "Answer (max ~40 words)" } ],
  "questions": [
    {
      "id": "perf-q1",
      "lesson": "perf-1",
      "difficulty": 2,                // 1 easy, 2 medium, 3 exam-hard scenario
      "q": "Scenario-style question like the real exam.",
      "code": "optional code snippet string",
      "lang": "apex",                 // if code
      "options": ["A", "B", "C", "D"],// 4 options (5 allowed for choose-2/3)
      "answer": [1],                  // zero-based indices; length>1 means "Choose N"
      "explain": "Why the correct answer(s) are right. 1-3 sentences.",
      "wrong": ["why A is wrong", "", "why C is wrong", "why D is wrong"], // aligned to options; "" for correct ones
      "source": "Name of the Salesforce doc / Trailhead module this is grounded in"
    }
  ]
}
```

Rules:
- ORIGINAL content only. Never copy exam dumps or leaked questions. Ground facts in official Salesforce docs (developer.salesforce.com, help.salesforce.com) and Trailhead.
- Accuracy over volume: current governor limits, current API behaviour (LWC, not Aura-first; Aura where the exam still tests it).
- Written for ADHD learners: short, punchy, concrete, one idea per card, vivid mnemonics, no walls of text.
- Questions should mirror the real PD2 style: scenario-based, "a developer needs to... what should they do?", some "Choose 2".
- Spread the correct answer index evenly; avoid "all of the above".
