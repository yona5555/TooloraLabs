# خارطة الطريق — TooloraLabs

> **ملاحظة مهمة:** هذا الملف مرجع تصميم (design reference) مبني على تحليل موقع منافس/نموذج مشابه، الهدف منه تحديد الفجوات الوظيفية والهيكلية بيننا وبين نسخة ناضجة من هذا النوع من المواقع. هذا **ليس نسخًا حرفيًا** لذلك الموقع — الألوان، الخطوط، والتفاصيل البصرية تُبنى لاحقًا بما يناسب هوية TooloraLabs الخاصة، وليس تقليدًا حرفيًا للمرجع.

## الغرض من هذا الملف

يوثّق هذا الملف الفجوة بين الوضع الحالي للموقع والتصميم المرجعي المعتمد للنسخة النهائية، حتى يكون مرجعًا ثابتًا لتخطيط العمل القادم بدل الاعتماد على الذاكرة أو نقاشات متفرقة.

## الميزات المطلوبة (مرتبة حسب الأولوية المنطقية)

### 1. مبدّل اللغة الظاهر بالواجهة (زر بالـ Navbar) — ✅ منجَز

- **الحالة:** `apps/web/components/layout/LanguageSwitcher.tsx` موجود ومربوط بالـ Navbar فعليًا، ويبدّل بين كل اللغات الست (en/ar/de/es/fr/hi) مع الحفاظ على نفس الصفحة الحالية.

### 2. مبدّل الوضع الليلي/النهاري (Dark/Light mode) — ✅ منجَز

- **الحالة:** `apps/web/components/layout/ThemeToggle.tsx` موجود ومربوط بالـ Navbar، مع دعم `dark:` كامل عبر مكوّنات الموقع وحفظ تفضيل المستخدم.

### 3. توسيع الفئات من 6 إلى 12 فئة — ✅ تجاوَز الهدف الأصلي

- **الوضع الحالي (محدَّث 2026-10-12):** **20 فئة** معرّفة في `apps/web/data/categories.ts` فعليًا (حُذفت فئة Fun & Entertainment وأدواتها الثلاث في 2026-10-16)، 15 منها فيها أدوات شغّالة: Health & Fitness (12)، Math (22)، Business (8)، Financial Calculators (7)، Chemistry (6)، Date & Time (5)، Dev Tools (6)، File Tools (6)، Physics (6)، Text Tools (6)، Markets (3)، Converters (3)، AI Tools (3)، Student Tools (4)، Weather (1).
- **5 فئات مُعرَّفة بلا أي أداة شغّالة بعد** (بذور لتوسّع رياضي/فيزيائي قادم، مرتبطة مباشرة بقائمة `comingSoon.ts` phase-1b): Algebra & Number Theory، Calculus & Analysis، Probability & Statistics، Geometry & Coordinate Math، Website Tools.
- **ملاحظة تاريخية:** فئة "AI Tools" القديمة (مولّد رمز QR فقط) أُزيلت 2026-08-17 لعدم علاقتها الفعلية بالذكاء الاصطناعي، ثم **أُعيد إنشاء فئة AI Tools من جديد بمحتوى فعلي** (Text to Speech، Speech to Text، Spelling & Grammar Checker) — هذه مرة فئة حقيقية لا فئة فارغة.
- **الدرس المستفاد (لا يزال سارياً):** لا تُضاف فئة جديدة فارغة بدون أدوات فعلية فيها إلا إذا كانت مربوطة بخطة توسّع موثّقة بـ`comingSoon.ts` كما هو حال الخمس الفئات أعلاه.

### 4. نظام "الأدوات الشائعة" (Popular Tools) بتقييمات نجوم وعدد استخدام

- **الوضع الحالي:** يوجد قسم "Featured Tools" ثابت (`apps/web/components/tools/FeaturedTools.tsx`) يعرض فقط الأدوات المعلّمة يدويًا بـ `featured: true` في `data/tools.ts`، بدون أي تقييم نجوم أو عدّاد استخدام حقيقي.
- **المطلوب:** حقل تقييم (نجوم) وعدد استخدام فعلي لكل أداة، مع منطق حقيقي لحسابهما وتحديثهما — يحتاج تخزين بيانات فعلي (قاعدة بيانات أو ما يعادلها)، وليس أرقامًا ثابتة بالكود.

