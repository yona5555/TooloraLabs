---
paths:
  - "apps/web/components/**"
  - "apps/web/app/**"
---
# هيكل الصفحة والرسوم والمؤشرات المعتمدة

> يعتمد على §8–§9 و§13 و§17–§18 و§20 و§22–§43 من `TooloraLabs-Claude-Instructions.md`. لا تخترع نوعاً عشوائياً؛ اختر من القائمة بما يخدم طبيعة البيانات.

- **No screenshots:** never take or review screenshots for visual work (hard rule in `CLAUDE.md`). Verify with lint/tsc/build and DOM values; end with the page URLs for xzerone to review.

## 1. هيكل صفحة الأداة (§8)
- **General rule (every tool):** Top of every tool page = 3 columns: input (left), result with a live indicator (middle), RelatedToolsSidebar + 300×600 AdSpace (right). Below it, cards span the full width with leaderboard ads between sections only. Reference: `loan-calculator` via `ToolAboveFold`; the right column hides on mobile and the columns stack.
- Above the Fold بلا تمرير: 3 أعمدة — إدخال (~320px) بقيم افتراضية تعطي نتيجة فوراً؛ نتيجة (~380–400px) مع مؤشر تفاعلي حقيقي (ممنوع رسم ثابت)؛ يمين (~300px) أدوات ذات صلة + AdSpace. على الموبايل تتكدس الأعمدة.
- القسم الموسوعي (EncyclopediaPaper) يحاكي ورقة A4 علمية؛ مؤشرات §31–§43 ملوّنة داخل بطاقات.
- أمثلة محلولة، أسئلة شائعة، «خلف الأداة» (تاريخ، معايير، مسار أكاديمي: 5 جامعات عالمية + جامعة/اثنتان عربيتان، يُتحقق منها ببحث حقيقي).
- المراجع: مصدر حقيقي (اسم، جهة، سنة، DOI/رابط) مع زر «اقرأ المصدر الأصلي».
- الإعلانات (§8.7): الصفحة الرئيسية بلا إعلان أبداً. صفحات الأدوات فقط، عبر AdSpace وحده: sidebar (300×600) أو leaderboard (728×90 من 768px فما فوق، و300×250 ثابتة في المنتصف على الهاتف؛ 320×100 فقط حيث 300×250 أطول من المكان).
- SectionCard: حدود مستديرة ورأس أزرق `bg-blue-600`. التكبير عند `lg:` فقط. الشبكة `items-start`.
- **General rule A (2026-10-10, every tool):** card headers contain the title only — no number badges or counters (e.g. the old "20"/"21" circles). `GlassHeroCard`/`GlassIndicatorCard` keep `n` as an id/layout key only; it is never rendered.
- **General rule B (2026-10-10, every tool):** no plain number cards. Every card, including the main Result card, contains a live indicator deep in information (chart, interactive diagram, or detailed live table), not just numbers and text. Apply to every tool rebuilt from now on. Reference: scientific-notation-converter Result (decimal-point shift + draggable log ladder + live equivalent-forms table).
- Column fill (§17/§27): when one above-the-fold column is shorter, stretch it with `ToolAboveFold` `stretchInput` / `stretchResult` and give its last card `lg:flex-1` with real content that grows (drawing, list), never an empty band.
- **Instant result (every tool):** the page shows a real result on load (sample data when the tool needs input); never zeros, dashes or an empty state in the result or its indicators.
- **Drawing + table (every tool, updated 2026-10-10):** drawing cards are two parts: deep live table and live drawing; side by side or stacked follows the conditional layout rule below; RTL mirrors naturally. Use `tool-ui/three/LiveTable3DLayout` + `tool-ui/three/Scene3D` (lazy @react-three/fiber + drei, ssr:false, theme colors from `usePalette3D`). This replaces the older "drawing left, table right" direction.
- **Drawing + table cards — no empty gaps (xzerone 2026-10-17, replaces any "always stack" / "always side-by-side" wording):** GOAL = no empty gaps in any card. Applies to every card holding a drawing (chart, scene, map, diagram, 3D, preview) plus a table, controls or info panel. (1) Card full with no visible empty space → DO NOT TOUCH IT, whatever its layout (e.g. weather "10-day forecast"). (2) Side-by-side card with empty space (one part much shorter, blank area under it) → STACKED: drawing on top at full card width, table/panel below at full card width in a 3/2/1-column grid by screen size, worked-example formula in a full-width bottom row (e.g. weather "Next 48 hours"). (3) Stacked card with empty space (drawing or controls in a narrow centred column with blank sides) → SIDE-BY-SIDE: drawing on one side, table/controls on the other, both filling the card (e.g. text tool "Layout playground"). (4) A card that had no gaps at commit 911cf931 but has gaps now is restored to its 911cf931 layout. Detection (measure, never screenshots): `apps/web/scripts/card-gap-check.mjs` at 1440px in ar and en flags side-by-side parts differing by more than 30% in height, and stacked content using less than 75% of the card inner width. Always: labels never clipped, drawings readable (axis text >= 12px), mirrored for RTL, light/dark, all 6 locales, mobile <= 768px stacked naturally with no gaps.
- **Chart labels >= 12 CSS px (2026-10-25, every tool):** chart axis labels (tick numbers, dates/times, axis titles and units on every chart, graph, gauge, dial and track scale) render at >= 12 CSS px, measured as the RENDERED size (font-size × the SVG's current scale), not SVG units: SVG label sizes are written `style={{ fontSize: svgPx(n) }}` (`tool-ui/svgPx`; `SvgLabelScale` sets each SVG's `--svg-k`), and a chart that sets its own width lays out at its box width below lg (`useBelowLg`). Labels never overlap (§39) or clip: reduce tick density (e.g. the `axisTicks` gap) instead of shrinking text. Shared label layout (2026-10-28, every chart): Mafs charts use `tool-ui/FitMafs` (+ `FitText`), hand-drawn SVG charts `tool-ui/FitSvg`, geometry in `tool-ui/chartLabels.ts`; never per-chart paddings or hidden labels. Check: `apps/web/scripts/site-audit.mjs` (the `overlap`/`clip` criteria cover this; CI jobs `site-audit-shard`/`site-audit`, required, ratcheted - see `CLAUDE.md`).
- **Indicator set (every tool):** about 12 indicators chosen from the §31 library, all computed from the tool's real calculations and following its inputs live, with at least one interactive "wow" piece (drag, sliders or animation).
- **History panels (every tool that has one):** × delete per entry, live grand total of all results, entry count, Clear all, click an entry to reuse its result, persisted per visitor. Use `tool-ui/HistoryTape` + `lib/use-persisted-list`.
- **Tool cards (listings):** one unified card, half image and half text; the image is the tool's MAIN VISUAL only (its chart, scene, gauge or diagram; never the whole card, tabs, text or tables), letterboxed 640×480 on the card background, from `npm run previews` (`apps/web/scripts/generate-tool-previews.mts` → `public/tool-previews/{ar|en}/{light|dark}/{slug}.webp`): ar pages use ar images, all other locales en; light/dark follow the site theme; a missing image shows a neutral placeholder.
- **Previews rule:** After any change to a tool's top interface, run npm run previews for that tool (or all tools) and commit the new images in the same commit.
- **Preview marks:** every tool marks its main visual with `data-preview="visual"` (shared wrappers mark their drawing part; `data-preview-hero` picks the hero when the result column has none); three.js canvases flag `data-preview-ready` after 30 frames (`three/PreviewReady`) and `three/FitContent` keeps the whole object in view. The script fails blank, clipped or placeholder captures; a tool with no visual (pdf-merge-split, zip-compressor) gets no image.
- **Market charts:** real OHLC candles only (no synthetic or line stand-ins) in a trading-terminal layout: instrument list next to the chart. Width, fullscreen and the WORKED EXAMPLE exception: see §5 below.

