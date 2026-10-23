# PHONE-ALL progress (branch wip/phone-all) — delete in the final commit

Approach: central, not per tool (all 98 tools share these components).
- [x] 1 Back button: ToolPageLayout passes "Back" to BackButton for every tool (both layouts); title max-md:truncate.
- [x] 2 Top mini cards: PhoneMiniCards (tool-ui). crypto (BTC+ETH, existing), commodities (gold+silver), forex (EUR/USD + selected pair), weather (now + next 24h). Finance calculators: no live data on page -> none.
- [x] 3 Cards: SectionCard generic; lib/phone/layout.ts inline pass marks first 3 top-level cards data-fixed; CSS collapse in globals.css scoped to [data-phone-cards].
- [x] 4 SectionNav: phone groups computed from item ids (tool/data/learn/faq) + article sections -> Learn; labels common.navGroups.
- [x] 5 Ads: AdSpace phone prop; desktop leaderboards max-md:hidden; ad1 in ViewDocsLink; ads 2-4 InfoSection slots picked by layout pass.
- [ ] Docs: visuals.md + approved-visuals-and-indicators.md
- [ ] Verify sample (390 ar/en items 1-5; 1440 ar/en rects vs main), lint/tsc/build, results file
- [ ] Final: commit+push, delete this file, restart dev server on 3001
