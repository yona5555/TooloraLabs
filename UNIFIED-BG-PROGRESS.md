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
- [ ] Desktop diff 1440 en+ar, main prod (3100) vs branch prod (3101); fix diffs (mean-median-mode arrow, worked example width).
- [ ] Phone 390 checks: axe color-contrast, phone guard, test:home-phone.
- [ ] lint/tsc/tests/build, PR, CI once, merge, cleanup.
