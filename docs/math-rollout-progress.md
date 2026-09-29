# Math Category Rollout — Progress

Generalizing the Triangle Calculator design (§36 interactive hero diagram + 15 distributed
indicators + redistributed encyclopedic sections) to the remaining 21 tools in the `math`
category (`apps/web/data/tools.ts`).

Reference implementation: Triangle Calculator (`apps/web/components/tools/triangle-calculator/`).

Shared infrastructure built once, reused by every tool below (not duplicated per tool):
- `apps/web/lib/use-dark-mode.ts` — dark-mode detection hook
- `apps/web/components/tool-ui/mafsTheme.css` — generic Mafs canvas theme fix (`.mafs-canvas` scope)
- `apps/web/components/tool-ui/MafsHoverPrimitives.tsx` — generic hover-tooltip primitives for Mafs children

## Status legend
- `not started`
- `in progress`
- `done` — verified (lint/typecheck/test/build pass), screenshotted, committed, pushed, CI checked

## Tools (21)

| # | Slug | Status | Commit |
|---|---|---|---|
| 1 | scientific-calculator | done | (pending push) |
| 2 | fraction-calculator | not started | |
| 3 | scientific-notation-converter | not started | |
| 4 | significant-figures-calculator | not started | |
| 5 | statistics-calculator | not started | |
| 6 | area-calculator | not started | |
| 7 | surface-area-calculator | not started | |
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
