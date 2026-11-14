# PD2 Quest ⚡

A phone-first study app for the **Salesforce Platform Developer II** exam, designed for people with ADHD, people who get distracted easily, and anyone who learns better with quick wins.

## What's inside

- **50 bite-sized lessons** (2–4 min, one idea per card, swipe through) across all 5 exam sections, weighted like the real exam: Advanced Developer Fundamentals 15%, Process Automation, Logic & Integration 27%, User Interface 20%, Testing, Debugging & Deployment 20%, Performance 18%.
- **201 scenario-style practice questions** with instant feedback, "why not the others?" explanations and the source doc for each.
- **160 flashcards** with 3D flips and spaced repetition.
- **Exam simulator**: full mock (60 questions, 120 min) or mini mock (20 questions, 40 min), with flags, a question map and a per-section review.
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

- `npm test`: engine unit tests (SRS, XP, streaks, session building)
- `npm run validate`: checks every content file (ids, answer keys, card length)
- `npm run build`: static site in `dist/`. Every push to `main` deploys to GitHub Pages via `.github/workflows/deploy.yml`.

## Project structure

```
src/data/        exam.json (facts, resources, study plan) + one JSON per exam section
src/engine/      pure logic: srs, xp, streak, mastery, session building (unit tested)
src/state/       persisted store (localStorage) and selectors
src/components/  QuestionView, PracticeRunner, Confetti, CelebrationLayer, ParkIt…
src/screens/     Home, Learn, Section, Lesson, Sprint, Cards, Exam, Me, Settings, Resources, Onboarding
src/audio/       generated sounds and haptics
research/        ADHD UX spec, content schema, color audit
```

## Content note

All questions and lessons are original practice material written from the public exam guide and Salesforce documentation. They are not real exam questions, and the app is not affiliated with Salesforce. Always double-check limits and behaviour against the current docs and release notes.