## 2. فهرس القواعد البصرية
| § | الجوهر |
|---|---|
| 8 | المحتوى وSEO وAbove the Fold و«خلف الأداة» والمراجع والإعلانات |
| 9 | الهوية البصرية الموحّدة |
| 13 | SectionNav يلتصق حتى نهاية الصفحة |
| 17 | ممنوع فراغ بصري كبير، يُملأ بجدول مرجعي |
| 18 | «جزيرة العميل» لمؤشرات تفاعلية داخل القسم الموسوعي |
| 20 | عناصر اختيار سريع لتنويع حسابي حي |
| 22 | لا فراغ حول أي رسم مفرد داخل بطاقته |
| 23 | لا رسم تعليمي بلا صلة بحساب الأداة |
| 24 | صناديق التنبيه كلها في قسم «إشعارات» واحد بآخر الصفحة |
| 25 | لا خانة فارغة بآخر أي شبكة بطاقات |
| 27 | امتداد §17 لعمود above-the-fold |
| 28/30 | اختصار قيم النتائج وتسميات الأزرار وصفوف الجداول |
| 29 | مؤشرات التدفق الصغيرة |
| 33 | بنية هرمية ثلاثية لنماذج الإدخال المتكررة |
| 34 | بطاقة قسم/أداة مزخرفة بلون هوية لكل قسم |
| 35 | زر رجوع موحّد في كل الصفحات |
| 37–43 | بطاقات بإطار وترويسة زرقاء، بلا مربعات، بلا تسميات متراكبة، مقابض سحب واضحة، بلا فراغ، جداول بارزة، أزرار − / + تفاعلية (قد لا تكون في ملف التعليمات المحلي؛ اسأل xzerone قبل الاعتماد) |