### 5. زر "Sign In" ونظام مستخدمين

- **الوضع الحالي:** زر "Sign In" موجود بالـ Navbar لكنه شكلي بالكامل، بدون أي وظيفة أو صفحة تسجيل دخول مرتبطة.
- **المطلوب:** نظام تسجيل دخول وحسابات مستخدمين حقيقي.
- **ملاحظة:** هذي الميزة تُبنى **لاحقًا**، بعد استقرار الأدوات الأساسية — ليست أولوية في المرحلة الحالية.

### 6. صفحة Blog

- **الوضع الحالي:** غير موجودة إطلاقًا في المشروع.
- **المطلوب:** بناء قسم مدونة كامل (قائمة مقالات + صفحة عرض مقال منفرد)، مترجم باللغات الست (en/ar/de/es/fr/hi) بنفس نمط ومستوى جودة بقية الموقع.

### 7. صفحتا About وContact حقيقيتين — ✅ منجَز

- **الحالة:** `apps/web/app/[locale]/about` و`.../contact` مبنيتان بمحتوى فعلي كامل (`legal.about` و`legal.contact` بملفات الترجمة)، مترجمتان بالكامل عبر اللغات الست.

### 8. قسم "What's New" الجانبي (شريط جانبي بآخر التحديثات)

- **الوضع الحالي:** غير موجود.
- **المطلوب:** قسم جانبي (widget) بالصفحة الرئيسية يعرض آخر الإضافات أو التحديثات على الموقع.
- **ملاحظة:** لا يُخلط هذا مع "widget الإمبيد" (`/embed/[slug]` + صفحة `embed-tools`) المذكور بقسم 9 أدناه — ذاك الأخير منجَز بالكامل ويخدم غرضًا مختلفًا تمامًا (تضمين أداة واحدة بموقع خارجي).

### 9. توسيع عدد الأدوات الفعلية

- **الوضع الحالي (محدَّث 2026-10-12، تحقّق فعلي من `data/tools.ts` و`components/tools/`):**
  - **101 أداة فعلية وشغّالة بالكامل**، كل واحدة بمستوى العمق الموسوعي الكامل (above-the-fold + قسم تعليمي + أمثلة محلولة + أسئلة شائعة + "خلف الأداة" + مسار أكاديمي + مراجع) — لا توجد أي أداة "Coming Soon" أو أداة بمستوى مبسّط متبقية ضمن الـ101.
  - موزَّعة على 16 فئة شغّالة (أهمها Math بـ22 أداة وHealth & Fitness بـ12 وBusiness بـ8)؛ التفاصيل الكاملة بقسم 3 أعلاه.
  - **مترجمة بالكامل إلى 6 لغات**: en/ar/de/es/fr/hi، مع تحقق آلي مؤكَّد (2026-10-12) أن مفاتيح الترجمة الست متطابقة 1:1 مع `en.json` بلا أي نقص أو زيادة.
- **قائمة الأدوات القادمة الرسمية الآن هي `apps/web/data/comingSoon.ts`** (152 أداة مخطَّطة عبر 4 مراحل: phase-1، phase-1b، phase-2، phase-3)، لا القوائم القديمة أسفل هذا الملف — انظر قسم "خارطة طريق الأدوات القادمة" لتفاصيل كل مرحلة.

### 10. قيد مؤقت: نافذة الرسم البياني التاريخي بقسم السلع (Commodities)

- **الوضع الحالي (2026-08-10):** قسم السلع (`commodities-tracker`) يستخدم نافذة تاريخية ثابتة بـ7 أيام فقط لرسم سعر الذهب، بلا اختيار فترة (1شهر/1سنة) كما في أداتَي العملات الرقمية والعملات الدولية.
- **السبب:** خطة MetalpriceAPI المجانية (مصدر بيانات الذهب/الفضة) لا توفر endpoint نطاق تاريخي (Timeframe) إلا بخطة مدفوعة، والبديل الوحيد المتاح (طلب لكل تاريخ على حدة) سيستهلك عشرات الطلبات من أصل 100 طلب/شهر فقط لبناء نافذة 30 يومًا. جُرِّبت بدائل مجانية أخرى (FRED — تبيّن أن سلسلة الذهب اليومية أُلغيت فعليًا من المنصة؛ Stooq — محجوب خلف فحص JavaScript لا يعمل من الخادم؛ Nasdaq Data Link — محجوب خلف حماية Incapsula) ولم تنجح أي منها.
- **الحل الحالي:** نافذة 7 أيام ثابتة فقط، بتخزين طويل الأمد لكل تاريخ ماضٍ (لا يتغيّر أبدًا بعد نشره)، مما يبقي الاستهلاك الشهري ضمن الحد المجاني بأمان.
- **المطلوب لاحقًا:** يُعاد تقييم هذا القيد بعد الإطلاق الفعلي وتوفر بيانات زيارات حقيقية على قسم السلع، لترقية خطة MetalpriceAPI (أو اعتماد مصدر بديل مدفوع) إن استدعى الأمر لدعم فترات أطول (شهر/سنة) بنفس عمق أداتَي العملات.

