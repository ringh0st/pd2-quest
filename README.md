# PD2 Quest ⚡

A phone-first study app for the **Salesforce Platform Developer II** exam, designed for people with ADHD, people who get distracted easily, and anyone who learns better with quick wins.

## It's a game ⚡

- **Zap**, your lightning-bolt study buddy: blinks, bounces, cheers your right answers, comforts the misses, tells Apex jokes and wears the hats you buy.
- **Adventure map with 5 worlds**, one per exam section: 🏯 Sharing Shrine, ⚙️ Async Forge, 🏝️ Pixel Bay, 🐸 Bug Swamp, 🏔️ Turbo Peaks. Each is a winding path of levels over its own scenery.
- **Levels with a rhythm**: bite-size lesson levels, a 💀 **Hard level** after every 3 lessons (5 tough questions, 3 hearts), and a **Boss** at the end of each world (The Sharing Sphinx, The Recursion Hydra, The Re-render Kraken, The Flaky Test Toad, The Governor), with a health bar, hits and hearts.
- **1–3 stars** per level, a "NEW BEST!" stamp and replays for ★★★. Worlds open with stars, or early with coins.
- **🪙 Coins** for new stars, Hard levels, Bosses, daily quests and the Daily Bolt. Spend them in the **shop**: outfits for Zap, accent themes (all AA-contrast checked), confetti styles, and capped helpers (✂️ 50/50, 💡 Hint, ❤️ Extra heart). No real money, ever.
- **⚡ Daily Bolt**: the same 5 surprise questions for everyone each day. **🎯 Daily quests**: 3 small goals a day, with a bonus chest for all three.
- **🏅 18 badges** for milestones.
- Celebrations wait until a question flow ends, so rewards never pile up mid-question.

## What's inside

- **50 bite-sized lessons** (2–4 min, one idea per card, swipe through) across all 5 exam sections, weighted like the real exam: Advanced Developer Fundamentals 15%, Process Automation, Logic & Integration 27%, User Interface 20%, Testing, Debugging & Deployment 20%, Performance 18%.
- **401 scenario-style practice questions**, 236 of them exam-hard and 184 with code to read (Apex, LWC, Aura, Visualforce, SOQL, test classes, debug logs, sf CLI), each with instant feedback, "why not the others?" explanations and the Salesforce doc it was checked against.
- **160 flashcards** with 3D flips and spaced repetition.
- **Exam simulator**: full mock (60 questions, 120 min), **Exam-hard mock** (60 of the toughest), mini mock (20 questions, 40 min) and an Exam-hard sprint. Mocks pick questions you've seen least first, so they don't repeat early.
- **Spaced repetition** (modified Leitner: 0/1/3/7/14/30/60 days; a miss drops 2 boxes, not to zero). Misses come back later in the same round.
- **Dopamine loop**: XP, levels and ranks, combos (×1.25 / ×1.5 / ×2), a daily goal ring, lucky-drop bonus chests, confetti, haptics and generated sounds.
- **Forgiving streaks**: any study counts; freezes (earned every 7 days) cover missed days automatically. No guilt copy.
- **ADHD helpers**: one big "what's next" button, focus mode (navigation hides during study), a pausable focus timer, and a **🅿️ Park it** button to drop distracting thoughts and get back to work.
- **Accessible**: WCAG 2.2 AA contrast in light and dark, screen-reader announcements, keyboard support, reduced motion, Calm mode, Atkinson Hyperlegible / Lexend fonts, text size up to 130%.
- **Installable and offline** (PWA). Progress stays on your phone.

## Put it on your phone

Open the GitHub Pages link, then:

- **iPhone (Safari):** Share → **Add to Home Screen**
- **Android (Chrome):** ⋮ → **Install app** / **Add to Home screen**

## Develop

```bash
npm install
npm run dev
```

- `npm test`: unit tests for the learning engine (SRS, XP, streaks, sessions) and game rules (levels, stars, shop, quests, badges)
- `npm run validate`: checks every content file (ids, answer keys, card length)
- `npm run build`: static site in `dist/`. Every push to `main` deploys to GitHub Pages via `.github/workflows/deploy.yml`.

## Project structure

```
src/data/        exam.json (facts, resources, study plan) + one JSON per exam section
src/engine/      pure logic: srs, xp, streak, mastery, session building (unit tested)
src/state/       persisted store (localStorage) and selectors
src/components/  QuestionView, PracticeRunner, Confetti, CelebrationLayer, ParkIt, game/ (Zap, Stars, WinScreen, DailyQuests, CoinChip)
src/game/        game rules: worlds/levels/stars, coins & shop, quests, badges, mascot lines (unit tested)
src/screens/     Home, WorldMap, World, Lesson, Play (Hard/Boss), Bolt, Shop, Sprint, Cards, Exam, Me, Settings, Resources, Onboarding
src/audio/       generated sounds and haptics
research/        ADHD UX spec, content schema, color audit
```

## Content note

The Exam-hard pack (200 questions) was checked against the official Salesforce docs (Apex, LWC, Visualforce, SOQL, Platform Events, DX guides) in November 2026, including two recent changes: heap is now 10 MB sync / 25 MB async, and from API 67.0 classes with no sharing keyword run with sharing in user mode. Lessons teach both the classic and the new behaviour.

All questions and lessons are original practice material written from the public exam guide and Salesforce documentation. They are not real exam questions, and the app is not affiliated with Salesforce. Always double-check limits and behaviour against the current docs and release notes.
