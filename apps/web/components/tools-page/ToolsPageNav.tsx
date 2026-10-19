"use client";
import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronRight, Search } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { categories } from "@/data/categories";
import { tools, type Tool } from "@/data/tools";
import { getToolIcon } from "@/lib/tool-icons";
import HelpfulFeedback from "@/components/docs/HelpfulFeedback";
import { toolsSectionId } from "./section-id";

const TOOLS_BY_CATEGORY = tools.reduce<Record<string, Tool[]>>((acc, tool) => {
  (acc[tool.category] ??= []).push(tool);
  return acc;
}, {});

/** Only the sections the /tools page actually renders, in the site-wide `categories` order. */
const LIVE_CATEGORIES = categories.filter((category) => (TOOLS_BY_CATEGORY[category.slug] ?? []).length > 0);

/**
 * The /tools side nav: styled like the /docs "On This Page" card (TableOfContents), with a
 * live search, every live category expanding to its tools (as in CategorySidebar), and the
 * shared "Was this helpful?" card. Sticky is handled by the page's grid column, which spans
 * the full content height, so it stays pinned to the end of the page.
 */
export default function ToolsPageNav() {
  const t = useTranslations("categories");
  const tTools = useTranslations("tools");
  const tDocsNav = useTranslations("docsNav");
  const tHero = useTranslations("hero");
  const tCommon = useTranslations("common");
  const tHome = useTranslations("homeCalculator");

  const [activeSlug, setActiveSlug] = useState(LIVE_CATEGORIES[0]?.slug ?? "");
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());
  const [query, setQuery] = useState("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveSlug(entry.target.id.replace(/^tools-/, ""));
        }
      },
      { rootMargin: "-100px 0px -70% 0px", threshold: 0 }
    );
    LIVE_CATEGORIES.map((category) => document.getElementById(toolsSectionId(category.slug)))
      .filter((el): el is HTMLElement => el !== null)
      .forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const normalizedQuery = query.trim().toLowerCase();
  const visible = useMemo(() => {
    return LIVE_CATEGORIES.map((category) => {
      const categoryTools = TOOLS_BY_CATEGORY[category.slug];
      if (!normalizedQuery) return { category, tools: categoryTools };
      if (t(`${category.slug}.title`).toLowerCase().includes(normalizedQuery)) return { category, tools: categoryTools };
      const matches = categoryTools.filter(
        (tool) =>
          tTools(`${tool.slug}.title`).toLowerCase().includes(normalizedQuery) ||
          tool.keywords.some((k) => k.toLowerCase().includes(normalizedQuery))
      );
      return { category, tools: matches };
    }).filter((entry) => entry.tools.length > 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [normalizedQuery]);

  function toggle(slug: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  }

  function goToSection(slug: string) {
    setExpanded((prev) => new Set(prev).add(slug));
    document.getElementById(toolsSectionId(slug))?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <nav aria-label={tHome("sidebarNavLabel")} className="flex flex-col gap-6 text-sm">
      <div data-bp-panel className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">{tDocsNav("onThisPage")}</p>

        <div className="mb-3 flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 focus-within:border-blue-400 dark:border-zinc-700 dark:bg-zinc-800">
          <Search size={14} className="shrink-0 text-zinc-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={tHero("searchPlaceholder")}
            aria-label={tHero("searchPlaceholder")}
            className="min-w-0 flex-1 bg-transparent text-sm text-zinc-700 outline-none placeholder:text-zinc-400 dark:text-zinc-200"
          />
        </div>

        {visible.length === 0 ? (
          <p className="px-1 py-2 text-xs text-zinc-400 dark:text-zinc-500">{tCommon("toolSearchNoResults")}</p>
        ) : (
          <ul className="no-scrollbar flex max-h-[calc(100vh-22rem)] flex-col gap-0.5 overflow-y-auto border-s border-zinc-200 dark:border-zinc-800">
            {visible.map(({ category, tools: categoryTools }) => {
              const isActive = activeSlug === category.slug;
              const isOpen = normalizedQuery !== "" || expanded.has(category.slug);
              return (
                <li key={category.slug}>
                  <div
                    className={`-ms-px flex items-center border-s-2 transition ${
                      isActive
                        ? "border-blue-600 font-medium text-blue-600 dark:border-blue-400 dark:text-blue-400"
                        : "border-transparent text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
                    }`}
                  >
                    <button type="button" onClick={() => goToSection(category.slug)} className="min-w-0 flex-1 truncate px-3 py-1 text-start">
                      {t(`${category.slug}.title`)}
                    </button>
                    <button
                      type="button"
                      onClick={() => toggle(category.slug)}
                      aria-expanded={isOpen}
                      aria-label={t(`${category.slug}.title`)}
                      className="shrink-0 p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                    >
                      <ChevronRight size={14} className={`transition-transform ${isOpen ? "rotate-90" : ""}`} />
                    </button>
                  </div>

                  {isOpen && (
                    <ul className="ms-3 mb-1 flex flex-col gap-0.5 border-s border-zinc-200 ps-2 dark:border-zinc-700">
                      {categoryTools.map((tool) => {
                        const ToolIcon = getToolIcon(tool.slug);
                        return (
                          <li key={tool.slug}>
                            <Link
                              href={`/tools/${tool.slug}`}
                              className="flex items-center gap-2 rounded-lg px-2 py-1 text-xs text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                            >
                              <ToolIcon size={13} className="shrink-0" />
                              <span className="truncate">{tTools(`${tool.slug}.title`)}</span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <HelpfulFeedback />
    </nav>
  );
}
