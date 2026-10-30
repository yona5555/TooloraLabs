# TooloraLabs — الدليل الشامل للمشروع

اقرأه مرة واحدة عند الحاجة إلى سياق المشروع. نص قاعدة بعينها: `grep -n '^## ' TooloraLabs-Claude-Instructions.md` ثم اقرأ ذلك القسم وحده. التاريخ: 2026-10-09.
القواعد التفصيلية في `.claude/rules/` (تُحمَّل تلقائياً حسب المسار): الرسوم وهيكل الصفحة `visuals.md`، الترجمة `i18n.md`، الحزم `packages.md`، الفحص `testing.md`.

## 1. المشروع
- TooloraLabs: موقع أدوات/حاسبات مجاني (حاسبات، محوّلات، مولّدات) لجمهور دولي (§14)، يُموَّل لاحقاً بـ AdSense + روابط تابعة + API مدفوع.
- الفلسفة (§0): الاكتمال المطلق لكل أداة؛ كل أداة تُبنى لتكون أفضل أداة من نوعها على الإنترنت.
- 101 أداة (`apps/web/data/tools.ts`)، 21 فئة (`categories.ts`).
- `README.md` قديم (يقول 31 أداة)؛ لا تعتمد عليه.
- الفئات: financial-calculators, business-finance, financial-markets, math, physics, chemistry, converters, ai-tools, developer-tools, file-tools, text-tools, student-productivity, health-fitness, date-time, weather, website-tools, algebra-number-theory, calculus-analysis, probability-statistics, geometry-coordinate-math.

## 2. البنية التقنية
- Monorepo (npm workspaces): `apps/web` — Next.js 16 (App Router + Turbopack)، React 19، TypeScript 5، Tailwind 4، next-intl. أهم المجلدات: `app/[locale]/`، `components/tools/<slug>/`، `components/tool-ui/` (SectionCard, AdSpace, ToolPageLayout, ToolAboveFold, RelatedToolsSidebar, EncyclopediaPaper)، `data/`، `messages/<locale>.json`، `lib/`.
- `packages/core` (محرك التنفيذ)، `packages/sdk` (أدوات البناء)، `packages/tools` (منطق كل حاسبة).
- CI (`.github/workflows/ci.yml`) على push/PR إلى main: lint + typecheck + اختبارات الحزم الثلاث + build.
- اعتماد baselines القفل (2026-10-26): label `approve-desktop-baseline` / `approve-home-phone-baseline` على PR من المستودع نفسه يجعل مهمة `regenerate-baselines` تكتب baseline لينكس، وتحذف الـ label، ثم تعمل commit وpush بتوكن تطبيق GitHub **toolora-baseline-bot-4jty** (App ID 5485467، صلاحياته contents + pull-requests + workflows: write، مثبَّت على TooloraLabs وحده). الأسماء فقط: يُصدَر توكن التطبيق من `vars.TOOLORA_BOT_CLIENT_ID` (متغيّر المستودع) و`secrets.TOOLORA_BOT_PRIVATE_KEY` (secret في Actions). حُذف secret `TOOLORA_BOT_APP_ID` في 2026-10-28 لأن create-github-app-token v3 يستعمل `client-id` لا `app-id`، ولا يُعاد إنشاؤه. الـ push بالتطبيق يبدأ تشغيل pull_request عادياً (لا action_required)، فلا حاجة لـ commit يدوي.

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

