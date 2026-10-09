import { createElement } from "react";
import { existsSync } from "node:fs";
import path from "node:path";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import type { Tool } from "@/data/tools";
import { getToolIcon } from "@/lib/tool-icons";
import { getCategoryPaletteColor } from "@/lib/category-palette";
import { Link } from "@/i18n/navigation";

/**
 * The one tool card used by every tool-listing surface: the /tools grid, a
 * category's grid, the homepage's featured tools and a tool page's related
 * tools. Fixed height; the inline-start half (mirrors in RTL) is the tool's
 * real result-panel preview captured by scripts/capture-tool-previews.mjs,
 * the other half holds title, Featured badge, tags, description and the
 * CTA stacked with no stretch gap. Surfaces follow the site theme. A tool
 * whose capture failed shows its icon on the category color instead of a
 * fake image. Hover only lifts the card, so the image is never clipped.
 */

type ToolCardProps = {
  tool: Tool;
  titleText: string;
  descriptionText: string;
  /** Translated "Featured" label — shown only when both this and `tool.featured` are set. */
  featuredLabel?: string;
  maxTags?: number;
};

const previewDir = path.join(process.cwd(), "public/tool-previews");

export default async function ToolCard({ tool, titleText, descriptionText, featuredLabel, maxTags = 2 }: ToolCardProps) {
  const t = await getTranslations("compareFinancialCalculators");
  const hasPreview = existsSync(path.join(previewDir, `${tool.slug}.png`));
  const { hex, text } = getCategoryPaletteColor(tool.category);
  const tags = tool.keywords.slice(0, maxTags);
  const showFeatured = tool.featured && featuredLabel;

  return (
    <Link
      href={`/tools/${tool.slug}`}
      className="group flex h-56 min-w-0 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl focus-visible:outline-2 focus-visible:outline-blue-500 dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-black/40 dark:hover:border-blue-500/40"
    >
      <div className="relative h-full w-1/2 shrink-0 border-e border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800/60">
        {hasPreview ? (
          <Image src={`/tool-previews/${tool.slug}.png`} alt="" aria-hidden="true" fill sizes="(min-width: 1280px) 210px, (min-width: 768px) 50vw, 50vw" className="object-contain p-2" />
        ) : (
          <div className="flex h-full items-center justify-center" style={{ backgroundColor: hex }}>
            {createElement(getToolIcon(tool.slug), { size: 56, strokeWidth: 1.5, className: text === "white" ? "text-white" : "text-zinc-900", "aria-hidden": true })}
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-2 p-3 sm:p-4">
        <h3 className="line-clamp-2 text-sm font-bold leading-snug text-zinc-900 sm:text-base dark:text-zinc-50">{titleText}</h3>

        {(showFeatured || tags.length > 0) && (
          <div className="flex h-5 flex-wrap gap-1 overflow-hidden">
            {showFeatured && (
              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold leading-4 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300">{featuredLabel}</span>
            )}
            {tags.map((tag) => (
              <span key={tag} className="truncate rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-medium leading-4 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                {tag}
              </span>
            ))}
          </div>
        )}

        <p className="line-clamp-3 text-xs leading-snug text-zinc-500 dark:text-zinc-400">{descriptionText}</p>

        <span className="inline-flex w-fit max-w-full shrink-0 items-center gap-1 truncate rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white transition-colors group-hover:bg-blue-700 dark:bg-blue-500 dark:group-hover:bg-blue-400 dark:group-hover:text-zinc-950">
          {t("openTool")}
          <ArrowRight size={12} className="rtl:rotate-180" aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
}