## 3. ما يرفضه في الرسوم
- **الرسوم الفقيرة والفارغة.** لا يريد بطاقات برسم صغير ومعلومات قليلة تملأ الصفحة (مثل «Classifying Triangles by Side Length / by Angle»). يريد رسوماً **أغنى تفصيلاً ومعلومات**، وأن تُستبدل الفارغة بها، مع إبقاء الرسوم الجيدة فاصلة بين أوراق الشرح. إما رسم غني بمعلومات أو لا رسم (§22/§17).
- ملء الفراغ بمحتوى حقيقي لا بحيل CSS.

## 4. مكتبة الأنواع العشرون (§31)
1. أعمدة بأرقام بارزة (Labeled Bar Chart)
2. سهم تدفق بأرقام مدمجة (Flow Arrow with Embedded Numbers)
3. تدفق هرمي/متدرّج (Hierarchical Flow)
4. صفوف مقارنة بأيقونات (Icon Comparison Rows)
5. قائمة أعمدة أفقية مرتّبة (Ranked Horizontal Bar List)
6. دائري متعدد الطبقات (Multi-Ring Donut)
7. خط اتجاه مع نقطة مرجعية بارزة (Trend Line with Highlighted Reference Point)
8. مؤشر نصف دائري متدرّج الألوان (Gradient Gauge)
9. خط زمني بمحطات (Timeline with Stations)
10. مقياس لوغاريتمي (Log-Scale Magnitude Bar)
11. مقارنة تكافؤ جنباً لجنب (Side-by-Side Equivalence)
12. ثلاثية حساسية منخفض/حالي/مرتفع (Sensitivity Trio)
13. مخطط سلّمي (Stepped Diagram)
14. ميزان/توازن (Balance Indicator)
15. عمود مُجزَّأ/مُكدَّس (Stacked Segmented Bar)
16. بطاقات مقارنة جنباً لجنب (Side-by-Side Comparison Cards)
17. جدول مرجعي بوسم لكل صف (Tagged Reference Table)
18. مخطط معادلة/صيغة (Formula Diagram)
19. شريط مناطق ملوّنة (Zone Strip)
20. نقطة مرجعية معلّقة ضمن توزيع (Annotated Reference Point)

**قيود كل نوع:** بيانات حقيقية محسوبة من منطق الأداة؛ اتساق العملة؛ لا فيضان أو التفاف للأرقام (`AutoFitText`)؛ RTL صحيح تلقائياً؛ لا تكرار لون بين عناصر متضادة؛ لا فراغ بصري؛ تسميات مختصرة. التسميات **دائمة الظهور** لا عند التحويم فقط.

