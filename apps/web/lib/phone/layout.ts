/**
 * APPROVED PHONE STANDARD (visuals.md) — the tool page's phone layout pass. Self-contained on purpose:
 * PHONE_LAYOUT_BOOT inlines it with `toString()` so it runs while the HTML is parsed (before the first
 * paint and before hydration) as soon as the `[data-phone-end]` sentinel after the page's content is
 * parsed; PhoneLayoutScript also calls it in a layout effect for a client-side navigation, where no
 * server HTML is parsed. It runs once per page (`data-phone-layout` on the scope).
 *
 * 1. Cards: the first 3 top-level blue-header cards ([data-card], not inside another card; on phone in
 *    screen order, which rule A's CSS order can make differ from DOM order) are marked
 *    always-open (`data-fixed`, no toggle); with 3 cards or fewer all are; cards in a dialog too.
 *    SectionCard reads the mark on hydration; a card mounted later applies the same rule itself.
 *    On phone they are also numbered (`data-phone-open` 1-3) for the phone order in globals.css.
 * 2. Article ads (phone only): InfoSection renders a display:none phone slot before every section.
 *    The slot before the article's first section always shows (the ad between the cards and the
 *    article). Inside the article, slots are picked near 1/3 and 2/3 of its phone height, on section
 *    boundaries only, with at least 600px of article between ads and 300px after the last one. When
 *    two do not fit, one near the middle (or none when no boundary leaves 600px). Desktop never
 *    measures: from 768px up every phone slot is display:none anyway.
 */
export function phoneLayout(anchor: Element | null): void {
  const root = anchor && anchor.closest("[data-phone-cards]");
  if (!root || root.hasAttribute("data-phone-layout")) return;
  root.setAttribute("data-phone-layout", "");
  const topLevel = (el: Element) => !el.parentElement || !el.parentElement.closest("[data-card]");

  // Only cards this screen renders count (e.g. the desktop-only sidebar's cards do not on phone).
  const cards = Array.prototype.filter.call(root.querySelectorAll("[data-card]"), (c: Element) => topLevel(c) && c.getClientRects().length > 0) as Element[];
  // Rule A reorders cards on phone with CSS order, so "first" there means first on screen.
  const phone = window.matchMedia("(max-width: 767px)").matches;
  if (phone) cards.sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top);
  cards.forEach((card, i) => {
    if (card.hasAttribute("data-card-init")) return;
    card.setAttribute("data-card-init", "");
    if (cards.length <= 3 || i < 3 || card.closest('dialog,[role="dialog"]')) card.setAttribute("data-fixed", "");
  });
  // Phone order (globals.css): the always-open cards, numbered in screen order, go first.
  if (phone) cards.filter((c) => !c.closest('dialog,[role="dialog"]')).slice(0, 3).forEach((card, i) => card.setAttribute("data-phone-open", String(i + 1)));

  if (!phone) return;
  const slots = Array.prototype.filter.call(root.querySelectorAll("[data-article-ad]"), topLevel) as Element[];
  const sections = slots.map((slot) => slot.nextElementSibling).filter(Boolean) as Element[];
  if (!slots.length || sections.length !== slots.length) return;
  slots[0].setAttribute("data-show", "");

  const start = sections[0].getBoundingClientRect().top;
  const height = sections[sections.length - 1].getBoundingClientRect().bottom - start;
  const offsets = sections.map((section) => section.getBoundingClientRect().top - start);
  const pick = (target: number, min: number) => {
    let best = -1;
    let bestDistance = Infinity;
    for (let i = 1; i < offsets.length; i++) {
      if (offsets[i] < min || height - offsets[i] < 300) continue;
      const distance = Math.abs(offsets[i] - target);
      if (distance < bestDistance) {
        bestDistance = distance;
        best = i;
      }
    }
    return best;
  };
  const first = pick(height / 3, 600);
  const second = first > 0 ? pick((2 * height) / 3, offsets[first] + 600) : -1;
  const picked = first > 0 && second > 0 ? [first, second] : [pick(height / 2, 600)].filter((i) => i > 0);
  picked.forEach((i) => slots[i].setAttribute("data-show", ""));
  root.setAttribute("data-article-ads", String(picked.length));
}

/**
 * Injected into the server HTML stream (not a React-owned <script>, so React never recreates it on the
 * client). It watches the parser until the sentinel PhoneLayoutScript renders after the tool page's
 * content exists, then runs the pass once; MutationObserver callbacks run in the same task as the
 * insertion, before the browser can paint it.
 */
export const PHONE_LAYOUT_BOOT = `(function(){var run=${phoneLayout.toString()};var end=function(){return document.querySelector("[data-phone-end]")};if(end()){run(end());return}var o=new MutationObserver(function(){var s=end();if(s){o.disconnect();run(s)}});o.observe(document.documentElement,{childList:true,subtree:true});document.addEventListener("DOMContentLoaded",function(){o.disconnect()})})();`;
