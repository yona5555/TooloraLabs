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
Approved change (Yousef, 2026-10-24): the calculator tab bar below 768px is ONE row of five button-style tabs (border + fill on every state, active light blue, 44px tall, equal widths, no scroll, no scrollbar), each an icon over a short label (`homeCalculator.modesShort`), icons only with aria-label and title in any locale whose short label does not fit; the mode menu button is desktop only. Baseline re-approved with `npm run baseline:home-phone -- --approve` after this change.

## APPROVED EXCEPTION — crypto-converter phone order (Yousef, 2026-10-23)
On phone (below 768px) `/{locale}/tools/crypto-converter` breaks the phone standard's "input first" rule, by request:
1st the live conversion flow card (converted amount, copy/share, the BTC → ETH flow with sparklines, worked example),
2nd the input card (amount, from, swap, to, display currency, clear, quick conversions), 3rd the market dominance card, then the rest unchanged.
Done with CSS order only inside `max-md:` (`display: contents` on the result cell, `order: -1` on the flow card); the markup order and the desktop layout are untouched. This exception applies to this tool only.

## Ad slot sizes on phone (Yousef, 2026-10-23)
Every phone ad slot (`AdSpace variant="leaderboard" phone`, see APPROVED PHONE STANDARD below) is a fixed, centered 300×250 (Medium Rectangle) with the "إعلان" label above it; the desktop in-content leaderboards stay 728×90 from 768px up and are hidden below it. 320×100 is the only allowed alternative where 300×250 is too tall. No other phone sizes and no full-width stretched boxes. The 300×600 sidebar is desktop-only (hidden below lg).


## APPROVED PHONE STANDARD — every tool page below 768px (Yousef, 2026-10-24)

The crypto-converter phone pilot was approved and is now the default for all tools; there is no flag.
Everything sits behind `max-width: 767px` (or `md:hidden`); desktop renders exactly as before. It lives
in the shared components, so a new tool gets it by using them (SectionCard, SectionNav, ViewDocsLink,
InfoSection, AdSpace, ToolPageLayout) — never wire it per tool.

- **Back button:** `ToolPageLayout` → `BackButton phoneText` — arrow + "رجوع"/"Back" (`common.back`),
  36px bordered pill in a 44×44 hit area, arrow flips in RTL; the title stays beside it on one line
  (`max-md:truncate`).
- **Two top mini cards** (`PhoneMiniCards`, the ticker chip at 64px: label, value, change, sparkline),
  one row under the title, only where the page already loads live data from a verified source; never
  invented data, a missing value hides the card or only its change/line. crypto-converter: Bitcoin +
  Ethereum (`CryptoPhoneTicker`, tappable). commodities-tracker: gold (MetalpriceAPI spot, PAXG daily
  closes for change + line) + silver (spot only — no free daily history). forex-converter: EUR/USD + the
  selected pair (ExchangeRate-API value, ECB/Frankfurter 10-day table for change + line). weather-forecast:
  now (temperature + icon) + next 24 h (low/high + hourly line), from its MET Norway forecast. Every
  other tool has none (the finance calculators load no live data) until Yousef decides.
- **Cards:** on tool pages (`main[data-phone-cards]`) the first 3 top-level blue-header cards are always
  open with no toggle (a page with ≤3 cards has no toggles); cards 4+ start collapsed to the blue header
  only (frame dropped, height = header). Pill toggle "فتح"/"OPEN" + chevron down, "إغلاق"/"CLOSE" +
  chevron up (`common.cardOpen/cardClose`), `aria-expanded` (server default false), 44×44 hit area.
  `lib/phone/layout.ts` marks the always-open cards (`data-fixed`) inline before the first paint; the
  collapse is CSS only (globals.css), so the body stays in the HTML; heavy parts use `useCardOpened`
  (e.g. `MarketChart`) and build on first open. Hand-built blue-header result cards carry
  `data-card data-fixed` so they count among the first 3. Cards inside a dialog never collapse.
- **Section nav:** 3–4 equal buttons Tool / Data / Learn / FAQ (`common.navGroups`): `tool` → Tool,
  `faq` → FAQ, `behind-the-tool`/`notices`/`news`/`learning-resources`/`worked-examples` and the article's
  own sections → Learn, every other id → Data; an empty group has no button. One line, 44px tall, no
  scrolling; smooth scroll; the active button follows the scroll.
