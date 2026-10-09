---
paths:
  - "packages/**"
---
# الحزم core وsdk وtools

- قيد صارم: الحزم الثلاث منطق خالص بلا window/document/localStorage/DOM (يفرضه `tsconfig.base.json` بـ `"lib": ["ES2022"]`) لأجل تطبيق موبايل مستقبلي.
- الفحوص:
  - `npx tsc --noEmit --project packages/{core,sdk,tools}/tsconfig.json`
  - `npm run test --workspace=packages/{core,sdk,tools}`
