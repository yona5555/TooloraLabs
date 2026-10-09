# TooloraLabs — الدليل الشامل للمشروع

اقرأه مرة واحدة عند الحاجة إلى سياق المشروع. نص قاعدة بعينها: `grep -n '^## ' TooloraLabs-Claude-Instructions.md` ثم اقرأ ذلك القسم وحده. التاريخ: 2026-10-09.
القواعد التفصيلية في `.claude/rules/` (تُحمَّل تلقائياً حسب المسار): الرسوم وهيكل الصفحة `visuals.md`، الترجمة `i18n.md`، الحزم `packages.md`، الفحص `testing.md`.

## 1. المشروع
- TooloraLabs: موقع أدوات/حاسبات مجاني (حاسبات، محوّلات، مولّدات) لجمهور دولي (§14)، يُموَّل لاحقاً بـ AdSense + روابط تابعة + API مدفوع.
- الفلسفة (§0): الاكتمال المطلق لكل أداة؛ كل أداة تُبنى لتكون أفضل أداة من نوعها على الإنترنت.
- 101 أداة (`apps/web/data/tools.ts`)، 21 فئة (`categories.ts`).
- `README.md` قديم (يقول 31 أداة)؛ لا تعتمد عليه.
- الفئات: financial-calculators, business-finance, financial-markets, math, physics, chemistry, converters, ai-tools, developer-tools, file-tools, text-tools, student-productivity, health-fitness, date-time, fun-entertainment, weather, website-tools, algebra-number-theory, calculus-analysis, probability-statistics, geometry-coordinate-math.

## 2. البنية التقنية
- Monorepo (npm workspaces): `apps/web` — Next.js 16 (App Router + Turbopack)، React 19، TypeScript 5، Tailwind 4، next-intl. أهم المجلدات: `app/[locale]/`، `components/tools/<slug>/`، `components/tool-ui/` (SectionCard, AdSpace, ToolPageLayout, ToolAboveFold, RelatedToolsSidebar, EncyclopediaPaper)، `data/`، `messages/<locale>.json`، `lib/`.
- `packages/core` (محرك التنفيذ)، `packages/sdk` (أدوات البناء)، `packages/tools` (منطق كل حاسبة).
- CI (`.github/workflows/ci.yml`) على push/PR إلى main: lint + typecheck + اختبارات الحزم الثلاث + build.

## 3. نموذج العمل بين الأجهزة
- الماك ميني = المنسِّق والجهاز الرئيسي. اللينكس = عامل ينفّذ ولا يقرر هيكلياً. يوسف = السلطة العليا.

## 4. فهرس القواعد العامة
| § | الجوهر |
|---|---|
| 0 | الاكتمال المطلق لكل أداة |
| 2 | خطوة بخطوة، وتحقق بعد كل خطوة |
| 3 | حل جذري لا ترقيع (ممنوع try/catch لإخفاء خطأ أو تجاوز types) |
| 4 | commit/push/CI بعد كل تغيير، وانتظار صامت |
| 5 | الإيجاز، وبلا تعليقات كود إلا للضرورة |
| 11 | الحياد التام في كل أداة مالية |
| 12 | بنية الأدوات ذات البيانات الخارجية الحية |
| 15 | كل صفحة أداة قابلة للتوسع بلا إعادة هيكلة |
| 16 | ممنوع commit محلي بلا push |
| 21 | عمق ونظافة نسخة PDF/الطباعة |
| 26 | معيار خاص للمولّدات وأدوات التحويل |

بقية الأقسام: §1 و§19 في `testing.md`، و§10 و§14 في `i18n.md`، و§8–§9 و§13 و§17–§18 و§20 و§22–§25 و§27–§43 في `visuals.md`.

## 5. الربح
- إعلانات AdSpace على صفحات الأدوات فقط (لم تُربط بحساب AdSense بعد). روابط تابعة لكل أداة بإفصاح واضح. API مدفوع لاحقاً. اشتراك Pro مؤجَّل حتى تطبيق الموبايل.

## 6. خارطة الطريق المتبقية
- معلَّق: نظام نجوم/عدّاد استخدام، تسجيل دخول، صفحة Blog بالست لغات، قسم «What's New».
- أدوات مخطَّطة: 25 أداة رياضية بأربع مستويات؛ أدوات API مؤجَّلة حتى يتحقق دخل.
- قيد: commodities-tracker نافذته 7 أيام (حد MetalpriceAPI المجاني).

## 7. آخر عمل منجز
- Triangle Calculator: مختبر مؤشرات بـMafs v0.21 (commit `b255221`)؛ المؤشر الرئيسي `TriangleInteractivePlayground.tsx` أول الصفحة بجدول حي من 9 صفوف (commit `73c8392`).
- آخر commit على main عند 2026-10-09: `3144b85` (scientific-calculator unit-circle). CI ناجح.

## 8. المهام المعلَّقة
- Triangle Calculator: المعلَّق في `visuals.md` §7، ثم مفاتيح ترجمة للغات الست ولقطات حقيقية.
- إصلاح `<html lang dir>` الثابت على `lang="en" dir="ltr"` في `app/layout.tsx` لكل اللغات (يضر SEO وقارئات الشاشة).
- مراجعة الرسوم الفقيرة في المشروع واستبدالها برسوم أغنى (`visuals.md` §3).
- تحديث `README.md`.
- عمل غير مكتمل محفوظ في الفرع `wip/scientific-notation-rebuild` (إن وُجد): scientific-notation-converter وscientific-calculator.