## 5. قالب التطبيق الإلزامي (§32)
- كل مؤشر داخل `SectionCard` مستقلة: إطار كامل + رأس أزرق (`bg-blue-600`) + عنوان واضح.
- جدول **WORKED EXAMPLE** ملاصق للمؤشر وبالعمق نفسه لبقية مؤشرات الصفحة: بجانبه إن كان الجزآن متوازنين، وتحته بعرض كامل إن ترك الوضع الجانبي فراغًا (قاعدة «لا فراغات» في §1: لا تُلمس البطاقة الممتلئة، ويُقاس كل بطاقة قبل تغييرها).
  - **Approved exception (candlestick charts only):** no WORKED EXAMPLE table beside a candlestick chart; the hover tooltip already shows the same OHLC data, and the chart spans the full card width with a fullscreen button (e.g. `CryptoHistoricalChart.tsx`).
- حجم المؤشرات موحّد ومتوسط (الوزن البصري الفعلي لا `viewBox` فقط). أبعاد SVG ثابتة بخاصيتي `width`/`height` (مثل 168×168 للدونات) لا بصنف CSS متغيّر.
- كل قسم له `h3` وجملة تمهيدية خاصة، بلا تكرار معلومات بين الأقسام.
- ممنوع دمج نوعين من الرسوم في بطاقة واحدة (بند 6).
- **المرجع الأول:** قسم "Cost by Power Source" في Fuel Cost Calculator (`FuelTypeCostComparisonChart.tsx`). **حالة تطبيق كاملة:** Break-Even Point Calculator (10 مؤشرات).
- أمثلة مطبَّقة للنوع 1: `FuelPriceSensitivityDiagram.tsx` و`EduBarChart.tsx`.

## 6. مؤشرات Triangle Calculator المعتمدة (مختبر Mafs، §36)
المجلد: `apps/web/components/tools/triangle-calculator/`
| # | المكوّن | النوع |
|---|---|---|
| 1 | `TriangleInteractivePlayground` | **المؤشر الرئيسي** (سحب A وB وC): 9 صفوف حية، أول عنصر في الصفحة |
| 2 | `TriangleAngleGauge` | مؤشر زاوية |
| 3 | `TriangleSolvingTimeline` | خط زمني بمحطات |
| 4 | `TriangleSideLengthChart` | أعمدة بأرقام بارزة |
| 5 | `TriangleAltitudesBarList` | قائمة أعمدة أفقية |
| 6 | `TriangleHeronFormulaDiagram` | مخطط صيغة |
| 7 | `TrianglePerimeterStackedBar` | عمود مُكدَّس |
| 8 | `TriangleCompactnessZoneStrip` | شريط مناطق |
| 9 | `TriangleLawOfSinesRatioBars` | أعمدة نسب |
| 10 | `TriangleAngleDragSensitivity` | **سحب** + حساسية |
| 11 | `TriangleRadiiComparisonCards` | بطاقات مقارنة |
| 12 | `TriangleAngleReferenceDrag` | **سحب** + مرجع زوايا |
| 13 | `TriangleSpecialTypesTable` | جدول مرجعي |
| 14 | `TriangleUnitConversionEquivalence` | مقارنة تكافؤ |

(الرقم 15 ذُكر في ملخصات سابقة ولم يُتحقق من المؤشر الخامس عشر في الكود؛ راجع `TriangleEducation.tsx`.)
- المؤشرات الثلاثة القابلة للسحب: الرئيسي (1) و(10) و(12).
- الأداة: Mafs v0.21 (`Mafs`, `Coordinates.Cartesian`, `Polygon`, `Theme`, `useMovablePoint`). الجداول الحية بقانون جيب التمام، والمساحة بـshoelace مطابَقة لهيرون، وارتفاع Mafs 280.
- الصياغة المعتمدة للتصنيف: `${sideClass} · ${angleClass}`، وحالة المثلث المنحل (مساحة < 0.05) تعرض سطراً واحداً «Drag apart to form a triangle».
- الترجمة تحت `tools['triangle-calculator'].education.lab` (6 لغات، 0 ناقص / 0 زائد).

