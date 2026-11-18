# Nimbolt ⚡

A phone-first study app for **Salesforce certification exams**, designed for people with ADHD, people who get distracted easily, and anyone who learns better with quick wins. One app, four exams: pick **PD1 Quest** (Platform Developer I), **PD2 Quest** (Platform Developer II), **App Builder Quest** (Platform App Builder) or **JS Quest** (JavaScript Developer) on the opening screen, and switch any time in Settings. Each exam keeps its own progress; settings are shared.

## It's a game ⚡

- **Zap**, your lightning-bolt study buddy: blinks, bounces, cheers your right answers, comforts the misses, tells jokes about the exam you're studying and wears the hats you buy.
- **An adventure map with one world per exam section.** PD1: Schema Shrine, Trigger Forge, Component Bay, Debug Swamp. PD2: Sharing Shrine, Async Forge, Pixel Bay, Bug Swamp, Turbo Peaks. App Builder: Setup Shrine, Data Marsh, Flow Forge, Layout Bay, Release Peaks. JavaScript: Truthy Temple, Prototype Forge, Bubbling Bay, Breakpoint Bog, Promise Forge, Node Peaks, Mock Marsh.
- **Levels with a rhythm**: bite-size lesson levels, a **Hard level** after every 3 lessons (5 tough questions, 3 hearts), and a **Boss** at the end of each world, with a health bar, hits and hearts.
- **1–3 stars** per level, a "NEW BEST!" stamp and replays for ★★★. Worlds open with stars, or early with coins.
- **Coins** for new stars, Hard levels, Bosses, daily quests and the Daily Bolt. Spend them in the **shop**: outfits for Zap, accent themes (all AA-contrast checked), confetti styles, and capped helpers (50/50, Hint, Extra heart). No real money, ever.
- **Daily Bolt**: the same 5 surprise questions for everyone each day. **Daily quests**: 3 small goals a day, with a bonus chest for all three.
- **18 badges** for milestones. Celebrations wait until a question flow ends, so rewards never pile up mid-question.

## What's inside

| | PD1 Quest | PD2 Quest | App Builder Quest | JS Quest |
| --- | --- | --- | --- | --- |
| Exam sections (weights from the official guide) | Developer Fundamentals 27%, Process Automation and Logic 28%, User Interface 25%, Testing, Debugging, and Deployment 20% | Advanced Developer Fundamentals 15%, Process Automation, Logic & Integration 27%, User Interface 20%, Testing, Debugging & Deployment 20%, Performance 18% | Salesforce Fundamentals 18%, Data Modeling and Management 20%, Business Logic and Process Automation 32%, User Interface 17%, App Deployment 13% | Variables, Types, and Collections 23%, Objects, Functions, and Classes 25%, Browser and Events 17%, Debugging and Error Handling 7%, Asynchronous Programming 13%, Server Side JavaScript 8%, Testing 7% |
| Lessons (2–4 min, one idea per card) | 38 | 49 | 43 | 43 |
| Key terms (tap to see a very simple meaning) | 368 | 482 | 399 | 412 |
| Practice questions (exam-hard / with code, formulas or setups to read) | 598 (222 / 224) | 602 (386 / 232) | 602 (218 / 153) | 636 (224 / 347) |
| Flashcards | 141 | 172 | 149 | 151 |
| Real exam | 60 questions, 105 min, 68% to pass | 60 questions, 120 min, 70% to pass | 60 questions, 105 min, 73% to pass | 60 questions, 105 min, 65% to pass |

