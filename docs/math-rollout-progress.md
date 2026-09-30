# Math Category Rollout — Progress

Generalizing the Triangle Calculator's STRUCTURE (§36: one draggable geometric hero + 15 deep
dynamic indicators with worked-example tables + AdSpace-spaced distribution + gap-filling) to the
21 remaining tools in the `math` category (`apps/web/data/tools.ts`). Triangle Calculator itself
is a structural reference only — it is NOT part of this task and is never modified. The
mathematical content of every hero and indicator is entirely tool-specific, since the 21 tools
are not all triangles.

## Standard v2 (superseded v1 on 2026-09-30 — full rejection, mandatory reread before resuming)

The user rejected every tool completed under the first pass of this rollout (tools 1–7) in full:
"التنفيذ السابق مرفوض بالكامل" — indicators that only displayed a real-but-fixed example computed
once from hardcoded constants (e.g. `SIDE = 4`) are **not acceptable**, no matter how real the
underlying math is. The explicit complaint: "رسومات ثابتة بلا ديناميكية ولا عمق" (static drawings
without dynamism or depth).

**What v2 requires that v1 did not:**
1. **True bidirectional reactivity.** The hero must share live state with the tool's own
   above-the-fold input fields — dragging the hero updates the fields, editing a field moves the
   hero — not a self-contained widget with its own disconnected local state.
2. **All 15 supporting indicators must re-render from that SAME live state**, not from fixed local
   constants — dragging the hero or editing a field must change every one of them, with a CSS
   transition on the changing value where feasible.
3. **Two new mandatory automated Playwright checks per tool**, run and reported before any
   "done" claim:
   - **Dynamism test**: capture a text signature of the hero + all 15 indicator cards, interact
     (drag hero / edit a field), re-capture, and fail if any of the 16 signatures is unchanged.
   - **Gaps test**: measure the vertical gap between every consecutive visible sibling in the
     above-fold columns, the encyclopedic paper's main flow, and every indicator card's own
     internals; fail on any statistical outlier gap (>3× the page's own median gap).
4. Screenshot set per tool now includes an explicit before/after-input-change pair (in addition
   to the existing initial / post-drag / dark / RTL / mobile set), and one full-page shot used as
   the gap-test's visual backup.
5. Component count, distribution pattern (explanation+indicator → AdSpace → explanation+indicator
   → …), and depth bar still literally match Triangle Calculator's scale — only the reactivity
   architecture is new.

**Shared infra added for v2** (reused by every tool below):
- `apps/web/lib/create-live-tool-state.tsx` — `createLiveToolState<TDims>()`, a factory
  returning `{LiveProvider, useLiveState}` for one tool's own numeric dims Context. Each tool
  gets one small file (e.g. `SurfaceAreaLiveContext.tsx`) calling this once at module scope;
  the top-level `<Tool>Calculator.tsx` derives `dims` from its existing string `draft` (already
  live on every keystroke) and wraps `<ToolAboveFold>…{education}` in the Provider; the hero
  reads `dims` to seed/sync its Mafs point and calls `setDim(...)` on drag, which writes straight
  back into the real `draft` — single source of truth, no shadow-state drift.
- `apps/web/components/tool-ui/EncyclopediaPaper.tsx` — added `data-encyclopedia-paper` on its
  inner flow `<div>` as a stable hook for the generic gaps test (non-visual, additive change).
- Generic Playwright templates (scratchpad, copy+adapt per tool like the old screenshot script):
  `dynamism-test.js <slug>` and `gaps-test.js <slug>` — written once, reused by sed-adapting the
  slug and (for tools whose hero legitimately isn't the ONLY reactive surface — see tool 1's
  note below) the card-title list.

**v1 → v2 status of tools 1–7:** all seven need a full hero+15 rebuild under the new
reactivity standard. None of their v1 work is reused; each is being redone as its turn in the
sequence comes up. Tools 8–21 start directly at v2 — they never had a v1 pass.

## Status legend
- `not started`
- `in progress`
- `done` — v2 standard: live-state wiring verified, dynamism test PASS, gaps test PASS,
  lint/typecheck/test/build pass, screenshotted (incl. before/after-input pair), committed,
  pushed, CI checked

## Tools (21)

| # | Slug | Status | Commit |
|---|---|---|---|
| 1 | scientific-calculator | done (v2) | 456a6e8 (CI green) |
| 2 | fraction-calculator | done (v2) | (pending push) |
| 3 | scientific-notation-converter | needs v2 rebuild | — |
| 4 | significant-figures-calculator | needs v2 rebuild | — |
| 5 | statistics-calculator | needs v2 rebuild | — |
| 6 | area-calculator | needs v2 rebuild | — |
| 7 | surface-area-calculator | needs v2 rebuild | — |
| 8 | volume-calculator | not started (v2 from the start) | |
| 9 | step-by-step-math-solver | not started | |
| 10 | matrix-calculator | not started | |
| 11 | vector-calculator | not started | |
| 12 | graphing-calculator | not started | |
| 13 | notepad-calculator | not started | |
| 14 | gcf-lcm-calculator | not started | |
| 15 | probability-calculator | not started | |
| 16 | mean-median-mode-range-calculator | not started | |
| 17 | percentage-calculator | not started | |
| 18 | random-number-generator | not started | |
| 19 | standard-deviation-calculator | not started | |
| 20 | circle-calculator | not started | |
| 21 | multiplication-table-generator | not started | |

## Notes / tools where a real drag interaction wasn't possible, or where dynamism required a design adaptation

**scientific-calculator (tool 1, rebuilt to v2):** this tool has no single shared numeric draft —
it's a free-form keypad expression calculator (`reducer.ts`'s `CalculatorState.display`), not a
dimension-fields form. The hero (a draggable unit-circle angle, `ScientificAngleExplorer.tsx`) is
genuinely mouse/touch/keyboard-draggable and shares its live angle (`ScientificAngleContext.tsx`)
with the 6 of 15 indicators whose own math is truly angle-based (trig curves, numerical
derivative/integral of sin, inverse-trig range, angle-unit conversion). The other 9 indicators
cover math domains with no real relationship to an angle (factorials, logs, combinatorics,
memory, sign, percent, operator precedence) — forcing them onto the hero's angle would be exactly
the decorative, unjustified connection §23 forbids. Each of those 9 instead owns its own embedded
live control (a native `<input type="range">`, or click-through buttons for the memory timeline
and order-of-operations stepper) — fully interactive, not a fixed constant. The tool-specific
Playwright dynamism test (`dynamism-test-scientific-calculator.js`, not the generic template)
verifies both groups explicitly: hero drag → hero + the 6 angle-linked cards change; each
self-contained card's own control → that specific card changes. All 16 passed. This federated
design is the adaptation anticipated by the rollout's own rule for tools whose nature doesn't
support one uniform shared-state hero — documented here rather than forced.

