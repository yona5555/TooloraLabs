# إعداد Analytics ومحركات البحث — الخطوات اليدوية المتبقية

هذا الملف يوثّق فقط الخطوات التي **يجب أن تنفّذها أنت يدويًا** خارج الكود، لأنها تتطلب حسابات وموافقات لا يمكن للكود إنشاءها تلقائيًا. كل الجانب التقني (السكربتات، meta tags، متغيرات البيئة) جاهز بالفعل في الكود ولن يعمل أو يظهر إطلاقًا حتى تضيف القيم الحقيقية أدناه إلى `.env.local`.

## كيف يعمل هذا تقنيًا (خلفية سريعة)

- كل قيمة أدناه تُقرأ من متغير بيئة في `apps/web/.env.local` (انسخ `apps/web/.env.example` كنقطة بداية).
- طالما المتغير فارغ، لا يظهر أي سكربت Analytics ولا أي meta tag تحقق في HTML الموقع — لا حاجة للقلق من ظهور بيانات وهمية أو meta tags فارغة.
- بعد إضافة القيم الحقيقية، أعد تشغيل خادم التطوير (`npm run dev`) أو أعد النشر على الاستضافة الفعلية، والقيم ستظهر تلقائيًا في كل صفحات الموقع وبكل اللغات.

---

## 1. Google Analytics 4 (GA4)

**الخطوات اليدوية:**
1. اذهب إلى [analytics.google.com](https://analytics.google.com) وسجّل الدخول بحساب Google الخاص بك.
2. أنشئ حساب Analytics جديد (Admin → Create Account) إن لم يكن لديك واحد.
3. داخل الحساب، أنشئ **خاصية (Property)** جديدة من نوع GA4، وأدخل اسم موقعك ومنطقتك الزمنية وعملتك.
4. أثناء إعداد الخاصية، أضف **مصدر بيانات ويب (Web data stream)** وأدخل رابط الموقع `https://tooloralabs.com`.
5. بعد إنشاء المصدر، ستحصل على **Measurement ID** بالصيغة `G-XXXXXXXXXX` — هذا هو المطلوب.

**أين تضعه:**
```
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```
في ملف `apps/web/.env.local`.

**كيف تتأكد أنه يعمل:** بعد النشر، افتح تقرير "Realtime" داخل GA4، تصفّح موقعك من متصفح آخر، ويجب أن تظهر زيارتك خلال ثوانٍ.

---

## 2. Google Search Console

**الخطوات اليدوية:**
1. اذهب إلى [search.google.com/search-console](https://search.google.com/search-console).
2. اختر إضافة خاصية من نوع **"Domain"** (يغطي كل النطاقات الفرعية وHTTP/HTTPS معًا — الخيار الموصى به) أو **"URL prefix"** إذا كنت تفضّل التحقق بطريقة meta tag بسرعة.
3. إن اخترت **URL prefix**، ستظهر لك عدة طرق تحقق — اختر **"HTML tag"**، وستحصل على وسم شبيه بـ:
   ```html
   <meta name="google-site-verification" content="XXXXXXXXXXXXXXXXXXXXXXXX" />
   ```
   انسخ فقط قيمة `content` (الجزء داخل علامتي الاقتباس).
4. إن اخترت **Domain**، ستحتاج بدلًا من ذلك إضافة سجل TXT في إعدادات DNS الخاصة بنطاقك — هذه الطريقة لا تحتاج أي تعديل في الكود، تُنفَّذ بالكامل من لوحة تحكم مزوّد النطاق.

**أين تضعه (لطريقة HTML tag فقط):**
```
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=XXXXXXXXXXXXXXXXXXXXXXXX
```

**بعد التحقق:** من داخل Search Console، اذهب إلى Sitemaps وأضف رابط خريطة الموقع الحالية:
```
https://tooloralabs.com/sitemap.xml
```
(هذا الملف موجود وجاهز بالفعل في الكود عبر `apps/web/app/sitemap.ts`.)

---

## 3. Bing Webmaster Tools

**الأسهل:** بعد التحقق من ملكية الموقع في Google Search Console، يوفّر Bing Webmaster Tools خيار **"Import from Google Search Console"** يستورد الموقع والخصائص فورًا دون أي تحقق يدوي إضافي.

**الطريقة اليدوية (إن أردت التحقق المباشر):**
1. اذهب إلى [bing.com/webmasters](https://www.bing.com/webmasters).
2. أضف موقعك، واختر طريقة التحقق **"Meta tag"**.
3. ستحصل على وسم شبيه بـ:
   ```html
   <meta name="msvalidate.01" content="XXXXXXXXXXXXXXXXXXXXXXXX" />
   ```

**أين تضعه:**
```
NEXT_PUBLIC_BING_SITE_VERIFICATION=XXXXXXXXXXXXXXXXXXXXXXXX
```

---

## 4. Brave Search

**الخطوات اليدوية:**
1. اذهب إلى [search.brave.com/webmasters](https://search.brave.com/webmasters) (أو Brave Search Console الحالي).
2. أضف موقعك واختر التحقق عبر **meta tag**.
3. ستحصل على وسم شبيه بـ:
   ```html
   <meta name="brave-site-verification" content="XXXXXXXXXXXXXXXXXXXXXXXX" />
   ```

**أين تضعه:**
```
NEXT_PUBLIC_BRAVE_SITE_VERIFICATION=XXXXXXXXXXXXXXXXXXXXXXXX
```

---

## ملخص سريع — كل ما تحتاج فعله

1. انسخ `apps/web/.env.example` إلى `apps/web/.env.local` إن لم يكن موجودًا بالفعل.
2. أنشئ الحسابات الأربعة أعلاه يدويًا (GA4، Google Search Console، Bing، Brave).
3. الصق القيم الأربع في `.env.local`.
4. أعد نشر الموقع (أو أعد تشغيل `npm run dev` محليًا للتجربة).
5. أضف رابط `sitemap.xml` داخل Search Console وBing Webmaster Tools بعد التحقق.

لا حاجة لأي تعديل إضافي في الكود — كل هذه القيم تُقرأ ويُبنى عليها تلقائيًا في كل صفحات الموقع وبكل اللغات المدعومة.
