# Site-wide section order (every page, every locale)

The sections always appear in this order, everywhere they are listed (home page, /tools, /docs,
category pages, the header's tools dropdown, the home sidebar, the sitemap, any new listing):

1. Math · 2. Markets · 3. Physics · 4. Chemistry · 5. Health & Fitness · 6. Finance · 7. Business ·
8. Student Tools · 9. Text Tools · 10. Date & Time · 11. Weather · 12. AI Tools · 13. Dev Tools ·
14. File Tools · 15. Converters

- **Single source:** `CATEGORY_ORDER` in `apps/web/data/categories.ts`; the exported `categories` array is
  sorted by it. Never add a second order list or sort sections differently in a page or component —
  read `categories` as is.
- Sections not in the list (the planned ones that have no live tools yet: Website Tools and the four
  math sub-sections) come after Converters in their original order and appear only once they have tools.
- The order is the same in all six locales (en, ar, es, fr, de, hi); only the translated titles change.
- Changing the order = editing `CATEGORY_ORDER` only, and only on Yousef's request (2026-10-19).

## A category page needs 3+ live tools (2026-10-24, AdSense low-value rule)
- A `/{locale}/categories/{slug}` page is generated only when the section has **3 or more live tools**
  (`MIN_TOOLS_FOR_CATEGORY_PAGE` / `categoryPages` in `apps/web/data/categories.ts`). Below that it is not
  built, not in the sitemap, not on `/categories`, and no internal link points to it — links use
  `categoryHref(slug)` (the section's block on `/tools`).
- Its old URL 301-redirects in `apps/web/next.config.ts`: an empty math sub-section → `/categories/math`;
  an empty non-math section → `/coming-soon`; a section with 1–2 tools → its tool. Remove the redirect
  when the section reaches 3 tools.
