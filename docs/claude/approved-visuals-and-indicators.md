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

## APPROVED EXCEPTION — crypto-converter phone order (Yousef, 2026-10-23)
On phone (below 768px) `/{locale}/tools/crypto-converter` breaks the phone standard's "input first" rule, by request:
1st the live conversion flow card (converted amount, copy/share, the BTC → ETH flow with sparklines, worked example),
2nd the input card (amount, from, swap, to, display currency, clear, quick conversions), 3rd the market dominance card, then the rest unchanged.
Done with CSS order only inside `max-md:` (`display: contents` on the result cell, `order: -1` on the flow card); the markup order and the desktop layout are untouched. This exception applies to this tool only.

## Ad slot sizes on phone (Yousef, 2026-10-23)
Every in-content `AdSpace variant="leaderboard"` below 768px is a fixed, centered 300×250 (Medium Rectangle) with the "إعلان" label above it; from 768px up it stays 728×90. 320×100 is the only allowed alternative where 300×250 is too tall. No other phone sizes and no full-width stretched boxes. The 300×600 sidebar is desktop-only (hidden below lg).


## PHONE PILOT — pending Yousef's approval (crypto-converter)

When approved, apply to all tools as a general rule. Branch `wip/phone-pilot-crypto` (not on main).
Gated by one flag, `phonePilot: true` in `apps/web/data/tools.ts` (crypto-converter only). Everything
lives below 768px; desktop and every other tool render as on main.

- **Back button:** `BackButton` `phoneText` — arrow + "رجوع"/"Back" (`common.back`, 6 locales), 36px
  bordered pill inside a 44px-tall hit area; the arrow flips in RTL. The title stays beside it on one
  line (`max-md:truncate`).
- **Two live mini cards** under the title (`CryptoPhoneTicker`): Bitcoin and Ethereum, the ticker chip
  style grown to 64px (name, price, 24h change green/red, the ticker's 30-day sparkline from the
  converter chart's daily candles). Tapping one sets it as the "from" coin.
- **Cards:** the 3 above-the-fold cards are always open with no toggle. Cards 4+ (below the fold and
  the encyclopedia's live-blocks card) sit in `PhoneCollapsibleCards` and start collapsed: only the blue
  header (border dropped, collapsed height = header height). Toggle = one pill with text + chevron:
  "فتح"/"OPEN" chevron down, "إغلاق"/"CLOSE" chevron up (`common.cardOpen/cardClose`, 6 locales),
  `aria-expanded` (server default false), 44×44 hit area. The body stays in the HTML (CSS-hidden); the
  candlestick canvas (`MarketChart`, `useCardOpened`) builds on first open.
- **Section nav:** `SectionNav` `phoneGroups` — 4 equal buttons, Tool / Data (chart, coin, market,
  network) / Learn (news, education, notices) / FAQ (`tools.crypto-converter.navGroups`), 13px, 44px
  tall, nowrap + keep-all, no scrolling; smooth-scroll and the active button follows the scroll.
- **Ads:** Phone ads on the tool page: 1 above the collapsed cards, 1 between the last card and the article, 2 inside the article at about 1/3 and 2/3 on paragraph boundaries with about 600px of text between them; other slots hidden on phone; desktop unchanged. Slots: 300×250, centered, reserved height, label "إعلان"/"Advertisement" (`common.advertisementLabel`), 24px clear of buttons, links and cards, never inside a collapsible or hidden container; the three new phone slots are `md:hidden`. Article ad 3 sits after "Risks" (section boundary), ad 4 inside "Behind the Concept" after "Modern Developments" and before "Academic Path" (at 390px: ar 26%/64%, en 28%/64%; text around them ≥1756px).
- **Not met:** at 390×844 the result (live flow amount, y≈431) is in the first screen but the amount
  input is not (y≈1154): the approved phone order puts the 780px live-flow card first. Needs a decision
  (e.g. a compact amount field in the flow card, or input first).
