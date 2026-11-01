"use client";
import { useEffect } from "react";

/**
 * Phones and tablets (below `lg`): a connected number or formula never breaks across lines (§29).
 *
 * 1. Marks every element whose whole text is a value or formula (digits plus operators,
 *    separators and at most a few letters for units) with `data-num`. Content decides, not class
 *    names: `font-mono` also holds prose, and many values sit in plain spans and table cells.
 *    globals.css keeps `[data-num]` (and `[data-fit]`, e.g. the page title) on one line.
 * 2. When such a one-line element is wider than the box it sits in, shrinks its font in 6% steps
 *    down to 60% of its own size (never under 10px) until it fits — measured, not guessed.
 * 3. Phone (below 768px, APPROVED PHONE STANDARD rule 5): a table whose narrowest layout does not
 *    fit its card at 360px reflows into stacked rows (`data-stack`): each row becomes a block titled
 *    by its first cell, every other cell a "column header: value" line (`data-label`, from the header
 *    row). The <table> markup stays; explicit ARIA roles keep its semantics once CSS drops the table
 *    display. Nothing scrolls sideways. Tablets (768–1023px): a table still wider than its card after
 *    that scrolls sideways inside itself (`data-scroll-x`), so the page itself never does; a table
 *    already in its own scrolling box marks that box instead. Both get a fade at the inline end.
 * Desktop is untouched: every inline size and mark is cleared at `lg` and up.
 */
const PHONE = "(max-width: 1023.98px)";
const STEP = 0.94;
const FLOOR = 0.6;
const MIN_PX = 10;
const MAX_LEN = 60;
const MAX_LETTERS = 6;
const FIT = "[data-num], [data-fit]";

export function isNumericText(text: string): boolean {
  const t = text.trim();
  if (!t || t.length > MAX_LEN || !/\p{Nd}/u.test(t)) return false;
  // letters and their combining marks (Devanagari vowel signs) both count: "21 मिनट पहले" is prose
  return (t.match(/[\p{L}\p{M}]/gu) || []).length <= MAX_LETTERS;
}

const SKIP = "h1, h2, h3, h4, h5, h6, svg, script, style, textarea, input, select, pre, [contenteditable=true]";

function markNumbers(root: Element) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    const host = n.parentElement;
    if (!host || host.hasAttribute("data-num") || !isNumericText(n.textContent ?? "")) continue;
    if (host.closest(SKIP) || !isNumericText(host.textContent ?? "")) continue;
    host.setAttribute("data-num", "");
  }
}

const outside = (r: DOMRect, b: DOMRect) => r.right > b.right + 0.5 || r.left < b.left - 0.5;

// A one-line element spills when its text runs past its own box or its block parent, or when it
// widens any ancestor (a grid or flex item grows to fit it) past the box everything must stay
// inside: the nearest card, clipping or scrolling ancestor, else the page. Inside a horizontal
// scroller it may be wider (that box scrolls instead).
function spills(el: HTMLElement): boolean {
  const inline = getComputedStyle(el).display === "inline";
  if (!inline && el.scrollWidth > el.clientWidth + 0.5) return true;
  let block = el.parentElement;
  while (block && getComputedStyle(block).display === "inline") block = block.parentElement;
  if (block && outside(el.getBoundingClientRect(), block.getBoundingClientRect())) {
    const ox = getComputedStyle(block).overflowX;
    if (ox !== "auto" && ox !== "scroll") return true;
  }
  const chain: Element[] = [el];
  for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) {
    const ox = getComputedStyle(a).overflowX;
    // a stacked table (rule 5) never scrolls sideways, so its scrolling wrapper is a box to fit in
    const stacked = (ox === "auto" || ox === "scroll") && !!el.closest("table[data-stack]") && a.contains(el.closest("table[data-stack]"));
    if ((ox === "auto" || ox === "scroll") && !stacked) return false;
    if (ox !== "visible" || stacked || a.hasAttribute("data-bp-panel")) {
      const b = a.getBoundingClientRect();
      return chain.some((c) => outside(c.getBoundingClientRect(), b));
    }
    // display:contents ancestors have no box (a 0×0 rect at the origin), so they would always
    // read as "outside" the clipping ancestor and shrink text that fits.
    if (getComputedStyle(a).display !== "contents") chain.push(a);
  }
  return chain.some((c) => outside(c.getBoundingClientRect(), new DOMRect(0, 0, document.documentElement.clientWidth, 0)));
}