- **Ads (phone only, `AdSpace phone`):** 1) after the docs row (`ViewDocsLink`), above the collapsed
  cards; 2) before the article's first section; 3–4) inside the article near 1/3 and 2/3 of its phone
  height, on section boundaries only (`InfoSection` renders a hidden slot before every section and
  `lib/phone/layout.ts` picks them), ≥600px of article between ads and ≥300px after the last; a short
  article gets one slot near the middle. 300×250, reserved height, centered, label "إعلان"/"Advertisement"
  (`common.advertisementLabel`), ≥24px from interactive elements, never inside a collapsible or hidden
  container. Every other in-content leaderboard is `max-md:hidden`; the phone slots are `md:hidden`.
- **Ad balance (Yousef, 2026-10-24):** when what sits between ad 1 and ad 2 (the collapsed cards, in their
  default closed state) is shorter than one ad (250px + label), only ad 2 shows; ad 1 gets
  `data-phone-hide` (display:none) from `lib/phone/layout.ts` (measured; it sits after the docs row, so
  the open cards never move). Ad 2 is always OUTSIDE the article paper, between the last collapsed card
  and the article (the article's first ad slot, picked and placed by globals.css alone, CSS order 5). Only the 1/3 and 2/3 ads sit inside the paper. Hidden slots are CSS display:none (allowed by AdSense).
- **Rule B — no blue-header card inside the article (Yousef, 2026-10-24, option 1):** on phone every card
  that lives in the article (EncyclopediaPaper) joins the collapsed-cards group under ad 1, keeping its
  relative order, with ONE DOM copy: globals.css makes the article, its wrappers, the paper boxes, the
  sections (`data-info-section`), their bodies (`data-info-body`) and anything holding a card or an ad slot
  `display: contents`, so the parts are items of the phone flow ([data-phone-flow]) and CSS order places
  them: cards 0, ad 2 5, article parts 10, whatever follows the article 20. The paper is redrawn as ONE
  continuous frame (the flow's `::before`, same colors/border as the desktop paper, light + dark) that
  `lib/phone/layout.ts` sizes to the parts and keeps in step with a ResizeObserver; parts get 1rem side
  margins and one uniform 1rem spacing (section headings +1rem). Cards keep the sans font, never the
  article's serif. SectionNav scrolls to a flattened section's first part. Desktop unchanged: the cards
  stay inside the article.
- **Phone order (every tool):** 1) the 3 always-open cards (rule A); 2) the docs row; 3) ad 1 (only if the
  balance rule allows); 4) all collapsed cards; 5) ad 2; 6) one continuous article paper with its 1/3 and
  2/3 ads.
