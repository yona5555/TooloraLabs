import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { categories } from "@/data/categories";
import { tools } from "@/data/tools";
import { getCategoryIcon } from "@/lib/category-icons";
import { getCategoryIconColor } from "@/lib/category-colors";

const TOOL_COUNT_BY_CATEGORY = tools.reduce<Record<string, number>>((counts, tool) => {
  counts[tool.category] = (counts[tool.category] ?? 0) + 1;
  return counts;
}, {});

/** Shared by both card variants below so the "Coming Soon" placeholder lines up exactly with a real category card at every breakpoint. Title is forced to a single line (truncating with an ellipsis in the rare case a translation still doesn't fit) rather than wrapping to two lines. */
const CARD_CLASSES =
  "flex h-full flex-col items-center justify-center gap-1.5 rounded-2xl border border-blue-300 bg-white p-2 text-center dark:border-blue-500/40 dark:bg-zinc-900";
const TITLE_CLASSES = "w-full truncate text-[11px] font-semibold leading-tight text-zinc-700 dark:text-zinc-200 sm:text-xs";

export default function HeroCategories() {
  const tc = useTranslations("categories");
  const tNav = useTranslations("navbar");
  const tSection = useTranslations("categoriesSection");

  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 sm:gap-2.5 lg:flex-1 lg:grid-rows-3">
      {categories.map((category) => {
        const Icon = getCategoryIcon(category.icon);
        const iconColorClasses = getCategoryIconColor(category.slug);
        const toolCount = TOOL_COUNT_BY_CATEGORY[category.slug] ?? 0;

        if (toolCount === 0) {
          return (
            <div key={category.slug} aria-disabled="true" className={`${CARD_CLASSES} opacity-60`}>
              <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconColorClasses}`}>
                <Icon size={22} strokeWidth={2} />
              </span>
              <span className={TITLE_CLASSES}>{tc(`${category.slug}.title`)}</span>
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
            <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconColorClasses}`}>
              <Icon size={22} strokeWidth={2} />
            </span>
            <span className={TITLE_CLASSES}>{tc(`${category.slug}.title`)}</span>
            <span className="rounded-full bg-zinc-100 px-1.5 py-0.5 text-[9px] font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400 sm:text-[10px]">
              {tSection("toolCount", { count: toolCount })}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
