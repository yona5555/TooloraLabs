---
paths:
  - "apps/web/components/**"
  - "apps/web/app/**"
---
# هيكل الصفحة والرسوم والمؤشرات المعتمدة

> يعتمد على §8–§9 و§13 و§17–§18 و§20 و§22–§43 من `TooloraLabs-Claude-Instructions.md`. لا تخترع نوعاً عشوائياً؛ اختر من القائمة بما يخدم طبيعة البيانات.

## 1. هيكل صفحة الأداة (§8)
- **General rule (every tool):** Top of every tool page = 3 columns: input (left), result with a live indicator (middle), RelatedToolsSidebar + 300×600 AdSpace (right). Below it, cards span the full width with leaderboard ads between sections only. Reference: `loan-calculator` via `ToolAboveFold`; the right column hides on mobile and the columns stack.
- Above the Fold بلا تمرير: 3 أعمدة — إدخال (~320px) بقيم افتراضية تعطي نتيجة فوراً؛ نتيجة (~380–400px) مع مؤشر تفاعلي حقيقي (ممنوع رسم ثابت)؛ يمين (~300px) أدوات ذات صلة + AdSpace. على الموبايل تتكدس الأعمدة.
- القسم الموسوعي (EncyclopediaPaper) يحاكي ورقة A4 علمية؛ مؤشرات §31–§43 ملوّنة داخل بطاقات.
- أمثلة محلولة، أسئلة شائعة، «خلف الأداة» (تاريخ، معايير، مسار أكاديمي: 5 جامعات عالمية + جامعة/اثنتان عربيتان، يُتحقق منها ببحث حقيقي).
- المراجع: مصدر حقيقي (اسم، جهة، سنة، DOI/رابط) مع زر «اقرأ المصدر الأصلي».
- الإعلانات (§8.7): الصفحة الرئيسية بلا إعلان أبداً. صفحات الأدوات فقط، عبر AdSpace وحده: sidebar (300×600) أو leaderboard (ارتفاع ثابت 90/50px).
- SectionCard: حدود مستديرة ورأس أزرق `bg-blue-600`. التكبير عند `lg:` فقط. الشبكة `items-start`.
- **General rule A (2026-10-10, every tool):** card headers contain the title only — no number badges or counters (e.g. the old "20"/"21" circles). `GlassHeroCard`/`GlassIndicatorCard` keep `n` as an id/layout key only; it is never rendered.
- **General rule B (2026-10-10, every tool):** no plain number cards. Every card, including the main Result card, contains a live indicator deep in information (chart, interactive diagram, or detailed live table), not just numbers and text. Apply to every tool rebuilt from now on. Reference: scientific-notation-converter Result (decimal-point shift + draggable log ladder + live equivalent-forms table).
- Column fill (§17/§27): when one above-the-fold column is shorter, stretch it with `ToolAboveFold` `stretchInput` / `stretchResult` and give its last card `lg:flex-1` with real content that grows (drawing, list), never an empty band.
- **Instant result (every tool):** the page shows a real result on load (sample data when the tool needs input); never zeros, dashes or an empty state in the result or its indicators.
- **Drawing + table (every tool, updated 2026-10-10):** drawing cards are two parts: deep live table on the LEFT, live drawing on the RIGHT, same height, no gaps; mobile stacks the drawing on top and the table under it; RTL mirrors naturally. Use `tool-ui/three/LiveTable3DLayout` + `tool-ui/three/Scene3D` (lazy @react-three/fiber + drei, ssr:false, theme colors from `usePalette3D`). This replaces the older "drawing left, table right" direction.
- **Indicator set (every tool):** about 12 indicators chosen from the §31 library, all computed from the tool's real calculations and following its inputs live, with at least one interactive "wow" piece (drag, sliders or animation).
- **History panels (every tool that has one):** × delete per entry, live grand total of all results, entry count, Clear all, click an entry to reuse its result, persisted per visitor. Use `tool-ui/HistoryTape` + `lib/use-persisted-list`.
- **Tool cards (listings):** one unified card, half image and half text; the preview shows the full result panel uncropped; separate light and dark previews, each shown with its matching theme.
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
| 37–43 | بطاقات بإطار وترويسة زرقاء، بلا مربعات، بلا تسميات متراكبة، مقابض سحب واضحة، بلا فراغ، جداول بارزة، أزرار − / + تفاعلية (قد لا تكون في ملف التعليمات المحلي؛ اسأل يوسف قبل الاعتماد) |

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
- جدول **WORKED EXAMPLE** ملاصق **بجانب** المؤشر لا أسفله، وبالعمق نفسه لبقية مؤشرات الصفحة.
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
- sin/cos curves under all interactive indicators (confirmed by Yousef): المكوّن المشترك `TriangleSinCosLiveCurve` تحت (1) و(2) و(10) و(12)؛ استثناء معتمد من §32 بند 6.
- توزيع المؤشرات الـ12 المتبقية بين `AdSpace` على طول الصفحة، من أعلاها إلى أسفلها.
