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
 *    The slot before the article's first section always shows as ad 2 (`data-phone-ad2`: moved out of
 *    the paper, after the collapsed cards). Inside the article, slots are picked near 1/3 and 2/3 of its
 *    phone height, on section boundaries only, with at least 600px of article between ads and 300px
 *    after the last one. When two do not fit, one near the middle (or none when no boundary leaves
 *    600px). Ad balance: ad 1 (after the docs row) is dropped when less than one ad's height sits between
 *    it and ad 2. Desktop never measures: from 768px up every phone slot is display:none anyway.
 * 3. Rule B paper (phone only): the article is flattened into the phone flow (globals.css), so one
 *    continuous paper is drawn behind its parts (the flow's ::before, sized by CSS variables on the scope).
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
  // Rule B flattens the article (display:contents has no box): an element's box is then its parts' union.
  const box = (el: Element): { top: number; bottom: number } | null => {
    if (el.getClientRects().length) return el.getBoundingClientRect();
    let out: { top: number; bottom: number } | null = null;
    for (let i = 0; i < el.children.length; i++) {
      const r = box(el.children[i]);
      if (r) out = out ? { top: Math.min(out.top, r.top), bottom: Math.max(out.bottom, r.bottom) } : { top: r.top, bottom: r.bottom };
    }
    return out;
  };
  const slots = Array.prototype.filter.call(root.querySelectorAll("[data-article-ad]"), topLevel) as Element[];
  const sections = slots.map((slot) => slot.nextElementSibling).filter(Boolean) as Element[];
  if (!slots.length || sections.length !== slots.length) return;
  // Ad 2: the article's first slot, moved out of the paper to after the collapsed cards (globals.css).
  slots[0].setAttribute("data-show", "");
  slots[0].setAttribute("data-phone-ad2", "");

  // Rule 4 moves the disclaimer sections to the article's end, so the screen order of sections can differ
  // from the DOM order: measure the article's extent over all of them, and never put an ad before one.
  const boxes = sections.map((section) => box(section) || { top: 0, bottom: 0 });
  const start = Math.min(...boxes.map((b) => b.top));
  const height = Math.max(...boxes.map((b) => b.bottom)) - start;
  const offsets = boxes.map((b) => b.top - start);
  const pick = (target: number, min: number) => {
    let best = -1;
    let bestDistance = Infinity;
    for (let i = 1; i < offsets.length; i++) {
      if (sections[i].hasAttribute("data-phone-disclaimer")) continue;
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

  // Ad balance: when what sits between ad 1 (after the docs row) and ad 2 (the collapsed cards, closed) is
  // shorter than one ad, only ad 2 stays.
  const flow = root.querySelector("[data-phone-flow]");
  const ad1 = root.querySelector("[data-phone-docs] + [data-ad-slot]");
  if (flow && ad1 && ad1.getClientRects().length) {
    const a = ad1.getBoundingClientRect();
    const b = slots[0].getBoundingClientRect();
    const gap = parseFloat(getComputedStyle(flow).rowGap) || 0;
    if (b.top - a.bottom - 2 * gap - (parseFloat(getComputedStyle(ad1).marginBottom) || 0) < a.height) ad1.setAttribute("data-phone-hide", "");
  }

  // Rule B: one continuous paper behind the article's parts (the flow's ::before, globals.css), kept in
  // step with every later height change (cards opened, fonts loaded) by a ResizeObserver on the flow.
  const article = root.querySelector("[data-phone-article]");
  if (!flow || !article) return;
  const parts: Element[] = [];
  const collect = (el: Element) => {
    for (let i = 0; i < el.children.length; i++) {
      const child = el.children[i];
      if (child.hasAttribute("data-card") || child.hasAttribute("data-phone-ad2")) continue;
      if (getComputedStyle(child).display === "contents") collect(child);
      else parts.push(child);
    }
  };
  collect(article);
  // Rule 4: disclaimer callouts from outside the article join its end, inside the paper.
  root.querySelectorAll("[data-phone-disclaimer]").forEach((el) => {
    if (!article.contains(el) && !el.closest("[data-card]")) parts.push(el);
  });
  const paper = () => {
    if (!window.matchMedia("(max-width: 767px)").matches) return;
    let min = Infinity;
    let max = -Infinity;
    parts.forEach((part) => {
      if (!part.getClientRects().length) return;
      const r = part.getBoundingClientRect();
      min = Math.min(min, r.top);
      max = Math.max(max, r.bottom);
    });
    if (min === Infinity) return;
    const pad = 16;
    const style = (root as HTMLElement).style;
    style.setProperty("--phone-paper-top", `${min - flow.getBoundingClientRect().top - pad}px`);
    style.setProperty("--phone-paper-height", `${max - min + 2 * pad}px`);
    root.setAttribute("data-phone-paper-height", "");
  };
  paper();
  if (typeof ResizeObserver === "function") new ResizeObserver(paper).observe(flow);
}

/**
 * Injected into the server HTML stream (not a React-owned <script>, so React never recreates it on the
 * client). It watches the parser until the sentinel PhoneLayoutScript renders after the tool page's
 * content exists, then runs the pass once; MutationObserver callbacks run in the same task as the
 * insertion, before the browser can paint it.
 */
export const PHONE_LAYOUT_BOOT = `(function(){var run=${phoneLayout.toString()};var end=function(){return document.querySelector("[data-phone-end]")};if(end()){run(end());return}var o=new MutationObserver(function(){var s=end();if(s){o.disconnect();run(s)}});o.observe(document.documentElement,{childList:true,subtree:true});document.addEventListener("DOMContentLoaded",function(){o.disconnect()})})();`;

/**
 * Rule B flattens the article's sections on phone (display:contents has no box), so the browser cannot
 * scroll to `#section` from a search result or a shared link: scroll to the section's first part instead
 * (it carries the anchors' scroll-margin, globals.css). Runs on load and on every hashchange.
 */
export function scrollToHashTarget(): void {
  const id = decodeURIComponent(location.hash.slice(1));
  const target = id ? document.getElementById(id) : null;
  if (!target || target.getClientRects().length) return;
  const first = (el: Element): Element | null => {
    for (let i = 0; i < el.children.length; i++) {
      const child = el.children[i];
      if (child.getClientRects().length) return child;
      const found = first(child);
      if (found) return found;
    }
    return null;
  };
  first(target)?.scrollIntoView({ block: "start" });
}
