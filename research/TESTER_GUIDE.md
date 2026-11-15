# Tester guide: PD2 Quest

App under test: a production build served at http://localhost:4173/ (vite preview). If it isn't responding:
`cd /home/user/pd2-quest && npm run build && (npx vite preview --port 4173 --strictPort > /dev/null 2>&1 &)` then wait 2 s.
The same app is live at https://ringh0st.github.io/pd2-quest/ (may be unreachable from this sandbox; use localhost).

Drive it with Playwright (preinstalled: `require('playwright')` works from any directory; `chromium.launch()` needs no options).
Write your scripts and screenshots ONLY in your own folder: /tmp/claude-0/-home-user/5b8ecbda-753a-5014-8781-16f2f41efd69/scratchpad/testers/<your-label>/ (mkdir -p it).
Use `devices['iPhone SE']`, `devices['iPhone 13']`, `devices['Pixel 7']`, `devices['iPad Mini']`, colorScheme 'dark'/'light', and `reducedMotion: 'reduce'` where relevant.
Look at your screenshots with the Read tool (it shows images). Use deviceScaleFactor 1 for your own screenshots.
DO NOT edit any file in /home/user/pd2-quest. You are a tester: report, don't fix.

Routes (hash): #/welcome (onboarding), #/ (home), #/map, #/world/<fund|auto|ui|test|perf>, #/lesson/<lessonId e.g. fund-1>,
#/play/<levelId e.g. fund-hard-1 | fund-boss>, #/sprint (?section=auto, ?mode=review, ?hard=1), #/cards, #/exam, #/bolt, #/shop, #/me, #/settings, #/resources.

State: localStorage key `pd2quest.v1` (JSON). Useful seeds (set, then reload):
- skip onboarding: {"onboarded":true}
- progress: {"onboarded":true,"coins":300,"stars":{"fund-1":3,"fund-2":2,"fund-3":1,"fund-hard-1":2}}
- missed days / streak tests: set "streak":{"count":6,"best":6,"lastDay":"2026-11-10","freezes":1} (dates are local YYYY-MM-DD; today is 2026-11-15)
- settings: "settings":{"theme":"dark","calm":true,"motion":"reduced","textScale":1.3,"font":"lexend","sound":false}
Celebration pop-ups close with Escape or their button. Options are role=radio (single) or role=checkbox (Choose N).

Content: src/data/<section>.json (lessons, flashcards, questions), exam facts in src/data/exam.json. Question ids look like auto-x12, ui-q3.
