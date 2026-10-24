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
- RULE A DONE (commits 9a948031, 2d4236b2): SectionCard `phoneRole` (tool/output/visual; crypto
  `live-output`), also on IndicatorCard (indicator-kit + markets), the shared indicator `Card`, GlassHeroCard.
  ToolPageLayout content wrapper = [data-phone-flow]: phone-only flex column (gap 1rem); wrappers between it
  and an open card / role card / docs row are display:contents; CSS order: lead (before open card 1, cards
  excepted) -60, live-output -55, tool -50, output -40, visual -30, other open cards -20, docs row + ad 1 -10,
  rest 0 (DOM order). layout.ts sorts cards by screen top on phone and numbers the 3 open ones
  (data-phone-open 1-3). 60 tools carry roles; map: scripts/output/card-order-map.txt (98 rows).
  Verified 98 x ar/en at 390 (dev): open cards = first 3, docs row right after them, no overflow, no new
  console errors; production build (copy) checked 7 tools en + 5 ar; desktop 1440 geometry identical to
  the base on 10 tools x en/ar. Root causes 8-12 in scripts/output/root-causes.txt (11, 12 pre-existing).

NEXT (in order)
1. RULE B (needs Yousef's answer first, see below): no blue-header cards inside the article on phone; they
   join the collapsible group under AD 1, same relative order, single DOM. Mechanism ready: the shared
   phone flow above; article cards stay order 0 (they already follow the above-fold cards in DOM), so it
   needs (a) [data-phone-article] on EncyclopediaPaper's outer div, (b) flatten the paper wrappers and every
   article element that contains a card, (c) every non-card item from the article on (and after it) gets
   order 10. OPEN QUESTION: flattening removes the paper box (bg, border, padding) on phone. Options:
   (1) emulate one continuous paper on the article's pieces (paper bg + side borders on every article item,
   margins -> padding, gap covered with margin-top -1rem; inner spacing becomes uniform), or
   (2) per-section paper sheets with a gap between sections. Card font: SectionCard sets its own font
   (font-sans) so it never inherits the article serif. Then re-check article ads (1/3, 2/3, >=600px).
   Phone order: 3 open cards, docs row, AD 1, all collapsible cards, AD 2, article (AD 3, AD 4).
2. Countdown #418 root cause (pending 6 in root-causes.txt); quick-table digits (7) needs Yousef.
3. Verify scientific-calculator, crypto, surface-area, mortgage, bmi at 390 ar/en (mapping, zero cards in
   article, order 1-6, each card once, card font, article ads, no overflow) and 1440 ar/en vs main.
4. ONE final sweep, all tools, 390 en: overflow, broken words, toggles, ad order/placement, 44px targets,
   card order matches mapping, no card inside the article. Then lint, tsc, build (separate distDir: build
   in a copy, e.g. rsync apps/web to .phone-build/apps/web + symlink node_modules, packages, tsconfig*).
5. Record RULE A/B in both docs; commit per root cause; push wip/phone-all (not main); delete this file in
   the final commit; git clean, 0 unpushed; 3001 answers 200.
