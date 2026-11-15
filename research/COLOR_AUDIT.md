# PD2 Quest: color and accessibility audit

Audited on 2026-11-14 against WCAG 2.2 AA, using the production build (`vite preview`) on an iPhone 13 viewport (390×844) in light and dark themes, plus 320 px width with text scale 1.3.

**How it was measured**

- **Contrast:** WCAG 2.x relative luminance, computed from the hex values in `src/styles/tokens.css`. `color-mix()` surfaces (hero tints, tip card, combo chip, heat-strip levels, nav bar) were flattened to the color the browser paints.
- **Colorblind checks:** simulated with the Machado 2009 matrices at full severity, then measured as CIE76 ΔE.
- **Automated checks:** axe-core 4.x (dev dependency) with the `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa` and `best-practice` tags plus the `target-size` rule. It ran on 17 screen states × 2 themes:
  - Home, Learn, Section, Lesson, Sprint (idle, selected, feedback)
  - Cards (menu, running, flipped)
  - Exam (menu, running)
  - Me, Settings, Resources, Welcome, and the Park-it sheet

**Thresholds:** text needs 4.5:1. UI components, graphical objects and focus indicators need 3:1. Rows marked `—` are informational: the pair is exempt, or another cue carries the meaning, and the note says which.

## Summary

| | Before | After |
|---|---|---|
| Non-exempt contrast failures (light + dark) | **12** | **0** |
| axe violations, 390 px, both themes (rule types / nodes) | 4 / 37 | **0 / 0** |
| axe violations, 320 px @ text 1.3 | (same rules) | **0 / 0** |
| Horizontal overflow at 320 px @ 1.3 | Exam/Sprint questions, Section chips | none |

The brand palette was kept as it was: magenta primary, teal-blue for correct, orange-red for incorrect, and gold for rewards. All fixes were made by adding tokens or adjusting edges and borders. No hue changed.

## Token changes

| Token | Theme | Before | After | Why |
|---|---|---|---|---|
| `--border` | light | `#8C879E` | `#858098` | The ghost button sits on `incorrect-bg` inside the "Not quite" panel and measured 2.97:1. It is now 3.26:1. Inputs and switches gain a little contrast too. |
| `--border` | dark | `#6E6985` | `#807B98` | 2.82:1 on `surface-2` and 2.67:1 on `correct-bg` became 3.65:1 and 3.46:1. |
| `--gold-meter` | light | (new) | `#A66F00` | The gold ring stroke and the gold bar edge were `#FFC94D` on the `#EFE4D7` track, which is 1.22:1. They are now 3.42:1. |
| `--gold-meter` | dark | (new) | `#FFC94D` | Already 8.3:1, so it is unchanged. |
| `--hero-gold-tint` | light / dark | 26% / 26% | 26% / **16%** | In dark mode, `text-muted` over the hero's gold corner glow measured 4.36:1. It is now 5.72:1. |

## Warm charcoal dark theme (2026-11-15)

A visual-design review asked for the dark neutrals to move from cool purple-greys to warm charcoal. Only neutrals changed. The accent themes, semantic colors (correct, incorrect, gold, flame), focus ring and section accents keep their dark values, because they all still pass on the new surfaces.

| Token (dark) | Before | After | Note |
|---|---|---|---|
| `--bg` | `#14111C` | `#161412` | Reviewer value. Also the dark `theme-color` (App.jsx, index.html). |
| `--surface` | `#1F1B2B` | `#201D1A` | Reviewer value |
| `--surface-2` | `#2A253A` | `#2B2723` | Reviewer value |
| `--surface-3` | `#352F48` | `#36312C` | Same step up as before, warm |
| `--text` | `#F3F0FA` | `#F6F1EA` | Warm off-white; 16.35:1 on bg |
| `--text-muted` | `#B9B4CC` | `#C2B8AB` | Warm grey, a touch lighter so the gold-tinted cards stay above 4.5:1 (min 4.93) |
| `--border` | `#807B98` | `#8C8277` | Warm grey; min 3.70:1 (on `correct-bg`), was 3.46 |
| `--hairline` | `#2F2A40` | `#36302A` | Decorative; 1.29:1 on surface (was 1.22) |
| `--on-primary` (token default) | `#14111C` | `#161412` | App.jsx overrides it with the accent theme value from economy.js (still `#14111C`, measured below) |
| `--on-gold` | `#14111C` | `#161412` | 12.00:1 on gold |

Light theme: no changes were needed. Every light pair still passes.

**How it was measured:** `contrast.mjs` (kept outside the repo) reads the token blocks in `tokens.css` and the `THEMES` list in `src/game/economy.js`, flattens each `color-mix()` surface the CSS paints (nav bar, tip/hint cards, combo chip, hero tints, section-emoji tile, CTA subtitle, heat strip), and computes WCAG 2.x ratios. It checks 240 pairs (120 per theme), including all five accent themes in both themes. **0 failures.**

