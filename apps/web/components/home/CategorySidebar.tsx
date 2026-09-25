"use client";
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { ChevronRight, Search, BookOpen, LayoutList, ArrowRight } from "lucide-react";
import { categories } from "@/data/categories";
import { tools, type Tool } from "@/data/tools";
import { getCategoryIcon } from "@/lib/category-icons";
import { getCategoryIconColor } from "@/lib/category-colors";
import { getToolIcon } from "@/lib/tool-icons";

const TOOLS_BY_CATEGORY = tools.reduce<Record<string, Tool[]>>((acc, tool) => {
  (acc[tool.category] ??= []).push(tool);
  return acc;
}, {});

/**
 * A quick-overview preview for one tool, shown on hover/focus of its link in
 * the sidebar (via the parent <li>'s "group" class) — a 2-3 line description
 * plus a link to that tool's full /docs page, so a visitor can get a sense
 * of what a tool does without leaving the homepage. Every tool here has a
 * real /docs/[slug] page (DOCUMENTED_TOOL_SLUGS covers all 101, confirmed
 * 1:1 against data/tools.ts), so the "view full docs" link is never dead.
 *
 * Deliberately an INLINE expansion (grid-rows 0fr -> 1fr, not a
 * position:absolute flyout to the side) — the sidebar's own scroll
 * container has overflow-y-auto, which (per the CSS overflow spec, an axis
 * left as the implicit default becomes "auto" too once the other axis isn't
 * "visible") clips overflow-x as well, so an absolutely-positioned popover
 * escaping the column's edge would silently render clipped/invisible rather
 * than beside it. Expanding in place has no such escape to clip.
 */
function ToolQuickPreview({ slug }: { slug: string }) {
  const tTools = useTranslations("tools");
  const tHome = useTranslations("homeCalculator");
  return (
    <div className="grid grid-rows-[0fr] overflow-hidden transition-all duration-200 group-hover:grid-rows-[1fr] group-focus-within:grid-rows-[1fr]">
      <div className="min-h-0">
        <div className="mx-1 mb-1.5 rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 dark:border-zinc-700 dark:bg-zinc-800/60">
          <p className="line-clamp-3 text-xs leading-5 text-zinc-500 dark:text-zinc-400">{tTools(`${slug}.description`)}</p>
          <Link
            href={`/docs/${slug}`}
            className="mt-1.5 inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline dark:text-blue-400"
          >
            {tHome("sidebarViewFullDocs")}
            <ArrowRight size={12} className="rtl:rotate-180" />
          </Link>
        </div>
      </div>
    </div>
  );
}

/**
 * A hierarchical, documentation-style side nav: a tool search box, Overview
 * / Tools Guide links, then every category as a collapsible node that
 * expands to its own real tools (from data/tools.ts, not invented). It's
 * placed as the FIRST child of the flex row in Hero.tsx and relies on the
 * ambient `dir` on <html> (set per-locale in app/[locale]/layout.tsx) to
 * mirror sides automatically: in a row flex container, the first DOM child
 * lands at the inline-start edge, which is the right in RTL and the left in
 * LTR, with no manual left-0/right-0 positioning needed. The nested tool
 * list's indent and connector line use logical properties (ps-*, border-s)
 * so they flip sides with it automatically too.
 */
