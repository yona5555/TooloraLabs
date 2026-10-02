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
6. **(added after a compliance audit on tool 5, 2026-10-02) Every indicator's WORKED EXAMPLE
   table sits DIRECTLY BESIDE its chart/visual, never stacked below it** — per the repo rulebook
   §32 ("بجانبه لا أسفله"), already true of most of Triangle Calculator's own indicators
   (`flex flex-col gap-6 lg:flex-row lg:items-center`, visual wrapped `shrink-0` or
   `w-full lg:flex-1` for naturally wide visuals, `WorkedExampleNote` as the second flex child).
   Tools 1–4 were all audited and found to have this same violation (worked-example boxes
   stacked in a separate `mt-4` div below the visual instead of beside it) — see the dedicated
   note below. **Every tool from 5 onward must get this right from the first draft**, not fixed
   after the fact.

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
| 1 | scientific-calculator | done (v2) | 456a6e8, layout fix c60905e (CI green) |
| 2 | fraction-calculator | done (v2) | d91a318, layout fix 0e2de64 (CI green) |
| 3 | scientific-notation-converter | done (v2) | a6bd5fe, layout fix 48dc7e8 (CI green) |
| 4 | significant-figures-calculator | done (v2) | f21f9b4, layout fix 37dbf3f (CI green) |
| 5 | statistics-calculator | done (v2) | 7101000, layout fix 8497ae5 (CI green) |
| 6 | area-calculator | done (v2) | 65511c2 (CI green) |
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

**scientific-notation-converter (tool 3, rebuilt to v2):** this tool has FOUR operation modes
(toScientific, toStandard, multiply, divide), each using a different subset of the shared fields
(`standardValue`, `coefficientA/exponentA`, `coefficientB/exponentB`). "A" conceptually means a
different live source depending on mode: in toScientific mode the real A is the engine's own
normalization of `standardValue` (the raw coefficientA/exponentA fields sit inert, unshown in the
input panel in that mode); in every other mode A maps directly to the user-edited
coefficientA/exponentA. Added `deriveEffectiveA(dims)` to `ScientificNotationLiveContext.tsx` —
one shared helper every indicator and the hero itself now call, so "A" means the same thing
everywhere instead of each file re-deriving it (or worse, several reading the inert raw fields
directly). The hero shows one draggable point for A always, plus a second for B that appears only
in multiply/divide mode — dragging A in toScientific mode writes a recomputed `standardValue`
back; in other modes it writes coefficientA/exponentA directly.

*Real systemic bug caught before shipping, not via screenshot this time but via the dynamism
test's first failing run*: 13 of the 15 new indicators read `dims.coefficientA`/`exponentA`
directly instead of deriving A properly — meaning on the tool's own default page load (mode =
toScientific, where those raw fields are literally `"0"`, unused placeholders), nearly every
indicator was silently rendering degenerate "0 × 10^0" content instead of the real normalized
form of the default `standardValue` (299792458). Only 3 of 15 had explicit `=== 0` null-guards
(DivideFormulaDiagram, NormalizationSteppedDiagram, SignificantFiguresAmbiguity) and so simply
vanished instead of showing wrong data — worse for test visibility, but the same underlying bug.
Fixed systemically by adding `deriveEffectiveA` and switching every A-reading indicator to call
it instead of touching `dims.coefficientA`/`exponentA` raw, rather than patching each file's
symptom separately.

*Two indicators intentionally keep the RAW coefficientA* (`CoefficientRangeZoneStrip`,
`NormalizationSteppedDiagram`) even after adopting `deriveEffectiveA` — their entire pedagogical
point is showing a coefficient that can legitimately fall outside [1, 10), which the engine's own
normalized output never does by construction. Also changed the toScientific mode's default raw
`coefficientA` from the inert `"0"` to a deliberately out-of-range `"45.2"` (exponent `"3"`) and
toScientific/toStandard's default `coefficientB`/`exponentB` from `"0"`/`"0"` to `"3"`/`"4"` —
the old all-zero placeholders were themselves the root design flaw, not just incidentally
unused; every indicator now has a real, meaningful number to show in every mode without the user
needing to switch modes first.

*Text-diffing blind spot caught and fixed*: `NamedMagnitudesTable`'s only live element was a
conditional highlight tag that doesn't appear at all unless A's exponent exactly matches one of
nine named magnitudes — dragging the hero to an exponent that matches no name left the card's
text byte-identical before/after (genuinely reactive internally, invisible to text-diffing). Fixed
by discovering the translation itself never interpolated the `{exponent}` parameter it was already
being passed — corrected `namedMagnitudes.intro` across all 6 locales so the caption always states
A's current exponent explicitly in text, which is also better UX than relying on an easily-missed
conditional tag. All 15/15 pass the generic dynamism test (single-point drag, toScientific mode)
and gaps test; multiply-mode (two-point) behavior spot-checked manually and confirmed correct
(A × B recomputes and renormalizes live).