| Category | Light min | Dark min (before → after) | Threshold |
|---|---|---|---|
| Text on every surface | 13.38 (surface-3) | 8.70 → **8.58** (hint card) | 4.5 |
| Muted text on every surface | 5.87 (surface-3) | 4.88 → **4.93** (hint card) | 4.5 |
| Semantic text (correct, incorrect, gold, flame) | 4.89 (incorrect on incorrect-bg) | 7.50 → **7.50** (incorrect on incorrect-bg) | 4.5 |
| Accent themes (on-primary on primary, CTA subtitle, primary on surfaces and soft, text on soft and tints), 5 themes | 4.98 (magenta: muted on hero tint) | 4.88 → **4.93** (gold: muted on hero tint) | 4.5 |
| Focus ring on bg, surfaces, feedback panels | 5.34 (surface-3) | 5.88 → **5.95** (surface-3) | 3 |
| UI components (borders, meters, bars, switch, section accents) | 3.26 (border on incorrect-bg) | 3.46 → **3.70** (border on correct-bg) | 3 |

The dark table in the next section is the new measurement; the light table is unchanged.

## Contrast tables

"Before" shows the old ratio only where the colors changed; `=` means the colors are unchanged.

### Light theme

| Pair | Colors (after) | Min | Before | After | |
|---|---|---|---|---|---|
| text / bg | `#1E1B2E` on `#FFF9F2` | 4.5:1 | = | **16.05** | pass |
| text / surface | `#1E1B2E` on `#FFFFFF` | 4.5:1 | = | **16.78** | pass |
| text / surface-2 (chip, btn) | `#1E1B2E` on `#F6EEE4` | 4.5:1 | = | **14.60** | pass |
| text / surface-3 | `#1E1B2E` on `#EFE4D7` | 4.5:1 | = | **13.38** | pass |
| text-muted / bg | `#57536B` on `#FFF9F2` | 4.5:1 | = | **7.04** | pass |
| text-muted / surface | `#57536B` on `#FFFFFF` | 4.5:1 | = | **7.36** | pass |
| text-muted / surface-2 (segmented, week day) | `#57536B` on `#F6EEE4` | 4.5:1 | = | **6.40** | pass |
| text-muted / surface-3 (disabled btn) | `#57536B` on `#EFE4D7` | 4.5:1 | = | **5.87** | pass |
| text-muted / primary-soft (nav pill area) | `#57536B` on `#FBE3EE` | 4.5:1 | = | **6.07** | pass |
| text-muted / correct-bg (feedback source) | `#57536B` on `#E2F3F6` | 4.5:1 | = | **6.44** | pass |
| text-muted / incorrect-bg (feedback source) | `#57536B` on `#FCEAE4` | 4.5:1 | = | **6.32** | pass |
| text-muted / tip card (gold 18% on surface) | `#57536B` on `#FFF5DF` | 4.5:1 | = | **6.79** | pass |
| text-muted / flip back (primary 8% on surface) | `#57536B` on `#F9ECF2` | 4.5:1 | = | **6.41** | pass |
| on-primary / primary (btn, badge, letter) | `#FFFFFF` on `#B3125F` | 4.5:1 | = | **6.63** | pass |
| primary / surface (nav active, choose-n, link) | `#B3125F` on `#FFFFFF` | 4.5:1 | = | **6.63** | pass |
| primary / bg (link) | `#B3125F` on `#FFF9F2` | 4.5:1 | = | **6.34** | pass |
| primary / primary-soft (nav active on pill) | `#B3125F` on `#FBE3EE` | 4.5:1 | = | **5.47** | pass |
| text / primary-soft (selected option, chip.primary) | `#1E1B2E` on `#FBE3EE` | 4.5:1 | = | **13.84** | pass |
| on-gold / gold (chip.gold, btn.gold, xp-pop) | `#1E1B2E` on `#FFC94D` | 4.5:1 | = | **10.96** | pass |
| gold-text / surface | `#8A5A00` on `#FFFFFF` | 4.5:1 | = | **5.93** | pass |
| correct / surface (mark ✓) | `#0A6C80` on `#FFFFFF` | 4.5:1 | = | **6.05** | pass |
| correct / correct-bg (verdict, mark on is-right) | `#0A6C80` on `#E2F3F6` | 4.5:1 | = | **5.30** | pass |
| text / correct-bg | `#1E1B2E` on `#E2F3F6` | 4.5:1 | = | **14.69** | pass |
| surface / correct (.letter on is-right) | `#FFFFFF` on `#0A6C80` | 4.5:1 | = | **6.05** | pass |
| incorrect / surface | `#B93A1E` on `#FFFFFF` | 4.5:1 | = | **5.70** | pass |
| incorrect / incorrect-bg (verdict, mark on is-wrong) | `#B93A1E` on `#FCEAE4` | 4.5:1 | = | **4.89** | pass |
| text / incorrect-bg (trap card, low timer) | `#1E1B2E` on `#FCEAE4` | 4.5:1 | = | **14.41** | pass |
| surface / incorrect (.letter on is-wrong) | `#FFFFFF` on `#B93A1E` | 4.5:1 | = | **5.70** | pass |
| text / combo (flame 22% on surface) | `#1E1B2E` on `#FFE7D7` | 4.5:1 | = | **14.11** | pass |
| text / tip card | `#1E1B2E` on `#FFF5DF` | 4.5:1 | = | **15.49** | pass |
| toast: bg / text | `#FFF9F2` on `#1E1B2E` | 4.5:1 | = | **16.05** | pass |
| UI border / surface (inputs, switch) | `#858098` on `#FFFFFF` | 3:1 | 3.46 | **3.79** | pass (changed) |
| UI border / surface-2 | `#858098` on `#F6EEE4` | 3:1 | 3.01 | **3.30** | pass (changed) |
| UI hairline / surface (unselected option border; exempt: label text + letter identify it) | `#E8DED2` on `#FFFFFF` | — | = | **1.33** | info |
| UI primary / surface (selected option border) | `#B3125F` on `#FFFFFF` | 3:1 | = | **6.63** | pass |
| UI correct / surface (is-right border) | `#0A6C80` on `#FFFFFF` | 3:1 | = | **6.05** | pass |
| UI incorrect / surface (is-wrong border) | `#B93A1E` on `#FFFFFF` | 3:1 | = | **5.70** | pass |
| UI focus / bg | `#1D4ED8` on `#FFF9F2` | 3:1 | = | **6.41** | pass |
| UI focus / surface | `#1D4ED8` on `#FFFFFF` | 3:1 | = | **6.70** | pass |
| UI focus / surface-2 | `#1D4ED8` on `#F6EEE4` | 3:1 | = | **5.83** | pass |
| UI focus / primary (n/a: 3px offset gap of bg sits between) | `#1D4ED8` on `#B3125F` | — | = | **1.01** | info |
| UI primary bar / surface-3 track | `#B3125F` on `#EFE4D7` | 3:1 | = | **5.29** | pass |
| UI gold bar fill / surface-3 track | `#FFC94D` on `#EFE4D7` | — | = | **1.22** | info |
| UI gold bar edge (gold-meter) / surface-3 track | `#A66F00` on `#EFE4D7` | 3:1 | 1.22 | **3.42** | pass (changed) |
| UI gold-ledge / surface-3 (gradient start; edge carries 3:1) | `#C9921A` on `#EFE4D7` | — | = | **2.20** | info |
| UI gold ring (gold-meter) / surface-3 track | `#A66F00` on `#EFE4D7` | 3:1 | 1.22 | **3.42** | pass (changed) |
| UI gold ring (gold-meter) / surface | `#A66F00` on `#FFFFFF` | 3:1 | 1.53 | **4.29** | pass (changed) |
| text-muted / hero primary tint (22%) | `#57536B` on `#EECBDC` | 4.5:1 | = | **4.98** | pass |
| text-muted / hero gold tint | `#57536B` on `#FFF1D1` | 4.5:1 | = | **6.57** | pass |
| CTA subtitle (on-primary @90%) / primary | `#F7E7EF` on `#B3125F` | 4.5:1 | = | **5.56** | pass |
| UI ghost btn border (border) / correct-bg | `#858098` on `#E2F3F6` | 3:1 | 3.03 | **3.32** | pass (changed) |
| UI ghost btn border (border) / incorrect-bg | `#858098` on `#FCEAE4` | 3:1 | 2.97 | **3.26** | pass (changed) |
| UI week empty-cell outline (border) / surface-2 | `#858098` on `#F6EEE4` | 3:1 | 3.01 | **3.30** | pass (changed) |
| UI sec-fund / surface-3 | `#8A5A00` on `#EFE4D7` | 3:1 | = | **4.73** | pass |
| UI sec-auto / surface-3 | `#0B7A5C` on `#EFE4D7` | 3:1 | = | **4.24** | pass |
| UI sec-ui / surface-3 | `#B3125F` on `#EFE4D7` | 3:1 | = | **5.29** | pass |
| UI sec-test / surface-3 | `#0A6C80` on `#EFE4D7` | 3:1 | = | **4.83** | pass |
| UI sec-perf / surface-3 | `#B4470A` on `#EFE4D7` | 3:1 | = | **4.35** | pass |
| UI switch on (primary) / surface | `#B3125F` on `#FFFFFF` | 3:1 | = | **6.63** | pass |
| UI switch off (surface-3+border) / surface | `#858098` on `#FFFFFF` | 3:1 | 3.46 | **3.79** | pass (changed) |
| UI week lvl1 / surface (card) | `#FAC59E` on `#FFFFFF` | — | 1.45 | **1.55** | info (changed) |
| UI week lvl1 / surface-2 (empty cell) | `#FAC59E` on `#F6EEE4` | — | 1.26 | **1.35** | info (changed) |
| UI week lvl2 / lvl1 | `#FCAE77` on `#FAC59E` | — | 1.26 | **1.18** | info (changed) |
| UI week lvl3 / surface (also carries 🔥 glyph) | `#FF9248` on `#FFFFFF` | — | = | **2.22** | info |
| UI week empty cell fill / surface (outline carries it now) | `#F6EEE4` on `#FFFFFF` | — | = | **1.15** | info |
| UI today outline (text) / surface | `#1E1B2E` on `#FFFFFF` | 3:1 | = | **16.78** | pass |
| UI dots on / surface-3 | `#B3125F` on `#EFE4D7` | 3:1 | = | **5.29** | pass |
| UI ghost btn border / bg | `#858098` on `#FFF9F2` | 3:1 | 1.27 | **3.63** | pass (changed) |