### 11. أداة جديدة: فرق التوقيت والمناطق الزمنية (World Time / Time Zone Converter) — ✅ منجَز

- **القرار النهائي المُطبَّق:** الخيار (أ) — حساب خالص بدون أي API خارجي، عبر `Intl.DateTimeFormat` القياسي في JavaScript (`packages/tools/src/converters/WorldTimeConverter.ts`)، بنفس منهجية BMI الحرفية: بدون اتصال شبكة، بدون حد استخدام، وبموثوقية 100%. لم يُستخدم WorldTimeAPI ولا أي بديل خارجي.
- الأداة الآن جزء من الـ31 أداة الكاملة العمق، مترجمة بالست لغات.

## خطة النمو بعد الإطلاق — أدوات مؤجَّلة

> **تاريخ التوثيق:** 2026-08-23. هذا القسم يوثّق الأدوات غير المكتملة أو المؤجَّلة عمدًا، بعد اكتمال دفعة الإطلاق النهائية (3 أدوات موسوعية جديدة: مولّد ألوان متناسقة، دمج/تقسيم PDF، ضاغط/فاكّ ضغط ZIP — الثلاثة بلا أي اعتماد على API خارجي). الهدف: مرجع ثابت لما تبقّى، بدل الاعتماد على الذاكرة.

### من الدفعة الحالية غير المكتملة (دفعة الـ13 أداة الأصلية) — ✅ الدفعة كاملة الآن (تحقّق 2026-10-12)

تحقّقتُ من الحالة الفعلية عبر `data/tools.ts` بتاريخ 2026-10-12: **13 من 13 أداة اكتملت ودُفعت فعليًا لـ origin/main**. الخمسة الأولى اكتملت 2026-08-23 (commits: `9224747`، `a34dbd9`، `53fd946`، `453d522`، `ab21a30`):

1. ✅ Affordable Loan Calculator (حاسبة القرض العكسية) — منجَزة
2. ✅ Retirement Calculator (حاسبة التقاعد) — منجَزة
3. ✅ House Affordability Calculator (حاسبة القدرة على تحمّل تكلفة المنزل) — منجَزة
4. ✅ Debt-to-Income Ratio Calculator (حاسبة نسبة الدين إلى الدخل) — منجَزة
5. ✅ Ideal Weight Calculator (حاسبة الوزن المثالي) — منجَزة

**الـ8 أدوات المتبقية — كلها منجَزة الآن أيضًا** (موجودة فعليًا بـ`data/tools.ts`، مؤكَّد 2026-10-12):

- **الصحة (Health & Fitness):**
  - ✅ Target Heart Rate Calculator (حاسبة معدل ضربات القلب المستهدف)
  - ✅ Sleep Calculator (حاسبة النوم)
- **الرياضيات (Math & Science):**
  - ✅ Fraction Calculator (حاسبة الكسور)
  - ✅ Probability Calculator (حاسبة الاحتمالات)
  - ✅ Statistics Calculator (حاسبة الإحصاء: المتوسط والوسيط والمنوال والمدى)
- **عامة:**
  - ✅ GPA Calculator (حاسبة المعدل التراكمي) — بالاسم `GPA / Grade Calculator`
  - ✅ Random Number Generator (مولّد أرقام عشوائية)
  - ✅ Fuel Cost Calculator (حاسبة تكلفة الوقود)