## 7. معلَّق على المؤشرات (لم يُنفَّذ)
- sin/cos curves under all interactive indicators (confirmed by xzerone): المكوّن المشترك `TriangleSinCosLiveCurve` تحت (1) و(2) و(10) و(12)؛ استثناء معتمد من §32 بند 6.
- توزيع المؤشرات الـ12 المتبقية بين `AdSpace` على طول الصفحة، من أعلاها إلى أسفلها.

## 8. Blueprint theme: page backgrounds and surfaces (2026-10-11, every page)
Single source of truth: the "Blueprint theme" block in `apps/web/app/globals.css` (tokens `--bp-*`). Never set a page background on `<body>`/`<main>` with utilities; never add per-page color hacks.
- **Page variants** (tokens set on `<body>` by the marker on the page's `<main>`):
  | Variant | Marker | Dark | Light |
  |---|---|---|---|
  | navy (default, all tools) | none (`data-tools-page` on /tools only highlights the pill) | #0e1a36, minor 30px rgba(96,130,200,.10), major 150px .22 | #eef3fb, minor rgba(40,80,160,.04), no major |
  | teal (categories) | `data-categories-page` | #0a2a2c, rgba(90,200,190,.10/.22) | #e8f5f3, rgba(20,120,110,.04) |
  | violet (coming soon) | `data-coming-soon-page` | #1b1233, rgba(170,135,240,.10/.22) | #f2eefb, rgba(100,70,170,.04) |
  | black (home, docs) | `data-home-page`, `data-docs-page` | zinc-950, no grid | light navy |
  Grid is CSS-only (layered linear-gradients), `background-attachment: fixed`. A new section with its own variant = new marker + one token rule, nothing else.
- **Browse dropdown:** always the current page's variant (same tokens), fully opaque, grid scrolls with the panel (`local`). Category headings `--bp-heading`: dark #f2c46d, light #a36a12, weight 800; tool links neutral (`--bp-link`).
- **Header nav pills:** `data-bp-nav="navy|teal|violet|black"` = the variant of the page each link opens (Home/Docs black, Tools/Browse navy, Categories teal, Coming soon violet); pill = base fill + 1px `--bp-edge` border; current page = `--bp-glow` border + soft glow.
- **Light mode surfaces (site-wide, automatic):** `bg-white` → panel #e7eefa; `bg-zinc/gray/slate-50|100` → inner #dde7f7; white buttons/inputs → key #f5f8fd (teal/violet pages use their own tints). Never pure white panels.
- **Light mode borders:** neutral borders → dividers rgba(40,80,160,.22); rounded fully bordered panels/cards/tables/FAQ/inputs → 1.5px rgba(40,80,160,.35); large rounded white panels get `0 1px 3px rgba(20,40,90,.08)`; table column dividers 1px; colored buttons keep their fill with a darker same-hue edge.
- Shared components opt in with `data-bp-panel` (SectionCard, TOC list, feedback box) and `data-bp-inner` (stat boxes, formula box, sidebar rows). Dark mode cards/panels are unchanged. The home calculator's own dark toggle (`.calc-dark`) and print areas are excluded.

## 9. Clickable actions look like buttons (xzerone, 2026-10-23, every page)
Any clickable action (tabs, save, clear, copy, export, toggles, show more) must be a visible button: background or border, padding, radius, clear active/hover/focus states, and a 44×44 touch area on phone. Plain text or underlined text for an action is rejected. Real navigation links inside paragraphs stay links.

## APPROVED PHONE STANDARD — every tool page below 768px (xzerone, 2026-10-24)
Default for all tools, desktop unchanged; built into the shared components (never per tool). Full spec:
`docs/claude/approved-visuals-and-indicators.md` § APPROVED PHONE STANDARD.
- Back button arrow + "رجوع"/"Back" (44×44), title beside it, wrapping to a second line instead of
  truncating/ellipsis when it does not fit one line (2026-10-30: no title text is ever clipped).
- Two top mini cards (`PhoneMiniCards`) only where verified live data already loads (crypto, commodities,
  forex, weather); otherwise nothing.
- First 3 blue-header cards open without toggle; cards 4+ collapsed to the header with the
  "فتح/OPEN"–"إغلاق/CLOSE" pill (`aria-expanded`, server false, body kept in the HTML).
- Section nav: 3–4 equal buttons Tool / Data / Learn / FAQ, one line, 44px, active follows the scroll.
- Phone ads 300×250 "إعلان": after the docs row, before the article, and at ~1/3 and ~2/3 of the article
  on section boundaries (≥600px apart; one in the middle if short). Desktop slots hidden on phone,
  phone slots hidden on desktop.
- Ad balance: if the collapsed cards between ad 1 and ad 2 are shorter than one ad (250px + label), only
  ad 2 shows. Ad 2 is always outside the article paper, right before it; only the 1/3 and 2/3 ads are inside.
- Rule B (option 1): no blue-header card inside the article on phone; article cards join the collapsed
  group in their order, one DOM copy (display:contents + CSS order), sans font; ONE continuous paper is
  redrawn around the article parts with uniform spacing. Desktop unchanged.
- Phone order: 3 open cards, docs row, ad 1 (if balanced), all collapsed cards, ad 2, the article paper.
- Phone polish rules 1–7 (xzerone, 2026-10-24; full spec in the doc above):
  1) section nav pinned directly under the site header from page open (one fixed element, active follows scroll);
  2) two top mini cards (88px) mirror the first two 2D kit indicators, same Drawing in compact mode, lazy, phone only;
     markets/live-ticker tools keep their live cards;
  3) one continuous column header→footer (dark / light key surface), 10px of blueprint grid on both sides;
  4) every warning/disclaimer callout (`data-phone-disclaimer`, notices section) ends the article, inside the paper;
  5) a table too wide for its card at 360px reflows into stacked rows (CSS on the same `<table>`), no sideways
     scroll; short tokens nowrap, long text wraps between words only;
  6) calculator mode tab bar: one row, icon + short label (icons only if needed), 44px, active filled;
  7) LOCKED card order (rule 7 replaced, xzerone 2026-10-24): see "APPROVED — LOCKED: phone card order" below.

