# EN speed progress (branch perf/en-speed)
- [x] 1 baseline (main build on 3100) — scripts/output/lh-speed-before-*
- [x] 2 render-blocking CSS — inlineCss tried, worse (doc 185KB, FCP 1.55s), reverted; CSS is Tailwind utilities from all tools (286KB raw / 39KB gz)
- [~] 3 HTML: education article dropped from client messages (-5..-21KB gz HTML)
- [ ] 4 after
- [ ] 5 gap check
- [ ] verify + PR

## Stopped at 60 min (2026-10-26)
- After (median, 3 runs): /en 93 3.16s · mortgage 93 3.15s · loan 97 2.49s · compound 97 2.49s · retirement 97 2.49s · affordable 94 3.00s · crypto 88 3.46s
- Lantern LCP = avg(optimistic, pessimistic); pessimistic counts every JS request (235–305KB) started before the observed paint (~90ms), so LCP flips 2.49s/3.1s. Next lever: less JS before first paint (layout client components, crypto initialCoins 60KB prop).
- Console scan: all 98 en tool pages, 1440 + 390: no MISSING_MESSAGE; WebGL warnings (chemistry, ideal-weight) also on main.
- Open gaps: color-contrast on /en (visual change, needs Yousef), mortgage input label, dt/dd without dl (loan/compound/retirement/affordable), crypto dl children + coin img aspect ratio, npm audit 6 (next critical, zod high, vitest/@vitest/mocker moderate, mafs/katex low). canonical fails only on localhost (points to tooloralabs.com).
- Not done: visual 3100/3101 compare, test:cards, test:home-phone, PR.