function fit(el: HTMLElement) {
  el.style.removeProperty("font-size");
  el.removeAttribute("data-fit-wrap");
  if (!el.isConnected || !el.getClientRects().length || !spills(el)) return;
  const base = parseFloat(getComputedStyle(el).fontSize);
  const floor = Math.max(MIN_PX, base * FLOOR);
  let size = base;
  while (size > floor && spills(el)) {
    size = Math.max(floor, size * STEP);
    el.style.fontSize = `${size}px`;
  }
  // A title ([data-fit], words) too long for one line even at the floor wraps at its own size
  // instead: two readable lines beat one tiny one. Numbers never take this path.
  if (spills(el) && !el.hasAttribute("data-num")) {
    el.style.removeProperty("font-size");
    el.setAttribute("data-fit-wrap", "");
  }
}

const PHONE_ONLY = "(max-width: 767px)";
/** Rule 5 decides as if the screen were 360px wide, whatever phone it runs on. */
const NARROWEST = 360;
const ROLES: [string, string][] = [
  ["table", "table"],
  ["thead, tbody, tfoot", "rowgroup"],
  ["tr", "row"],
  ["td", "cell"],
];

function unstack(table: HTMLElement) {
  if (!table.hasAttribute("data-stack")) return;
  table.removeAttribute("data-stack");
  for (const el of [table, ...table.querySelectorAll<HTMLElement>("[data-stack-role]")]) {
    el.removeAttribute("role");
    el.removeAttribute("data-stack-role");
  }
  table.querySelectorAll("[data-label]").forEach((c) => c.removeAttribute("data-label"));
  table.querySelectorAll("[data-stack-head]").forEach((r) => r.removeAttribute("data-stack-head"));
}

// The card box the table has to fit: the nearest ancestor that is neither a sideways scroller nor
// boxless (display: contents), measured inside its padding.
function room(table: HTMLElement): number {
  for (let a = table.parentElement; a && a !== document.body; a = a.parentElement) {
    const cs = getComputedStyle(a);
    if (cs.display === "contents" || /auto|scroll/.test(cs.overflowX)) continue;
    return a.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
  }
  return document.documentElement.clientWidth;
}

function stack(table: HTMLElement) {
  const rows = Array.from(table.querySelectorAll<HTMLTableRowElement>("tr")).filter((r) => r.closest("table") === table);
  const headRows = rows.filter((r) => r.parentElement?.tagName === "THEAD");
  let head = headRows[headRows.length - 1];
  if (!head && rows[0] && Array.from(rows[0].cells).every((c) => c.tagName === "TH")) {
    head = rows[0];
    head.setAttribute("data-stack-head", "");
  }
  const labels: string[] = [];
  if (head) for (const c of Array.from(head.cells)) for (let i = 0; i < c.colSpan; i++) labels.push((c.textContent ?? "").trim());
  for (const r of rows) {
    if (r === head || r.parentElement?.tagName === "THEAD") continue;
    let col = 0;
    for (const c of Array.from(r.cells)) {
      if (col > 0 && labels[col]) c.setAttribute("data-label", labels[col]);
      if (c.tagName === "TH") {
        c.setAttribute("role", col === 0 ? "rowheader" : "cell");
        c.setAttribute("data-stack-role", "");
      }
      col += c.colSpan;
    }
  }
  for (const [selector, role] of ROLES) {
    for (const el of [table, ...table.querySelectorAll<HTMLElement>(selector)]) {
      if (!el.matches(selector) || el.closest("table") !== table || el.hasAttribute("role")) continue;
      el.setAttribute("role", role);
      el.setAttribute("data-stack-role", "");
    }
  }
  table.querySelectorAll<HTMLElement>("thead th").forEach((th) => {
    if (th.closest("table") !== table || th.hasAttribute("role")) return;
    th.setAttribute("role", "columnheader");
    th.setAttribute("data-stack-role", "");
  });
  table.setAttribute("data-stack", "");
}

