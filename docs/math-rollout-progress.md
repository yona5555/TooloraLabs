# Math Category Rollout — Progress

Generalizing the Triangle Calculator design (§36 interactive hero diagram + 15 distributed
indicators + redistributed encyclopedic sections) to the remaining 21 tools in the `math`
category (`apps/web/data/tools.ts`).

Reference implementation: Triangle Calculator (`apps/web/components/tools/triangle-calculator/`).

Shared infrastructure built once, reused by every tool below (not duplicated per tool):
- `apps/web/lib/use-dark-mode.ts` — dark-mode detection hook
- `apps/web/components/tool-ui/mafsTheme.css` — generic Mafs canvas theme fix (`.mafs-canvas` scope)
- `apps/web/components/tool-ui/MafsHoverPrimitives.tsx` — generic hover-tooltip primitives for Mafs children
- `apps/web/components/tool-ui/WorkedExampleNote.tsx`, `apps/web/components/tool-ui/EduBarChart.tsx` — generic worked-example note / bar chart

**Standing rule (clarified 2026-09-30, applies to tool 2 onward):** any indicator a tool already
has, if reused verbatim during its rollout pass, must still be rebuilt to the same depth bar as a
brand-new one — a real worked example, real computed numbers, genuine dynamism where the tool's
nature allows it. Never keep a shallow pre-existing diagram just because deleting it is more work;
delete it and build its replacement fresh. (Applied starting with fraction-calculator, whose 5 old
static diagrams were deleted and rebuilt; scientific-calculator's `OrderOfOperationsDiagram.tsx`
predates this clarification and is flagged here as a candidate for a follow-up pass if revisited.)

## Status legend
- `not started`
- `in progress`
- `done` — verified (lint/typecheck/test/build pass), screenshotted, committed, pushed, CI checked

## Tools (21)

| # | Slug | Status | Commit |
|---|---|---|---|
| 1 | scientific-calculator | done | e0854da |
| 2 | fraction-calculator | done | b3b87c1 (CI green) |
| 3 | scientific-notation-converter | done | 7b088b6 (CI green) |
| 4 | significant-figures-calculator | done | 05c44e6 (CI green) |
| 5 | statistics-calculator | done | c5218b2 (CI green) |
| 6 | area-calculator | done | 7d947cb |
| 7 | surface-area-calculator | done | (pending push) |
| 8 | volume-calculator | not started | |
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

## Notes / tools where a real drag interaction wasn't possible

(filled in per-tool as encountered, with reasoning)