**significant-figures-calculator (tool 4, rebuilt to v2):** `rawValueA`/`rawValueB` are STRINGS
here, not parsed numbers — significant figures are a property of how a number was *written*
("100" vs "100." carry different precision despite being numerically equal), so the live context
(`SignificantFiguresLiveContext.tsx`) keeps them as strings rather than following the earlier
tools' pattern of storing parsed numbers. Reused the engine's own exported pure functions
(`countSignificantFigures`, `countDecimalPlaces`, `roundToSigFigs`) directly in indicators rather
than calling `execute()` for the ones that are really about digit structure, not a full
calculation — matching the established "reuse already-exported pure functions" precedent from
the original (v1) rollout. Kept `DigitSignificanceDisplay.tsx`'s own exported
`computeDigitSignificance` (used above-fold) as a shared rendering utility, reused by both the
hero and `CountingStepsTimeline`.

*Same systemic empty-default bug as tool 3, caught before building indicators this time*: the
default "count" and "round" operation modes had `valueB: ""` (empty), which would have made every
B-dependent indicator (AddSubtractWorkedFlow, MultiplyDivideWorkedFlow, SigFigCountComparisonBarChart,
PrecisionRankedComparison, SigFigsAfterOperationTable) silently vanish on the tool's own default
page load. Fixed by giving `count`/`round` a real non-empty `valueB` default ("2.33") before
writing any indicator that depends on it, rather than discovering it via a failing test run again.

*Legitimately federated hero*: the hero drags `roundToDigits` (an integer precision target, 1-8)
— a real, independently meaningful live dimension, but one essentially unrelated to most of these
15 indicators' own topics (zero classification, decimal-vs-sigfig count, trailing-zero ambiguity,
etc., which are about `rawValueA`'s own *written structure*, not about a chosen rounding target).
Forcing all 15 to depend on `roundToDigits` would be the artificial §23 connection the rollout's
own rule forbids. Only the hero itself and `RoundingRulesTable` (which explicitly highlights the
current rounding level among five precomputed rows) are genuinely `roundToDigits`-aware; the
other 14 are `rawValueA`/`rawValueB`-dependent. Used a tool-specific dynamism test
(`dynamism-test-significant-figures-calculator.js`) verifying both real interaction paths: hero
drag → hero + RoundingRulesTable change; editing the real `valueA` field → all 14 other
A-dependent indicators change. All 15 pass. (The generic template's hero-signature selector also
grabbed the wrong DOM sibling for this tool specifically — the digit-significance mask row sits
between the badges and the Mafs canvas, so `canvas.previousElementSibling` caught the mask, not
the badges; confirmed via direct inspection that the real badges did update correctly before
concluding a tool-specific test — not a product bug — was needed.)

*One computation kept deliberately separate from the engine's own `execute()`*:
`ExactNumbersVsMeasuredNumbers` models an exact count (12, infinite implied precision) multiplied
by the measured live A — the calculator's own multiply operation has no concept of "exact"
inputs and would incorrectly apply `min(sigFigsA, sigFigsB)`, treating "12" as a 2-sig-fig
measurement and corrupting the real answer. Computed directly with the exported `roundToSigFigs`
using `sigFigsA` alone instead, rather than calling `execute()` and reporting a plausible-looking
but actually wrong number.

**statistics-calculator (tool 5, rebuilt to v2):** the hero (`StatisticsDataPointsDrag.tsx`) holds
up to 8 movable points on a number line, each bound to one real value in the live dataset
(`dims.rawData`, a comma-separated string shared with the real above-fold field) via a new
reusable `useSyncedPoint(initialValue, color, onDragCommit)` hook — called a FIXED 8 times every
render regardless of the real dataset's length (React's rules-of-hooks requirement), with unused
slots simply not rendered. All 15 indicators re-derive from the same `parseDataSet(dims.rawData)`
and the existing `StatisticsCalculator` engine, so editing the field or dragging any point updates
every one of them together.

*Real finding from the dynamism test, not a coincidence at first glance*: the generic template's
default (180,-110) drag on point[0] left "Share of Data Within One Standard Deviation" textually
unchanged (75%→75%) even though the underlying mean/stddev genuinely shifted — confirmed by hand
that this was a real numerical coincidence (the within-1σ *count* stayed 6/8 despite different
members), not a stale/non-reactive component. A second default dataset landed on the same 75%
again — for small, clustered datasets, 75% within one sigma is just a common outcome, not a fluke
specific to one example. Fixed by writing a tool-specific test
(`dynamism-test-statistics-calculator.js`) that edits the field to a dataset with a single sharp
outlier (guarantees a decisively different within-σ share) for Phase 1, and drags an inner
*duplicate* point (one of three repeated "4"s) by a large, decisive delta for Phase 2 — turning a
repeated value into a new near-outlier reliably shifts mean, stddev, mode structure, and σ-band
membership together, unlike a modest drag on an edge point.