- Every question has instant feedback, "why not the others?" explanations and the official doc it was checked against (Salesforce docs; MDN, Node.js and Jest docs for JavaScript). Lessons teach in plain words ("In plain words", "Think of it like…", the real rule, an exam trap, "Remember it").
- **Exam simulator**: full mock and **Exam-hard mock** at the real exam's length and time, a mini mock (a third of the exam at the same pace) and an Exam-hard sprint. About 1 in 5 hard questions is kept for mocks only, so a mock always shows fresh questions.
- **Spaced repetition** (modified Leitner: 0/1/3/7/14/30/60 days; a miss drops 2 boxes, not to zero). "Sure" or "Guessing" before checking: lucky guesses don't count as learned.
- **Study plan** from your exam date, **placement / test-out** to skip what you know, **break nudges**, **read aloud** (a natural voice recorded ahead of time, or the phone's own voices).
- **Dopamine loop**: XP, levels and ranks, combos (×1.25 / ×1.5 / ×2), a daily goal ring, lucky-drop bonus chests, confetti, haptics, generated sounds and music.
- **Forgiving streaks**: any study counts; freezes (earned every 7 days) cover missed days automatically. No guilt copy.
- **ADHD helpers**: one big "what's next" button, focus mode (navigation hides during study), a pausable focus timer, and a **Park it** button to drop distracting thoughts and get back to work.
- **Accessible**: WCAG 2.2 AA contrast in light and dark, screen-reader announcements, keyboard support, reduced motion, Calm mode, Atkinson Hyperlegible / Lexend fonts, text size up to 130%.
- **Installable and offline** (PWA). Progress stays on your phone.

## Put it on your phone

Open the GitHub Pages link, then:

- **iPhone / iPad (Safari):**
  1. Open the link in **Safari** (from another app, tap “Open in Safari” first).
  2. Tap **Share** (the square with an arrow, bottom of the screen; top right on iPad). Only see **⋯**? Tap it, then **Share**.
  3. Scroll down and tap **Add to Home Screen** (not listed? tap **View More** / **Edit Actions** and add it).
  4. Keep **Open as Web App** on and tap **Add**. Open Nimbolt from the new ⚡ icon.
  5. Studied in Safari before? The home-screen app keeps its own progress: Safari → Settings → **Save backup**, then in the app → Settings → **Restore**.

  The app also has a small **📲 Add to Home Screen** button (Home and Settings) with these steps. It disappears once you add the app.
- **Android (Chrome):** ⋮ → **Install app** / **Add to Home screen**

## Develop

```bash
npm install
npm run dev
```

- `npm test`: unit tests for the learning engine (SRS, XP, streaks, sessions), game rules (levels, stars, shop, quests, badges), saved-progress repair, and content quality (the correct option must not be guessable by its length)
- `npm run e2e`: browser checks against `npm run preview`: no sideways scrolling on any screen at 320px and every text size, exam taps/resume/submit behaviour, and an axe accessibility scan in light and dark
- `npm run validate`: checks every content file (ids, answer keys, card length)
- `npm run build`: static site in `dist/`. Every push to `main` deploys to GitHub Pages via `.github/workflows/deploy.yml`.

## Project structure

```
src/lib/track.js     the exams (PD1, PD2): name, storage keys, sections in the official guide's order
src/data/<exam>/     exam.json (facts, objectives, world and Boss names, resources, study plan)
                     + one JSON per exam section (lessons with key terms, flashcards, questions)
src/engine/          pure logic: srs, xp, streak, mastery, session building, study plan (unit tested)
src/state/           persisted store (per exam, shared settings) and selectors
src/components/      QuestionView, PracticeRunner, CelebrationLayer, ParkIt, splash/, game/, art/, icons/
src/game/            game rules: worlds/levels/stars, coins & shop, quests, badges, mascot lines (unit tested)
src/screens/         Home, WorldMap, World, Lesson, Play (Hard/Boss), Bolt, Shop, Sprint, Cards, Exam, Me, Settings…
src/audio/           generated sounds, music and haptics
research/            ADHD UX spec, content schema and writing briefs (plain language, code marking, hard pack, PD1)
```

### Adding or changing an exam

Everything that differs between exams is data. Add the exam to `TRACKS` in `src/lib/track.js` (name, storage prefix, section ids), then add `src/data/<exam>/exam.json` (facts, objectives, `sections[].short`/`icon`, `worlds` with each world's name, Boss and `look`, Zap's topic jokes in `zap`, rank titles in `ranks`) and one file per section, following `research/CONTENT_SCHEMA.md`. Screens, game rules, tests (`npm test`), content checks (`npm run validate`) and e2e scripts (`TRACK=<exam> node e2e/behavior.cjs`) pick it up from there. A world's `look` picks one of the five world arts, skies and accents (`WORLD_STYLES` in `src/game/worlds.js`); everything else comes from `exam.json`.

## Content note

JavaScript Developer content was written in November 2026 from the official exam guide (questions align to Summer '22, so nothing newer than ES2022, Node 16-18 or Jest 29 is ever the only answer) with MDN, Node.js, npm and Jest docs; every code snippet was run in Node or Chromium, then reviewed independently. App Builder content was written in November 2026 from the official exam guide (questions align to Summer '26) and Salesforce Help, then reviewed independently. PD1 content was written in November 2026 from the official PD1 exam guide (questions align to Summer '25) and the Trailhead Cert Prep modules, then reviewed independently question by question against the official docs. PD2's Exam-hard pack (200 questions) was checked against the official Salesforce docs (Apex, LWC, Visualforce, SOQL, Platform Events, DX guides) in November 2026, including two recent changes: heap is now 10 MB sync / 25 MB async, and from API 67.0 classes with no sharing keyword run with sharing in user mode. Lessons teach both the classic and the new behaviour.

All questions and lessons are original practice material written from the public exam guide and Salesforce documentation. They are not real exam questions, and the app is not affiliated with Salesforce. Always double-check limits and behaviour against the current docs and release notes.
