"use client";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowUp, ArrowDown } from "lucide-react";

export type SectionNavItem = { id: string; label: string };

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
};

const STUCK_TOP_OFFSET = 72; // px — matches the `top-18` sticky/fixed offset below the site header.

const navSurfaceClassName =
  "z-40 border-b border-zinc-200 bg-white/90 px-4 py-2 backdrop-blur-xl sm:px-6 dark:border-zinc-800 dark:bg-zinc-950/90";

export default function SectionNav({ items, showJumpToBottom = false, visible = true }: SectionNavProps) {
  const t = useTranslations("common");
  const [activeId, setActiveId] = useState<string>(items[0]?.id ?? "");
  const [isStuck, setIsStuck] = useState(false);
  const [navHeight, setNavHeight] = useState(0);
  const [narrowRect, setNarrowRect] = useState<{ left: number; width: number } | null>(null);
  const [wideRect, setWideRect] = useState<{ left: number; width: number } | null>(null);
  const itemsRef = useRef(items);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

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

  /**
   * `position: sticky` only holds within its own DOM parent's box — once the
   * user scrolls past that parent's bottom edge, the bar detaches even if
   * the page (education section, siblings) continues well past it. Every
   * caller nests this bar inside a short "secondary" column that ends long
   * before the page does, so plain CSS sticky can't reach page-bottom here.
   * A sentinel + IntersectionObserver reimplements sticky manually with
   * `position: fixed`, which is anchored to the viewport instead of any
   * ancestor's height, so it keeps working regardless of how short that
   * ancestor is.
   */
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(([entry]) => setIsStuck(!entry.isIntersecting), {
      rootMargin: `-${STUCK_TOP_OFFSET}px 0px 0px 0px`,
      threshold: 0,
    });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  useLayoutEffect(() => {
    const el = navRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      setNavHeight(entries[0].contentRect.height);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  /**
   * When stuck, the bar can't just inherit its parent's width the way a
   * normal-flow element does, since `position: fixed` takes it out of flow
   * entirely. Two different widths are correct depending on scroll depth:
   * narrow (this "secondary" column, via the sentinel, which stays in
   * normal flow even while the nav is fixed) while the sidebar still sits
   * to the side at the same vertical position, and wide (the page's actual
   * content column, via `<main>`) once scrolled past the above-the-fold
   * grid into the encyclopedic section, which has no sidebar and is wider.
   * Which one applies is decided at render time from `activeId`.
   */
  useLayoutEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    function measure() {
      const rect = el!.getBoundingClientRect();
      setNarrowRect({ left: rect.left, width: rect.width });
    }

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  useLayoutEffect(() => {
    function measure() {
      const main = document.querySelector("main");
      if (!main) return;
      const rect = main.getBoundingClientRect();
      const style = getComputedStyle(main);
      const paddingLeft = parseFloat(style.paddingLeft) || 0;
      const paddingRight = parseFloat(style.paddingRight) || 0;
      setWideRect({ left: rect.left + paddingLeft, width: rect.width - paddingLeft - paddingRight });
    }

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(document.querySelector("main") ?? document.body);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
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

  const pastAboveFold = activeId !== items[0]?.id;
  const stuckRect = (pastAboveFold ? wideRect : narrowRect) ?? narrowRect;

  return (
    <>
      <div ref={sentinelRef} aria-hidden="true" />
      {isStuck && <div aria-hidden="true" className="mb-6" style={{ height: navHeight }} />}
      <nav
        ref={navRef}
        aria-label={t("sectionNavLabel")}
        className={`${isStuck ? `fixed top-18 ${navSurfaceClassName}` : `relative mb-6 ${navSurfaceClassName}`} transition-opacity duration-300 ${visible ? "opacity-100" : "pointer-events-none opacity-0"}`}
        style={isStuck && stuckRect ? { left: stuckRect.left, width: stuckRect.width } : undefined}
      >
        <div className="mx-auto flex max-w-6xl items-center gap-1 overflow-x-auto">
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
