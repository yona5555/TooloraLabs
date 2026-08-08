"use client";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowUp } from "lucide-react";

export type SectionNavItem = { id: string; label: string };

type SectionNavProps = {
  items: SectionNavItem[];
};

export default function SectionNav({ items }: SectionNavProps) {
  const t = useTranslations("common");
  const [activeId, setActiveId] = useState<string>(items[0]?.id ?? "");
  const itemsRef = useRef(items);

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

  function scrollToSection(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (items.length === 0) return null;

  return (
    <nav
      aria-label={t("sectionNavLabel")}
      className="sticky top-18 z-40 -mx-4 mb-6 border-b border-zinc-200 bg-white/90 px-4 py-2 backdrop-blur-xl sm:-mx-6 sm:px-6 dark:border-zinc-800 dark:bg-zinc-950/90"
    >
      <div className="mx-auto flex max-w-6xl items-center gap-1 overflow-x-auto">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => scrollToSection(item.id)}
            className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition sm:text-sm ${
              activeId === item.id
                ? "bg-blue-600 text-white"
                : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
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
      </div>
    </nav>
  );
}
