# TEST RESULTS — result-analyzer-bd

Run #81 (2026-10-17, 13:00 slot). All checks run for real; nothing invented.

## Unit tests — 21/21 blocks passed

`node tests/test_logic.cjs` — pure logic in `js/logic.js`:

- Grade-band boundaries: every threshold verified (80/79.99, 70/69.99,
  60/59.99, 50/49.99, 40/39.99, 33/32.99), plus out-of-range/NaN → null.
- GPA with 4th-subject excess: 7 compulsory (5,5,4,4,3.5,3,2 = 26.5) + 4th A
  (4.0, excess 2.0) → (26.5+2.0)/7 = **4.07**, grade A, total 557, avg 69.63.
- GPA without 4th subject: 2× A+ → 5.00, golden true.
- 4th subject at C (2.0) adds zero excess → GPA stays 5.00.
- GPA capped at 5.00 (compulsory 5+5 with 4th A+ excess 3 → capped).
- Compulsory fail → whole result F, GPA 0.00, failedSubjects lists the subject.
- 4th-subject fail does NOT fail the result (GPA 5.00, golden false).
- Golden A+ requires A+ in every subject including the 4th.
- Empty subjects → not passed, GPA 0, total 0, average 0.
- Grade distribution counts (A+×1, A×2, F×1).
- What-if delta: (5+3.5)/2=4.25 → (5+5)/2=5 → delta **+0.75**.
- Target GPA: reachable (need avg 4.0 → band A, min 70), impossible
  (GP 2 + 1 remaining cannot reach 5.0), already-met (band "any"),
  needs-exactly-B (avg 3.0, min 50), bad args rejected.
- Validation: subject errors, sheet/import errors (wrong app/version,
  duplicate 4th, duplicate sheet id, null shape).
- Draft rows (marks null/undefined) excluded from GPA; validateSheet accepts them.
- round2 rounds half away from zero (2.345→2.35, −2.345→−2.35).

Repairs during unit testing (both genuine logic bugs, fixed + re-verified):
1. **Band lookup**: `GRADE_BANDS.find(b => neededAvg <= b.point)` on the
   descending list always returned A+; fixed to search the ascending list, so
   "need avg 4.0" correctly maps to band A (70+).
2. **Test expectation**: "already met" case asserted band "any" for a
   scenario that genuinely needs 3.0 (B) — test corrected to a true
   already-met scenario plus a separate needs-exactly-B case.

## Headless-Chrome smoke — 34/34 checks passed

`node tests/smoke.cjs` (raw CDP against /opt/meta-chromium/chrome, file://,
fresh profile, zero console/page errors):

- Title / H1 / 3 tabs render.
- Add Mathematics 85 → GPA 5.00, Passed, total 85.
- Add Physics 45 → GPA 3.50, grade A−.
- Tick Physics as 4th → GPA back to 5.00, 4th badge shown.
- What-if Math → 70 → "GPA 4.00, change −1.00"; GPA still 5.00 after
  (what-if does not save).
- Target GPA 5 with 1 remaining → needs 80 marks (A+).
- Empty-name submit → inline error, row count still 2.
- Add Chemistry 20 (compulsory) → GPA 0.00, Failed, fail note names Chemistry.
- BN toggle → button shows "English", total renders "১৫০" (85+45+20),
  H1 renders "ফলাফল বিশ্লেষক".
- Reload → 3 subjects + GPA 0.00 persist (localStorage).
- Science preset → 12 rows, blank marks → GPA "—" (draft rows excluded).
- Import pasted JSON (Accounting 88 + Finance 76) → "Imported", GPA 4.50.
- Malformed import (wrong app) → rejected, data intact (GPA still 4.50).
- Erase: wrong word blocked (message names DELETE); DELETE → erased,
  0 rows.
- 390px mobile: `documentElement.scrollWidth <= 390` (no horizontal overflow).
- Zero console/page errors across the whole run.

Repairs during smoke testing: harness-only — the first CDP harness used
`Target.sendMessageToTarget` with `flatten:true`, which Chrome rejects in
flat mode (commands must carry a top-level `sessionId`). Harness fixed; the
app itself needed no changes (0 app bugs in smoke).

## ASCII hygiene

`grep -rP '[^\x00-\x7f]'` over `js/`, `index.html`, `css/`, `tests/` → zero
matches. Bengali lives as `\uXXXX` escapes in JS and numeric entities in HTML.