### Dark theme (warm charcoal, measured 2026-11-15)

| Pair | Colors | Min | Ratio | |
|---|---|---|---|---|
| text / bg | `#F6F1EA` on `#161412` | 4.5:1 | **16.35** | pass |
| text / surface | `#F6F1EA` on `#201D1A` | 4.5:1 | **14.93** | pass |
| text / surface-2 | `#F6F1EA` on `#2B2723` | 4.5:1 | **13.19** | pass |
| text / surface-3 | `#F6F1EA` on `#36312C` | 4.5:1 | **11.45** | pass |
| text / nav bar (surface 92% on bg) | `#F6F1EA` on `#1F1C19` | 4.5:1 | **15.09** | pass |
| text / tip card (gold 18%) | `#F6F1EA` on `#483C23` | 4.5:1 | **9.60** | pass |
| text / hint card / badge.got (gold 22%) | `#F6F1EA` on `#514325` | 4.5:1 | **8.58** | pass |
| text / combo (flame 22%) | `#F6F1EA` on `#513724` | 4.5:1 | **9.72** | pass |
| text / hero gold tint | `#F6F1EA` on `#443922` | 4.5:1 | **10.08** | pass |
| text / correct-bg | `#F6F1EA` on `#10303A` | 4.5:1 | **12.41** | pass |
| text / incorrect-bg | `#F6F1EA` on `#3A1D16` | 4.5:1 | **13.67** | pass |
| text-muted / bg | `#C2B8AB` on `#161412` | 4.5:1 | **9.40** | pass |
| text-muted / surface | `#C2B8AB` on `#201D1A` | 4.5:1 | **8.58** | pass |
| text-muted / surface-2 | `#C2B8AB` on `#2B2723` | 4.5:1 | **7.58** | pass |
| text-muted / surface-3 | `#C2B8AB` on `#36312C` | 4.5:1 | **6.58** | pass |
| text-muted / nav bar (surface 92% on bg) | `#C2B8AB` on `#1F1C19` | 4.5:1 | **8.67** | pass |
| text-muted / tip card (gold 18%) | `#C2B8AB` on `#483C23` | 4.5:1 | **5.52** | pass |
| text-muted / hint card / badge.got (gold 22%) | `#C2B8AB` on `#514325` | 4.5:1 | **4.93** | pass |
| text-muted / combo (flame 22%) | `#C2B8AB` on `#513724` | 4.5:1 | **5.59** | pass |
| text-muted / hero gold tint | `#C2B8AB` on `#443922` | 4.5:1 | **5.79** | pass |
| text-muted / correct-bg | `#C2B8AB` on `#10303A` | 4.5:1 | **7.13** | pass |
| text-muted / incorrect-bg | `#C2B8AB` on `#3A1D16` | 4.5:1 | **7.85** | pass |
| toast: bg on text | `#161412` on `#F6F1EA` | 4.5:1 | **16.35** | pass |
| correct / surface | `#5CD0E8` on `#201D1A` | 4.5:1 | **9.30** | pass |
| correct / correct-bg | `#5CD0E8` on `#10303A` | 4.5:1 | **7.73** | pass |
| surface on correct (.letter) | `#201D1A` on `#5CD0E8` | 4.5:1 | **9.30** | pass |
| incorrect / surface | `#FF9B80` on `#201D1A` | 4.5:1 | **8.19** | pass |
| incorrect / incorrect-bg | `#FF9B80` on `#3A1D16` | 4.5:1 | **7.50** | pass |
| surface on incorrect (.letter) | `#201D1A` on `#FF9B80` | 4.5:1 | **8.19** | pass |
| on-gold / gold | `#161412` on `#FFC94D` | 4.5:1 | **12.00** | pass |
| gold-text / surface | `#FFC94D` on `#201D1A` | 4.5:1 | **10.95** | pass |
| gold-text / bg | `#FFC94D` on `#161412` | 4.5:1 | **12.00** | pass |
| gold-text / surface-2 | `#FFC94D` on `#2B2723` | 4.5:1 | **9.68** | pass |
| flame / surface | `#FF9248` on `#201D1A` | 4.5:1 | **7.55** | pass |
| magenta: on-primary / primary | `#14111C` on `#FF7AB8` | 4.5:1 | **7.75** | pass |
| magenta: CTA subtitle (on-primary 90%) / primary | `#2B1C2C` on `#FF7AB8` | 4.5:1 | **6.69** | pass |
| magenta: primary / surface | `#FF7AB8` on `#201D1A` | 4.5:1 | **6.97** | pass |
| magenta: primary / bg | `#FF7AB8` on `#161412` | 4.5:1 | **7.64** | pass |
| magenta: primary / surface-2 | `#FF7AB8` on `#2B2723` | 4.5:1 | **6.16** | pass |
| magenta: primary / primary-soft | `#FF7AB8` on `#3A1E31` | 4.5:1 | **6.19** | pass |
| magenta: text / primary-soft | `#F6F1EA` on `#3A1E31` | 4.5:1 | **13.25** | pass |
| magenta: text-muted / primary-soft | `#C2B8AB` on `#3A1E31` | 4.5:1 | **7.62** | pass |
| magenta: text-muted / hero primary tint 22% | `#C2B8AB` on `#51313D` | 4.5:1 | **5.78** | pass |
| magenta: text / section-emoji tile (16%) | `#F6F1EA` on `#442C33` | 4.5:1 | **11.30** | pass |
| magenta: primary bar / surface-3 track | `#FF7AB8` on `#36312C` | 3:1 | **5.35** | pass |
| magenta: switch on (primary) / surface | `#FF7AB8` on `#201D1A` | 3:1 | **6.97** | pass |
| mango: on-primary / primary | `#14111C` on `#FFA45C` | 4.5:1 | **9.51** | pass |
| mango: CTA subtitle (on-primary 90%) / primary | `#2B2022` on `#FFA45C` | 4.5:1 | **8.04** | pass |
| mango: primary / surface | `#FFA45C` on `#201D1A` | 4.5:1 | **8.56** | pass |
| mango: primary / bg | `#FFA45C` on `#161412` | 4.5:1 | **9.38** | pass |
| mango: primary / surface-2 | `#FFA45C` on `#2B2723` | 4.5:1 | **7.56** | pass |
| mango: primary / primary-soft | `#FFA45C` on `#3A2416` | 4.5:1 | **7.42** | pass |
| mango: text / primary-soft | `#F6F1EA` on `#3A2416` | 4.5:1 | **12.94** | pass |
| mango: text-muted / primary-soft | `#C2B8AB` on `#3A2416` | 4.5:1 | **7.44** | pass |
| mango: text-muted / hero primary tint 22% | `#C2B8AB` on `#513B29` | 4.5:1 | **5.35** | pass |
| mango: text / section-emoji tile (16%) | `#F6F1EA` on `#443325` | 4.5:1 | **10.70** | pass |
| mango: primary bar / surface-3 track | `#FFA45C` on `#36312C` | 3:1 | **6.56** | pass |
| mango: switch on (primary) / surface | `#FFA45C` on `#201D1A` | 3:1 | **8.56** | pass |
| mint: on-primary / primary | `#14111C` on `#5EE0B4` | 4.5:1 | **11.36** | pass |
| mint: CTA subtitle (on-primary 90%) / primary | `#1B262B` on `#5EE0B4` | 4.5:1 | **9.42** | pass |
| mint: primary / surface | `#5EE0B4` on `#201D1A` | 4.5:1 | **10.22** | pass |
| mint: primary / bg | `#5EE0B4` on `#161412` | 4.5:1 | **11.20** | pass |
| mint: primary / surface-2 | `#5EE0B4` on `#2B2723` | 4.5:1 | **9.03** | pass |
| mint: primary / primary-soft | `#5EE0B4` on `#16332A` | 4.5:1 | **8.30** | pass |
| mint: text / primary-soft | `#F6F1EA` on `#16332A` | 4.5:1 | **12.13** | pass |
| mint: text-muted / primary-soft | `#C2B8AB` on `#16332A` | 4.5:1 | **6.97** | pass |
| mint: text-muted / hero primary tint 22% | `#C2B8AB` on `#2E483C` | 4.5:1 | **5.09** | pass |
| mint: text / section-emoji tile (16%) | `#F6F1EA` on `#2A3C33` | 4.5:1 | **10.43** | pass |
| mint: primary bar / surface-3 track | `#5EE0B4` on `#36312C` | 3:1 | **7.84** | pass |
| mint: switch on (primary) / surface | `#5EE0B4` on `#201D1A` | 3:1 | **10.22** | pass |
| lava: on-primary / primary | `#14111C` on `#FF8A8F` | 4.5:1 | **8.24** | pass |
| lava: CTA subtitle (on-primary 90%) / primary | `#2B1D28` on `#FF8A8F` | 4.5:1 | **7.09** | pass |
| lava: primary / surface | `#FF8A8F` on `#201D1A` | 4.5:1 | **7.41** | pass |
| lava: primary / bg | `#FF8A8F` on `#161412` | 4.5:1 | **8.12** | pass |
| lava: primary / surface-2 | `#FF8A8F` on `#2B2723` | 4.5:1 | **6.55** | pass |
| lava: primary / primary-soft | `#FF8A8F` on `#3A1A1D` | 4.5:1 | **6.90** | pass |
| lava: text / primary-soft | `#F6F1EA` on `#3A1A1D` | 4.5:1 | **13.89** | pass |
| lava: text-muted / primary-soft | `#C2B8AB` on `#3A1A1D` | 4.5:1 | **7.98** | pass |
| lava: text-muted / hero primary tint 22% | `#C2B8AB` on `#513534` | 4.5:1 | **5.63** | pass |
| lava: text / section-emoji tile (16%) | `#F6F1EA` on `#442E2D` | 4.5:1 | **11.16** | pass |
| lava: primary bar / surface-3 track | `#FF8A8F` on `#36312C` | 3:1 | **5.69** | pass |
| lava: switch on (primary) / surface | `#FF8A8F` on `#201D1A` | 3:1 | **7.41** | pass |
| gold: on-primary / primary | `#14111C` on `#FFC94D` | 4.5:1 | **12.17** | pass |
| gold: CTA subtitle (on-primary 90%) / primary | `#2B2321` on `#FFC94D` | 4.5:1 | **10.05** | pass |
| gold: primary / surface | `#FFC94D` on `#201D1A` | 4.5:1 | **10.95** | pass |
| gold: primary / bg | `#FFC94D` on `#161412` | 4.5:1 | **12.00** | pass |
| gold: primary / surface-2 | `#FFC94D` on `#2B2723` | 4.5:1 | **9.68** | pass |
| gold: primary / primary-soft | `#FFC94D` on `#352A12` | 4.5:1 | **9.20** | pass |
| gold: text / primary-soft | `#F6F1EA` on `#352A12` | 4.5:1 | **12.53** | pass |
| gold: text-muted / primary-soft | `#C2B8AB` on `#352A12` | 4.5:1 | **7.20** | pass |
| gold: text-muted / hero primary tint 22% | `#C2B8AB` on `#514325` | 4.5:1 | **4.93** | pass |
| gold: text / section-emoji tile (16%) | `#F6F1EA` on `#443922` | 4.5:1 | **10.08** | pass |
| gold: primary bar / surface-3 track | `#FFC94D` on `#36312C` | 3:1 | **8.40** | pass |
| gold: switch on (primary) / surface | `#FFC94D` on `#201D1A` | 3:1 | **10.95** | pass |
| focus / bg | `#7FB2FF` on `#161412` | 3:1 | **8.50** | pass |
| focus / surface | `#7FB2FF` on `#201D1A` | 3:1 | **7.76** | pass |
| focus / surface-2 | `#7FB2FF` on `#2B2723` | 3:1 | **6.85** | pass |
| focus / surface-3 | `#7FB2FF` on `#36312C` | 3:1 | **5.95** | pass |
| focus / correct-bg | `#7FB2FF` on `#10303A` | 3:1 | **6.45** | pass |
| focus / incorrect-bg | `#7FB2FF` on `#3A1D16` | 3:1 | **7.11** | pass |
| border / bg | `#8C8277` on `#161412` | 3:1 | **4.88** | pass |
| border / surface | `#8C8277` on `#201D1A` | 3:1 | **4.45** | pass |
| border / surface-2 | `#8C8277` on `#2B2723` | 3:1 | **3.93** | pass |
| border / correct-bg | `#8C8277` on `#10303A` | 3:1 | **3.70** | pass |
| border / incorrect-bg | `#8C8277` on `#3A1D16` | 3:1 | **4.08** | pass |
| correct border / surface | `#5CD0E8` on `#201D1A` | 3:1 | **9.30** | pass |
| incorrect border / surface | `#FF9B80` on `#201D1A` | 3:1 | **8.19** | pass |
| gold-meter / surface-3 track | `#FFC94D` on `#36312C` | 3:1 | **8.40** | pass |
| gold-meter / surface | `#FFC94D` on `#201D1A` | 3:1 | **10.95** | pass |
| today outline (text) / surface | `#F6F1EA` on `#201D1A` | 3:1 | **14.93** | pass |
| sec-fund / surface-3 | `#FFC94D` on `#36312C` | 3:1 | **8.40** | pass |
| sec-auto / surface-3 | `#5EE0B4` on `#36312C` | 3:1 | **7.84** | pass |
| sec-ui / surface-3 | `#FF7AB8` on `#36312C` | 3:1 | **5.35** | pass |
| sec-test / surface-3 | `#5CD0E8` on `#36312C` | 3:1 | **7.13** | pass |
| sec-perf / surface-3 | `#FF9248` on `#36312C` | 3:1 | **5.79** | pass |
| sec-fund / surface | `#FFC94D` on `#201D1A` | 3:1 | **10.95** | pass |
| sec-auto / surface | `#5EE0B4` on `#201D1A` | 3:1 | **10.22** | pass |
| sec-ui / surface | `#FF7AB8` on `#201D1A` | 3:1 | **6.97** | pass |
| sec-test / surface | `#5CD0E8` on `#201D1A` | 3:1 | **9.30** | pass |
| sec-perf / surface | `#FF9248` on `#201D1A` | 3:1 | **7.55** | pass |
| hairline / surface (exempt) | `#36302A` on `#201D1A` | — | **1.29** | info |
| hairline / bg (exempt) | `#36302A` on `#161412` | — | **1.41** | info |
| surface / bg (card edge, exempt) | `#201D1A` on `#161412` | — | **1.10** | info |
| week lvl1 / surface-2 | `#8A5734` on `#2B2723` | — | **2.47** | info |

