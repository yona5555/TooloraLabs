"use client";
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  ArrowLeft,
  ChartNoAxesColumnIncreasing,
  ChartSpline,
  Circle,
  Dices,
  Hash,
  Search,
  Shuffle,
  Table2,
  Triangle,
  type LucideIcon,
} from "lucide-react";
import { tools } from "@/data/tools";
import { getToolIcon, toolIcons } from "@/lib/tool-icons";
import { categoryIconColors } from "@/lib/category-colors";

/**
 * Icons for tools that have no entry in lib/tool-icons.tsx yet. Kept local so
 * the shared map (which also feeds the ToolCard fallback) stays unchanged.
 */
const EXTRA_TOOL_ICONS: Record<string, LucideIcon> = {
  "gcf-lcm-calculator": Hash,
  "triangle-calculator": Triangle,
  "probability-calculator": Dices,
  "mean-median-mode-range-calculator": ChartNoAxesColumnIncreasing,
  "random-number-generator": Shuffle,
  "standard-deviation-calculator": ChartSpline,
  "circle-calculator": Circle,
  "multiplication-table-generator": Table2,
};

/**
 * The tinted icon-badge classes the category icons already use
 * (lib/category-colors.ts), minus the grey ones, so every tool row gets a
 * distinct colour from the same system instead of a new palette.
 */
const TOOL_BADGE_COLORS = Object.values(categoryIconColors).filter(
  (classes) => !/\b(?:bg-(?:zinc|stone|neutral|slate))-/.test(classes)
);

function iconFor(slug: string): LucideIcon {
  return toolIcons[slug] ?? EXTRA_TOOL_ICONS[slug] ?? getToolIcon(slug);
}

/**
 * Side nav listing one category's tools (icon + name per row) with a filter
 * box, a count line and a link back to every category. Generic: pass any
 * category slug. Sits as the first child of a `lg:flex-row` <main>, so it lands
 * on the inline-start edge in both LTR and RTL, like the /tools sidebar.
 */
export default function CategoryToolsSidebar({ categorySlug }: { categorySlug: string }) {
  const tTools = useTranslations("tools");
  const tHome = useTranslations("homeCalculator");
  const tCommon = useTranslations("common");
  const [query, setQuery] = useState("");

  const categoryTools = useMemo(() => tools.filter((tool) => tool.category === categorySlug), [categorySlug]);

  const normalizedQuery = query.trim().toLowerCase();
  const visibleTools = normalizedQuery
    ? categoryTools.filter((tool) => {
        const title = tTools(`${tool.slug}.title`).toLowerCase();
        return title.includes(normalizedQuery) || tool.keywords.some((k) => k.toLowerCase().includes(normalizedQuery));
      })
    : categoryTools;

  return (
    <nav
      aria-label={tHome("sidebarCategoryToolsLabel")}
      data-category-tools-sidebar
      className="no-scrollbar flex w-full shrink-0 flex-col border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 lg:sticky lg:top-0 lg:h-screen lg:w-72 lg:self-start lg:overflow-y-auto lg:border-b-0 lg:border-e xl:w-80"
    >
      <div className="flex flex-col gap-2.5 p-3">
        <div className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 focus-within:border-blue-400 dark:border-zinc-700 dark:bg-zinc-800">
          <Search size={14} className="shrink-0 text-zinc-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={tHome("sidebarSearchCategoryTools")}
            aria-label={tHome("sidebarSearchCategoryTools")}
            className="min-w-0 flex-1 bg-transparent text-sm text-zinc-700 outline-none placeholder:text-zinc-400 dark:text-zinc-200"
          />
        </div>
        <p className="max-md:hidden px-1 text-center text-xs font-medium text-zinc-500 dark:text-zinc-400">
          {tHome("sidebarTotalTools", { count: visibleTools.length })}
        </p>
      </div>

      <ul className="flex flex-1 flex-col gap-0.5 border-t border-zinc-100 px-3 py-2.5 dark:border-zinc-800">
        {visibleTools.length === 0 ? (
          <li className="px-2 py-4 text-center text-xs text-zinc-400 dark:text-zinc-500">{tCommon("toolSearchNoResults")}</li>
        ) : (
          visibleTools.map((tool) => {
            const Icon = iconFor(tool.slug);
            const colorIndex = categoryTools.indexOf(tool) % TOOL_BADGE_COLORS.length;
            return (
              <li key={tool.slug}>
                <Link
                  href={`/tools/${tool.slug}`}
                  className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                >
                  <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${TOOL_BADGE_COLORS[colorIndex]}`}>
                    <Icon size={15} strokeWidth={2} aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1 break-words text-start">{tTools(`${tool.slug}.title`)}</span>
                </Link>
              </li>
            );
          })
        )}
      </ul>

      <div className="border-t border-zinc-100 p-3 dark:border-zinc-800">
        <Link
          href="/categories"
          className="flex items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-500/10"
        >
          <ArrowLeft size={14} className="shrink-0 rtl:rotate-180" aria-hidden />
          {tHome("sidebarAllCategories")}
        </Link>
      </div>
    </nav>
  );
}
