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

## Variety pass (owner: the set must not look AI-made)

Seen together, the first set repeats one template: sun with rays in a top corner, 2–3 line clouds, "+" sparkles,
a hill line, a ground line, and three uppercase labels underneath, with the same round-headed people. Real
illustrators vary framing, light, time of day and composition. Keep the line-art style (ink lines, offset pastel
patches, paper grain) but break the template:

- **Use the framing assigned below.** *close-up*: one object fills the frame, no sky, no horizon. *indoor*: a room
  with walls/floor/lamps, no sun or clouds. *night* or *dusk*: dark sky background `#2B2738` (or a dusky `#F3D9C8`
  for dusk), lines in cream `#FBF6EF` where they sit on the dark, lit windows/lamps glowing `#FFE08A`; patches still
  pastel. *top-down*: seen from above (a table, a map, a desk), no horizon. *cutaway*: a building cut open.
  *outdoor*: a wide day scene, and only these may have a sun.
- **Across the whole set:** a sun in at most 6 pictures, clouds in at most 8, "+" sparkles in at most 8. Not every
  picture needs a ground line. Put the horizon at different heights; let the main subject sit off-centre sometimes;
  crop things at the edges on purpose sometimes.
- **Labels:** only the pictures marked "labels" below keep them (at most 3, ideally 2). Better still, put the
  word *in* the scene (on a sign, a tag, a screen, a sticker) instead of a row under the ground. Everyone else: no
  labels.
- **People:** vary them: different ages, heights, builds, hair (curly, bun, short, hijab, cap, bald), clothes and
  poses. Show hands doing things. Some pictures need only hands or no people at all.
- **Details that feel observed:** a scuffed edge, a coffee ring, a cable, a plant leaning to the light, uneven
  stacks. Small imperfections make it feel drawn by a person.

| Lesson | Framing | Labels |
|---|---|---|
| fund-1 library card | close-up: a hand holds the card to a scanner, shelves cropped behind | WITH SHARING, WITHOUT SHARING (on signs) |
| fund-2 locked columns | close-up of a laptop screen with the sheet and a padlock, robot hand on the keys | FLS |
| fund-3 guest list | night: garden party with string lights, host with the clipboard at the gate | none |
| fund-4 restaurant menus | top-down: a town map, a delivery van's route to two branches with their own boards | none |
| fund-5 departures board | indoor terminal, no sky | LOCAL, GMT (on the boards) |
| fund-6 vending machine | night: a glowing vending machine on a quiet street | none |
| fund-7 LEGO | top-down: bricks scattered on a rug, two hands building | none |
| fund-8 checkpoint | close-up: a handheld game console, the scene on its screen | none |
| fund-9 fridge note | close-up of the fridge door: magnets, the pizza note, a kid's drawing | none |
| auto-1 car wash | outdoor (may have a sun) | none |
| auto-2 trigger host | indoor: restaurant entrance seen from inside, host's back to us | none |
| auto-3 train | keep as is (approved) | keep |
| auto-4 finalizer | indoor: hall the morning after, low light through tall windows | none |
| auto-5 bakery | indoor (keep the night window) | BATCH APEX |
| auto-6 async delivery | top-down: a town map with a postcard, a parcel van and a moving truck on their routes | FUTURE, QUEUEABLE, BATCH (on the vehicles) |
| auto-7 radio | night: tower with a blinking light, houses with lit windows | none |
| auto-8 CDC diary | close-up: the diary under a desk lamp, evening | none |
| auto-9 callout | close-up: desk phone and the saved contact card | NAMED CREDENTIAL (on the card) |
| auto-10 drive-through | night: lit menu board and window, a car's headlights | none |
| auto-11 invocable | close-up: a hand pressing the custom brick into the set | none |
| auto-12 grading | top-down: a teacher's desk with papers being marked one by one | none |
| ui-1 scoreboard | night: stadium floodlights on the scoreboard | none |
| ui-2 whiteboard | indoor classroom (remove sky things) | none |
| ui-3 newspaper | outdoor dawn: low sun on the horizon, paper on the doorstep, phone by the window | @WIRE, IMPERATIVE |
| ui-4 hotel | cutaway: hotel floors as small stages (built, check-in, housekeeping, check-out) | CONSTRUCTOR, CONNECTED, RENDERED |
| ui-5 house notes | cutaway (keep), no sun/clouds | @API, EVENTS, LMS |
| ui-6 plug | close-up: the plug with its tag in front of three wall sockets | none |
| ui-7 dolls | indoor close-up: dolls on a wooden shelf in lamplight | none |
| ui-8 pizza | indoor kitchen | STANDARD, EXTENSION, CUSTOM (on order tickets) |
| ui-9 mosaic | close-up: two hands setting one new tile in a wall | none |
| ui-10 note glass | close-up (remove sun/clouds) | none |
| test-1 cooking show | indoor studio | none |
| test-2 race | top-down: an aerial view of a running track | STARTTEST, STOPTEST |
| test-3 library card | indoor library, evening lamps | none |
| test-4 fire drill | outdoor, overcast (no sun) | none |
| test-5 stunt double | indoor film set with studio lights | none |
| test-6 simulator | indoor hangar | none |
| test-7 camera | night (keep) | none |
| test-8 house build | outdoor (may have a sun) | SANDBOX, SCRATCH ORG |
| test-9 airport | indoor terminal from the x-ray belt | none |
| perf-1 allowance | dusk: fair lights coming on | 100 SOQL, 150 DML (on the booth) |
| perf-2 shopping list | close-up: a hand holding the long list over full bags | none |
| perf-3 book index | close-up (remove window sun) | none |
| perf-4 route map | close-up: a phone in a car holder, dashboard cropped | none |
| perf-5 checkout | indoor supermarket, no sparkles | none |
| perf-6 office cache | indoor office at night (keep) | ORG CACHE, SESSION |
| perf-7 waiter | indoor restaurant, warm lamps | none |
| perf-8 backpack | indoor: the backpack on a chair by the door | none |
| perf-9 library | indoor | SOSL, SOQL |

Check the full section side by side at the end: if two pictures share a composition, change one.