### Code block palette on `#1A1726` (unchanged, both themes)

| Token | Color | Ratio |
|---|---|---|
| code plain | `#EDEAF6` | 14.82 |
| tk-keyword | `#FF8FC6` | 8.37 |
| tk-type | `#7FE3D0` | 11.55 |
| tk-string | `#FFD479` | 12.51 |
| tk-comment | `#A49FBD` | 6.93 |
| tk-annotation/number | `#FFB27A` | 9.96 |
| tk-fn | `#9FD0FF` | 10.83 |

### Colorblind simulation (Machado 2009, full severity; CIE76 ΔE, >20 clearly distinct, <10 confusable)

| Theme | Vision | correct vs incorrect ΔE | correct-bg vs incorrect-bg ΔE | closest section-accent pair (ΔE) |
|---|---|---|---|---|
| light | none | 92.2 (`#0A6C80` vs `#B93A1E`) | 13.2 | sec-fund~sec-perf (28.5) |
| light | protan | 51 (`#5F6881` vs `#605519`) | 7 | sec-fund~sec-perf (1.7) |
| light | deutan | 69.4 (`#505E80` vs `#7F7117`) | 9.5 | sec-auto~sec-ui (1.8) |
| light | tritan | 102.8 (`#007372` vs `#CC0B35`) | 16.6 | sec-auto~sec-test (6.2) |
| dark | none | 79.6 (`#5CD0E8` vs `#FF9B80`) | 30 | sec-fund~sec-perf (32.9) |
| dark | protan | 42.1 (`#BECAE9` vs `#B3A87E`) | 18.4 | sec-ui~sec-test (18.6) |
| dark | deutan | 58.6 (`#A9BAE8` vs `#CBBD7F`) | 23.3 | sec-auto~sec-ui (12.3) |
| dark | tritan | 92.4 (`#00DAD7` vs `#FF8B94`) | 37.5 | sec-auto~sec-test (6.8) |

