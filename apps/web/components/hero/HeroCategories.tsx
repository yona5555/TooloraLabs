import { useTranslations } from "next-intl";
import { categories } from "@/data/categories";
import { tools } from "@/data/tools";
import { comingSoonPhases } from "@/data/comingSoon";
import { getCategoryIcon } from "@/lib/category-icons";
import { getCategoryPaletteColor } from "@/lib/category-palette";
import DecoratedCard from "@/components/tool-ui/DecoratedCard";

const TOOL_COUNT_BY_CATEGORY = tools.reduce<Record<string, number>>((counts, tool) => {
  counts[tool.category] = (counts[tool.category] ?? 0) + 1;
  return counts;
}, {});

/** Planned (not yet live) tools, counted separately from TOOL_COUNT_BY_CATEGORY above so the
 * real live-tool count this component has always shown never gets diluted with unshipped tools —
 * it's rendered as an additive "+N coming" badge instead of being folded into the main count. */
const COMING_SOON_COUNT_BY_CATEGORY = Object.values(comingSoonPhases)
  .flat()
  .reduce<Record<string, number>>((counts, tool) => {
    counts[tool.category] = (counts[tool.category] ?? 0) + 1;
    return counts;
  }, {});

export default function HeroCategories() {
  const tc = useTranslations("categories");
  const tNav = useTranslations("navbar");
  const tSection = useTranslations("categoriesSection");

  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 sm:gap-2.5 lg:flex-1 lg:grid-rows-3">
      {categories.map((category) => {
        const Icon = getCategoryIcon(category.icon);
        const { hex, text } = getCategoryPaletteColor(category.slug);
        const toolCount = TOOL_COUNT_BY_CATEGORY[category.slug] ?? 0;
        const comingSoonCount = COMING_SOON_COUNT_BY_CATEGORY[category.slug] ?? 0;
        const isComingSoon = toolCount === 0;

        return (
          <DecoratedCard
            key={category.slug}
            href={`/categories/${category.slug}`}
            colorHex={hex}
            textVariant={text}
            Icon={Icon}
            seed={category.slug}
            size="compact"
            disabled={isComingSoon}
          >
            <div className="flex flex-1 flex-col items-center gap-1 p-2 text-center sm:p-2.5">
              <span className="w-full truncate text-[11px] font-bold text-zinc-800 dark:text-zinc-100 sm:text-xs">{tc(`${category.slug}.title`)}</span>
              <span className="line-clamp-2 text-[9px] leading-tight text-zinc-500 dark:text-zinc-400 sm:text-[10px]">
                {tc(`${category.slug}.description`)}
              </span>
              {isComingSoon ? (
                <span className="mt-auto pt-1 text-[9px] font-medium tracking-wide text-zinc-400 uppercase dark:text-zinc-500 sm:text-[10px]">
                  {tNav("comingSoon")}
                </span>
              ) : (
                <span className="mt-auto flex flex-col items-center gap-0.5 pt-1">
                  <span className="rounded-full bg-zinc-100 px-1.5 py-0.5 text-[9px] font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400 sm:text-[10px]">
                    {tSection("toolCount", { count: toolCount })}
                  </span>
                  {comingSoonCount > 0 && (
                    <span className="rounded-full bg-blue-50 px-1.5 py-0.5 text-[9px] font-medium text-blue-500 dark:bg-blue-500/10 dark:text-blue-400 sm:text-[10px]">
                      {tSection("comingSoonCount", { count: comingSoonCount })}
                    </span>
                  )}
                </span>
              )}
            </div>
          </DecoratedCard>
        );
      })}
    </div>
  );
}
