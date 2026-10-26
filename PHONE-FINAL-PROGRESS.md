# PHONE-FINAL-PROGRESS (branch fix/phone-final)
- [x] 0 CI 40322678326 was in_progress at start (checked once); branch created
- [x] 1 phone ad slots gated on ADS_ENABLED (InfoSection, ViewDocsLink); layout.ts paper works without slots.
      Prod 390: 0 slots, paper shorter by exactly the 2 article ads, max gap = main; dev: 4 shown as before
- [x] 2 axe (scrolled, light/dark, en/ar, 390/1440, home + 6 tools): phone 1 -> 0 (sci display overflow-y);
      desktop contrast deferred (phone-only AA token layer)
- [x] 3 forex/commodities desktop diff, shared fetch cache: 0
- [x] 4 katex override ^0.19.1: audit 0, 0 .katex nodes, Mafs tools desktop diff 0
- [x] 5 WebGL: removed ContextReleaser (double loseContext); 0 console messages (metal) on 7 tools x 2 widths
- [x] 6 A11Y-PROGRESS.md deleted
- [x] verify: desktop diff 24 pages x en/ar = 0; guard 98 en/ar 0; home-phone PASS; cards 780/780; lint/tsc/tests/build clean
- [ ] PR / merge