**Colorblind notes**

- **Correct vs incorrect stays clearly distinct under every simulation.** The lowest ΔE is 42, for protanopia in dark mode, and every case is ≥ 42. The pair also never relies on color alone: there is a ✓/✗ glyph, the words "Correct" and "Not quite" (or the praise variants), a screen-reader suffix ("(correct answer)" / "(your choice, incorrect)"), and an `aria-live` announcement.
- **The light-mode `correct-bg` / `incorrect-bg` panel fills sit close together under protan and deutan simulation (ΔE 7–9.5).** This is acceptable because each panel also has a 2 px border in `correct`/`incorrect` (ΔE ≥ 51) and the ✓/✗ verdict line.
- **Some section accents collapse under CVD simulation:**
  - Light theme: Fundamentals `#8A5A00` vs Performance `#B4470A` drop to ΔE 1.7 under protanopia. Automation `#0B7A5C` vs UI `#B3125F` drop to ΔE 1.8 under deuteranopia.
  - Both themes: Automation vs Testing sit at ΔE ~6–7 under tritanopia.
  - Accents are never the only cue: every ring, bar and card also shows the section emoji, the section name and a % number. This meets 1.4.1, but see the recommendations.
- **The heat strip uses one hue ramp** (flame orange at 45%, then 70%, then 100%). Ramp steps are luminance-based, so they hold up under all three CVD types. Empty days now have a 3:1 outline, and goal days carry 🔥.

