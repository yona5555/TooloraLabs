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
 * 3. A table still wider than its card after that scrolls sideways inside itself
 *    (`data-scroll-x`), so the page itself never scrolls sideways.
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

const SKIP = "svg, script, style, textarea, input, select, pre, [contenteditable=true]";

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
    if (ox === "auto" || ox === "scroll") return false;
    if (ox !== "visible" || a.hasAttribute("data-bp-panel")) {
      const b = a.getBoundingClientRect();
      return chain.some((c) => outside(c.getBoundingClientRect(), b));
    }
    chain.push(a);
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

function scrollWideTables(root: Element) {
  for (const table of root.querySelectorAll<HTMLElement>("main table")) {
    table.removeAttribute("data-scroll-x");
    if (table.scrollWidth > (table.parentElement?.clientWidth ?? Infinity) + 0.5 && spills(table)) {
      table.setAttribute("data-scroll-x", "");
    }
  }
}

function clear() {
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
      // innermost first, so an outer element measures its children at their final size
      [...els].reverse().forEach(fit);
      if (roots.length) scrollWideTables(main);
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
      attributeFilter: ["class", "hidden", "open", "data-revealed"],
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