**ملاحظة مهمة:** بندان من القائمة الأصلية للـ15 أداة لم يُدرَجا هنا لأنهما حُسما بقرار صريح من المستخدم قبل البدء بالتنفيذ (عبر AskUserQuestion)، وليسا "أدوات مؤجَّلة": General Loan Calculator تحوّل إلى توسيع الأداة الموجودة `loan-calculator` (منجَز، commit `9d05745`)، وSavings Calculator أُلغي بالكامل لأن Compound Interest Calculator الحالية تغطي نفس الحاجة فعليًا.

### أدوات مجانية إضافية بلا تكلفة API (يمكن تنفيذها في أي وقت لاحق)

- ✅ **حاسبة تقويم الحمل الأسبوعي** (Pregnancy Week-by-Week Calculator) — منجَزة، شغّالة بالاسم `Pregnancy Calculator` (slug: `pregnancy-calculator`).
- ✅ **حاسبة وقت القراءة** (Reading Time Calculator) — منجَزة، شغّالة.
- ⏳ **مولّد أسماء عشوائي** (Random Name Generator) — لا يزال مؤجَّلاً، موجود بـ`comingSoon.ts` phase-1 (`random-name-generator`).
- ⏳ **حاسبة نسبة الذهب** (Golden Ratio Calculator) — لا يزال مؤجَّلاً، موجود بـ`comingSoon.ts` phase-1 (`golden-ratio-calculator`).

### أدوات تحتاج تكلفة API مستمرة (تُنفَّذ فقط بعد تحقيق دخل حقيقي من الموقع)

هذه الأدوات تتطلّب خدمة خارجية مدفوعة أو ببنية تسعير تعتمد على الاستخدام (per-request/per-minute)، وليست حسابًا محليًا خالصًا مثل بقية أدوات الموقع — لذلك **تُؤجَّل عمدًا لما بعد الإطلاق وحتى تحقيق دخل فعلي من الموقع يغطي تكلفتها المستمرة**، تجنبًا لتكرار نفس الدرس المستفاد من قيد نافذة السلع التاريخية (قسم 10 أعلاه) حيث خطة مجانية محدودة تسبّب قيودًا وظيفية دائمة:

- ضاغط الفيديو (Video Compressor)
- تحويل نص لصوت (Text-to-Speech)
- تحويل كلام لنص (Speech-to-Text)
- ضغط الصور بذكاء (Smart Image Compression)
- إزالة خلفية الصورة تلقائيًا (Automatic Background Removal)
- مدقق إملائي وقواعدي (Spelling & Grammar Checker)
- ملخّص نصوص (Text Summarizer)
- رفع جودة/دقة الصور (Image Upscaler)
- فحص السرقة الأدبية (Plagiarism Checker)
- كاشف المحتوى المُولَّد بالذكاء الاصطناعي (AI-Generated Content Detector)
- محوّل PDF لـ Word قابل للتعديل الكامل (PDF-to-Editable-Word Converter)
- استخراج النص من الصور (OCR متقدم / Advanced OCR)

## خطة تطبيق الموبايل (مستقبلي)

### الهدف

بعد ما يستقر موقع الويب، نشر تطبيق على **Apple App Store** و**Google Play Store**، على الأرجح باستخدام **React Native** أو **Expo**. الفكرة الأساسية: إعادة استخدام منطق `packages/core` و`packages/sdk` و`packages/tools` **مباشرة وبدون تعديل**، لأنها TypeScript خالص بدون أي اعتماد على DOM أو المتصفح — والاكتفاء ببناء واجهة موبايل جديدة فوقها فقط (مو إعادة كتابة منطق الحسابات من الصفر).

### القيد المعماري — يبدأ الالتزام به من الآن

هذا مو خطة مستقبلية بس، هذا قاعدة تنطبق على كل شغل قادم بالمشروع:

> **`packages/core` و`packages/sdk` و`packages/tools` يجب أن تبقى "منطق خالص" (pure logic) — بدون أي اعتماد على DOM أو `window` أو `document` أو `localStorage` أو أي API خاص بالمتصفح. يجب أن تشتغل في أي بيئة JavaScript (متصفح، React Native، Node.js) بدون أي تعديل.**

أي كود يحتاج بيئة المتصفح تحديدًا (حفظ تفضيل بـ`localStorage`، قراءة `document`، أي تفاعل مع DOM) يبقى محصورًا داخل `apps/web` فقط، ولا ينزل أبدًا لهذي الحزم الثلاث.