## Non-text contrast notes

- **Focus ring vs primary (1.01:1 light, 1.11:1 dark; focus and primary did not change):** this is not an adjacency failure. The ring has `outline-offset: 3px`, so a strip of page background always sits between the ring and a primary button. Against that background the ring measures 6.41:1 (light) and 8.50:1 (dark). Against `surface-2` it measures 5.83:1 and 6.85:1.
- **Unselected answer option border (`hairline`, 1.33:1):** left as is. SC 1.4.11 does not require a visible boundary when the label text and the A/B/C/D letter chip identify the control. The 3 px ledge shadow gives the tappable affordance. Selected, correct and wrong states all have 2 px borders of 5.7:1 or better.
- **Gold bar:** the bright `#FFC94D` fill is kept for the reward feel. A 2 px inset edge in `--gold-meter` now carries the 3:1 boundary against the track.
- **Disabled buttons:** exempt from contrast (still 5.87:1 and 6.58:1). They now drop the 3D ledge so they no longer look pressable.
- **The `.letter` badge on revealed options uses `var(--surface)` text on the fill:** 6.05:1 on correct and 5.70:1 on incorrect (light), 9.30:1 and 8.19:1 (dark).
- **Toast (`bg` on `text`):** 16.05:1 (light) and 16.35:1 (dark).