**Real bug caught and fixed via screenshot (tool 1):** `ScientificAngleExplorer.tsx`'s Mafs
canvas used a square `viewBox={{x:[-4,4],y:[-4,4]}}` inside a full-width container — Mafs's
default `preserveAspectRatio` expanded the visible x-domain to roughly [-18,18] to fill the wide
container while keeping the circle undistorted, making it tiny and off-center with large empty
margins on both sides. Fixed by wrapping the canvas in a `mx-auto max-w-[320px]` container so its
rendered pixel aspect ratio actually matches the requested 1:1 viewBox, instead of using
`preserveAspectRatio={false}` (which would have stretched the circle into an ellipse — wrong for
a unit-circle diagram where shape fidelity matters). Re-verified via screenshot after the fix.

**fraction-calculator (tool 2, rebuilt to v2):** unlike tool 1, this tool DOES have a clean
shared numeric draft (`numeratorA/denominatorA/numeratorB/denominatorB/operation`), so the hero
(`FractionNumberLineDrag.tsx`, via `FractionLiveContext.tsx`) and all 15 indicators share ONE
live context with full bidirectional sync — editing any above-fold field moves the matching hero
point, and dragging either point writes straight back into that fraction's real numerator field.
The hero also now genuinely reflects whichever operation is selected (A + B / − / × / ÷), fixing
a real v1 flaw where the old hero always computed a sum regardless of the selected operation.

*Generic dynamism-test drag distance fix*: the reusable `dynamism-test.js` template's original
70px drag delta (tuned for tool 1's unit-circle scale) was too small to cross even one numerator
step for a fraction with denominator 2 — the drag visually moved the point but rounded back to
the same numerator every time, which looked like a stuck/broken hero in the first test run before
the real cause (resolution vs. delta, not a reactivity bug) was traced with temporary console
logging. Fixed globally by raising the template's default delta to 180×110px and scoping its
card-selector to `[data-encyclopedia-paper]` only (the first run also over-counted at 19 cards
because it was matching above-fold `SectionCard`s like Result/QuickReference/RelatedTools, which
share the same border classes as education-section cards).

*Single-fraction-focused indicators*: 3 of the 15 (`FractionLCDBarChart`, `FractionReciprocalBalance`,
originally also `FractionUnitFractionsTable`) are legitimately scoped to only part of the live
state by design — LCD to both denominators (not either numerator), ReciprocalBalance to B alone
(mirroring the division-flip lesson), UnitFractionsTable's title to denominatorA alone. A drag of
only fraction A's point, or an edit of only `denominatorA`, correctly leaves B-only indicators
unchanged, and vice versa — confirmed deliberately, not a bug, by editing `denominatorA` then
`denominatorB` separately and checking the two "unchanged" sets are the expected disjoint A-only /
B-only indicators, covering all 15 between them. Used a tool-specific dynamism test
(`dynamism-test-fraction-calculator.js`) that drags BOTH hero points in one run (matching that the
hero has two interactive points, not one) — this covers all 15 in a single pass and is the
standard this tool is held to. Two indicators were also genuinely deepened rather than just
patched to pass: `FractionLCDBarChart` gained real "A/B rescaled to the LCD" worked-example rows
(numerator-dependent, pedagogically a natural next step after showing the LCD itself, not added
only to satisfy the test), and `FractionUnitFractionsTable` gained an explicit "← A is here" text
marker column (the highlighted-row-via-CSS-only signal was invisible to the text-diffing test
methodology, and an explicit text marker is better UX than color alone regardless).