### نتيجة المراجعة (تمّت اليوم)

راجعت الكود الحالي بالكامل بالحزم الثلاث بحثًا عن أي مخالفة لهذا القيد — **ما لقيت أي مخالفة**:

- بحث شامل عن `window`، `document`، `localStorage`، `sessionStorage`، `navigator` بمجلدات `src` الثلاث: **لا يوجد أي استخدام**.
- الدوال المضافة اليوم تحديدًا (`detectDigitStyle`، `formatLocalizedNumber` في `packages/core`) تستخدم فقط regex عادي و`Intl.NumberFormat` — وهذي ليست API خاصة بالمتصفح، بل جزء من مواصفة JavaScript القياسية (ECMA-402) وموجودة في Node.js وReact Native (عبر محرك Hermes) على حد سواء.
- كل منطق التحقق (validation) اللي أضفناه اليوم بحدود الحاسبات السبع موجود بالكامل داخل `apps/web/components/tools/*` — مو داخل `packages/tools`. الحزمة المشتركة نفسها ما فيها أي حدود تحقق مكتوبة، فقط التنفيذ الحسابي الخالص.
- **ملاحظة إضافية مهمة:** ملف `tsconfig.base.json` (اللي ترثه الحزم الثلاث) يحدد `"lib": ["ES2022"]` فقط — بدون `"DOM"`. يعني حتى لو حاول أحد بالمستقبل يستخدم `window`/`document` بالخطأ داخل هذي الحزم، TypeScript نفسه بيرفض يبني الكود لأن أنواع DOM غير معرّفة أصلًا بهذا الإعداد. هذا قيد مفروض تلقائيًا على مستوى الأدوات، مو بس اتفاق شفهي.

## خارطة طريق الأدوات القادمة (تحديث 2026-09-04، أُعيد التحقق منها 2026-10-12)

> يوثّق هذا القسم تحديدًا الأدوات الرياضية المخطَّطة القادمة، بعد فحص فعلي للأدوات الحالية لتفادي أي تكرار، بالإضافة لحالة الدفعة الأخيرة من الأدوات المنجزة على جهاز اللينكس.

### قسما Math وPhysics — ✅ منجَزان كقسمين قائمين بذاتهما (تحديث 2026-10-12)

منذ كتابة هذا القسم أول مرة (2026-09-04) لم يكن لدى الموقع فئتا "Math" أو "Physics" مستقلتين أصلًا. الآن كلاهما فئة حقيقية قائمة في `data/categories.ts` بأدوات فعلية شغّالة بعمق موسوعي كامل ومؤشرات 3D تفاعلية حية (`tool-ui/three/*`): **Math بـ22 أداة** (GCF & LCM، Triangle Calculator، Probability، Statistics، Matrix، Vector، Graphing، Circle، Standard Deviation، Mean/Median/Mode/Range، Percentage، Multiplication Table، Notepad، Random Number Generator، وغيرها) و**Physics بـ6 أدوات** (Density، Ohm's Law، Energy/Work/Power، Kinematics، Force & Newton's Law، Projectile Motion). القائمة التفصيلية أدناه (25 أداة مخطَّطة) كانت الخطة الأصلية الضيّقة لهذين القسمين؛ **القائمة الرسمية الحالية والأوسع بكثير** للتوسّع الرياضي/الفيزيائي/الكيميائي القادم هي `comingSoon.ts` phase-1b (82 أداة: Algebra & Number Theory، Calculus & Analysis، Probability & Statistics، Geometry & Coordinate Math، Physics، Chemistry) — راجعها هي، لا القائمة التالية.

### أدوات رياضية مخطَّطة (25 أداة، مرتّبة من الأسهل للأصعب) — جزئيًا منجَزة، القائمة الأشمل الآن بـ`comingSoon.ts` phase-1b

**المستوى 1 — الأسهل:** ✅ GCF & LCM Calculator (منجَزة)، Prime Factorization Calculator, Ratio & Proportion Calculator, Exponents & Powers Calculator, Number Base Converter (Binary/Octal/Decimal/Hex)

