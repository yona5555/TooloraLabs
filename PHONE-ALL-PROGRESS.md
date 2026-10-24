# PHONE-ALL progress (branch wip/phone-all) — delete in the final commit

Approach: central, in shared components (SectionCard, SectionNav, AdSpace, InfoSection, ViewDocsLink,
ToolPageLayout, lib/phone/layout.ts, PhoneMiniCards). Root causes so far: scripts/output/root-causes.txt.

DONE
- Items 1-5 of the phone standard on all 98 tools; docs (visuals.md + approved-visuals-and-indicators.md).
- Sweep round 2 (98 tools x ar/en, 390px): 0 failures except countdown #418 (pre-existing on main).
- Desktop 1440 ar/en vs main (same data cache, run side by side): mortgage, surface-area, bmi, json-formatter
  identical; crypto differs only in live-price text widths; weather only in animated SVG rain lines
  (identical with reduced motion except 2 animated lines).
- Short articles (1 inner ad): ohms-law, energy-work-power, kinematics, force, chemical-equation-balancer,
  time-calculator, batch-invoice, world-time-converter, reading-time, lorem-ipsum, text-logo,
  speech-word-count, countdown (ar+en); projectile-motion, citation, fuel-cost, study-time, percentage,
  zip-compressor, text-to-speech, speech-to-text, spelling-grammar, roman-numeral (ar only).
- Dev server: apps/web `npm run dev -- -H 0.0.0.0 -p 3001`, log apps/web/scripts/output/dev.log.
  NEVER kill 3001 or delete .next. Production builds only with a separate distDir.
- RULE A DONE (commits 9a948031, 2d4236b2): SectionCard `phoneRole` (tool/output/visual; crypto
  `live-output`), also on IndicatorCard (indicator-kit + markets), the shared indicator `Card`, GlassHeroCard.
  ToolPageLayout content wrapper = [data-phone-flow]: phone-only flex column (gap 1rem); wrappers between it
  and an open card / role card / docs row are display:contents; CSS order: lead (before open card 1, cards
  excepted) -60, live-output -55, tool -50, output -40, visual -30, other open cards -20, docs row + ad 1 -10,
  rest 0 (DOM order). layout.ts sorts cards by screen top on phone and numbers the 3 open ones
  (data-phone-open 1-3). 60 tools carry roles; map: scripts/output/card-order-map.txt (98 rows).
  Verified 98 x ar/en at 390 (dev): open cards = first 3, docs row right after them, no overflow, no new
  console errors; production build (copy) checked 7 tools en + 5 ar; desktop 1440 geometry identical to
  the base on 10 tools x en/ar. Root causes 8-12 in scripts/output/root-causes.txt (11, 12 pre-existing).

- AD FIX + RULE B DONE (option 1): ad balance (ad 1 dropped when < one ad between it and ad 2; ad 2
  always outside the paper), article cards join the collapsed group, one redrawn paper (root causes 13, 14).
  Sweep 98 en at 390: structure 98/98 OK; sample 10 ar/en OK; desktop 1440 identical; prod copy checked.

- 2026-10-24 (later): ar sweep 98/98 structural OK; broken words fixed at the root on tool pages
  (16e78f1f), #id links on flattened sections (33773357); sample 10 ar/en OK.

BLOCKER FOR THE MERGE: desktop 1440 vs MAIN is NOT identical (vs the branch base it is). On bmi,
mortgage, world-time (en) every article section sits ~96px higher on the branch than on main and the
article is shorter; cause sits in the earlier branch commits (SectionCard rewrite / InfoSection slots),
not yet found. Measuring main needs the dev server on main: swapping branches under it stalled it
for minutes, so use a separate production build of `git archive main` on its own port next time.

NEXT (in order)
0. Find the desktop main-vs-branch difference above; then the final en broken-words pass (not run yet);
   then the merge steps.
1. Countdown #418 root cause (pending 6 in root-causes.txt); quick-table digits (7) needs Yousef.
2. Pre-existing broken words (97/98 en): squeezed first columns in LiveTable tables, button labels,
   break-all URLs — needs its own task.