- **Phone polish (Yousef, 2026-10-24), rules 1–7:**
  1. **Section nav at the top:** SectionNav (`[data-section-nav]`) is `position: fixed` directly under the
     site header (73px) from page open, above the back button and title, on every tool; the page reserves
     its 57px. One element, never inert on phone, the active group follows the scroll. No mid-page position.
  2. **Two top mini cards:** ToolPageLayout renders two 88px slots under the title (`[data-phone-mini-slot]`).
     The page's first two 2D kit indicators whose visual is the shared `Drawing` (`[data-ph-mini-ok]`) are
     mirrored there by `PhoneMiniMirror` (React.lazy, mounted only when `(max-width: 767px)` matches): the
     card's own visual element in compact mode (`MiniContext`: SVG only, no handle, no refs), so it is live
     with the card's state; tap scrolls to the card. Never 3D, nothing generated. Hidden where no such
     indicator exists, on the markets tools and where live ticker cards (`PhoneMiniCards`) already show.
     Every other tool CHOOSES its two: `PhoneMini` (`indicator-kit/PhoneMini.tsx`; or the `mini={0|1}` prop on
     the markets/kit `IndicatorCard` and the tools' own card shells) wraps one of the tool's own 2D indicators
     (no 3D; formula card + main result value only when no 2D indicator fits). A hidden marker before the
     visual (no wrapper box, desktop unchanged); on phone a lazy copy of the same element is scaled into the
     slot, inert and aria-hidden, tap scrolls to the original. A chosen page skips the automatic mirror.
     A visual that holds a parent-created ref (drag, hover, measure) is first extracted so each copy owns its
     ref. Per-tool choices: `scripts/output/top-cards-map.txt` (all 98 tools).
  3. **One continuous column:** tool page `<main>` is one surface from the header to the footer (dark:
     zinc-950, light: `--bp-key`), 10px margins so the blueprint grid shows on both sides, 8px inner
     padding; the pinned nav is aligned to it.
  4. **Disclaimers last:** every warning/disclaimer callout (`data-phone-disclaimer`: the `notices`
     InfoSection, the intro disclaimer boxes, the tools' own disclaimer callouts) moves by CSS order (15)
     to the end of the article, inside the one paper (`lib/phone/layout.ts` counts it as a part); no ad
     slot is picked before it. Callouts inside a card stay in the card.
  5. **Tables:** FitNumbers marks a table whose min-content width does not fit its card at 360px
     (`data-stack`): each row is a block titled by its first cell, other cells "header: value" lines
     (`data-label`), start-aligned; header row kept for screen readers, ARIA roles set; no horizontal
     scroll in the page or the table (the scroll + fade remain for tablets 768–1023px only). Simple
     tables that fit stay tables. Short tokens nowrap, long text wraps between words only.
  6. **Calculator tab bar** (Standard / Scientific / Graph / Programmer / Converter): one row, no scroll,
     icon + short label (icons only with aria-label/title when a locale does not fit at 360px), 44px,
     active filled. Pending: the bar exists only on the locked phone home page.
  7. **Output cards always open:** a top-level card holding a Copy or Share/Export action
     (`button` with the lucide copy / share-2 / file-down icon, or `[data-phone-output-action]`) is an
     output card (`data-phone-output`, set in `lib/phone/layout.ts` and SectionCard) and always one of the
     3 open cards (outputs first, then the first cards on screen, kept in screen order). The markets tools
     (`data-phone-markets`) keep their approved order.
- **Known:** crypto-converter keeps the approved live-flow-first order, so its amount input is below the
  first screen at 390×844 (pending decision since the pilot).

## APPROVED — LOCKED: phone card order (Yousef, 2026-10-24)

Permanent rule for every tool below 768px (desktop unchanged). It replaces phone polish rule 7.

- **Card 1 = INPUT:** where the visitor types numbers or chooses operations (inputs, selects, sliders, keypad).
- **Card 2 = OUTPUT:** the PRIMARY result card (the one with Share / Export, or the main result).
  Always second, always open (`phoneRole="output"`).
- **Card 3 = VISUAL:** the main drawing or chart.
- Input and output in one card (e.g. age, date, time, world-time, countdown, GPA, scientific calculator):
  it is card 1 (`phoneRole="output"`), the visual is card 2, the next most useful card is card 3. An input
  card with a copy button counts as this merged card 1 (approved 2026-10-24).
- **CHANGED 2026-10-24 (Yousef): secondary outputs collapse.** SECONDARY output cards (long tables or
  schedules with a Download / Copy button: mortgage's monthly and bi-weekly schedules, loan's
  amortization schedule, citation's bibliography) go to the collapsible group like other cards, with
  their buttons inside them (`phoneRole="output-secondary"`, DOM order after ad 1). The page's visual
  then takes card 3 (`phoneRole="visual"`); `visual-collapsed` stays available for a visual that must
  lead the collapsible group.
- **At most 3 open cards on every tool.**
- The primary output card can NEVER be collapsed or placed after ad 1.
- Exception kept: crypto-converter, forex-converter and commodities-tracker (their approved live order).

**How it is built.** Every result button renders through a shared component that carries
`data-result-action="share|copy|print|download|export|save"`: `ShareExportButton` (the trigger of every
`*ShareExportModal`), `ResultActionButton` (any other result button), CopyButton, CopyLinkButton,
PrintButton, DownloadButton, PdfDownloadButton. Roles are known at server render: SectionCard
`phoneRole` = "input" | "output" | "output-secondary" | "visual" | "visual-collapsed" | "extra"
(hand-built cards: `data-card data-phone-role`, plus `data-phone-open data-fixed` when open), set on each
tool's cards. globals.css orders them: input, output, visual, extra, docs row, ad 1, collapsible group,
ad 2, article. Pure CSS from the server HTML (2026-10-25): SectionCard renders the open-role cards
(input, output, visual, live-output, extra) always-open (`data-fixed`, `data-phone-open`) and no script
orders or opens a card, so there is no render-blocking tag. A page with fewer than 3 open roles marks its
next open card `phoneRole="extra"` (QuickExamplesCard does by default).
**Guard:** `tests/phone-card-order.mjs` (CI, 390px, every tool): at most 3 open cards; every card with
`[data-result-action]` has `phoneRole="output"` (open, above ad 1) or `"output-secondary"` (collapsible
group); the primary output card (Share / Export) is open card 2, or 1 when merged with the input; with
`--ids` zero duplicate ids; the cards, docs row and ad 2 come in the same order with JavaScript disabled.
A new tool that breaks this fails CI.
