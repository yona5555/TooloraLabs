import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { categories } from "@/data/categories";
import { tools } from "@/data/tools";
import { comingSoonPhases } from "@/data/comingSoon";
import { getCategoryIcon } from "@/lib/category-icons";
import { getCategoryPaletteColor } from "@/lib/category-palette";
import { Link } from "@/i18n/navigation";
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
  const tTools = useTranslations("tools");
  const tNav = useTranslations("navbar");
  const tFooter = useTranslations("footer");
  const tSection = useTranslations("categoriesSection");

  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 sm:gap-2.5 lg:flex-1 lg:grid-rows-3">
      {categories.map((category) => {
        const Icon = getCategoryIcon(category.icon);
        const { hex, text } = getCategoryPaletteColor(category.slug);
        const toolCount = TOOL_COUNT_BY_CATEGORY[category.slug] ?? 0;
        const comingSoonCount = COMING_SOON_COUNT_BY_CATEGORY[category.slug] ?? 0;
        const isComingSoon = toolCount === 0;
        const textColorClass = text === "white" ? "text-white" : "text-[#1c1917]";
        const ctaClass = text === "white" ? "bg-white text-[#1c1917] hover:bg-white/90" : "bg-[#1c1917] text-white hover:bg-black/80";
        const secondaryClass = text === "white" ? "border-white/50 hover:bg-white/15" : "border-[#1c1917]/30 hover:bg-black/10";

        const categoryTools = tools.filter((t) => t.category === category.slug);
        const toolNames = categoryTools.map((t) => tTools(`${t.slug}.title`)).join("، ");
        const overviewText = toolNames ? `${tc(`${category.slug}.description`)} — ${toolNames}.` : tc(`${category.slug}.description`);

        const hoverOverlay = !isComingSoon ? (
          <div className={`flex h-full min-h-0 flex-col items-center gap-1 p-2.5 text-center ${textColorClass}`}>
            <h3 className="shrink-0 text-[11px] leading-tight font-bold sm:text-xs">{tc(`${category.slug}.title`)}</h3>

            <p className="line-clamp-5 min-h-0 flex-1 overflow-hidden text-[9px] leading-snug opacity-90 sm:text-[10px]">{overviewText}</p>

            <div className="pointer-events-auto flex w-full min-w-0 shrink-0 flex-col gap-1">
              <Link
                href={`/categories/${category.slug}`}
                className={`relative z-50 inline-flex items-center justify-center gap-1 rounded-md px-2 py-1 text-[9px] font-bold transition-colors sm:text-[10px] ${ctaClass}`}
              >
                {tNav("browse")}
                <ArrowRight size={9} className="rtl:rotate-180" />
              </Link>
              <Link
                href="/contact"
                className={`relative z-50 inline-flex items-center justify-center rounded-md border px-2 py-1 text-[9px] font-medium transition-colors sm:text-[10px] ${secondaryClass}`}
              >
                {tFooter("contact")}
              </Link>
            </div>
          </div>
        ) : undefined;

        return (
          <DecoratedCard
            key={category.slug}
            href={`/categories/${category.slug}`}
            colorHex={hex}
            textVariant={text}
            Icon={Icon}
            seed={category.slug}
            title={tc(`${category.slug}.title`)}
            size="compact"
            disabled={isComingSoon}
            hoverOverlay={hoverOverlay}
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