export default function CategorySidebar() {
  const t = useTranslations("categories");
  const tTools = useTranslations("tools");
  const tHome = useTranslations("homeCalculator");
  const tHero = useTranslations("hero");
  const tCommon = useTranslations("common");
  const tDocsNav = useTranslations("docsNav");
  const tCategoriesSection = useTranslations("categoriesSection");
  const tNavbar = useTranslations("navbar");
  const pathname = usePathname();

  const activeToolSlug = pathname.match(/^\/tools\/([^/]+)/)?.[1] ?? null;
  const activeCategorySlug = pathname.match(/^\/categories\/([^/]+)/)?.[1] ?? null;

  const [expanded, setExpanded] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    const activeTool = tools.find((tool) => tool.slug === activeToolSlug);
    if (activeTool) initial.add(activeTool.category);
    return initial;
  });
  const [query, setQuery] = useState("");

  function toggle(slug: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  }

  const normalizedQuery = query.trim().toLowerCase();
  const searchResults = useMemo(() => {
    if (!normalizedQuery) return null;
    return tools
      .filter((tool) => {
        const title = tTools(`${tool.slug}.title`).toLowerCase();
        return title.includes(normalizedQuery) || tool.keywords.some((k) => k.toLowerCase().includes(normalizedQuery));
      })
      .slice(0, 20);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [normalizedQuery]);

  return (
    <nav
      aria-label={tHome("sidebarNavLabel")}
      className="no-scrollbar flex w-full shrink-0 flex-col border-zinc-200 bg-white ltr:lg:border-r rtl:lg:border-l dark:border-zinc-800 dark:bg-zinc-900 lg:sticky lg:top-0 lg:max-h-screen lg:w-72 lg:self-start lg:overflow-y-auto xl:w-80"
    >
      <div className="flex flex-col gap-2.5 p-3">
        <div className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 focus-within:border-blue-400 dark:border-zinc-700 dark:bg-zinc-800">
          <Search size={14} className="shrink-0 text-zinc-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={tHero("searchPlaceholder")}
            className="min-w-0 flex-1 bg-transparent text-sm text-zinc-700 outline-none placeholder:text-zinc-400 dark:text-zinc-200"
          />
        </div>
        <p className="px-1 text-center text-xs font-medium text-zinc-500 dark:text-zinc-400">{tHome("sidebarTotalTools", { count: tools.length })}</p>
        <div className="flex gap-1 border-b border-zinc-100 pb-2.5 dark:border-zinc-800">
          <Link
            href="/docs"
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium text-zinc-600 transition hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <BookOpen size={13} />
            {tDocsNav("overview")}
          </Link>
          <Link
            href="/docs"
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium text-zinc-600 transition hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <LayoutList size={13} />
            {tDocsNav("toolsGuide")}
          </Link>
        </div>
      </div>

      {searchResults ? (
        <ul className="flex flex-col gap-0.5 px-3 pb-3">
          {searchResults.length === 0 ? (
            <li className="px-2 py-4 text-center text-xs text-zinc-400 dark:text-zinc-500">{tCommon("toolSearchNoResults")}</li>
          ) : (
            searchResults.map((tool) => {
              const ToolIcon = getToolIcon(tool.slug);
              const isActiveTool = activeToolSlug === tool.slug;
              return (
                <li key={tool.slug} className="group relative">
                  <Link
                    href={`/tools/${tool.slug}`}
                    className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition ${
                      isActiveTool
                        ? "bg-blue-50 font-semibold text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
                        : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                    }`}
                  >
                    <ToolIcon size={14} className="shrink-0 text-zinc-400" />
                    <span className="truncate">{tTools(`${tool.slug}.title`)}</span>
                  </Link>
                  <ToolQuickPreview slug={tool.slug} />
                </li>
              );
            })
          )}
        </ul>
      ) : (
        <ul className="flex flex-col gap-0.5 px-3 pb-3">
          {categories.map((category) => {
            const Icon = getCategoryIcon(category.icon);
            const iconColorClasses = getCategoryIconColor(category.slug);
            const isOpen = expanded.has(category.slug);
            const categoryTools = TOOLS_BY_CATEGORY[category.slug] ?? [];
            const isActiveCategory = activeCategorySlug === category.slug;

            if (categoryTools.length === 0) {
              return (
                <li key={category.slug}>
                  <div aria-disabled="true" className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-zinc-400 opacity-60 dark:text-zinc-500">
                    <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${iconColorClasses}`}>
                      <Icon size={15} strokeWidth={2} />
                    </span>
                    <span className="flex-1 truncate text-start">{t(`${category.slug}.title`)}</span>
                    <span className="shrink-0 rounded-full bg-zinc-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500">
                      {tNavbar("comingSoon")}
                    </span>
                  </div>
                </li>
              );
            }

            return (
              <li key={category.slug}>
                <button
                  type="button"
                  onClick={() => toggle(category.slug)}
                  aria-expanded={isOpen}
                  className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition ${
                    isActiveCategory
                      ? "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
                      : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                  }`}
                >
                  <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${iconColorClasses}`}>
                    <Icon size={15} strokeWidth={2} />
                  </span>
                  <span className="flex-1 truncate text-start">{t(`${category.slug}.title`)}</span>
                  <span className="shrink-0 rounded-full bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                    {tCategoriesSection("toolCount", { count: categoryTools.length })}
                  </span>
                  <ChevronRight size={14} className={`shrink-0 text-zinc-400 transition-transform ${isOpen ? "rotate-90" : ""}`} />
                </button>

                {isOpen && categoryTools.length > 0 && (
                  <ul className="ms-[1.15rem] mt-0.5 flex flex-col gap-0.5 border-s border-zinc-200 ps-3 dark:border-zinc-700">
                    {categoryTools.map((tool) => {
                      const ToolIcon = getToolIcon(tool.slug);
                      const isActiveTool = activeToolSlug === tool.slug;
                      return (
                        <li key={tool.slug} className="group relative">
                          <Link
                            href={`/tools/${tool.slug}`}
                            className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs transition ${
                              isActiveTool
                                ? "bg-blue-50 font-semibold text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
                                : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                            }`}
                          >
                            <ToolIcon size={13} className="shrink-0" />
                            <span className="truncate">{tTools(`${tool.slug}.title`)}</span>
                          </Link>
                          <ToolQuickPreview slug={tool.slug} />
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
    </nav>
  );
}
