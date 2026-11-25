# Lesson illustrations: brief

Every lesson has one "Think of it like…" card (usually card index 1) that explains the idea with an everyday
metaphor. Each of those cards gets **one hand-made SVG illustration of that exact metaphor**. The owner approved
one reference picture; every new one must look like it belongs to the same set.

**Reference:** `src/assets/art/auto-queueable-train.svg` (shown on lesson auto-3). Open it, read it, and render it
before you start. Match its style, level of detail, palette, and finish.

## The style ("flat editorial, light and shadow")

- **Canvas:** `viewBox="0 0 360 220"`, `xmlns` and `xmlns:xlink` set; use `xlink:href` for `<use>`.
- **Scene, not icons:** a small, complete world: a sky with a soft vertical gradient (warm cream/peach), then layered
  hills or a room/backdrop, a ground band, and the main subject in the middle third. Objects stand on the ground and
  cast nothing heavier than a faint shadow line.
- **Real silhouettes, evolved shapes:** draw objects the way they really look, with parts and details (the train has
  a boiler with bands, chimney with a rim, domes, cab with roof overhang, spoked wheels, a rod, cowcatcher with slats,
  planked wagons, crates with cross braces). Mix straight edges, angles and curves. **Not boxes, not blobs, not
  circles**: no shape should be a plain rectangle or circle unless the real object is.
- **Light and shadow:** each solid object has a light side and a darker side (a second, darker fill over part of
  it), plus a thin highlight strip where useful. No outlines/strokes around shapes (small detail lines are fine).
- **Small story details:** 2–4 tiny touches that make it feel alive and support the meaning (a ticket on a string,
  steam puffs, a headlamp beam, birds, speed lines, a dotted motion trail).
- **Palette (only these, plus tints/shades of them):** ink `#1E1B2E`/`#35304A`/`#25212F`, berry `#B3125F`/`#8E0D4C`/
  `#E24E92`, teal `#0A6C80`/`#075566`, green `#0B7A5C`/`#086049`, gold `#FFC94D`/`#E7A92E`/`#FFE7A0`, orange
  `#B4470A`/`#E07A3A`, sky `#FBE6D6`→`#FCF3E8`, hills `#EAD6C4`, `#CFE4D7`, `#BCDACB`, pines `#A9CFBA`/`#93C2AA`,
  ground `#EBDDCB`/`#DCC9B2`, wood `#D9A35A`/`#E9BD7A`/`#B9823A`, white clouds. Never blue or purple as a main colour.
- **Grain:** finish with the same paper grain as the reference (`feTurbulence` filter rect over everything,
  alpha .07).
- **Labels (optional, at most 3):** short uppercase words that tie the picture to the code idea (`@FUTURE`,
  `QUEUEABLE`), set on the ground band like the reference, using the reference's text attributes
  (`font-family="system-ui,-apple-system,Segoe UI,Roboto,sans-serif" font-size="10.5" font-weight="700"
  letter-spacing="1.3"`) and a dark colour from the palette. No sentences in the picture.
- **Readable at phone size:** the picture shows about 330 px wide. Keep the main subject big; nothing important
  smaller than ~8 px; nothing clipped at the edges; nothing overlapping awkwardly.
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
