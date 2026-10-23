"use client";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowUp, ArrowDown } from "lucide-react";

export type SectionNavItem = { id: string; label: string };
/** Phone pilot: one button per group of sections; `id` is the group's first anchor, `members` every section id in it. */
export type SectionNavGroup = { id: string; label: string; members: string[] };

type SectionNavProps = {
  items: SectionNavItem[];
  /** Opt-in: adds a "Jump to Bottom" action next to "Back to Top". Off by default so existing callers are unaffected. */
  showJumpToBottom?: boolean;
  /**
   * Opt-in visibility gate, independent of the bar's own sticky logic — lets a caller
   * keep it invisible (no layout shift, since it stays in flow) until some condition of
   * its own choosing (e.g. having scrolled past a tall page header) is met. Defaults to
   * `true`, so callers that don't pass it render exactly as before.
   */
  visible?: boolean;
  /**
   * Phone pilot (Tool.phonePilot): below 768px these 3–4 equal-width group buttons replace the
   * per-section buttons and the back-to-top button. From 768px up nothing changes.
   */
  phoneGroups?: SectionNavGroup[];
};

const STUCK_TOP_OFFSET = 72; // px — matches the site header's own `h-18`/`top-18`.

export default function SectionNav({ items, showJumpToBottom = false, visible = true, phoneGroups }: SectionNavProps) {
  const t = useTranslations("common");
  const [activeId, setActiveId] = useState<string>(items[0]?.id ?? "");
  const [activeGroup, setActiveGroup] = useState<string>(phoneGroups?.[0]?.id ?? "");
  const groupsRef = useRef(phoneGroups);
  const [isStuck, setIsStuck] = useState(false);
  const [navHeight, setNavHeight] = useState(0);
  const itemsRef = useRef(items);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  // A caller that starts the bar hidden (`visible={false}`) wants it only as the stuck top bar. Such a
  // bar never takes in-flow space: an invisible in-flow bar left an empty band (sentinel + two flex gaps
  // + the bar + its margin, ~147px) under the card above it. Only the zero-height sentinel stays in flow,
  // pulled up by the parent's own gap so it adds no gap either; it still marks the exact same stuck line.
  const [gated] = useState(!visible);
  const [parentGap, setParentGap] = useState(0);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  // Which section heading is currently in view, to highlight the matching button.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: "-130px 0px -70% 0px", threshold: 0 }
    );

    const elements = itemsRef.current
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el !== null);

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const groups = groupsRef.current;
    if (!groups?.length) return;
    let ticking = false;
    function pick() {
      ticking = false;
      if (!groups) return;
      // The line just under the site header plus this bar once stuck.
      const line = STUCK_TOP_OFFSET + (navRef.current?.offsetHeight ?? 0) + 16;
      let best = groups[0].id;
      let bestTop = -Infinity;
      for (const g of groups) {
        for (const id of g.members) {
          const top = document.getElementById(id)?.getBoundingClientRect().top;
          if (top !== undefined && top <= line && top > bestTop) {
            bestTop = top;
            best = g.id;
          }
        }
      }
      setActiveGroup(best);
    }
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(pick);
    }
    pick();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  /**
   * `position: sticky` only holds within its own DOM parent's box — once the
   * user scrolls past that parent's bottom edge, the bar detaches even if
   * the page (education section, siblings) continues well past it. Every
   * caller nests this bar inside a short "secondary" column that ends long
   * before the page does, so plain CSS sticky can't reach page-bottom here.
   * A sentinel + IntersectionObserver reimplements sticky manually with
   * `position: fixed`, anchored to the viewport instead of any ancestor's
   * height.
   *
   * ROOT CAUSE of the two prior bugs (both patched the symptom, not this):
   *
   * 1. "Pinned over the H1 on first load, in some locales only" — an
   *    IntersectionObserver callback's `entry.boundingClientRect` is a
   *    snapshot taken at the moment its intersection ratio crosses a
   *    threshold. It does NOT re-fire on every layout shift — only on
   *    threshold-crossing ones. A locale whose translated strings are
   *    longer/shorter (a button wrapping to a second line, a scenario chip
   *    row reflowing) changes the above-the-fold column's height *after*
   *    hydration, once client components re-render with real translated
   *    content. If that late shift doesn't happen to cross the observer's
   *    own threshold again, `isStuck` is left set from a stale, pre-shift
   *    measurement — wrong for whichever locale's content happened to
   *    settle at a different height than what the first callback saw. This
   *    is exactly why it "worked" for two locales and broke for a third:
   *    it was never actually deterministic, just luck of the layout timing
   *    per locale.
   *
   *    A first rewrite attempt kept IntersectionObserver for scroll-driven
   *    detection too, reasoning it would simply re-fire on every crossing.
   *    Instrumented testing disproved that: IntersectionObserver only
   *    fires when `isIntersecting` *changes*. With a zero-height sentinel
   *    and a single large scroll jump (restoring scroll position on load,
   *    a fast Home-key/scrollbar-drag scroll, or this bar's own
   *    `scrollToBottom` button), the sentinel can go from "below the
   *    viewport" straight to "above the stuck line" within one sampled
   *    frame — `isIntersecting` is `false` both before and after, so no
   *    crossing is ever reported and the callback never fires again. This
   *    was confirmed directly: `checkStuck()` ran 3 times at mount and
   *    zero times after a scripted `window.scrollTo()` moved the sentinel
   *    by thousands of pixels. Fixed by dropping edge-triggered
   *    (threshold-crossing) detection entirely in favor of a `scroll`/
   *    `resize` listener that re-runs a *fresh* `getBoundingClientRect()`
   *    check on every actual scroll event, however large the jump — it
   *    reads the current position directly instead of inferring it from a
   *    boundary crossing, so it cannot skip a state. A `ResizeObserver` on
   *    `document.body` is kept alongside it for the distinct case of a
   *    layout shift with no scroll at all (late-hydrating content, font
   *    swap) — not locale-specific, not guessing at which languages are
   *    "long".
   *
   * 2. "Doesn't span full width when stuck (gap on one side)" — the old
   *    code computed an explicit `left`/`width` in JS from two different
   *    measured rects ("narrow" above-the-fold column vs. "wide" education
   *    column) and applied them as inline styles on a `fixed` element. Two
   *    separate JS measurements, swapped based on scroll position, are two
   *    ways for this to be off by the time it renders. The site's own top
   *    header (cited as the working reference) needs none of this: it's
   *    `sticky`, unconditionally full-width, with its content centered via
   *    plain CSS (`mx-auto max-w-*`). This bar can't use `sticky` (see
   *    above), but it *can* borrow the same "don't measure width in JS"
   *    principle: when stuck, it's `fixed inset-x-0` (always the full
   *    viewport, like the header), and the same `mx-auto max-w-6xl`
   *    wrapper that already centers its content in the non-stuck state
   *    keeps centering it identically once fixed — zero measured rects,
   *    nothing that can go stale or be locale-dependent.
   */
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    function checkStuck() {
      if (!sentinel) return;
      setIsStuck(sentinel.getBoundingClientRect().top < STUCK_TOP_OFFSET);
    }

    checkStuck();

    // Fresh position check on every actual scroll/resize event — never
    // infers state from a threshold crossing, so it can't skip a state
    // when the sentinel jumps past the stuck line in a single frame.
    let ticking = false;
    function onScrollOrResize() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        checkStuck();
        ticking = false;
      });
    }
    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize, { passive: true });

    // Catches a layout shift with no scroll at all (late-hydrating
    // translated content, web font swap, scenario-chip row wrapping
    // differently per locale, etc.).
    const resizeObserver = new ResizeObserver(checkStuck);
    resizeObserver.observe(document.body);

    return () => {
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
      resizeObserver.disconnect();
    };
  }, []);

  useLayoutEffect(() => {
    const parent = sentinelRef.current?.parentElement;
    if (!gated || !parent) return;
    const style = getComputedStyle(parent);
    if (style.display.includes("flex") || style.display.includes("grid")) setParentGap(parseFloat(style.rowGap) || 0);
  }, [gated]);

  useLayoutEffect(() => {
    const el = navRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      setNavHeight(entries[0].contentRect.height);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Anchors ([id], globals.css) land below the sticky site header plus this bar once it is stuck:
  // publish their real combined height (both change with wrapping and breakpoints).
  useLayoutEffect(() => {
    const nav = navRef.current;
    const header = document.querySelector("header");
    if (!nav) return;
    const root = document.documentElement;
    const update = () => {
      const h = (header?.getBoundingClientRect().height ?? STUCK_TOP_OFFSET) + nav.getBoundingClientRect().height;
      root.style.setProperty("--anchor-offset", `${Math.ceil(h)}px`);
    };
    const observer = new ResizeObserver(update);
    observer.observe(nav);
    if (header) observer.observe(header);
    return () => {
      observer.disconnect();
      root.style.removeProperty("--anchor-offset");
    };
  }, []);

  function scrollToSection(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function scrollToBottom() {
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "smooth" });
  }

  if (items.length === 0) return null;

  return (
    <>
      <div ref={sentinelRef} aria-hidden="true" style={gated && parentGap ? { marginBlockStart: -parentGap } : undefined} />
      {isStuck && !gated && <div aria-hidden="true" className="mb-6" style={{ height: navHeight }} />}
      <nav
        ref={navRef}
        aria-label={t("sectionNavLabel")}
        className={`z-40 border-b border-zinc-200 bg-white/90 backdrop-blur-xl transition-opacity duration-300 dark:border-zinc-800 dark:bg-zinc-950/90 ${
          isStuck ? "fixed inset-x-0 top-18" : gated ? "absolute inset-x-0" : "relative mb-6"
        } ${visible && (isStuck || !gated) ? "opacity-100" : "pointer-events-none opacity-0"}`}
        inert={gated && !(isStuck && visible) ? true : undefined}
      >
        {phoneGroups && (
          <div className="mx-auto grid max-w-6xl gap-1.5 px-4 py-1.5 md:hidden" style={{ gridTemplateColumns: `repeat(${phoneGroups.length}, minmax(0, 1fr))` }}>
            {phoneGroups.map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => scrollToSection(g.id)}
                aria-current={activeGroup === g.id ? "true" : undefined}
                data-nav-group=""
                className={`flex h-11 min-w-0 items-center justify-center rounded-lg border px-1 text-[13px] font-semibold whitespace-nowrap break-keep transition ${
                  activeGroup === g.id
                    ? "border-blue-400 bg-blue-600 text-white"
                    : "border-zinc-300 bg-white text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>
        )}
        <div className={`mx-auto flex max-w-6xl items-center gap-1 overflow-x-auto px-4 py-2 sm:px-6${phoneGroups ? " max-md:hidden" : ""}`}>
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => scrollToSection(item.id)}
              className={`shrink-0 rounded-lg border px-3 py-1.5 text-xs font-medium transition sm:text-sm ${
                activeId === item.id
                  ? "border-blue-400 bg-blue-600 text-white"
                  : "border-zinc-300 text-zinc-600 hover:bg-zinc-100 hover:text-blue-600 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-blue-600"
              }`}
            >
              {item.label}
            </button>
          ))}
          <button
            type="button"
            onClick={scrollToTop}
            aria-label={t("backToTop")}
            className="ms-auto flex shrink-0 items-center gap-1 rounded-lg border border-zinc-300 px-2.5 py-1.5 text-xs font-medium text-zinc-600 transition hover:border-blue-400 hover:text-blue-600 sm:text-sm dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-blue-500 dark:hover:text-blue-400"
          >
            <ArrowUp size={14} />
            <span className="hidden sm:inline">{t("backToTop")}</span>
          </button>
          {showJumpToBottom && (
            <button
              type="button"
              onClick={scrollToBottom}
              aria-label={t("jumpToBottom")}
              className="flex shrink-0 items-center gap-1 rounded-lg border border-zinc-300 px-2.5 py-1.5 text-xs font-medium text-zinc-600 transition hover:border-blue-400 hover:text-blue-600 sm:text-sm dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-blue-500 dark:hover:text-blue-400"
            >
              <ArrowDown size={14} />
              <span className="hidden sm:inline">{t("jumpToBottom")}</span>
            </button>
          )}
        </div>
      </nav>
    </>
  );
}
