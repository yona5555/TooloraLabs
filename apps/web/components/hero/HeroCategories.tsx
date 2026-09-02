import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { categories } from "@/data/categories";
import { tools } from "@/data/tools";
import { getCategoryIcon } from "@/lib/category-icons";

const CATEGORIES_WITH_TOOLS = new Set(tools.map((tool) => tool.category));

/** Shared by both card variants below so the "Coming Soon" placeholder lines up exactly with a real category card at every breakpoint. */
const CARD_CLASSES =
  "flex h-full flex-col items-center justify-center gap-1.5 rounded-2xl border border-blue-300 bg-white p-2 text-center dark:border-blue-500/40 dark:bg-zinc-900";

export default function HeroCategories() {
  const tc = useTranslations("categories");
  const tNav = useTranslations("navbar");

  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 sm:gap-2.5 lg:flex-1 lg:grid-rows-3">
      {categories.map((category) => {
        const Icon = getCategoryIcon(category.icon);
        const hasTools = CATEGORIES_WITH_TOOLS.has(category.slug);

        if (!hasTools) {
          return (
            <div key={category.slug} aria-disabled="true" className={`${CARD_CLASSES} opacity-60`}>
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                <Icon size={14} strokeWidth={2} />
              </span>
              <span className="text-[11px] font-semibold leading-tight text-zinc-700 dark:text-zinc-200 sm:text-xs">
                {tc(`${category.slug}.title`)}
              </span>
              <span className="text-[9px] font-medium uppercase tracking-wide text-zinc-400 dark:text-zinc-500 sm:text-[10px]">
                {tNav("comingSoon")}
              </span>
            </div>
          );
        }

        return (
          <Link
            key={category.slug}
            href={`/categories/${category.slug}`}
            className={`${CARD_CLASSES} transition hover:-translate-y-1 hover:border-blue-400 hover:shadow-lg dark:hover:border-blue-500/70`}
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
              <Icon size={14} strokeWidth={2} />
            </span>
            <span className="text-[11px] font-semibold leading-tight text-zinc-700 dark:text-zinc-200 sm:text-xs">
              {tc(`${category.slug}.title`)}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
