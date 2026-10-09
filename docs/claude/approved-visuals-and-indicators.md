# الرسوم والمؤشرات المعتمدة (مرجع الاختيار والتطبيق)

> يعتمد على §31 و§32 و§36 من `TooloraLabs-Claude-Instructions.md`. لا تخترع نوعاً عشوائياً؛ اختر من القائمة بما يخدم طبيعة البيانات.

## 1. مكتبة الأنواع العشرون (§31)
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

## 2. قالب التطبيق الإلزامي (§32)
- كل مؤشر داخل `SectionCard` مستقلة: إطار كامل + رأس أزرق (`bg-blue-600`) + عنوان واضح.
- جدول **WORKED EXAMPLE** ملاصق **بجانب** المؤشر لا أسفله، وبالعمق نفسه لبقية مؤشرات الصفحة.
- حجم المؤشرات موحّد ومتوسط (الوزن البصري الفعلي لا `viewBox` فقط). أبعاد SVG ثابتة بخاصيتي `width`/`height` (مثل 168×168 للدونات) لا بصنف CSS متغيّر.
- كل قسم له `h3` وجملة تمهيدية خاصة، بلا تكرار معلومات بين الأقسام.
- ممنوع دمج نوعين من الرسوم في بطاقة واحدة.
- **المرجع الأول:** قسم "Cost by Power Source" في Fuel Cost Calculator (`FuelTypeCostComparisonChart.tsx`). **حالة تطبيق كاملة:** Break-Even Point Calculator (10 مؤشرات).
- أمثلة مطبَّقة للنوع 1: `FuelPriceSensitivityDiagram.tsx` و`EduBarChart.tsx`.

## 3. مؤشرات Triangle Calculator المعتمدة (مختبر Mafs، §36)
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

## 4. معلَّق على المؤشرات (لم يُنفَّذ)
- منحنيان حيّان (أحمر sin، أخضر cos) مرتبطان بزاوية حية تحت المؤشرات. **النطاق غير مؤكَّد:** ثلاثة قابلة للسحب فقط، أم كل المؤشرات؟ اسأل يوسف.
- توزيع المؤشرات الـ12 المتبقية بين `AdSpace` على طول الصفحة.
- استبدال الرسوم الفقيرة في المشروع برسوم أغنى.