## axe results

**Before (390 px, both themes):**

| Rule | Impact | Nodes | Where |
|---|---|---|---|
| `label-content-name-mismatch` | serious | 22 | Home streak chip and readiness card, Lesson "Back" button (named "Previous card"), lesson card counter, Sprint timer pill, Cards flip card, Exam "Q 1/20" map button |
| `page-has-heading-one` | moderate | 12 | Sprint, Cards (running/flipped), Exam (running) |
| `aria-allowed-role` | minor | 2 | Park-it sheet: `role="dialog"` on a `<form>` |
| `color-contrast` | serious | 1 | `.xp-pop` captured mid fade-out. This is a false positive (the settled chip is 10.96:1). |

**After:** 0 violations on all 34 states at 390 px, and 0 on all 34 states at 320 px with text scale 1.3.

**Fixes beyond what axe flags:**

- **Answer semantics (spec §9):** options were `aria-pressed` toggle buttons. They are now `role="radio"` in a `radiogroup` for single-answer questions, and `role="checkbox"` in a `group` for "Choose N". Both use `aria-checked`, and arrow keys move focus between options.
- **Skip link:** it was `.sr-only` and stayed invisible when focused (2.4.7). It now appears as a card at the top left.
- **Cards due badge:** `aria-label` on a plain `<span>` was replaced with visually hidden text. The link now reads "Cards, 3 due".
- **Flip card:** the old `aria-label` was removed. Only the visible face is exposed to assistive tech, so the answer is no longer in the accessibility tree before the flip.
- **Exam chips ("Q 1/20" and Flag):** raised to 44 px targets. The map button gets `aria-haspopup="dialog"`.
- **Sprint timer:** the pause button is now a real toggle (`aria-pressed`) with a stable name.
- **Reduced motion:** the old rule set `transition-duration: 120ms !important` on `*`. Because the default `transition-property` is `all`, every element then animated layout and transforms, including padding, width and position. That added motion in reduced mode (for example, the skip link grew in from 1 px). Under reduced motion, only opacity and color now transition.