function stackWideTables(root: Element) {
  const shrink = Math.max(0, window.innerWidth - NARROWEST);
  // inner tables first: an outer table measures with its nested ones already stacked
  for (const table of [...root.querySelectorAll<HTMLElement>("main table")].reverse()) {
    unstack(table);
    if (!table.getClientRects().length) continue;
    const width = table.style.width;
    table.style.width = "min-content";
    const need = table.getBoundingClientRect().width;
    table.style.width = width;
    if (need > room(table) - shrink + 0.5) stack(table);
  }
}

function scrollWideTables(root: Element) {
  for (const table of root.querySelectorAll<HTMLElement>("main table")) {
    table.removeAttribute("data-scroll-x");
    const parent = table.parentElement;
    parent?.removeAttribute("data-scroll-x");
    if (!parent || table.scrollWidth <= parent.clientWidth + 0.5) continue;
    if (spills(table)) table.setAttribute("data-scroll-x", "");
    // already inside its own scrolling box: that box gets the fade hint (globals.css)
    else if (/auto|scroll/.test(getComputedStyle(parent).overflowX)) parent.setAttribute("data-scroll-x", "");
  }
}

function clear() {
  document.querySelectorAll<HTMLElement>("table[data-stack]").forEach(unstack);
  for (const el of document.querySelectorAll<HTMLElement>(`${FIT}, [data-scroll-x]`)) {
    el.style.removeProperty("font-size");
    el.removeAttribute("data-num");
    el.removeAttribute("data-fit-wrap");
    el.removeAttribute("data-scroll-x");
  }
}

export default function FitNumbers() {
  useEffect(() => {
    const mq = window.matchMedia(PHONE);
    let frame = 0;
    let full = true;
    const dirty = new Set<Element>();

    const flush = () => {
      frame = 0;
      if (!mq.matches) {
        clear();
        dirty.clear();
        return;
      }
      const main = document.querySelector("main");
      if (!main) return;
      const roots = full ? [main] : [...dirty].filter((d) => d.isConnected && main.contains(d));
      full = false;
      dirty.clear();
      for (const root of roots) markNumbers(root);
      const els = new Set<HTMLElement>();
      for (const root of roots) {
        if (root.matches(FIT)) els.add(root as HTMLElement);
        root.querySelectorAll<HTMLElement>(FIT).forEach((e) => els.add(e));
        const owner = root.closest<HTMLElement>(FIT);
        if (owner) els.add(owner);
      }
      // tables first (rule 5): a value fits the stacked row it ends up in
      if (roots.length && window.matchMedia(PHONE_ONLY).matches) {
        main.querySelectorAll("[data-scroll-x]").forEach((el) => el.removeAttribute("data-scroll-x"));
        stackWideTables(main);
      }
      // innermost first, so an outer element measures its children at their final size
      [...els].reverse().forEach(fit);
      if (roots.length) {
        if (!window.matchMedia(PHONE_ONLY).matches) {
          main.querySelectorAll<HTMLElement>("table[data-stack]").forEach(unstack);
          scrollWideTables(main);
        }
      }
    };
    const schedule = (all: boolean) => {
      if (all) full = true;
      if (!frame) frame = requestAnimationFrame(flush);
    };

    schedule(true);
    let width = window.innerWidth;
    const onResize = () => {
      if (window.innerWidth === width) return; // mobile URL-bar height changes do not move text
      width = window.innerWidth;
      schedule(true);
    };
    window.addEventListener("resize", onResize);
    const mutations = new MutationObserver((records) => {
      for (const r of records) {
        const el = r.target.nodeType === Node.ELEMENT_NODE ? (r.target as Element) : r.target.parentElement;
        if (el) dirty.add(el);
      }
      schedule(false);
    });
    // class / hidden / open changes reveal content that was not measurable before (reveal-on-scroll,
    // tabs, accordions); our own writes are `style` and data attributes, so this never loops
    mutations.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ["class", "hidden", "open", "data-revealed", "data-state"],
    });
    const onBreakpoint = () => schedule(true);
    mq.addEventListener("change", onBreakpoint);
    document.fonts?.ready.then(() => schedule(true));
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("resize", onResize);
      mutations.disconnect();
      mq.removeEventListener("change", onBreakpoint);
    };
  }, []);
  return null;
}
