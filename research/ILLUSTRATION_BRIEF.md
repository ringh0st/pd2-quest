# Lesson illustrations: brief

Every lesson has one "Think of it like…" card (usually card index 1) that explains the idea with an everyday
metaphor. Each of those cards gets **one hand-made SVG illustration of that exact metaphor**. The owner approved
one reference picture; every new one must look like it belongs to the same set.

**Reference:** `src/assets/art/auto-queueable-train.svg` (shown on lesson auto-3). Open it, read it, and render it
before you start. Match its style, level of detail, palette, and finish exactly.

## The style ("line art with colour patches", chosen by the owner)

- **Canvas:** `viewBox="0 0 360 220"`, `xmlns` and `xmlns:xlink` set; use `xlink:href` for `<use>`.
- **Look:** a detailed ink drawing on a warm paper background `#FBF6EF`. Every object is drawn with dark lines
  (`#1E1B2E`, stroke-width 1.8 for outlines, 1.2–1.4 for inner details, round joins and caps, `fill="none"`), and
  under it a **flat pastel colour patch of the same shape, offset by +5,+5** (`<g transform="translate(5 5)">`), so the
  colour sits slightly off the lines like a risograph print. Define each shape once in `<defs>` and `<use>` it twice
  (patch, then lines) so they always match.
- **Scene, not icons:** a small, complete world drawn in line: a sun with rays, a few line clouds, small sparkles
  (`+`), a hill line with a very soft fill (`#E2EFE7`), a ground line, short ground details. The main subject sits
  in the middle third and is big.
- **Real silhouettes, rich detail:** draw objects the way they really look, with parts and details (the train has a
  boiler with bands, a chimney with a rim, domes, a cab with a roof and a window, spoked wheels, a rod, a cowcatcher
  with slats, planked wagons, crates with cross braces, tags on strings). Mix straight edges, angles and curves.
  Not plain boxes, blobs or circles.
- **Colour:** pastel patches only, from: pink `#F6C9DC`/`#EDA3C3`, teal `#BFE3EA`, mint `#C4E8D9`/`#BFE0CE`,
  gold `#FFD978`/`#FFE08A`, warm grey `#D9D2CB`, wood `#F0D3A4`, peach `#F8D1B8`. Accent lines (rays, a beam) may
  use gold `#E7A92E`. Small solid fills inside lines are fine for windows/lamps (`#FFF1C2`, `#FFE08A`). Never blue or
  purple as a main colour. Not every object needs a patch; leave some white space.
- **Small story details:** 2–4 tiny touches that support the meaning (a ticket on a string, steam puffs, a beam,
  birds, speed lines, a dotted motion trail).
- **Grain:** finish with the same paper grain as the reference (`feTurbulence` filter rect over everything,
  alpha .06).
- **Labels (optional, at most 3):** short uppercase words that tie the picture to the code idea (`@FUTURE`,
  `QUEUEABLE`), under the ground line like the reference, with the reference's text attributes
  (`font-family="system-ui,-apple-system,Segoe UI,Roboto,sans-serif" font-size="10.5" font-weight="700"
  letter-spacing="1.3"`) in `#7A0A40`, `#075566` or `#086049`. No sentences in the picture.
- **Readable at phone size:** the picture shows about 330 px wide. Keep the main subject big; nothing important
  smaller than ~8 px; nothing clipped at the edges; nothing overlapping awkwardly; lines never so dense they tangle.
- **Self-contained:** no external images or fonts, no `<style>` blocks, no scripts. Ids must be unique within the
  file and prefixed with the file's slug (e.g. `bk-sky`) so files never clash. Keep each file under ~16 KB.

## The picture must match the card

Read the lesson's "Think of it like…" card. Draw **that** metaphor, showing the parts the text names (and the
"where it stops" twist only if it fits naturally). If the metaphor is impossible to draw well, you may adjust the
card text slightly to a drawable metaphor that teaches the same thing, but keep every key term that appears in it,
keep it ≤ 65 words, and keep the title.

## What to change per card

- Save the picture as `src/assets/art/<section>-<slug>.svg` (e.g. `auto-batch-bakery.svg`).
- On that card add `"art": "<section>-<slug>"` and `"alt": "<one sentence, 8–30 words, describing what the picture
  shows>"`.
- Don't change anything else in the JSON (keep its 2-space formatting; write it back with `JSON.stringify(d, null, 2)`
  plus a trailing newline).

## Check your work (required)

1. Render every picture to PNG with Playwright (`require('playwright')`, `chromium.launch()`, deviceScaleFactor 2) and
   **look at it** with the Read tool. Fix clipping, overlaps, muddy shapes, unclear metaphors, anything boxy or blobby.
   Iterate until each one is as good as the reference. Compare side by side with the reference.
2. Make one contact sheet PNG of all your pictures (a grid, each with its lesson id) at the path you're given.
3. `node scripts/validate-content.mjs src/data/pd2/<section>.json` must print OK.
4. Don't commit. Report the list of files, and anything you changed in card text.
