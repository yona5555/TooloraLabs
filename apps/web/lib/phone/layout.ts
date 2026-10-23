/**
 * APPROVED PHONE STANDARD (visuals.md) — the tool page's phone layout pass. Self-contained on purpose:
 * PhoneLayoutScript inlines it with `toString()` so it runs while the HTML is parsed (before the first
 * paint and before hydration); PhoneLayoutRunner calls it after a client-side navigation, where an
 * inline script never runs. It runs once per page (`data-phone-layout` on the scope).
 *
 * 1. Cards: the first 3 top-level blue-header cards ([data-card], not inside another card) are marked
 *    always-open (`data-fixed`, no toggle); with 3 cards or fewer all are; cards in a dialog too.
 *    SectionCard reads the mark on hydration; a card mounted later applies the same rule itself.
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

  const cards = Array.prototype.filter.call(root.querySelectorAll("[data-card]"), topLevel) as Element[];
  cards.forEach((card, i) => {
    if (card.hasAttribute("data-card-init")) return;
    card.setAttribute("data-card-init", "");
    if (cards.length <= 3 || i < 3 || card.closest('dialog,[role="dialog"]')) card.setAttribute("data-fixed", "");
  });

  if (!window.matchMedia("(max-width: 767px)").matches) return;
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
