# YKI Finnish track: content brief (stage 1: worlds 1–3)

Read first: `reports/YKI Finnish exam prep.md` (the research report; sections "B1 means producing the core inflection",
"Retrieval, spacing and typed production" and "How to design the app's YKI track").

The learner: an English-speaking adult **complete beginner** living in Finland, aiming for YKI intermediate grade 3
(listening + writing pair), about 7–8 hours a week. Explanations are in **plain, simple English** (short sentences,
one idea per card). The Finnish taught is **standard written Finnish (kirjakieli)**. Mention spoken forms only in a
"tip" when useful (e.g. *mä* = minä in speech), never as the answer.

## Quality bar (most important)

- **Every Finnish word and sentence must be correct** standard Finnish: spelling, ä/ö, case endings, consonant
  gradation, vowel harmony, verb forms, word order. When unsure about a form, use a different, simpler example.
  Check forms against Wiktionary's declension/conjugation tables or Kielitoimiston sanakirja (kielitoimistonsanakirja.fi)
  if you can reach them; otherwise use only forms you are certain of.
- Use **high-frequency, everyday vocabulary** from the YKI topic of the world (see below). No rare words.
- Teach rules **explicitly and briefly** ("why"), then give 2–3 examples. Show the stem and ending separately when it
  helps: `talo|ssa`, `kadu|lla`. Name the pattern (e.g. "kk → k").
- Introduce one form at a time in a lesson; later lessons and the world's questions mix earlier forms (interleaving).
- No invented facts about Finland. Keep cultural notes to safe, common knowledge (sauna, Kela, terveyskeskus, HSL).
- Never use real exam questions. Everything is original.

## Files

One JSON file per world: `src/data/yki/<section>.json`:

| World | section id | Grammar spine | YKI topic setting | Writing |
|---|---|---|---|---|
| 1 Sounds and me | `sounds` | Alphabet & sounds, long vs short sounds, vowel harmony, personal pronouns, *olla* (present, all persons), verb type 1 present, -ko/-kö questions, negation (en, et, ei… + stem), numbers 0–100, time & days, greetings | Me and my background (name, country, languages, family, job) | Self-introduction (5–6 sentences) |
| 2 Around town | `town` | The six location cases (inessive -ssa/-ssä, elative -sta/-stä, illative -Vn/-hVn/-seen, adessive -lla/-llä, ablative -lta/-ltä, allative -lle) for nouns, with **consonant gradation in the strong→weak direction** (kk→k, pp→p, tt→t, k→∅, p→v, t→d, nk→ng, mp→mm, lt→ll, nt→nn, rt→rr); where? / from where? / to where?; *mennä/tulla/olla* + case | Travel and transport; places in town (kauppa, kirjasto, asema, apteekki, terveyskeskus, posti, pankki, ravintola) | Short message giving directions / where to meet |
| 3 Everyday verbs | `verbs` | Verb types 1–5 in the present (positive + negative, all persons), gradation in verbs (tavata → tapaan, lukea → luen), genitive singular, *minulla on* (possession), singular partitive (numbers 2+, *ei ole* + partitive, food/amounts: *kahvia, maitoa*), *haluta/tarvita* + partitive | Shopping and services (kauppa, kahvila, hinnat, ostoslista) | Invitation to a friend + shopping list message |

## JSON format

```json
{
  "id": "sounds",
  "title": "Sounds and Me",
  "weight": 10,
  "summary": "One plain sentence about the world.",
  "lessons": [ … ],
  "flashcards": [ … ],
  "questions": [ … ],
  "writing": [ … ]
}
```

### Lessons (10–12 per world)

```json
{
  "id": "sounds-1",
  "title": "Short title",
  "minutes": 3,
  "objective": "What you can do after this lesson, one sentence.",
  "cards": [ 4–9 cards ],
  "check": ["sounds-q1", "sounds-q2"],
  "terms": [ { "term": "vowel harmony", "say": "Plain meaning, max 45 words." } ]
}
```

Card types (each card's text: max 65 words; `body` supports `**bold**` and `` `code` `` marks; put Finnish words in
*backticks* so they stand out, e.g. `` `talossa` ``):

- `{ "type": "text", "title": "In plain words", "body": "…" }`: the rule, explained simply.
- `{ "type": "tip", "title": "Think of it like…", "body": "…" }`: a memory hook or pattern.
- `{ "type": "trap", "title": "Watch out", "body": "…" }`: a typical English-speaker mistake.
- `{ "type": "examples", "title": "Examples", "items": [ { "fi": "Asun Helsingissä.", "en": "I live in Helsinki." } ] }`:
  2–5 Finnish sentences with translations. Each gets a listen button (Finnish voice). **Use this a lot.**
- `{ "type": "table", "title": "Forms", "head": ["", "where?", "from where?", "to where?"], "rows": [["talo", "talossa", "talosta", "taloon"]], "body": "optional one-line note" }`:
  a small table (max 6 rows × 5 columns) for cases or conjugations.

`terms`: 0–4 key grammar words per lesson (e.g. "vowel harmony", "inessive", "consonant gradation", "stem"); each
`term` must appear in the cards' `body`/`items` text exactly. Optional.

`check`: 2–3 question ids from this world's questions whose `lesson` is this lesson.

### Questions (about 90 per world)

Every question has `id` (`<section>-q<n>`), `lesson` (the lesson it belongs to), `difficulty` (1 easy, 2, 3 hard),
`explain` (why the answer is right, naming the rule, max 50 words), and `source` (the reference, e.g.
`"Uusi kielemme: Consonant gradation"`, `"Kielitoimiston sanakirja: kauppa"`, `"Wiktionary: talo (declension)"`).
Mix across the world: about **45% type**, **15% order**, **15% listen**, **25% choose**.

