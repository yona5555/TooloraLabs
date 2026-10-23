export const PHONE_QUERY = "(max-width: 767px)";

/**
 * Phone card defaults (Yousef 2026-10-23): cards start collapsed (globals.css); this opens the first 3
 * cards of <main> in visual order for good, with no chevron (`--card-fixed`). A page with 3 cards or
 * fewer has nothing collapsible. Done by injecting CSS rules, never by touching
 * React's markup; runs inline at the end of <body> before first paint and again on every client-side
 * navigation (CardFirstOpener). Self-contained: it is also serialised as a string.
 */
export function openFirstCard() {
  try {
    document.querySelectorAll("style[data-card-first]").forEach((el) => el.remove());
    if (!window.matchMedia("(max-width: 767px)").matches) return;
    const shown = Array.from(document.querySelectorAll("main [data-card]"))
      .map((card, i) => ({ card, i, r: card.getBoundingClientRect() }))
      .filter((c) => c.r.width > 0 && c.r.height > 0)
      .sort((a, b) => a.r.top - b.r.top || a.i - b.i);
    // A structural path, not an id: it still matches when the client re-mounts the same markup.
    const path = (card: Element) => {
      let p = "";
      for (let el = card; el.parentElement && el.tagName !== "MAIN"; el = el.parentElement) {
        p = ` > :nth-child(${Array.prototype.indexOf.call(el.parentElement.children, el) + 1})${p}`;
      }
      return `main${p}`;
    };
    // Restores the card's own Tailwind values (layered) over the collapsed defaults (unlayered).
    const css = shown
      .slice(0, 3)
      .map((c) => path(c.card) + "[data-card]")
      .map(
        (p) =>
          `${p}{--card-fixed:1;grid-template-rows:auto 1fr;overflow:revert-layer;border-width:revert-layer}` +
          `${p}>[data-card-body]{visibility:visible;padding:revert-layer}` +
          `${p}>[data-card-header]{border-bottom-left-radius:revert-layer;border-bottom-right-radius:revert-layer;cursor:auto}` +
          `${p}>[data-card-header]>[data-card-toggle]{display:none}`
      )
      .join("");
    const style = document.createElement("style");
    style.setAttribute("data-card-first", "");
    style.textContent = `@media (max-width: 767px){${css}}`;
    document.head.appendChild(style);
    window.dispatchEvent(new Event("cards:first"));
  } catch {
    // never block the page over a cosmetic default
  }
}

export const CARD_PREPAINT_SCRIPT = `(${openFirstCard.toString()})();`;