## 9. خط أنابيب يتحقق من نفسه (2026-10-28)
- **صفر تحذيرات يُفشل الفحص:** `eslint --max-warnings 0`؛ البناء في CI يمر عبر `scripts/run-no-warnings.mjs` فيفشل عند أي سطر تحذير (Next.js ⚠، webpack، React، Node، npm، deprecated)؛ اختبارات Vitest تفشل عند أي `console.warn`/`console.error` أو تحذير Node (`tests/vitest-no-console.ts` عبر `packages/*/vitest.config.mts`)؛ ومهمة `zero-warnings` في `ci.yml` تفشل إن ترك أي job في التشغيل نفسه annotation بمستوى warning أو failure. الإصلاح جذري دائماً، لا تجاهل ولا قاعدة ignore.
- **حماية main:** classic branch protection، `strict: true` (الفرع يجب أن يكون محدَّثاً قبل الدمج)، والفحوص الإلزامية الاثنا عشر: build وhome-phone-lock وdesktop-lock وsite-audit وgates-self-test وperf-budget وaudit وAnalyze (javascript-typescript) وAnalyze (actions) وzero-warnings وaudit-zero-warnings وcodeql-zero-warnings (الثلاثة الأخيرة تشغّل `scripts/zero-warnings.sh`).
- **main-health:** بعد كل تشغيل على main لـ CI وCodeQL وAudit وSBOM وScorecard وPR auto-update وLaunch readiness، يفتح `scripts/main-health.mjs` (من `main-health.yml`) issue واحداً لكل workflow بعنوان `main-health: <workflow>` ووسم `main-health`، مسنَداً إلى yona5555 (فيصله إشعار)، أو يعلّق عليه إن كان مفتوحاً، عند أي نتيجة غير success أو أي annotation تحذير؛ وعند أول تشغيل نظيف يغلق issue ذلك الـworkflow وحده بتعليق فيه رابط التشغيل. التشغيل الملغى لأن تشغيلاً أحدث حلّ محله لا يُحكم عليه.
- **site-audit وperf-budget (ratchet):** `scripts/ratchet.mjs` يحوّل البوابتين إلى فحص لا يسمح بالتراجع (لا صفر فوري): يفشل فقط إذا ارتفع عدد معيار ما لصفحة قيست (site-audit)، أو تراجع LCP/TBT/CLS/JS أو انخفض Performance بأكثر من هامش التذبذب المقاس (perf-budget)، أو كانت صفحة جديدة بلا أساس فيها أي ملاحظة. `.audit/ratchet/site-audit.json` و`.audit/ratchet/perf-budget.json` هما الأساس؛ يُخفَّضان فقط (`npm run ratchet:update`)، وأي رفع لهما يفشل (`ratchet.mjs check-baseline`). الصفر الكامل على الموقع كله هو `launch-readiness` (يومي على main، غير إلزامي لطلبات الدمج) الذي يقيس كل صفحة ويقرّر جاهزية الإطلاق.
- **التحقق من الآن فصاعداً = قراءة واحدة:** `gh issue list --label main-health --state open`. لا issues مفتوحة = main سليم. لا قراءة لتشغيلات جارية ولا انتظار.

## 10. الإطلاق: متغيرات Vercel Production الإلزامية (2026-10-28)
- يجب ضبط هذه المتغيرات الثلاثة في Vercel → Project → Settings → Environment Variables، بيئة **Production**:
  - `METALPRICE_API_KEY` (أسعار الذهب والفضة، `lib/commodities/metalprice.ts`)
  - `OILPRICE_API_KEY` (أسعار WTI وBrent، `lib/commodities/oilprice.ts`)
  - `EXCHANGE_RATE_API_KEY` (أسعار العملات، `lib/forex/exchangerate.ts`)
- غياب أيٍّ منها في بناء Production (`VERCEL_ENV=production`) يوقف البناء فوراً برسالة تذكر اسم المتغير الناقص فقط: `assertMarketApiKeysForProduction` في `apps/web/lib/api-key.ts`، يُستدعى مرة واحدة من `apps/web/next.config.ts` في مرحلة `next build`. القائمة المصدر الوحيد: `MARKET_API_KEYS` في الملف نفسه؛ أي مفتاح سوق جديد يُضاف إليها.
- بناء CI وPreview والجهاز المحلي لا يحتاجها: كل أداة تسلك مسار «لا مفتاح» الصريح (لا طلب، لا سجل، حالة «البيانات غير متاحة»).

## 12. هامش تذبذب perf-budget في ratchet.mjs (2026-10-30)
- **القياس:** `BASE=<fixture> LOCALES=en RUNS=10 node apps/web/scripts/perf-budget.mjs <6 صفحات ممثّلة>` على نفس البناء (لا تغيير بينها)، فمحسوبة 10 قيم خام لكل معيار لكل صفحة؛ الهامش = أكبر فرق (max−min) عبر التكرارات العشرة، عبر 5 من الصفحات الستّ.
- **الاستثناء:** استُبعدت crypto-converter: فروقها (LCP 3.1 ثانية! Performance 16 نقطة) من تذبذب شبكة الأسعار الحيّة (fixtures لا تزال تعيد محاولات) لا من أداء الصفحة نفسها.
- **المفاجأة:** TBT وحدها وصل تذبذبها إلى 308 م.ث على صفحة فيها مؤقِّتات كثيرة (world-time-converter) بلا أي تغيير آخر — أعلى بكثير من الافتراض الأول (40 م.ث)، فهامشها الآن 350.
- **الهوامش الحالية** (`scripts/ratchet.mjs`، `TOLERANCE`): LCP 60ms، TBT 350ms، CLS 0.01، Performance 8، JS 3KiB.
- **تحذير:** قيست على جهاز Mac محلي لا على عداء CI (ubuntu-24.04)؛ القيمة المعتمدة فعلياً هي ما يقيسه CI، فيُعاد القياس على CI (نفس الطريقة، launch-readiness أو تشغيل مخصص) عند تراكم بيانات كافية، وتُراجَع الهوامش إن اختلفت.
