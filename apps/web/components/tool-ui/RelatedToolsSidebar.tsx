"use client";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { ArrowRight, ChevronDown, Search as SearchIcon } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { tools } from "@/data/tools";
import { getToolIcon } from "@/lib/tool-icons";
import AdSpace from "./AdSpace";
import SectionCard from "./SectionCard";

type RelatedToolsSidebarProps = {
  currentSlug: string;
  category: string;
  /** Optional curated list of tool slugs rendered as a quick-link list beneath the search box. Omit for the default search-only sidebar. */
  relatedList?: string[];
  /** Heading shown above `relatedList`. Ignored if `relatedList` is omitted. */
  relatedListTitle?: string;
  /**
   * Continue the tool list with more tools from the same category (behind "Show more"). The card keeps
   * its natural height; the ToolAboveFold `sidebarMatchRow` column space it doesn't use stays below it,
   * filled with `fillContent` when given, or left as an invisible spacer otherwise.
   */
  fill?: boolean;
  /** Real content for the unused `sidebarMatchRow` space below the card (§41) — ignored unless `fill` is set. */
  fillContent?: ReactNode;
};

export default function RelatedToolsSidebar({
  currentSlug,
  category,
  relatedList,
  relatedListTitle,
  fill = false,
  fillContent,
}: RelatedToolsSidebarProps) {
  const t = useTranslations("hero");
  const tTools = useTranslations("tools");
  const tCommon = useTranslations("common");
  const tCategories = useTranslations("categories");

  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const searchResults = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return [];

    return tools
      .filter((tool) => {
        if (tool.slug === currentSlug) return false;
        const title = tTools(`${tool.slug}.title`).toLowerCase();
        const keywords = tool.keywords.join(" ").toLowerCase();
        return title.includes(normalized) || keywords.includes(normalized);
      })
      .slice(0, 5);
  }, [query, tTools, currentSlug]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const curated = (relatedList ?? []).filter((slug) => slug !== currentSlug);
  const moreInCategory = fill
    ? tools.filter((tool) => tool.category === category && tool.slug !== currentSlug && !curated.includes(tool.slug)).map((tool) => tool.slug)
    : [];
  const allRelated = [...curated, ...moreInCategory];
  const VISIBLE_COUNT = 3;
  const hiddenCount = allRelated.length - VISIBLE_COUNT;
  const listId = `related-tools-${currentSlug}`;

  const toolLink = (slug: string) => {
    const Icon = getToolIcon(slug);
    return (
      <li key={slug}>
        <Link
          href={`/tools/${slug}`}
          className="flex items-center gap-3 px-3 py-2.5 text-sm text-zinc-700 transition hover:bg-blue-50 hover:text-blue-600 dark:text-zinc-200 dark:hover:bg-blue-500/10 dark:hover:text-blue-400"
        >
          <Icon size={14} className="shrink-0 text-zinc-400" />
          <span>{tTools(`${slug}.title`)}</span>
        </Link>
      </li>
    );
  };

  return (
    <>
    <SectionCard title={tCommon("relatedToolsTitle")} bodyClassName="flex flex-col gap-6 p-4 lg:p-6">
      <div className="flex flex-col gap-4">
        <div ref={containerRef} className="relative">
          <div className="flex items-center gap-2 rounded-xl border border-zinc-300 bg-white px-3 py-2 focus-within:border-blue-500 dark:border-zinc-700 dark:bg-zinc-800">
            <SearchIcon size={16} className="shrink-0 text-zinc-400" />
            <input
              type="text"
              placeholder={t("searchPlaceholder")}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
              className="min-w-0 flex-1 bg-transparent text-sm text-zinc-900 outline-none placeholder:text-zinc-400 dark:text-zinc-100 dark:placeholder:text-zinc-500"
            />
          </div>

          {isOpen && query.trim() && (
            <div className="absolute inset-x-0 top-full z-20 mt-2 overflow-hidden rounded-xl border border-zinc-200 bg-white text-start shadow-xl dark:border-zinc-700 dark:bg-zinc-900">
              {searchResults.length > 0 ? (
                <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {searchResults.map((tool) => {
                    const Icon = getToolIcon(tool.slug);
                    return (
                      <li key={tool.slug}>
                        <Link
                          href={`/tools/${tool.slug}`}
                          onClick={() => setIsOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm transition hover:bg-zinc-50 dark:hover:bg-zinc-800"
                        >
                          <Icon size={14} className="shrink-0 text-zinc-400" />
                          <span className="text-zinc-800 dark:text-zinc-200">
                            {tTools(`${tool.slug}.title`)}
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="px-4 py-3 text-sm text-zinc-500 dark:text-zinc-400">
                  {tCommon("toolSearchNoResults")}
                </p>
              )}
            </div>
          )}
        </div>

        {allRelated.length > 0 && (
          <div className="flex flex-col gap-2">
            {(relatedListTitle || fill) && (
              <p className="px-1 text-xs font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
                {curated.length > 0 && relatedListTitle ? relatedListTitle : tCategories(`${category}.title`)}
              </p>
            )}
            <div className="flex flex-col overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
              <ul id={listId} className="flex flex-col divide-y divide-zinc-100 dark:divide-zinc-800">
                {allRelated.slice(0, VISIBLE_COUNT).map(toolLink)}
                {expanded && allRelated.slice(VISIBLE_COUNT).map(toolLink)}
              </ul>
              {hiddenCount > 0 && (
                <button
                  type="button"
                  aria-expanded={expanded}
                  aria-controls={listId}
                  onClick={() => setExpanded((v) => !v)}
                  className="flex min-h-11 items-center justify-center gap-1.5 border-t border-zinc-100 px-3 text-sm font-medium text-blue-600 transition hover:bg-blue-50 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-blue-500 motion-reduce:transition-none dark:border-zinc-800 dark:text-blue-400 dark:hover:bg-blue-500/10"
                >
                  {expanded ? tCommon("relatedShowLess") : tCommon("relatedShowMore", { count: hiddenCount })}
                  <ChevronDown size={14} className={`transition-transform motion-reduce:transition-none ${expanded ? "rotate-180" : ""}`} />
                </button>
              )}
            </div>
          </div>
        )}

        <Link
          href={`/categories/${category}`}
          className="flex items-center justify-center gap-1.5 rounded-xl border border-zinc-200 py-2.5 text-sm font-medium text-blue-600 transition hover:bg-blue-50/50 dark:border-zinc-800 dark:text-blue-400 dark:hover:bg-blue-500/10"
        >
          {tCommon("viewAllCta", { category: tCategories(`${category}.title`) })}
          <ArrowRight size={14} className="rtl:rotate-180" />
        </Link>
      </div>

      <div className="-mx-4 border-t border-zinc-200 pt-6 dark:border-zinc-800 lg:-mx-6">
        <AdSpace className="mx-auto" />
      </div>
    </SectionCard>
    {/* Unused sidebarMatchRow column height lands here, outside the card; ToolAboveFold subtracts it when
        measuring regardless of whether it's empty or filled with `fillContent`. */}
    {fill &&
      (fillContent ? (
        <div data-sidebar-grow className="hidden lg:flex lg:min-h-0 lg:flex-1 lg:flex-col">
          {fillContent}
        </div>
      ) : (
        <div data-sidebar-grow aria-hidden="true" className="hidden lg:block lg:flex-1" />
      ))}
    </>
  );
}