1. **type** (type the right form in context; the core exercise):
   ```json
   { "id": "town-q1", "lesson": "town-2", "difficulty": 1, "kind": "type",
     "q": "Olen ___ (kauppa).", "hint": "in the shop",
     "answer": ["kaupassa"],
     "explain": "Inessive -ssa = in. kauppa has pp, which becomes p in the -ssa form (pp → p).",
     "source": "Uusi kielemme: Inessive case" }
   ```
   - `q` contains exactly one `___` gap and the base form in parentheses at the end (or an English cue in `hint`).
   - `answer` lists **every** acceptable form (e.g. with and without the pronoun if the gap is a whole phrase). The
     first one is shown as the correct answer.
   - Gaps are usually one word.
2. **order** (build the sentence from tiles; words already in their right forms):
   ```json
   { "id": "town-q30", "lesson": "town-3", "difficulty": 2, "kind": "order",
     "q": "Build the sentence: “We are going to the library.”",
     "tiles": ["kirjastoon", "Me", "menemme"],
     "answer": ["Me menemme kirjastoon", "Menemme kirjastoon"],
     "explain": "…", "source": "…" }
   ```
   - 3–7 tiles; every tile must be used in the first `answer`. List other correct word orders as extra answers only
     if they use exactly the same tiles. (Pro-drop variants without a tile are not possible: keep answers to the tiles.)
3. **listen** (Finnish is read aloud by a Finnish voice, max twice; the text is shown only after answering):
   ```json
   { "id": "sounds-q60", "lesson": "sounds-8", "difficulty": 2, "kind": "listen",
     "audio": "Hei! Minä olen Anna. Olen kotoisin Ruotsista. Asun nyt Tampereella.",
     "q": "Where does Anna live now?",
     "options": ["In Tampere", "In Sweden", "In Helsinki", "In Turku"],
     "answer": [0],
     "wrong": ["", "That is where she is from (Ruotsista = from Sweden).", "Helsinki isn't mentioned.", "Turku isn't mentioned."],
     "explain": "…", "source": "…" }
   ```
   - `audio`: 1–4 short, natural sentences (max 40 words), slow-paced vocabulary of the world.
   - Questions in English in worlds 1–2; from world 3, about half may be in simple Finnish (as in YKI).
4. **choose** (multiple choice; no `kind` field): exactly the existing format:
   ```json
   { "id": "verbs-q70", "lesson": "verbs-4", "difficulty": 2,
     "q": "Which form fits? Minulla ___ kaksi lasta.",
     "options": ["on", "olen", "ovat", "olla"],
     "answer": [0],
     "wrong": ["", "olen = I am; possession uses 'minulla on'.", "ovat = they are.", "olla is the basic form."],
     "explain": "…", "source": "…" }
   ```
   - Exactly 4 options (or 5 when two are correct, then `answer` has 2 indexes). `wrong[i]` is `""` for correct
     options and a short reason for each wrong one.
   - Distractors should be **diagnostic**: wrong case, wrong gradation, wrong vowel harmony, wrong person.
   - Good uses: structured input ("Which sentence means *I am going INTO the shop*?"), which word fits a gap, short
     reading (a 2–4 sentence notice or message in `q`, then the question), meaning of a word.
   - Keep the correct option from being the longest more than ~30% of the time; spread `answer` positions evenly.

### Flashcards (about 60 per world)

```json
{ "id": "town-f1", "front": "kauppa", "back": "shop · kauppa – kaupan – kauppaa – kauppoja · Olen kaupassa (I'm in the shop)." }
```
- Nouns: front = Finnish word; back = meaning · **key forms** (nominative – genitive – partitive – plural partitive) ·
  one short example.
- Verbs: back = meaning · infinitive – 1st person present – 3rd person past (e.g. `tavata – tapaan – tapasi`) · the
  case it takes if any (e.g. `pitää + mistä?`).
- Phrases/chunks are welcome (e.g. "Hauska tutustua!" = Nice to meet you).
- `back` max 40 words. Only forms you are certain of; if a key form is irregular or rare, give fewer forms.

### Writing tasks (2–3 per world)

```json
{
  "id": "sounds-w1",
  "lesson": "sounds-10",
  "title": "Introduce yourself",
  "type": "informal",
  "situation": "You join a Finnish course. Write a short message to the group introducing yourself.",
  "points": ["your name", "where you are from", "where you live now", "what languages you speak", "one thing you like"],
  "words": [30, 60],
  "model": "Hei kaikki! Minä olen Sami. Olen kotoisin Englannista. …",
  "checklist": ["I wrote a greeting (Hei / Moi)", "I covered all 5 points", "Verbs agree with the person (minä olen, minä puhun)", "I ended with my name"],
  "phrases": ["Hei kaikki!", "Olen kotoisin …", "Puhun …", "Terveisin, …"]
}
```
- `type`: `informal` | `formal` | `opinion`. Stage 1 worlds use mostly `informal`, simple ones.
- `model` uses only grammar taught up to that world. 3–6 `checklist` items; 4–8 useful `phrases`.

## Lesson order inside each world

Follow the research's learning order. World 1 starts from absolute zero: letters and sounds (ä, ö, y; long vowels
and double consonants change meaning: *tuli/tuuli/tulli*), vowel harmony (front vs back vowels), then pronouns +
*olla*, then verb type 1 (puhua, asua) present tense, questions with -ko/-kö, negation, numbers, days and time,
greetings and introducing yourself. World 2 and 3 as in the table. Each lesson: 4–9 cards, rule → tip/trap →
examples → table where useful. Lessons ~3 minutes.

## Before you finish

Run `node scripts/validate-content.mjs src/data/yki/<section>.json` and fix every error. Then re-read every Finnish
sentence once more for correctness.