*Also found during Phase 2 of that same test build*: dragging the hero immediately after an
Playwright `input.fill()` reset intermittently grabbed a stale, off-screen bounding box (the page
had scrolled/reflowed between the reset and the drag) — fixed by re-calling
`hero.scrollIntoViewIfNeeded()` right before measuring the point's box on every phase, not just
once at the start of the script. Not a product bug — a test-script ordering issue.

**Mid-rollout compliance audit, applied retroactively to tools 1–5 before continuing (2026-10-02):**
re-reading the project rulebook's §32 in full (not just the parts remembered from earlier in the
session) surfaced a real, systemic violation across every tool shipped so far: §32 requires every
indicator's WORKED EXAMPLE table to sit **directly beside** its chart/visual
(`flex flex-col gap-6 lg:flex-row lg:items-center`, visual `shrink-0` or `w-full lg:flex-1`), never
stacked below in a separate `mt-4` block — a rule Triangle Calculator's own indicators already
follow correctly in most files. Of 74 indicator files checked across the first 5 tools, only 6
already used the side-by-side pattern (by incidental reuse of `EduBarChart`'s established
wrapper); the other 68 had the worked-example box stacked underneath instead. Fixed all 5 tools
(statistics-calculator directly; scientific-calculator, fraction-calculator,
scientific-notation-converter, and significant-figures-calculator via four parallel subagents,
each given the exact wrapping pattern and the already-fixed statistics-calculator files as
reference) — pure layout restructuring, zero logic/translation/computed-value changes, re-verified
with lint, typecheck, each tool's dynamism and gaps tests, and a fresh screenshot capture.
Commits: statistics-calculator `8497ae5`, scientific-calculator `c60905e`, fraction-calculator
`0e2de64`, scientific-notation-converter `48dc7e8`, significant-figures-calculator `37dbf3f` — all
CI green. **Every tool from 6 onward is built with this layout correct from the first draft.**

**area-calculator (tool 6, rebuilt to v2):** this tool's nature is fundamentally different from
every prior tool in the rollout — it supports 8 distinct shapes (square, rectangle, triangle,
circle, ellipse, trapezoid, parallelogram, sector) behind one shape selector, each with its own
field set, rather than one fixed set of dimensions. The hero (`AreaShapeDrag.tsx`) redraws
whichever shape is currently active via Mafs primitives (`Polygon`/`Circle`/`Ellipse`), with 1 or
2 draggable handles whose real-world meaning is derived per shape rather than being generic: a
single point constrained to the y=x diagonal for a square (controls `side`), an unconstrained
corner point for a rectangle (controls `width`+`height` from one drag), a free polar point for a
sector (`radius` = distance from origin, `angleDegrees` = angle from the positive x-axis, both
from a single point), two points for triangle/parallelogram (one on the x-axis for `base`, one on
a tracking vertical line for `height`), and so on — all synced bidirectionally into the same
`AreaLiveContext` (`dims` = the real above-fold `AreaDraft`, written on every keystroke, not
gated behind this tool's existing "Calculate" button) that drives all 15 indicators.

*Two real, independent bugs found and fixed before/during this build, not cosmetic:* (1) switching
the shape selector left every shape but the page's own default (square) with empty dimension
fields — the exact "degenerate empty default" bug class from tools 3–4, except here triggered by
a *shape switch* rather than an *operation-mode switch*. Fixed proactively by adding
`SHAPE_DEFAULTS` (real, non-degenerate example dimensions per shape) and wiring the shape
`<select>`'s `onChange` in `AreaInputPanel.tsx` to apply them. (2) the production build was
already failing before this rebuild touched anything: `tools.area-calculator.aboveFold.quickReference`
was entirely missing from all 6 locale files (the `aboveFold` namespace didn't exist at all for
this tool), breaking `npm run build` with `MISSING_MESSAGE` errors in every locale — this was
first noticed as a tangential finding while verifying statistics-calculator's build output, and
fixed for real once area-calculator became the tool actually being worked on, by adding the
missing namespace to all 6 locales.

*15 indicators designed around universal, shape-agnostic concepts* (since no single live
dimension generalizes across all 8 shapes the way `rawData` did for statistics-calculator):
a live formula-substitution diagram and computation-steps timeline for whichever shape is active;
a tagged reference table and bar chart ranking all 8 shapes' area at the same live "characteristic
length" as the active shape; a balance comparison against a same-size square; a bounding-box fill
ratio and an isoperimetric compactness ratio (zone strip, gracefully falls back to live
explanatory text for the 4 of 8 shapes whose perimeter isn't determined by the given dimensions
alone — triangle, ellipse, trapezoid, parallelogram); a ±20% measurement-error sensitivity trio; a
continuous Mafs curve of area-vs-scale-factor; a stepped 1×/2×/4× doubling diagram; a composite-
copies flow and a real cost-per-area estimator (each with its own embedded live control per §20);
a unit-conversion equivalence; a real-world log-scale placement bar; and a two-dimension
comparison card pair. Verified across all 8 shapes manually (not just the default square) — every
shape produces the correct point count (1 or 2) and genuinely recomputes area/perimeter on drag.
