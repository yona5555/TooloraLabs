# EN speed progress (branch perf/en-speed)
- [x] 1 baseline (main build on 3100) — scripts/output/lh-speed-before-*
- [x] 2 render-blocking CSS — inlineCss tried, worse (doc 185KB, FCP 1.55s), reverted; CSS is Tailwind utilities from all tools (286KB raw / 39KB gz)
- [x] 3 HTML: education article dropped from client messages (-5..-21KB gz HTML)
- [x] npm audit: next 16.4.3 (critical), zod 4.6.7 (high), vitest 4.1.12 (moderate); next dev patch carried to 16.4.3; npm 11 allowScripts set. Left: katex low (mafs ^0.16 has no fixed range)
- [x] count badges contrast (approved): #5e5e67, passes 4.5:1 on navy/teal/violet inner surfaces
- [x] a11y no-visual fixes: dl/dt structure (loan, compound, retirement, affordable, break-even, inventory, DTI, house-affordability, mortgage, worked-example notes), mortgage down-payment label, coin logos object-contain
- [x] first-load JS: unused English titles/descriptions removed from data/tools.ts (shared chunk tools array 9.5→4.5 KB gz)
- [x] 4 after — scripts/output/lh-speed-final-* (median of 3, mobile, prod build)
- [x] verify: DOM comparison vs session-start build (only badge colours + live crypto prices differ), test:cards 780/780, home-phone lock PASS, phone card order 98/0
- [ ] PR + CI

## Final (median of 3, Lighthouse 13.5 mobile, prod build; before = main @ next 16.3.8)
| page | perf | LCP | a11y | bp |
|---|---|---|---|---|
| /en | 93 → 93 | 3.17 → 3.16s | 97 → 97 | 100 |
| mortgage | 92 → 95 | 3.31 → 2.93s | 95 → 100 | 100 |
| loan | 92 → 95 | 3.31 → 2.93s | 97 → 100 | 100 |
| compound | 97 → 95 | 2.49 → 2.93s | 97 → 100 | 100 |
| retirement | 97 → 95 | 2.49 → 2.93s | 97 → 100 | 100 |
| affordable | 94 → 95 | 3.01 → 2.93s | 97 → 100 | 100 |
| crypto | 88 → 87 | 3.62 → 3.77s | 94 → 100 | 96 → 100 |
LCP is bimodal (Lantern pessimistic estimate counts every JS request before the ~90ms paint), so 2.49/2.93/3.1s flips run to run.

## Not done / needs Yousef
- /en contrast (visual, not approved): calculator inactive tab, history empty text, orange "=" key (white on #fe9a00 2.13:1), card captions, flowchart caption, table cells, phone menu text 4.49:1. Several are inside the LOCKED phone home page.
- crypto initialCoins (53.5 KB raw / 12.4 KB gz in the HTML) cannot leave the client payload: the converter, pickers, top list, movers and ticker are client components that read all 100 coins; the only unread field (lastUpdated) is read by the markets pages.
- Layout client components (theme, share, language, Browse menu, docs button) are interactive; Navbar is already a server component. data/tools stays client-side for the sidebar search (keywords).
- Site-wide axe backlog (222 /en pages): landmark-unique (all), scrollable-region-focusable 62, dlitem 44, definition-list 43, aria-allowed-attr 24 (drag handles), heading-order 16, aria-prohibited-attr 13 (mafs), empty-table-header 8, label 7, others ≤2.