**المستوى 2 — سهل-متوسط:** Pythagorean Theorem Calculator, ✅ Triangle Angle Calculator (منجَزة تحت اسم `Triangle Calculator`، تغطي حل المثلث بالزوايا والأضلاع معًا)، Trigonometry Calculator (SOH-CAH-TOA) (لا تزال مؤجَّلة، `comingSoon.ts` phase-1)، Slope & Distance Formula Calculator, Arithmetic & Geometric Sequence Calculator, Permutations & Combinations Calculator, ✅ Basic Probability Calculator (منجَزة تحت اسم `Probability Calculator`)

**المستوى 3 — متوسط:** Simple Pendulum Period Calculator, Torque Calculator, Wave Speed/Frequency/Wavelength Calculator, Half-Life & Radioactive Decay Calculator, Percent Composition & Empirical Formula Calculator, Boyle's & Charles's Law Calculator, System of Linear Equations Solver, Complex Numbers Calculator (كل بنود هذا المستوى لا تزال غير منجَزة؛ لم تُشاهَد في `tools.ts` ولا `comingSoon.ts` الحاليين بهذه الأسماء تحديدًا)

**المستوى 4 — الأصعب:** Limits Calculator, Advanced Derivative Calculator (امتداد حقيقي لوضع derivative المحدود في Step-by-Step Math Solver — دوال مثلثية/أسية/سلسلة، وليس تكرارًا)، Integral Calculator, Logarithm & Exponential Equation Solver, Binomial Theorem/Series Expansion Calculator (كل بنود هذا المستوى لا تزال غير منجَزة)

### أدوات إضافية معتمدة

- ✅ **Pace Calculator** (Health & Fitness) — منجَزة (4 أوضاع: Pace/Time/Distance, Multipoint, Converter, Finish Time).

### أدوات منافسة تطبيقات مدفوعة (منجزة من اللينكس، رُفعت لاحقًا لمعايير الجودة الكاملة من الماك)

Step-by-Step Math Solver ✅، Graphing Calculator ✅، Notepad Calculator ✅

### أدوات هندسية (منجزة من اللينكس، رُفعت لاحقًا لمعايير الجودة الكاملة من الماك)

Area Calculator ✅، Surface Area Calculator ✅، Volume Calculator ✅

### فرع أرشيفي غير مكتمل: `wip/scientific-notation-rebuild`

فرع `origin/wip/scientific-notation-rebuild` هو **أرشيف لعمل غير مكتمل** على إعادة بناء Scientific Notation Converter، ولم يُدمَج بـ`main`. الأداة الحالية الشغّالة فعليًا على `main` (`scientific-notation-converter`) مستقلة عنه وكاملة بذاتها. لا يُعتمَد على هذا الفرع ولا يُدمَج دون مراجعة صريحة لأنه قد يحتوي كودًا جزئيًا أو تجريبيًا فقط.

---

**تحديث 2026-10-12 — ما استُجدّ منذ 2026-10-09:** دفعة كبيرة من العمل دُفعت لـ`main` خلال هذه الفترة: (1) **إعادة بناء أدوات الأسواق المالية** (financial-markets) — Crypto Converter بتصميم جديد كامل (رسم شموع OHLC بـ9 نطاقات زمنية، حلقات هيمنة، مؤشر الخوف والطمع، سيناريو الـhalving)، Forex Converter وCommodities Tracker بتصميم سوق معتمد ومؤشرات بيانات حية إضافية؛ (2) **Batch Invoice Calculator** أداة جديدة كاملة (فوترة دفعية مع تصدير CSV/Excel و12 مؤشر بيانات حية)؛ (3) **اكتمال قسم Math** عمليًا — موجة إعادة بناء شملت Multiplication Table Generator وNotepad Calculator وRandom Number Generator وMatrix وVector وGraphing وCircle وGCF & LCM وProbability وStatistics/Significant Figures/Step-by-Step Solver وArea/Surface Area/Volume وTriangle Calculator، كلها بجداول حية ومؤشرات 3D تفاعلية (`tool-ui/three/*`)؛ (4) **اكتمال قسم Physics** عمليًا — Projectile Motion وForce وEnergy/Work/Power وKinematics وOhm's Law وDensity، بنفس منهجية الجداول الحية والمشاهد 3D. راجع قسمي "Math وPhysics" و"توسيع عدد الأدوات الفعلية" أعلاه للتفاصيل الكاملة والأرقام المحدَّثة.
