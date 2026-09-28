import { ArrowRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { tools, type Tool } from "@/data/tools";
import { getToolIcon } from "@/lib/tool-icons";
import { getCategoryPaletteColor } from "@/lib/category-palette";
import { getToolIndicatorAspectRatio } from "@/lib/tool-indicator-dimensions";
import { Link } from "@/i18n/navigation";
import DecoratedCard from "./DecoratedCard";
import type { DecoratedIconHeaderSize } from "./DecoratedIconHeader";

/**
 * The standard tool card, built on the shared DecoratedCard — used by every
 * tool-listing surface (see TooloraLabs-Claude-Instructions.md §34): the
 * /tools grid, a category's tool grid, the homepage's featured tools, and
 * the related-tools list at the bottom of a tool page. The card's color is
 * always inherited from the tool's own category (`getCategoryPaletteColor`)
 * — never set independently per tool.
 *
 * Whole-card hover reveals a two-column panel in the card's own color: an
 * indicator-thumbnail column (logical inline-start — left in LTR, right in
 * RTL; sized via that tool's own captured aspect ratio — see
 * lib/tool-indicator-dimensions.ts — so it always fills its column with no
 * crop and no gap) and a details column (title, description, an "Open
 * Tool" CTA, and this tool's own "Related Tools" chips — other tools in the
 * same category, up to 3, real clickable links). Within the details
 * column, the title/CTA/chips are `shrink-0` (always shown in full); the
 * description is the one flexible element, taking only the leftover space
 * and truncating cleanly at a line boundary if it doesn't fit.
 *
 * Originated as a trial scoped to Compound Interest Calculator only,
 * approved and generalized to every tool card site-wide.
 */

type DecoratedToolCardProps = {
  tool: Tool;
  titleText: string;
  descriptionText: string;
  /** Translated "Featured" label — shown only when both this and `tool.featured` are set. */
  featuredLabel?: string;
  size?: DecoratedIconHeaderSize;
  showTags?: boolean;
  maxTags?: number;
};

export default async function DecoratedToolCard({ tool, titleText, descriptionText, featuredLabel, size = "regular", showTags = true, maxTags = 3 }: DecoratedToolCardProps) {
  const Icon = getToolIcon(tool.slug);
  const { hex, text } = getCategoryPaletteColor(tool.category);
  const tags = showTags ? tool.keywords.slice(0, maxTags) : [];
  const isCompact = size === "small" || size === "compact";
  const textColorClass = text === "white" ? "text-white" : "text-[#1c1917]";
  const chipBorderClass = text === "white" ? "border-white/50 hover:bg-white/15" : "border-[#1c1917]/30 hover:bg-black/10";
  const ctaClass = text === "white" ? "bg-white text-[#1c1917] hover:bg-white/90" : "bg-[#1c1917] text-white hover:bg-black/80";
  const aspectRatio = getToolIndicatorAspectRatio(tool.slug);

  const tTools = await getTranslations("tools");
  const tCompare = await getTranslations("compareFinancialCalculators");
  const relatedTools = tools.filter((t) => t.category === tool.category && t.slug !== tool.slug).slice(0, 3).map((t) => ({ slug: t.slug, name: tTools(`${t.slug}.title`) }));

  const hoverOverlay = (
    <div className="flex h-full">
      {/* Width follows the indicator's own aspect-ratio (never crops the tall/normal
          majority of tools), but is capped at 48% of the card so a landscape-oriented
          indicator (e.g. a short "Result" panel) can't blow out past half the card —
          object-contain on the images below still shows it complete, just letterboxed. */}
      <div className="h-full max-w-[48%] shrink-0" style={{ aspectRatio }}>
        <img src={`/card-previews/${tool.slug}-light.png`} alt="" aria-hidden="true" className="block h-full w-full object-contain dark:hidden" />
        <img src={`/card-previews/${tool.slug}-dark.png`} alt="" aria-hidden="true" className="hidden h-full w-full object-contain dark:block" />
      </div>

      <div className={`flex h-full min-h-0 min-w-0 flex-1 flex-col gap-1 p-2.5 ${textColorClass}`}>
        <h3 className={`shrink-0 font-bold leading-tight ${isCompact ? "text-[11px]" : "text-[13px]"}`}>{titleText}</h3>

        <p className={`min-h-0 flex-1 overflow-hidden leading-snug opacity-90 line-clamp-4 ${isCompact ? "text-[9px]" : "text-[10px]"}`}>{descriptionText}</p>

        <Link
          href={`/tools/${tool.slug}`}
          className={`pointer-events-auto relative z-50 inline-flex max-w-full min-w-0 shrink-0 items-center gap-1 truncate rounded-md px-2 py-0.5 text-[10px] font-bold transition-colors ${ctaClass}`}
        >
          {tCompare("openTool")}
          <ArrowRight size={10} className="rtl:rotate-180" />
        </Link>

        {relatedTools.length > 0 && (
          <div className="pointer-events-auto flex min-w-0 shrink-0 flex-col gap-1">
            {relatedTools.map((r) => (
              <Link
                key={r.slug}
                href={`/tools/${r.slug}`}
                className={`relative z-50 block truncate rounded-md border px-1.5 py-0.5 text-[9px] font-medium leading-tight transition-colors ${chipBorderClass}`}
              >
                {r.name}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <DecoratedCard href={`/tools/${tool.slug}`} colorHex={hex} textVariant={text} Icon={Icon} seed={tool.slug} title={titleText} size={size} hoverOverlay={hoverOverlay}>
      <div className={`flex flex-1 flex-col gap-2.5 ${isCompact ? "p-4" : "p-6"}`}>
        <div className="flex items-center gap-2">
          <h3 className={`font-bold text-zinc-900 dark:text-zinc-50 ${isCompact ? "text-base" : "text-lg"}`}>{titleText}</h3>
          {tool.featured && featuredLabel && (
            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-500/15 dark:text-blue-400">
              {featuredLabel}
            </span>
          )}
        </div>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <span key={tag} className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                {tag}
              </span>
            ))}
          </div>
        )}

        <p className="text-sm text-zinc-500 dark:text-zinc-400">{descriptionText}</p>
      </div>
    </DecoratedCard>
  );
}
