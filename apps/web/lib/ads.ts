/**
 * Desktop ads switch. Off in production builds by default: until an ad network is wired up, no desktop
 * slot renders at all (in-content or the 300x600 sidebar), so the page shows no empty placeholders or
 * reserved gaps. `next dev` always shows them, at their approved size and position, so Yousef can review
 * the layout. Inlined at build time (NEXT_PUBLIC_ and NODE_ENV), so server and client always agree. The
 * approved phone slots (AdSpace `phone`) are not gated by it.
 */
export const ADS_ENABLED = process.env.NEXT_PUBLIC_ADS_ENABLED === "true" || process.env.NODE_ENV === "development";

/**
 * The tool page's desktop in-content ads (>= 768px): exactly 3 per page, chosen once before the first
 * paint from the candidates the shared components render (DesktopAdSlot: before every top-level
 * SectionCard and every article section; display:none until picked, so nothing appears or resizes
 * later). Self-contained on purpose: DESKTOP_ADS_BOOT inlines it with `toString()`, like the phone pass.
 *
 * A candidate is usable when it sits between full-width blocks of a single-column stack (never inside
 * a card, never in the above-the-fold grid, never right after an input card, so never between an input
 * and its result). Its position is the top of the next block it would push down. The 3 picks are the
 * ones closest to 1/4, 2/4 and 3/4 of the page content, measured with the slots already shown, at
 * least 600px apart and 300px before the content ends.
 */
export function desktopAdLayout(anchor: Element | null): void {
  const root = anchor && anchor.closest("[data-phone-cards]");
  if (!root || root.hasAttribute("data-desktop-ads") || window.matchMedia("(max-width: 767px)").matches) return;
  root.setAttribute("data-desktop-ads", "");
  const flow = root.querySelector("[data-phone-flow]");
  if (!flow) return;
  const visible = (el: Element | null) => {
    while (el && !el.getClientRects().length) el = el.nextElementSibling;
    return el;
  };
  const singleColumn = (el: Element) => {
    const cs = getComputedStyle(el);
    if (cs.display.indexOf("grid") >= 0) return cs.gridTemplateColumns.trim().split(/\s+/).length === 1;
    if (cs.display.indexOf("flex") >= 0) return cs.flexDirection.indexOf("column") === 0;
    return true;
  };
  const prevBlock = (el: Element) => {
    let p = el.previousElementSibling;
    while (p && !p.getClientRects().length) p = p.previousElementSibling;
    return p;
  };
  const all = () => Array.prototype.slice.call(root.querySelectorAll("[data-desktop-ad]")) as Element[];
  const slots = all();
  const candidates: { slot: Element; y: number }[] = [];
  slots.forEach((slot) => {
    const parent = slot.parentElement;
    const next = visible(slot.nextElementSibling);
    if (!parent || !next || slot.closest('[data-card],[data-afold-cell],[data-afold-side],dialog,[role="dialog"]')) return;
    if (parent.clientWidth < 728 || !singleColumn(parent)) return;
    const prev = prevBlock(slot);
    if (prev && prev.matches('[data-card][data-phone-role="input"]')) return;
    candidates.push({ slot, y: next.getBoundingClientRect().top });
  });
  if (!candidates.length) return;
  // Every shown slot pushes what follows down (its box, margins and the stack's gap): measure that once,
  // then model the page with the picks in place so the spacing is even as the visitor sees it.
  const probe = candidates[candidates.length >> 1];
  const after = visible(probe.slot.nextElementSibling) as Element;
  (probe.slot as HTMLElement).style.display = "block";
  const h = after.getBoundingClientRect().top - probe.y;
  probe.slot.removeAttribute("style");
  const top = flow.getBoundingClientRect().top;
  const height = flow.getBoundingClientRect().height + 3 * h;
  const ys = candidates.map((c) => c.y - top);
  let best: number[] = [];
  let bestCost = Infinity;
  const n = ys.length;
  for (let i = 0; i < n; i++)
    for (let j = i + 1; j < n; j++)
      for (let k = j + 1; k < n; k++) {
        const at = [ys[i], ys[j] + h, ys[k] + 2 * h];
        if (at[1] - at[0] - h < 600 || at[2] - at[1] - h < 600 || height - at[2] - h < 300) continue;
        const cost = Math.max(Math.abs(at[0] - height / 4), Math.abs(at[1] - height / 2), Math.abs(at[2] - (3 * height) / 4));
        if (cost < bestCost) {
          bestCost = cost;
          best = [i, j, k];
        }
      }
  // The picks are kept by their place among the candidates: a card that swaps its component after
  // hydration (e.g. a placeholder replaced by the live indicator) mounts a new candidate in the same
  // place, and the observer marks it in the same task, before the browser can paint it.
  const picked = best.map((i) => slots.indexOf(candidates[i].slot));
  const mark = () => {
    const now = all();
    if (now.length !== slots.length) return;
    now.forEach((slot, i) => {
      if (picked.indexOf(i) >= 0) {
        if (!slot.hasAttribute("data-show")) slot.setAttribute("data-show", "");
      } else if (slot.hasAttribute("data-show")) slot.removeAttribute("data-show");
    });
  };
  mark();
  root.setAttribute("data-desktop-ads", String(picked.length));
  const added = (records: MutationRecord[]) =>
    records.some((r) => Array.prototype.some.call(r.addedNodes, (n: Node) => n.nodeType === 1 && ((n as Element).matches("[data-desktop-ad]") || !!(n as Element).querySelector("[data-desktop-ad]"))));
  new MutationObserver((records) => {
    if (added(records)) mark();
  }).observe(root, { childList: true, subtree: true });
}

/** Injected into the server HTML stream next to PHONE_LAYOUT_BOOT, and run at the same moment (see there). */
export const DESKTOP_ADS_BOOT = `(function(){var run=${desktopAdLayout.toString()};var end=function(){return document.querySelector("[data-phone-end]")};if(end()){run(end());return}var o=new MutationObserver(function(){var s=end();if(s){o.disconnect();run(s)}});o.observe(document.documentElement,{childList:true,subtree:true});document.addEventListener("DOMContentLoaded",function(){o.disconnect()})})();`;
