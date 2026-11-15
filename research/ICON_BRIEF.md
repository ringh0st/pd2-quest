# No more emoji: icon and art brief

The owner asked to remove every emoji from the app and replace them with something unique: vector art, a design package, animation. Several agents work on this in parallel, each on its own files.

## The system (already in the repo)

- **`src/components/icons/Icon.jsx`**: `<Icon name="flame" />` wraps Lucide line icons (MIT, `lucide-react`) with one stroke weight, sized in `em` so it follows the text-size setting. The semantic names are in `ICONS` (`home, map, cards, exam, me, settings, back, next, chevron, close, bolt, flame, coin, trophy, star, lock, target, gift, freeze, rocket, sparkles, crown, heart, skull, swords, brain, timer, idea, review, book, fund, auto, ui, test, perf, check, ok, wrong, warn, pause, play, park, retry, party, shirt, palette, …`).
  - Decorative by default (`aria-hidden`). Pass `label="…"` only when the icon alone carries the meaning.
  - `fill` paints the inside, e.g. a solid star or heart.
  - If you need a name that isn't there, add it to `ICONS` using any Lucide icon. Only add; never rename or remove.
- **`src/components/art/`**: unique vector art, owned by the illustrator agents. It starts as stubs with a FIXED API that you can import today:
  - `WorldEmblem({ world, size })`: `world` is one of fund, auto, ui, test, perf.
  - `BossArt({ world, size, mood })`: `mood` is idle, hit, taunt or defeated.
  - `Scenery({ world, variant })`: a decorative absolute background layer.
  - `HeroArt({ kind, size })`: `kind` is one of trophy, chest, rocket, star, levelUp, streak, goal, badge, welcome, flag, calm, oops, empty, lock, placement, plan, install.
  - `BadgeMedal({ id, earned, size })`.
- **Exam sections:** use `<Icon name={sec.id} />` (fund → shield, auto → workflow, ui → layout, test → flask, perf → gauge) wherever `sec.emoji` was used. Don't render `emoji` fields any more.

## Rules

1. After your work, no emoji may remain in the files you own: none in JSX, none in strings shown to the user (toasts, aria-labels, mascot lines, quest names, calendar titles). Typographic marks that are not emoji are also out, so replace `★ ✓ ✗ → ← ✕ ⏱ ⚠ ↻ ↩ ↔ ∞` with Icons too. Keep plain punctuation (·, –, —, quotes). To check, run:
   `python3 -c "import re,sys;[print(p,ln+1,l.strip()[:90]) for p in sys.argv[1:] for ln,l in enumerate(open(p,encoding='utf8')) if re.search('[\U0001F000-\U0001FAFF☀-➿⬀-⯿←-⇿⌀-⏿★✓✗✕]',l)]" <your files>`
2. **Look and feel:** a playful game for ADHD learners, with the warm tokens in `src/styles/tokens.css`: `--primary` (magenta or the chosen accent), `--gold`, `--correct`, `--incorrect`, `--flame-fill`, surfaces and text. Make it chunky and friendly. Icons sit inside rounded colored "tiles" where an emoji used to be a big visual, e.g. a 40px rounded square in `color-mix(in srgb, var(--accent) 18%, var(--surface))` with the icon in the accent color. Keep it consistent across screens. Never hard-code a color that breaks dark mode; use tokens or `color-mix`.
3. **Motion:** use `motion/react`, already in the app. Always respect `useReducedMotion()` from `src/hooks/useMotionPrefs.js` and Calm mode (`useStore(s => s.settings.calm)`). With either on, show static art. Keep idle loops subtle and short (a few repeats, not infinite), except the boss's gentle idle bob.
4. **Accessibility:** color is never the only signal; pair icons with words. Icons that are now the only content of a button need the button's `aria-label`. Keep existing labels, roles and focus behavior.
5. **Layout:** no horizontal overflow at 320px or at text scale 1.3. Icons use em sizes; tiles may use `calc(40px * var(--text-scale))`.
6. **CSS:** add styles only by APPENDING one clearly marked block at the end of `src/styles/global.css` (`/* ===== <your area> ===== */ … /* ===== end <your area> ===== */`). Never edit or reorder existing lines; other agents append too.
7. **Files:** edit only the files listed in your task. If something outside them must change, say so in your report instead of editing it.
8. **Checks:** `cd /home/user/pd2-quest && npm test && npm run build` must pass. A preview server may be running on http://localhost:4173/ serving `dist/`. Rebuild to refresh it; if nothing answers there, start your own with `npx vite preview --port <free port>` and stop it afterwards. Look at screenshots of your screens with Playwright (`require('playwright')`, `chromium.launch()`, deviceScaleFactor 1, 390x844, light and dark). Seed localStorage key `pd2quest.v1` with `{"v":1,"onboarded":true,"settings":{"theme":"light"}}` (add stars, coins and so on as needed). Don't commit.
