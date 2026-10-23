# PHONE-ALL progress (branch wip/phone-all) — delete in the final commit

Approach: central, in shared components (SectionCard, SectionNav, AdSpace, InfoSection, ViewDocsLink,
ToolPageLayout, lib/phone/layout.ts, PhoneMiniCards). Root causes so far: scripts/output/root-causes.txt.

DONE
- Items 1-5 of the phone standard on all 98 tools; docs (visuals.md + approved-visuals-and-indicators.md).
- Sweep round 2 (98 tools x ar/en, 390px): 0 failures except countdown #418 (pre-existing on main).
- Desktop 1440 ar/en vs main (same data cache, run side by side): mortgage, surface-area, bmi, json-formatter
  identical; crypto differs only in live-price text widths; weather only in animated SVG rain lines
  (identical with reduced motion except 2 animated lines).
- Short articles (1 inner ad): ohms-law, energy-work-power, kinematics, force, chemical-equation-balancer,
  time-calculator, batch-invoice, world-time-converter, reading-time, lorem-ipsum, text-logo,
  speech-word-count, countdown (ar+en); projectile-motion, citation, fuel-cost, study-time, percentage,
  zip-compressor, text-to-speech, speech-to-text, spelling-grammar, roman-numeral (ar only).
- Dev server: apps/web `npm run dev -- -H 0.0.0.0 -p 3001`, log apps/web/scripts/output/dev.log.
  NEVER kill 3001 or delete .next. Production builds only with a separate distDir.

NEXT (in order)
1. RULE A (Yousef 2026-10-24): the 3 always-open cards in logical order on phone: 1 tool (inputs),
   2 output (if a separate card), 3 main visual. Role per card in the shared layout (e.g. SectionCard/
   ToolAboveFold `phoneRole="tool"|"output"|"visual"` + CSS order on phone), not per-page reordering.
   Read each tool's components; write scripts/output/card-order-map.txt (tool / card1 / card2 / card3 /
   reason). Exception: crypto-converter keeps live-result first, input second. Known defect:
   scientific-calculator shows the unit circle before the Calculator card. Desktop unchanged.
2. RULE B: no blue-header cards inside the article on phone: they move into the collapsible group under
   AD 1, same relative order, single DOM (display:contents on the article wrappers + CSS order, or
   equivalent). Desktop: inside the article. Card sets its own font (not the article serif). Then
   re-check article ads (1/3, 2/3, >=600px). Phone order: 3 open cards, docs row, AD 1, all collapsible
   cards, AD 2, article (AD 3, AD 4).
3. Countdown #418 root cause (pending 6 in root-causes.txt); quick-table digits (7) needs Yousef.
4. Verify scientific-calculator, crypto, surface-area, mortgage, bmi at 390 ar/en (mapping, zero cards in
   article, order 1-6, each card once, card font, article ads, no overflow) and 1440 ar/en vs main.
5. ONE final sweep, all tools, 390 en: overflow, broken words, toggles, ad order/placement, 44px targets,
   card order matches mapping, no card inside the article. Then lint, tsc, build (separate distDir).
6. Record RULE A/B in both docs; commit per root cause; push wip/phone-all (not main); delete this file in
   the final commit; git clean, 0 unpushed; 3001 answers 200.
