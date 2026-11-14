# PD2 Quest: ADHD-first UX spec

Scope: a mobile-first React PWA for the Salesforce Platform Developer II exam. Evidence levels: **[R]** peer-reviewed research, **[P]** practitioner/vendor guidance, **[S]** standard (WCAG/W3C). Most "ADHD app" guidance online is vendor content, so we rely on general learning-science findings, which do apply to ADHD learners, and mark the practitioner claims as such.

## 1. Core principles

1. **Retrieval first, reading second.** Practice testing and distributed practice are the only two techniques Dunlosky et al. rated "high utility" [R] ([Dunlosky 2013](https://journals.sagepub.com/doi/10.1177/1529100612453266)). College students with ADHD benefit from retrieval practice about as much as their peers [R] ([Knouse et al.](https://www.researchgate.net/publication/340857853_How_much_do_college_students_with_ADHD_benefit_from_retrieval_practice_when_learning_key-term_definitions)).
2. **Make rewards come right away.** ADHD is linked to weaker reward-pathway dopamine signalling and to aversion to delay [R] ([Volkow 2011](https://link.springer.com/article/10.1038/mp.2010.97)). Every answer gets feedback in under 100 ms.
3. **One obvious next action.** One primary button on every screen, so the learner never has to choose what to do next [P] ([W3C COGA](https://www.w3.org/TR/coga-usable/)).
4. **Start costs nothing.** "Just one card" is a full, valid session.
5. **Short sprints.** The default is a 10-minute sprint made of 5-card rounds.
6. **Forgive and never shame.** Lapses cost nothing permanent. The copy is warm, as in Finch ([review](https://www.saner.ai/blogs/best-neurodivergent-apps-for-adults)) [P].
7. **Stimulating but calm.** There is a "Calm" or "Hype" toggle, and the user controls every sound and haptic, as in Tiimo ([Tiimo sensory design](https://www.tiimoapp.com/resource-hub/sensory-design-neurodivergent-accessibility)) [P].
8. **Interleave topics** within a sprint, because the PD2 domains are similar and easy to confuse [R] (g=0.42, [Brunmair & Richter 2019](https://pubmed.ncbi.nlm.nih.gov/31556629/)).
9. **Never use color alone.** Correct and incorrect are always shown by icon + text + color [S] ([WCAG 1.4.1](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color)).
10. **Motion is a reward, never a requirement.** Respect `prefers-reduced-motion` fully, and nothing flashes [S].

## 2. Features

### Must-have
| Feature | Rationale | Source |
|---|---|---|
| Big **Next** button on Home | Removes decision paralysis; the app picks due cards first, then new ones | [COGA](https://www.w3.org/TR/coga-usable/) [P] |
| Leitner-style SRS (§5) | Spacing is high-utility and Leitner is the simplest robust scheduler | [Dunlosky](https://journals.sagepub.com/doi/10.1177/1529100612453266) [R] |
| MCQ + "pick all that apply" in exam format; free-recall flip cards for concepts | Retrieval practice in the same format as the exam | [Knouse](https://www.researchgate.net/publication/340857853_How_much_do_college_students_with_ADHD_benefit_from_retrieval_practice_when_learning_key-term_definitions) [R] |
| Feedback right away: why it's right or wrong in at most 2 sentences, plus a "show more" link | Feedback with no delay serves delay-averse learners | [Volkow](https://link.springer.com/article/10.1038/mp.2010.97) [R] |
| Micro-lessons of at most 90 s (at most 120 words or 1 code snippet), each followed by 2 questions | One objective per chunk | [microlearning](https://eitt.academy/knowledge-base/microlearning-designing-short-training-modules/) [P] |
| Sprint timer (5/10/15/25 min, default 10) with a visual ring and no ticking | Time-boxing helps with time blindness | [Tiimo](https://www.tiimoapp.com/resource-hub/gamification-adhd) [P] |
| Mixed-topic queue (at most 2 cards in a row from the same domain) | Interleaving | [Brunmair](https://pubmed.ncbi.nlm.nih.gov/31556629/) [R] |
| XP, levels, combo, daily goal, forgiving streak (§4) | Frequent small rewards | [Tiimo gamification](https://www.tiimoapp.com/resource-hub/gamification-adhd) [P] |
| Focus mode: hides the nav bar, stats and badges while cards are on screen | Less visual clutter | [Tiimo](https://www.tiimoapp.com/resource-hub/sensory-design-neurodivergent-accessibility) [P] |
| Calm / Hype mode, plus separate sound, haptics and confetti switches | Sensory needs vary | [Tiimo](https://www.tiimoapp.com/resource-hub/sensory-design-neurodivergent-accessibility) [P] |
| Offline (service worker + IndexedDB) | Study on the commute, no friction | PWA baseline |
| Progress map per exam domain (% mastered = cards in box 4 or higher) | Makes progress visible | [COGA](https://www.w3.org/TR/coga-usable/) [P] |

### Nice-to-have
| Feature | Rationale | Source |
|---|---|---|
| "Study buddy" ambient body-double (an animated companion that "works" alongside you; optional live room later) | Popular practice, little trial evidence; keep it optional | [PopSci](https://www.popsci.com/health/body-doubling-focus-benefits/) [P] |
| Surprise chest (variable cosmetic reward) | Novelty / variable reward without gambling with money | [Tiimo gamification](https://www.tiimoapp.com/resource-hub/gamification-adhd) [P] |
| Weekly themed "boss" (a 10-question mixed quiz in mock-exam style) | Novelty and a check of transfer | practitioner |
| Gentle reminder (at most 1/day, at a time the user picks, can be snoozed, no guilt copy) | Interruptions must be predictable | [COGA](https://www.w3.org/TR/coga-usable/) [S] |
| Upgrade the scheduler to FSRS (`ts-fsrs`) once review logs exist | FSRS predicts recall better than SM-2 for 99.5% of users | [benchmark](https://expertium.github.io/Benchmark.html) [R] |
| Dyslexia-friendly reading options (spacing, line height, Atkinson Hyperlegible) | Users like having the option; dyslexia fonts themselves show no measured benefit | [Wery 2017](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5629233/) [R] |

## 3. Session flow

1. **Home**: greeting, today's goal ring, and one button: **"Next card ▶"**. Secondary text links: "10-min sprint", "Browse topics".
2. Tapping it starts at once with no setup screen. The first card shows within 300 ms.
3. **Round** = 5 cards. After each answer: feedback → +XP chip → auto-advance after 1.2 s or on tap (there is a setting to require a tap, for WCAG 2.2.1).
4. **End of round**: a 1.5 s celebration (combo, XP total), then **"Keep going"** (primary) or "Done for now" (secondary). Leaving at any point counts as success, with no "are you sure?" dialog.
5. **Sprint end** (timer): "Nice sprint. Take 3 min?" offers a break timer, then the same two buttons.
6. **Summary**: cards done, new vs reviewed, domain progress bump, streak status. No red numbers and no "you missed".
7. Wrong cards come back once more later in the same session (requeued 3 cards later).

## 4. Gamification rules

- **XP**: correct = 10; correct on first exposure = +5; wrong-but-attempted = 2 (effort counts); micro-lesson read = 5; round complete = 10; sprint complete = 25.
- **Combo**: 3 correct in a row → ×1.25, 5 → ×1.5, 10 or more → ×2 (cap). A wrong answer resets the multiplier but never removes XP.
- **Daily goal**: default **50 XP** (about 5 to 7 min). Choices are 20 / 50 / 100 / 150. The user picks it once in onboarding, which builds commitment ([Duolingo goal-setting](https://lazyweb.com/research/duolingo-streak-goals-retention) [P]).
- **Levels**: XP needed to go from level n to n+1 is `100 + 50·(n−1)`, so cumulative XP for level n is `25·(n−1)·(n+2)`. That gives L2 = 100, L5 = 700, L10 = 2,700, L20 = 10,450. Around 50 XP a day, a new level arrives about every 2 to 5 days early on. Each level unlocks a cosmetic (theme accent, buddy outfit).
- **Streak**: a day counts if the user finishes **at least 1 card** ("minimum viable day"). The daily goal is tracked separately as a "goal streak".
  - **Freezes**: earn 1 per 7-day streak, hold at most 2, and they apply automatically. You can't buy them.
  - **Rest days**: the user picks 1 rest day a week (default off), and it never breaks the streak.
  - **Repair**: a broken streak can be restored within 48 h by meeting 2× the daily goal once.
  - **Copy**: "Welcome back! Your progress is all still here." Never "You lost your streak." Duolingo shows freezes reduce churn among at-risk users ([case study](https://jiwonvyoo.github.io/portfolio/case/duolingo/duo.html), unverified figures) [P].
- **Variable reward**: after a round, a 1-in-6 chance of a surprise chest (cosmetic or 10 to 30 bonus XP). Never tied to money.
- **Badges**: for milestones only (first PD2 domain at 50%, 100 cards, first boss). At most 1 badge popup per session.

## 5. Spaced repetition (modified Leitner)

```ts
const INTERVALS_DAYS = [0, 1, 3, 7, 14, 30, 60]; // box 0..6
const NEW_PER_DAY = 10, REVIEW_CAP = 60;

function grade(card, correct: boolean, confidence?: 'unsure'|'sure', now = Date.now()) {
  if (correct) {
    card.box = Math.min(card.box + (confidence === 'unsure' ? 0 : 1), 6);
  } else {
    card.box = Math.max(card.box - 2, 0);   // forgiving: drop 2, not to zero
    card.lapses++;
  }
  const days = INTERVALS_DAYS[card.box];
  const fuzz = days >= 3 ? 1 + (Math.random() * 0.2 - 0.1) : 1; // ±10% spreads load
  card.due = now + days * fuzz * 86_400_000;
  card.lastReviewed = now;
}

function nextQueue(cards, now) {
  const due = cards.filter(c => c.seen && c.due <= now)
    .sort((a, b) => (a.box - b.box) || (a.due - b.due))  // weakest first
    .slice(0, REVIEW_CAP);                              // shed overload: no wall of 300 cards
  const fresh = cards.filter(c => !c.seen).slice(0, NEW_PER_DAY - newSeenToday());
  return interleave([...due, ...fresh], { maxSameDomainRun: 2 });
}
```
Why Leitner: it has no ease factor (so no SM-2 "ease hell"), it is easy to show visually as boxes, and it is easy to test. Migrate to FSRS later without changing the UI ([Anki FAQ](https://docs.ankiweb.net/faqs/what-spaced-repetition-algorithm.md), [benchmark](https://expertium.github.io/Benchmark.html)).

## 6. Color palette

Ratios were computed with the WCAG 2.x relative-luminance formula. Text needs ≥4.5:1 and UI parts or large text need ≥3:1 ([WCAG 1.4.3/1.4.11](https://www.w3.org/TR/WCAG22/)). Correct and incorrect use **blue-teal vs orange-red**, a pair that stays distinguishable with deuteranopia and protanopia, and always come with ✓/✗ icons plus the words "Correct"/"Not quite".

| Token | Light | vs bg / surface | Dark | vs bg / surface |
|---|---|---|---|---|
| `bg` | `#FFF9F2` (warm paper) | — | `#13111C` (not pure black) | — |
| `surface` | `#FFFFFF` | — | `#1E1B2B` | — |
| `text` | `#1E1B2E` | 16.05 / 16.78 | `#F3F0FA` (not pure white) | 16.59 / 14.96 |
| `text-muted` | `#57536B` | 7.04 / 7.36 | `#B9B4CC` | 9.30 / 8.39 |
| `primary` | `#5A3FD6` | 6.44 / 6.74 | `#AFA2FF` | 8.39 / 7.57 |
| `on-primary` | `#FFFFFF` | 6.74 on primary | `#13111C` | 8.39 on primary |
| `correct` | `#0A6C80` | 5.79 / 6.05 | `#5CD0E8` | 10.35 / 9.34 |
| `correct-bg` (+text) | `#E2F3F6` | correct 5.30, text 14.69 | `#10303A` | correct 7.73, text 12.39 |
| `incorrect` | `#B93A1E` | 5.45 / 5.70 | `#FF9B80` | 9.12 / 8.22 |
| `incorrect-bg` (+text) | `#FCEAE4` | incorrect 4.89, text 14.41 | `#3A1D16` | incorrect 7.50, text 13.64 |
| `xp` (gold) | `#8A5A00` text; fill `#FFC94D` with `text` on it = 10.96 | 5.67 / 5.93 | `#FFC94D` | 12.19 / 11.00 |
| `streak` (flame) | `#B4470A` | 5.22 / 5.46 | `#FF9248` | 8.41 / 7.58 |
| `focus-ring` | `#1D4ED8` | 6.41 / 6.70 | `#7FB2FF` | 8.64 / 7.79 |
| `border` (inputs) | `#8C879E` | 3.31 / 3.46 | `#6E6985` | 3.58 / 3.23 |

Rules: saturated colors cover at most about 10% of any screen, and accents are saved for rewards. Calm mode lowers accent chroma by about 30% and turns off gradients. Dark mode follows `prefers-color-scheme` and can be overridden manually.

## 7. Typography

- Font: **Atkinson Hyperlegible** (for body text and UI) and **JetBrains Mono** (for Apex/SOQL code). Ship OpenDyslexic only as an opt-in, because it has no proven benefit ([Wery 2017](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5629233/)).
- Body 17px / 1.5 line height, questions 20px / 1.4, code 15px. Line length at most 60ch. Left-aligned, never justified.
- Text spacing must survive WCAG 1.4.12 overrides (letter spacing 0.12em, word spacing 0.16em). Bold key terms; never use all-caps paragraphs or italics for long runs.
- Scales to 200% with no horizontal scroll at 320 CSS px (WCAG 1.4.4/1.4.10).

## 8. Animation spec

| Token | Duration | Easing |
|---|---|---|
| `instant` (press feedback) | 80–100 ms | `ease-out` |
| `quick` (chip, toggle) | 150–200 ms | `cubic-bezier(0.2,0,0,1)` |
| `standard` (card enter/exit) | 250–300 ms | `cubic-bezier(0.2,0,0,1)` |
| `celebrate` | 600–1200 ms, **one time only, never looping** | spring `stiffness 400, damping 25` (Framer Motion / `motion`) |

Micro-interactions:
- Button press: scale 0.96 plus a haptic `navigator.vibrate(10)` where supported.
- Answer correct: card border pulses teal once, a ✓ draws on (stroke, 250 ms), "+10 XP" chip springs up from the card, and a soft "ding".
- Answer wrong: a gentle horizontal nudge (6px, 2 cycles, 300 ms), *not* a red flash. The explanation slides up.
- Card flip: 3D rotateY 400 ms spring. Under reduced motion it becomes a crossfade.
- Progress ring/bar fill: 500 ms ease-out with a number count-up.
- Combo meter: a flame icon that grows a step at ×1.25, ×1.5 and ×2, with a subtle 2 s idle flicker in Hype mode only.
- Round complete: confetti burst of at most 40 particles, lasting 1.2 s, kept out of the text area.
- Level up: a full-screen card that springs in. It closes on tap and never blocks for more than 2 s.

**Reduced motion** (`@media (prefers-reduced-motion: reduce)` or the in-app toggle) ([MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion)): replace movement with opacity/color changes of 150 ms or less, no confetti (show a static badge), no parallax or shake, and keep haptics and sound because they are separate switches. Nothing flashes more than 3 times per second, and no large saturated-red flashes ([WCAG 2.3.1](https://www.w3.org/WAI/WCAG22/Understanding/three-flashes-or-below-threshold)).

## 9. Accessibility checklist (WCAG 2.2 AA)

- [ ] Contrast: text ≥4.5:1, UI parts and focus ≥3:1 (§6); never color alone (1.4.1).
- [ ] Touch targets ≥44×44px (2.5.8 sets a 24px minimum, and we exceed it). No gestures with fixed paths; swipe always has a button alternative (2.5.1).
- [ ] Visible focus ring of 2px or more, never hidden under sticky bars (2.4.7, 2.4.11).
- [ ] The sprint timer and auto-advance can be paused, extended or turned off (2.2.1). Nothing times out a question.
- [ ] Feedback is announced through an `aria-live="polite"` region ("Correct. +10 XP"). Confetti is `aria-hidden`.
- [ ] Semantic radio/checkbox groups for answers, keyboard operable, with code blocks readable by screen readers.
- [ ] Sound off by default for screen-reader users, never autoplayed with voice. Haptics can be toggled.
- [ ] Reflow at 320px, text resize to 200%, text-spacing overrides (1.4.10, 1.4.4, 1.4.12).
- [ ] Consistent help and navigation positions (3.2.6, 3.2.3). No redundant entry (3.3.7).
- [ ] Accessible authentication: no cognitive tests to log in (3.3.8). Local-first, account optional.
- [ ] Test with VoiceOver, TalkBack, axe, and a color-blindness simulator.

## 10. Anti-patterns to avoid

- Shame or guilt copy, sad mascots, "you lost X" emails ([Finch contrast](https://www.saner.ai/blogs/best-neurodivergent-apps-for-adults)).
- Streaks that you can only protect by paying, and streak-saver push spam ([Lenny's/Duolingo](https://rosetta.to/u/lennyspodcast/behind-the-product-duolingo-streaks-jackson-shuttleworth-group-pm-retention-team)).
- Rewarding the minimum "streak-saver" behavior so much that it replaces depth. The daily goal, not the streak, drives XP bonuses ([case study](https://jiwonvyoo.github.io/portfolio/case/duolingo/duo.html)).
- Punitive mechanics (Forest-style "your tree dies", Habitica health loss) as defaults. Offer them opt-in only.
- Leaderboards by default (social comparison). Loot boxes or any paid randomness.
- Big review backlogs: cap the queue and never show "312 due".
- Looping animations, autoplay video, flashing, constant badge popups, more than 1 notification a day.
- Menus that ask the user to choose before starting, and multi-step setup before the first card.
- Walls of text: anything over 120 words gets split.
