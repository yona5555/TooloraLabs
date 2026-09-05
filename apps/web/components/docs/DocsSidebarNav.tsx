"use client";
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronDown, ChevronRight, Compass, LayoutGrid, Library, Search } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { categories } from "@/data/categories";
import { tools } from "@/data/tools";
import { getCategoryIcon } from "@/lib/category-icons";
import { getToolIcon } from "@/lib/tool-icons";
import { isToolDocumented } from "@/lib/docs-tools";

const categoriesWithTools = categories
  .map((category) => ({ ...category, tools: tools.filter((tool) => tool.category === category.slug) }))
  .filter((category) => category.tools.length > 0);

export default function DocsSidebarNav() {
  const t = useTranslations("docsNav");
  const tTools = useTranslations("tools");
  const tCategories = useTranslations("categories");
  const pathname = usePathname();
  const currentSlug = pathname.startsWith("/docs/") ? pathname.slice("/docs/".length) : null;
  const currentCategory = currentSlug ? tools.find((tool) => tool.slug === currentSlug)?.category : null;

  const [query, setQuery] = useState("");
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>(
    () => (currentCategory ? { [currentCategory]: true } : {})
  );

  const normalizedQuery = query.trim().toLowerCase();
  const filteredCategories = useMemo(() => {
    if (!normalizedQuery) return categoriesWithTools;
    return categoriesWithTools
      .map((category) => ({
        ...category,
        tools: category.tools.filter((tool) => tTools(`${tool.slug}.title`).toLowerCase().includes(normalizedQuery)),
      }))
      .filter((category) => category.tools.length > 0);
  }, [normalizedQuery, tTools]);

  function toggleCategory(slug: string) {
    setOpenCategories((prev) => ({ ...prev, [slug]: !prev[slug] }));
  }

  const isSearching = normalizedQuery.length > 0;

  return (
    <nav aria-label={t("navLabel")} className="flex flex-col gap-5 text-sm">
      <div className="relative">
        <Search size={16} className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-zinc-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("searchPlaceholder")}
          className="w-full rounded-lg border border-zinc-300 bg-white ps-9 pe-3 py-2 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-blue-500 dark:focus:ring-blue-500/20"
        />
      </div>

      <Link
        href="/docs"
        className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 font-medium transition ${
          pathname === "/docs"
            ? "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
            : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
        }`}
      >
        <Compass size={16} />
        {t("overview")}
      </Link>

      <div>
        <p className="mb-2 flex items-center gap-2 px-2.5 text-xs font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
          <LayoutGrid size={13} />
          {t("toolsGuide")}
        </p>
        <div className="flex flex-col gap-0.5">
          {filteredCategories.map((category) => {
            const CategoryIcon = getCategoryIcon(category.icon);
            const isOpen = isSearching || openCategories[category.slug];
            return (
              <div key={category.slug}>
                <button
                  type="button"
                  onClick={() => toggleCategory(category.slug)}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-start font-medium text-zinc-700 transition hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
                >
                  <CategoryIcon size={16} className="shrink-0 text-zinc-400" />
                  <span className="flex-1 truncate">{tCategories(`${category.slug}.title`)}</span>
                  {isOpen ? <ChevronDown size={14} className="shrink-0 text-zinc-400" /> : <ChevronRight size={14} className="shrink-0 text-zinc-400" />}
                </button>
                {isOpen && (
                  <div className="ms-4 mt-0.5 flex flex-col gap-0.5 border-s border-zinc-200 ps-3 dark:border-zinc-800">
                    {category.tools.map((tool) => {
                      const ToolIcon = getToolIcon(tool.slug);
                      const isPilotReady = isToolDocumented(tool.slug);
                      const isActive = currentSlug === tool.slug;
                      return (
                        <Link
                          key={tool.slug}
                          href={`/docs/${tool.slug}`}
                          className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 transition ${
                            isActive
                              ? "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
                              : "text-zinc-600 hover:bg-zinc-100 hover:text-blue-600 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-blue-400"
                          }`}
                        >
                          <ToolIcon size={14} className="shrink-0 text-zinc-400" />
                          <span className="flex-1 truncate">{tTools(`${tool.slug}.title`)}</span>
                          {!isPilotReady && (
                            <span className="shrink-0 rounded-full bg-zinc-100 px-1.5 py-0.5 text-[10px] font-semibold text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                              {t("soon")}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <Link
        href="/docs"
        className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 font-medium text-zinc-700 transition hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
      >
        <Library size={16} />
        {t("reference")}
      </Link>
    </nav>
  );
}
