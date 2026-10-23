# Approved visuals and indicators

## Drawing + table cards: no empty gaps (Yousef 2026-10-17)
This replaces any earlier "always stack" or "always side-by-side" wording.

- GOAL = no empty gaps in any card. Applies to every card holding a drawing (chart, scene, map, diagram, 3D, preview) plus a table, controls or info panel. (1) Card full with no visible empty space → DO NOT TOUCH IT, whatever its layout (e.g. weather "10-day forecast"). (2) Side-by-side card with empty space (one part much shorter, blank area under it) → STACKED: drawing on top at full card width, table/panel below at full card width in a 3/2/1-column grid by screen size, worked-example formula in a full-width bottom row (e.g. weather "Next 48 hours"). (3) Stacked card with empty space (drawing or controls in a narrow centred column with blank sides) → SIDE-BY-SIDE: drawing on one side, table/controls on the other, both filling the card (e.g. text tool "Layout playground"). (4) A card that had no gaps at commit 911cf931 but has gaps now is restored to its 911cf931 layout. Detection (measure, never screenshots): `apps/web/scripts/card-gap-check.mjs` at 1440px in ar and en flags side-by-side parts differing by more than 30% in height, and stacked content using less than 75% of the card inner width. Always: labels never clipped, drawings readable (axis text >= 12px), mirrored for RTL, light/dark, all 6 locales, mobile <= 768px stacked naturally with no gaps.
- Approved full card, do not touch: weather "10-day forecast".
- Stacked reference: weather "Next 48 hours".
- Side-by-side reference: text tool "Layout playground".

## Clickable actions look like buttons (Yousef 2026-10-23)
Any clickable action (tabs, save, clear, copy, export, toggles, show more) must be a visible button: background or border, padding, radius, clear active/hover/focus states, and a 44×44 touch area on phone. Plain text or underlined text for an action is rejected. Real navigation links inside paragraphs stay links.

## APPROVED — LOCKED: phone home page /ar and /en (Yousef, 2026-10-23)
Approved phone home page (below 768px), as shipped in commits 9cf4fb6d, be5df414, cb9012b2 and fd3b15d3:
- One-row header: the uppercase `TOOLORALABS.COM` wordmark (shared `Wordmark`, Arial, 15px, always LTR) and the smaller Docs / theme / share / language buttons (36px visible, 44×44 hit area, 8px apart; order from the start side Docs, theme, share, language).
- The calculator FIRST, in one device frame (tinted surface, 10px padding, 8px gaps, each section a lighter-bordered card). Rounded tabs with the active one filled light blue, then the history/archive card BEFORE the display, then the functions row, the keypad and the bottom row.
- The categories below it: 4 visible plus "عرض المزيد من الأقسام (N)" (count computed), "عرض أقل" when open.
- Footer: the wordmark always at the left edge on every locale; copyright and links aligned by the page language (right in Arabic, left in the other locales); 24px between rows, 44px link targets.

**Do not change the approved phone home page unless Yousef explicitly asks for that exact change.**
Locked by `npm run test:home-phone` (CI job `home-phone-lock`, macOS runner) against `tests/baselines/home-phone.json`: rects (±1px), font sizes, texts and element order of the header, calculator frame, categories list and footer at 360/390px in ar/en. The baseline is rewritten only with `npm run baseline:home-phone -- --approve`, after Yousef approves the exact change.
Pending (already requested 2026-10-23, needs his decisions first): the button-style tab conversion from §9 (inactive tabs still have no fill or border).
