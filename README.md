# Result Analyzer BD

Offline bilingual (EN / বাংলা) SSC / HSC result analyzer for Bangladesh. Enter
subject marks, get the GPA under the real Bangladesh board grading system —
including the **4th-subject (optional subject) rule** — plus a what-if simulator
and a target-GPA planner. No server, no account, no network calls: everything
lives in your browser's localStorage.

## Why this exists

University CGPA calculators (credit-hour based) do not model the SSC/HSC
system. School/college results in Bangladesh use a grade-point table plus a
special rule for the 4th subject: only the points *above 2.00* count, and
failing the 4th subject does not fail the whole result — while failing any
compulsory subject does. This app implements exactly those rules, so students
can check a mock/test result or plan what they still need.

## Features

1. **Result sheets** — multiple named sheets (e.g. "SSC Test", "HSC Mock"),
   each with its own group (Science / Commerce / Arts / Other).
2. **Subject entry** — name + marks (0–100) + 4th-subject flag, with inline
   validation (empty name, out-of-range marks, duplicate 4th subject). Marks
   are editable in place; only one 4th subject per sheet.
3. **GPA engine** — Bangladesh board grade table, 4th-subject excess rule,
   5.00 cap, whole-result fail on any compulsory F, "Golden A+" detection
   (A+ in every subject including the 4th), grade distribution, total/average.
4. **Group presets** — one tap loads the standard subject list for Science,
   Commerce, or Arts; marks stay blank until you enter them (draft rows never
   affect the GPA).
5. **What-if simulator** — try different marks for any entered subject and see
   the GPA change instantly. Nothing is saved.
6. **Target GPA planner** — "I want GPA 4.50 with 2 subjects left": tells you
   the average grade points (and minimum marks band) those subjects need, or
   that the target is impossible.
7. **Backup & restore** — JSON export / import with strict validation
   (wrong app, wrong version, duplicate 4th subject, bad marks all rejected
   with data intact), plus typed-`DELETE` erase-all.
8. **Bilingual + mobile** — EN/বাংলা toggle persisted across reloads,
   Bengali digits in BN mode, 390px mobile layout with no horizontal overflow.

## GPA rules (Bangladesh board system)

| Marks | Grade | Point |
|------:|-------|------:|
| 80–100 | A+ | 5.00 |
| 70–79 | A | 4.00 |
| 60–69 | A− | 3.50 |
| 50–59 | B | 3.00 |
| 40–49 | C | 2.00 |
| 33–39 | D | 1.00 |
| 0–32 | F | 0.00 |

GPA = (sum of compulsory grade points + max(0, 4th-subject points − 2.00))
÷ number of compulsory subjects, capped at 5.00.

Example: 7 compulsory subjects with points 5, 5, 4, 4, 3.5, 3, 2 (= 26.5)
and a 4th subject at A (4.00) → excess 2.00 → GPA = (26.5 + 2.00) ÷ 7 = 4.07.

## Stack

Vanilla HTML / CSS / JavaScript — no frameworks, no build step, no CDN.
`js/logic.js` holds the pure, Node-testable math; `js/app.js` holds the DOM.

## Run locally

Open `index.html` in any modern browser, or serve the folder:

```bash
npx serve .
# or
python3 -m http.server 8000
```

## Testing

```bash
node tests/test_logic.cjs   # pure-logic unit tests
node tests/smoke.cjs        # headless-Chrome (CDP) UI smoke tests
```

## Deployment

Static site — deploy the folder as-is to GitHub Pages, Netlify, or any
static host. No environment variables, no backend.

## Limitations

- Implements the widely-used board grading rules; individual boards/institutions
  may publish variations — verify official results with your board.
- Preset subject lists are the conventional SSC group subjects, not an
  official syllabus; edit names freely.
- Data lives in one browser's localStorage (per-device). Use Export JSON to
  move it elsewhere.
- Marks are self-reported; this app does not fetch or verify any official result.

## Status

MVP complete. Factory run #81 (2026-10-17, 13:00 slot).
