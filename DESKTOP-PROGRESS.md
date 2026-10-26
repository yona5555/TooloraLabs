# DESKTOP PHASE — progress (branch desktop/restore-lock)

Delete this file after the PR is merged.

## 1. Baseline
- Baseline commit: `08e8b932` (2026-10-20 20:46, "perf(cls): reserve the above-fold sizes before first paint"),
  the last main commit before the first phone commit `214168b2` ("fix(mobile): stop iOS focus-zoom ...").
  Caveat: the 2026-10-14/15 json-formatter + converter work merged in `d3a3acc6` is not in it; differences there
  are pre-phone desktop work, not regressions.
- Worktrees: `~/Projects/TooloraLabs-wt/base` (prod, port 3100) and `~/Projects/TooloraLabs-wt/main` (prod, port 3101,
  `NEXT_PUBLIC_ADS_ENABLED=true` so ad slots are compared too). Shared fetch cache: `~/Projects/TooloraLabs-wt/fetch-cache`.
- Audit scripts (scratch, not committed): audit.mjs (text-node rects + fonts, en/ar, 1440px light, 98 tools + home,
  /tools, /categories, 14 category pages, /docs = 232 page-locale pairs).

## 2. Audit at 1440px — classified differences
Note: element-keyed comparison is noisy (FitNumbers wraps numbers in spans, cards gained data-card); the final
pass measures text nodes (Range rects), which is DOM-structure independent.

APPROVED (KEEP list)
- A1 Chart/axis labels raised to >=12px: 4,240 SVG text nodes on 184 page-locale pairs, plus HTML scale labels
  (pH, molarity, ideal-gas, chemical-equation scales 11px -> 12px).
- A2 Ad slots: 3 unified in-content slots + 300x600 sidebar; page heights grow +190..+920px by the slots only.
- A3 password-generator text spacing (columns 13px wider/shifted).
- A4 Invisible a11y structure (data-card, nav aria-label, dl/roles): no visual change.
- A5 /categories 1251 -> 1079px tall: category pages need 3+ live tools (AdSense rule 2026-10-24).

REGRESSIONS
- R1 FIXED (verified: tdee pill 142x32 = baseline) — indicator-kit stepper value pill (`KitControls`, CardKit.tsx) shrank to 6.5rem and wrapped to 2 lines on
  desktop (~20 tools: tdee, bmr, bmi, macro, sleep, ideal-weight, ovulation, due-date, pregnancy, molar-mass,
  chemical-equation, ideal-gas, stoichiometry, text-to-speech, speech-to-text, spelling-grammar ...). Root: 299c217c
  replaced `min-w-[6.5rem]` by `min-w-0 shrink basis-[6.5rem]` at every width; desktop (md+) restored.
Checked and NOT regressions (element rects identical in both builds; the diff came from text split into new spans or
from a different visible-occurrence order): graphing chips, ohms-law presets, kinematics, json/csv size label,
batch-invoice "High risk", world-time dates, SectionNav, crypto table, energy-work-power, Quick examples buttons.
APPROVED by consequence or as bug fixes:
- A6 GapFreeRow picks side-by-side instead of stacked on fuel-cost "Total Cost by Trip Distance" (and the same chart
  family on readability-score / study-time): the chart grew with its 12px labels (A1, commit 84280546), so the
  measured height ratio now fits side-by-side. No code change in GapFreeRow.
- A7 Scale-bar end labels (scientific-notation, area, surface-area, volume) hang inward: baseline overhung the card
  by 40px (bug fix 214168b2).
- A8 class-schedule-builder course fieldset 326 -> 286px: baseline spilled 6px out of its 320px card (bug fix).
Still to check one by one next session: commodities-tracker "Highest in history" box, projectile-motion
"g 1.62" row, color-palette hex label, pdf-merge-split page size label.

## 4. Unified background + AA — DONE
- globals.css: the unified-background block now applies at every width; card-header controls are white at every
  width; new desktop-only (768px+) AA accent text rules (amber/emerald/red 600 -> 700, blue-500 -> 700 in light;
  dark:text-zinc-600 -> #9494a0, bare emerald-600 -> 400 in dark). Mortgage/loan header download buttons white in
  dark desktop; mean-median-mode-range quartile chips keep blue/violet-600 in dark from md up.
- axe at 1440px, fully scrolled, home + mortgage, loan, compound-interest, retirement, affordable-loan,
  house-affordability + crypto + scientific + mean-median-mode-range: before (unified bg only) 129 en / 68 ar;
  after: 0 in en/ar x light/dark, with ads on (3101) and off (3103). Task start figure: 830 en / 468 ar.
- Phone unchanged: test:home-phone PASS (1244 elements), phone card order 98/98, test:cards 780/780 (prod build).

## Next steps
1. Check the 4 remaining audit items above.
3. Tablet 820px check (6 tools incl. unit-converter).
4. Desktop lock (tests/desktop-lock.mjs, baselines desktop.json + desktop.linux.json, CI job desktop-lock, npm script).
5. CLAUDE.md rule, verify all, PR, merge, delete this file.