## Visual review (iPhone 13 and 320 px @ text 1.3, both themes)

**Fixed:**

- **Exam and Sprint at 320 px:** long code tokens in questions and options (`Integration_Config__c.getOrgDefaults()`, `Test.getEventBus().deliver()`) pushed the page about 70 px wider than the screen, hiding option text under the sticky bar. The fixes were `overflow-wrap: anywhere` on `.question`, the options and the lesson cards, plus `minmax(0,1fr)` on the option grid. The empty ✓/✗ column is now `auto`, which gives the text 26 px more room before an answer is revealed.
- **Section screen:** the three `nowrap` chips overflowed the summary card at every width. The chip row now wraps.
- **Home header at 320 px / 1.3:** the title was squeezed into a one-word-per-line column beside the streak chip. The header now wraps, so the chips drop below the title. The hero "Level N · x/y XP" row also wraps instead of breaking mid-label.
- **Stat tiles:** labels sat at different heights depending on whether the top was an emoji or a number. They now share a baseline.
- **Me screen:** the ⚙️ icon link showed a text underline. Empty heat-strip days were nearly invisible (1.15:1). They now show an outlined slot.
- **Disabled buttons:** they no longer keep the 3D ledge.

**Checked and fine:**

- Every screen has one obvious primary action. Feedback panels are calm: a nudge, not a red flash. The Calm-mode and reduced-motion paths remove confetti and idle animation.

## Recommendations not implemented

1. **Reward stacking right after an answer.** The streak toast (top), the "+XP" pop, the combo chip bump and the feedback panel can all fire within about 300 ms. The toast also covers the progress bar and timer for 2.2 s. Consider delaying streak toasts until "Continue", or moving them to the bottom above the action bar. Either keeps one reward moment at a time.
2. **Section accents under CVD.** For more separation, consider moving light `--sec-fund` toward a brighter amber (for example `#7A6200`, checked against the track first) and shifting `--sec-auto` lighter or more yellow-green. A pattern or position cue on the Me mastery bars would also help. Not done, because accents are always labelled and this is a brand decision.
3. **Unselected option border.** If you want a stronger "this is a button" signal for very distractible users, use `--border` for unselected options. It meets 3:1 but adds visual weight to every question.
4. **Light gold ring** (`#A66F00`) reads more mustard than the bright reward gold. If that feels too dull, draw the ring as a bright `#FFC94D` stroke over a slightly wider `--gold-meter` stroke (an edge-plus-fill ring, like the bar).
5. **Heat strip.** Light lvl1 and lvl2 differ only by about 1.3:1. Consider showing the day's XP as a small number, or a ½ glyph for "under half the goal".
6. **Radio pattern.** Options are still each in the Tab order. A full roving-tabindex radiogroup (one Tab stop, arrows select) would match the APG exactly, but it changes the keyboard flow for current users.
7. **Inactive lesson dots** (`surface-3` on `bg`) are low contrast. They are `aria-hidden` and the "1/6" chip carries the information, so this is fine. They could be raised if the dots ever become interactive.
