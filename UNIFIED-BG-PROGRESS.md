# UNIFIED-BG-PROGRESS (branch design/unified-bg) — delete after merge

Task: unified background on PHONE only (<768px) for all pages; DESKTOP identical to main; dev-mode ad slots.

## Done
- [x] Pilot gate removed; unified block moved into `@media (max-width: 767px)` in globals.css (all pages).
- [x] Card-header white-control rule moved to phone only.
- [x] Tool component color-class AA changes rewritten as `max-md:` phone-only (main classes restored for desktop).
- [x] palette-text.ts: phone-only `!important` classes; desktop keeps the inline series colors.
- [x] Home graph AA palette phone-only (FUNCTION_COLORS.lightPhone via matchMedia).
- [x] ADS_ENABLED true in `next dev`.

## Next
- [x] Desktop diff 1440 en+ar, 426 pages, light+dark: 33 differed; fixed IndicatorWithTable notes, glass tokens
      (reverted to main; phone AA grays on :root), empty th->td weight. Re-check: left only live data / random / timing
      (main vs main shows the same noise).
- [x] Phone 390: axe color-contrast 0 (7 pages x en/ar x light/dark), phone-card-order 98+98 ok, test:home-phone PASS.
- [x] Dev ads: 1440 shows 3x 970x250 + 300x600, 390 shows 3x 300x250; prod 0.
- [ ] PR, CI once, merge, cleanup.
