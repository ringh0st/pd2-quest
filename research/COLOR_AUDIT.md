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

### Dark theme

| Pair | Colors (after) | Min | Before | After | |
|---|---|---|---|---|---|
| text / bg | `#F3F0FA` on `#14111C` | 4.5:1 | = | **16.56** | pass |
| text / surface | `#F3F0FA` on `#1F1B2B` | 4.5:1 | = | **14.93** | pass |
| text / surface-2 (chip, btn) | `#F3F0FA` on `#2A253A` | 4.5:1 | = | **13.10** | pass |
| text / surface-3 | `#F3F0FA` on `#352F48` | 4.5:1 | = | **11.30** | pass |
| text-muted / bg | `#B9B4CC` on `#14111C` | 4.5:1 | = | **9.29** | pass |
| text-muted / surface | `#B9B4CC` on `#1F1B2B` | 4.5:1 | = | **8.37** | pass |
| text-muted / surface-2 (segmented, week day) | `#B9B4CC` on `#2A253A` | 4.5:1 | = | **7.35** | pass |
| text-muted / surface-3 (disabled btn) | `#B9B4CC` on `#352F48` | 4.5:1 | = | **6.34** | pass |
| text-muted / primary-soft (nav pill area) | `#B9B4CC` on `#3A1E31` | 4.5:1 | = | **7.42** | pass |
| text-muted / correct-bg (feedback source) | `#B9B4CC` on `#10303A` | 4.5:1 | = | **6.95** | pass |
| text-muted / incorrect-bg (feedback source) | `#B9B4CC` on `#3A1D16` | 4.5:1 | = | **7.65** | pass |
| text-muted / tip card (gold 18% on surface) | `#B9B4CC` on `#473A31` | 4.5:1 | = | **5.46** | pass |
| text-muted / flip back (primary 8% on surface) | `#B9B4CC` on `#312336` | 4.5:1 | = | **7.35** | pass |
| on-primary / primary (btn, badge, letter) | `#14111C` on `#FF7AB8` | 4.5:1 | = | **7.75** | pass |
| primary / surface (nav active, choose-n, link) | `#FF7AB8` on `#1F1B2B` | 4.5:1 | = | **6.98** | pass |
| primary / bg (link) | `#FF7AB8` on `#14111C` | 4.5:1 | = | **7.75** | pass |
| primary / primary-soft (nav active on pill) | `#FF7AB8` on `#3A1E31` | 4.5:1 | = | **6.19** | pass |
| text / primary-soft (selected option, chip.primary) | `#F3F0FA` on `#3A1E31` | 4.5:1 | = | **13.23** | pass |
| on-gold / gold (chip.gold, btn.gold, xp-pop) | `#14111C` on `#FFC94D` | 4.5:1 | = | **12.17** | pass |
| gold-text / surface | `#FFC94D` on `#1F1B2B` | 4.5:1 | = | **10.97** | pass |
| correct / surface (mark ✓) | `#5CD0E8` on `#1F1B2B` | 4.5:1 | = | **9.31** | pass |
| correct / correct-bg (verdict, mark on is-right) | `#5CD0E8` on `#10303A` | 4.5:1 | = | **7.73** | pass |
| text / correct-bg | `#F3F0FA` on `#10303A` | 4.5:1 | = | **12.39** | pass |
| surface / correct (.letter on is-right) | `#1F1B2B` on `#5CD0E8` | 4.5:1 | = | **9.31** | pass |
| incorrect / surface | `#FF9B80` on `#1F1B2B` | 4.5:1 | = | **8.20** | pass |
| incorrect / incorrect-bg (verdict, mark on is-wrong) | `#FF9B80` on `#3A1D16` | 4.5:1 | = | **7.50** | pass |
| text / incorrect-bg (trap card, low timer) | `#F3F0FA` on `#3A1D16` | 4.5:1 | = | **13.64** | pass |
| surface / incorrect (.letter on is-wrong) | `#1F1B2B` on `#FF9B80` | 4.5:1 | = | **8.20** | pass |
| text / combo (flame 22% on surface) | `#F3F0FA` on `#503531` | 4.5:1 | = | **9.85** | pass |
| text / tip card | `#F3F0FA` on `#473A31` | 4.5:1 | = | **9.73** | pass |
| toast: bg / text | `#14111C` on `#F3F0FA` | 4.5:1 | = | **16.56** | pass |
| UI border / surface (inputs, switch) | `#807B98` on `#1F1B2B` | 3:1 | 3.22 | **4.16** | pass (changed) |
| UI border / surface-2 | `#807B98` on `#2A253A` | 3:1 | 2.82 | **3.65** | pass (changed) |
| UI hairline / surface (unselected option border; exempt: label text + letter identify it) | `#2F2A40` on `#1F1B2B` | — | = | **1.22** | info |
| UI primary / surface (selected option border) | `#FF7AB8` on `#1F1B2B` | 3:1 | = | **6.98** | pass |
| UI correct / surface (is-right border) | `#5CD0E8` on `#1F1B2B` | 3:1 | = | **9.31** | pass |
| UI incorrect / surface (is-wrong border) | `#FF9B80` on `#1F1B2B` | 3:1 | = | **8.20** | pass |
| UI focus / bg | `#7FB2FF` on `#14111C` | 3:1 | = | **8.62** | pass |
| UI focus / surface | `#7FB2FF` on `#1F1B2B` | 3:1 | = | **7.77** | pass |
| UI focus / surface-2 | `#7FB2FF` on `#2A253A` | 3:1 | = | **6.82** | pass |
| UI focus / primary (n/a: 3px offset gap of bg sits between) | `#7FB2FF` on `#FF7AB8` | — | = | **1.11** | info |
| UI primary bar / surface-3 track | `#FF7AB8` on `#352F48` | 3:1 | = | **5.28** | pass |
| UI gold bar fill / surface-3 track | `#FFC94D` on `#352F48` | — | = | **8.30** | info |
| UI gold bar edge (gold-meter) / surface-3 track | `#FFC94D` on `#352F48` | 3:1 | = | **8.30** | pass |
| UI gold-ledge / surface-3 (gradient start; edge carries 3:1) | `#A8771A` on `#352F48` | — | = | **3.22** | info |
| UI gold ring (gold-meter) / surface-3 track | `#FFC94D` on `#352F48` | 3:1 | = | **8.30** | pass |
| UI gold ring (gold-meter) / surface | `#FFC94D` on `#1F1B2B` | 3:1 | = | **10.97** | pass |
| text-muted / hero primary tint (22%) | `#B9B4CC` on `#50304A` | 4.5:1 | = | **5.62** | pass |
| text-muted / hero gold tint | `#B9B4CC` on `#433730` | 4.5:1 | 4.36 | **5.72** | pass (changed) |
| CTA subtitle (on-primary @90%) / primary | `#2B1C2C` on `#FF7AB8` | 4.5:1 | = | **6.69** | pass |
| UI ghost btn border (border) / correct-bg | `#807B98` on `#10303A` | 3:1 | 2.67 | **3.46** | pass (changed) |
| UI ghost btn border (border) / incorrect-bg | `#807B98` on `#3A1D16` | 3:1 | 2.94 | **3.81** | pass (changed) |
| UI week empty-cell outline (border) / surface-2 | `#807B98` on `#2A253A` | 3:1 | 2.82 | **3.65** | pass (changed) |
| UI sec-fund / surface-3 | `#FFC94D` on `#352F48` | 3:1 | = | **8.30** | pass |
| UI sec-auto / surface-3 | `#5EE0B4` on `#352F48` | 3:1 | = | **7.75** | pass |
| UI sec-ui / surface-3 | `#FF7AB8` on `#352F48` | 3:1 | = | **5.28** | pass |
| UI sec-test / surface-3 | `#5CD0E8` on `#352F48` | 3:1 | = | **7.05** | pass |
| UI sec-perf / surface-3 | `#FF9248` on `#352F48` | 3:1 | = | **5.73** | pass |
| UI switch on (primary) / surface | `#FF7AB8` on `#1F1B2B` | 3:1 | = | **6.98** | pass |
| UI switch off (surface-3+border) / surface | `#807B98` on `#1F1B2B` | 3:1 | 3.22 | **4.16** | pass (changed) |
| UI week lvl1 / surface (card) | `#8A5640` on `#1F1B2B` | — | 2.27 | **2.79** | info (changed) |
| UI week lvl1 / surface-2 (empty cell) | `#8A5640` on `#2A253A` | — | 1.99 | **2.45** | info (changed) |
| UI week lvl2 / lvl1 | `#BF7144` on `#8A5640` | — | 2.00 | **1.62** | info (changed) |
| UI week lvl3 / surface (also carries 🔥 glyph) | `#FF9248` on `#1F1B2B` | — | = | **7.57** | info |
| UI week empty cell fill / surface (outline carries it now) | `#2A253A` on `#1F1B2B` | — | = | **1.14** | info |
| UI today outline (text) / surface | `#F3F0FA` on `#1F1B2B` | 3:1 | = | **14.93** | pass |
| UI dots on / surface-3 | `#FF7AB8` on `#352F48` | 3:1 | = | **5.28** | pass |
| UI ghost btn border / bg | `#807B98` on `#14111C` | 3:1 | 1.35 | **4.62** | pass (changed) |

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

- **Focus ring vs primary (1.01:1 light, 1.11:1 dark):** this is not an adjacency failure. The ring has `outline-offset: 3px`, so a strip of page background always sits between the ring and a primary button. Against that background the ring measures 6.41:1 (light) and 8.62:1 (dark). Against `surface-2` it measures 5.83:1 and 6.82:1.
- **Unselected answer option border (`hairline`, 1.33:1):** left as is. SC 1.4.11 does not require a visible boundary when the label text and the A/B/C/D letter chip identify the control. The 3 px ledge shadow gives the tappable affordance. Selected, correct and wrong states all have 2 px borders of 5.7:1 or better.
- **Gold bar:** the bright `#FFC94D` fill is kept for the reward feel. A 2 px inset edge in `--gold-meter` now carries the 3:1 boundary against the track.
- **Disabled buttons:** exempt from contrast (still 5.87:1 and 6.34:1). They now drop the 3D ledge so they no longer look pressable.
- **The `.letter` badge on revealed options uses `var(--surface)` text on the fill:** 6.05:1 on correct and 5.70:1 on incorrect (light), 9.31:1 and 8.20:1 (dark).
- **Toast (`bg` on `text`):** 16.05:1 (light) and 16.56:1 (dark).

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
