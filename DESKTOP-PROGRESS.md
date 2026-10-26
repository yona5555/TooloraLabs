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
- A6 REJECTED by Yousef (2026-10-26) -> R2 FIXED: fuel-cost "Total Cost by Trip Distance" and readability
  "Readability Formulas" had flipped from stacked (chart above the table, baseline) to side-by-side because their
  12px-label geometry now measured no gap. Both pinned `layout="stacked"` (GapFreeRow / RsIndicatorCard ->
  IndicatorWithTable). Verified 1440/820/390, en+ar: table below the chart, labels >= 12px rendered.
  study-time charts only grew taller (same width/position), not a layout flip.
- A7 Scale-bar end labels (scientific-notation, area, surface-area, volume) hang inward: baseline overhung the card
  by 40px (bug fix 214168b2).
- A8 class-schedule-builder course fieldset 326 -> 286px: baseline spilled 6px out of its 320px card (bug fix).
Checked 2026-10-26, NOT regressions (no clipping, no overflow, same font size): commodities "Highest in history" (now
fits one line, box 40 -> 56px tall), projectile "g 1.62" (identical rect), color-palette hex labels and pdf-merge-split
page-size label (text split into separate spans, same right edge).

## 4. Unified background + AA — DONE
- globals.css: the unified-background block now applies at every width; card-header controls are white at every
  width; new desktop-only (768px+) AA accent text rules (amber/emerald/red 600 -> 700, blue-500 -> 700 in light;
  dark:text-zinc-600 -> #9494a0, bare emerald-600 -> 400 in dark). Mortgage/loan header download buttons white in
  dark desktop; mean-median-mode-range quartile chips keep blue/violet-600 in dark from md up.
- axe at 1440px, fully scrolled, home + mortgage, loan, compound-interest, retirement, affordable-loan,
  house-affordability + crypto + scientific + mean-median-mode-range: before (unified bg only) 129 en / 68 ar;
  after: 0 in en/ar x light/dark, with ads on (3101) and off (3103). Task start figure: 830 en / 468 ar.
- Phone unchanged: test:home-phone PASS (1244 elements), phone card order 98/98, test:cards 780/780 (prod build).

## 5. Tablet 820px (branch prod build, en + ar)
- unit-converter, mortgage, crypto-converter, scientific, bmi, json-formatter: page overflow 0, elements out of the
  viewport 0, card overlap 0 in both locales. unit-converter order: Your Value -> On the Measuring Instrument ->
  Result -> Common Conversions (logical).
- FIXED: result second after the input at tablet width (768-1023px), every tool: ToolAboveFold grid gets
  `data-above-fold`; globals.css flattens the wrappers holding role cards and orders live-output -> input -> output
  (same phoneRole as the phone order), 16px gap. Before: ~50 tools showed Quick examples / a reference card / bmi's
  converter + actions before the result. After (820px scan, 98 tools): input then output on all tools with both roles;
  overflow 0 and overlap 0 en+ar. Phone unchanged (phone order 98/98, home-phone PASS 1244), test:cards 780/780.

## 6. Desktop lock — DONE (local), Linux baseline pending
- tests/desktop-lock.mjs + npm scripts test:desktop-lock / baseline:desktop-lock, CI job desktop-lock (label
  approve-desktop-baseline writes desktop.linux.json and uploads it as an artifact). Baseline desktop.json (macOS):
  204 pages (98 tools + 4 pages, en+ar) at 1440px, 5,784 items. 3 compares in a row PASS; it flags the old fuel-cost
  side-by-side row (checked against 3101).
- Stability: fixed clock + UTC, a fresh browser context per page (macro/study-time/time-calculator keep state in
  localStorage), WebGL off (3D scenes show their 2D twin), reads repeated until two agree.
- Bug found and FIXED by it: with WebGL off/unavailable, Scene3D (32 scenes) and the home Graph3D threw "Error
  creating WebGL context" and blanked the whole page (macro-calculator lost <main>). Shared `useWebGL()`
  (components/tool-ui/three/webgl.ts) now gates them; they show `common.live3d.unavailable` (6 locales) instead.
- Not ours: headless Chromium prints "GL Driver Message ... GPU stall due to ReadPixels" with WebGL on, also on main.

## 7. Desktop lock CI fix (2026-10-26)
- Run 40353149701 hung 50 min with no output and was cancelled (APPROVE_BASELINE was false: the label was added
  after the push). Local cost is ~2.5s/page, so the cause was unbounded waits (evaluate without timeout,
  uncapped scroll loop and fonts.ready, networkidle up to 180s) plus live upstream APIs. Findings:
  scripts/output/desktop-lock-timing.txt.
- CI set: home + 12 tools, en+ar (26 pages, ~15s locally); full 204 pages = npm run test:desktop-lock:full (108s).
- Live data: tests/fixtures/offline-fetch.mjs preloaded into the build (npm run build:desktop-lock, .next-lock) and
  the server the test starts itself; fixtures in tests/fixtures/live (no key values). Browser requests outside
  the server are aborted. Every wait bounded; 30s hard cap per page. Live pages now locked in full (heights too).
- Mac baseline: only crypto (en) and forex (en, ar) lines changed (fixture values). CI: timeout-minutes 30/20/15,
  `labeled` trigger, per-page timing artifact.

## Next steps
1. PR with label approve-desktop-baseline -> download the desktop-linux-baseline artifact -> commit it -> remove
   the label -> CI green.
2. Merge, delete this file, stop 3100/3101/3103, remove ~/Projects/TooloraLabs-wt worktrees.