## APPROVED — LOCKED: phone card order, every tool below 768px (xzerone, 2026-10-24)
Permanent; applies to every current and future tool. Full spec: `docs/claude/approved-visuals-and-indicators.md`.
- Card 1 = INPUT (inputs, selects, sliders, keypad). Card 2 = OUTPUT: the result card holding any result
  action (Share / Export, Copy, Print, Download, Save), always second, always open. Card 3 = the main VISUAL.
- Input and output in one card: it is card 1, the visual card 2, the next most useful card 3.
- CHANGED 2026-10-24 (xzerone): only the PRIMARY output card (the one with Share / Export, or the main
  result) is always open, in place 2 (`phoneRole="output"`). SECONDARY output cards (long tables or
  schedules with a Download / Copy button, e.g. mortgage's two payment schedules) go to the collapsible
  group like other cards, with their buttons inside them (`phoneRole="output-secondary"`).
- At most 3 open cards on every tool. An input card with a copy button counts as the merged card 1.
- The primary output card is NEVER collapsed and NEVER after ad 1.
- Roles are set at server render: SectionCard `phoneRole` = "input" | "output" | "output-secondary" |
  "visual" | "visual-collapsed" | "extra" (raw cards: `data-phone-role` + `data-phone-open data-fixed`
  when open); globals.css orders them (input, output, visual, extra, docs row, ad 1, collapsed group,
  ad 2). Pure CSS from the server HTML: the open cards are exactly the open-role cards (input, output,
  visual, live-output, extra), no script orders or opens a card, no render-blocking tag. A page with
  fewer than 3 open roles marks its next open card `phoneRole="extra"` (e.g. Quick examples, by default). Every result button renders through `ResultActionButton` / `ShareExportButton` /
  CopyButton / PrintButton / DownloadButton / PdfDownloadButton / CopyLinkButton (`data-result-action`).
- Guard in CI: `tests/phone-card-order.mjs` (390px, every tool; also compares the order with JavaScript
  disabled). Exception kept: crypto-converter,
  forex-converter, commodities-tracker.

## APPROVED — LOCKED: phone home page /ar and /en (xzerone, 2026-10-23)
Approved phone home page (below 768px), as shipped in commits 9cf4fb6d, be5df414, cb9012b2 and fd3b15d3:
- One-row header: the uppercase `TOOLORALABS.COM` wordmark (shared `Wordmark`, Arimo, 15px, always LTR) and the smaller Docs / theme / share / language buttons (36px visible, 44×44 hit area, 8px apart; order from the start side Docs, theme, share, language).
- The calculator FIRST, in one device frame (tinted surface, 10px padding, 8px gaps, each section a lighter-bordered card). Rounded tabs with the active one filled light blue, then the history/archive card BEFORE the display, then the functions row, the keypad and the bottom row.
- The categories below it: 4 visible plus "عرض المزيد من الأقسام (N)" (count computed), "عرض أقل" when open.
- Footer: the wordmark always at the left edge on every locale; copyright and links aligned by the page language (right in Arabic, left in the other locales); 24px between rows, 44px link targets.

**Do not change the approved phone home page unless Yousef explicitly asks for that exact change.**
Locked by `npm run test:home-phone -- --base <url>` (a server on a dedicated port, e.g. 3110; CI job `home-phone-lock`, ubuntu-24.04 runner) against `tests/baselines/home-phone.json` (macOS, local) and `tests/baselines/home-phone.linux.json` (CI and the Linux container; fonts are self-hosted, but text rasterising differs by OS, so each OS has its own baseline): rects (±1px), font sizes, texts and element order of the header, calculator frame, categories list and footer at 360/390px in ar/en. The baseline is rewritten only with `npm run baseline:home-phone -- --approve`, after Yousef approves the exact change; in CI the PR label `approve-home-phone-baseline` rewrites the Linux one and uploads it as an artifact.
Approved change (Yousef, 2026-10-24): the calculator tab bar below 768px is ONE row of five button-style tabs (border + fill on every state, active light blue, 44px tall, equal widths, no scroll, no scrollbar), each an icon over a short label (`homeCalculator.modesShort`), icons only with aria-label and title in any locale whose short label does not fit; the mode menu button is desktop only. Baseline re-approved with `npm run baseline:home-phone -- --approve` after this change.

## Brand mark and share images (approved by Yousef 2026-10-29, PR #24)
- **Σ mark:** blue-600 (#2563eb) rounded tile with a white Σ on a 16-unit grid (`public/favicon.svg`, crisp at
  16px). Desktop header logo = Σ tile + the unchanged wordmark (`public/logo.svg`, `assets/logo-full-dark.svg`);
  the phone header keeps the written site name. Favicons, apple-touch-icon and the manifest icons
  (`app/manifest.ts`) come from `npm run icons --workspace=apps/web` (`scripts/brand-icons.mjs`).
- **Share images:** every indexable page has one: `/share/{locale}/{key}.png` (`app/share/[locale]/[image]/route.tsx`,
  1200×630, prerendered; key `home`, a tool slug, else `page-` + the path). The page list is
  `lib/indexable-pages.ts`, the one source of the sitemap too: a new indexable page goes there (with its share
  title) and its page's generateMetadata spreads `shareMetadata(locale, path)` (or puts `shareImageMetadata`'s
  images in its own openGraph). `npm run test:share-images` (BASE = a fixture server, also in CI desktop-lock)
  fails when any sitemap URL lacks og:image/twitter:image or its image is not 200 image/png. Titles are shaped by HarfBuzz
  (`lib/share-image/shape.ts`, bidi runs + face fallback chain from `assets/fonts`), never by satori, which
  has no shaper. `npm run test:share-text --workspace=apps/web` compares the shaped ar/hi/en titles with
  Chromium's rendering (ink IoU >= 0.80, same width) and must pass after any change to it.
