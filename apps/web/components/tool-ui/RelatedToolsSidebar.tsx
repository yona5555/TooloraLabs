"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowRight, Search as SearchIcon } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { tools } from "@/data/tools";
import { getToolIcon } from "@/lib/tool-icons";
import { getCategoryIconColor } from "@/lib/category-colors";
import AdSpace from "./AdSpace";
import SectionCard from "./SectionCard";

const MAX_RELATED = 3;

type RelatedToolsSidebarProps = {
  currentSlug: string;
  category: string;
};

export default function RelatedToolsSidebar({ currentSlug, category }: RelatedToolsSidebarProps) {
  const t = useTranslations("hero");
  const tTools = useTranslations("tools");
  const tCommon = useTranslations("common");
  const tCategories = useTranslations("categories");

  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const related = tools
    .filter((tool) => tool.category === category && tool.slug !== currentSlug)
    .slice(0, MAX_RELATED);

  const searchResults = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return [];

    return tools
      .filter((tool) => {
        const title = tTools(`${tool.slug}.title`).toLowerCase();
        const keywords = tool.keywords.join(" ").toLowerCase();
        return title.includes(normalized) || keywords.includes(normalized);
      })
      .slice(0, 5);
  }, [query, tTools]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
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

        <div className="space-y-2">
          {related.map((tool) => {
            const Icon = getToolIcon(tool.slug);
            return (
              <Link
                key={tool.slug}
                href={`/tools/${tool.slug}`}
                className="flex items-center gap-3 rounded-xl border border-transparent p-2.5 transition hover:border-blue-200 hover:bg-blue-50/50 dark:hover:border-blue-500/40 dark:hover:bg-blue-500/10"
              >
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${getCategoryIconColor(category)}`}
                >
                  <Icon size={14} strokeWidth={2} />
                </div>
                <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {tTools(`${tool.slug}.title`)}
                </span>
              </Link>
            );
          })}
        </div>

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
  );
}
