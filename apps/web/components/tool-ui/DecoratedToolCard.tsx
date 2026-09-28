import type { Tool } from "@/data/tools";
import { getToolIcon } from "@/lib/tool-icons";
import { getCategoryPaletteColor } from "@/lib/category-palette";
import DecoratedCard from "./DecoratedCard";
import type { DecoratedIconHeaderSize } from "./DecoratedIconHeader";

/**
 * The standard tool card, built on the shared DecoratedCard — used by every
 * tool-listing surface (see TooloraLabs-Claude-Instructions.md §34): the
 * /tools grid, a category's tool grid, the homepage's featured tools, and
 * the related-tools list at the bottom of a tool page. The card's color is
 * always inherited from the tool's own category (`getCategoryPaletteColor`)
 * — never set independently per tool.
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

export default function DecoratedToolCard({ tool, titleText, descriptionText, featuredLabel, size = "regular", showTags = true, maxTags = 3 }: DecoratedToolCardProps) {
  const Icon = getToolIcon(tool.slug);
  const { hex, text } = getCategoryPaletteColor(tool.category);
  const tags = showTags ? tool.keywords.slice(0, maxTags) : [];
  const isCompact = size === "small";

  return (
    <DecoratedCard href={`/tools/${tool.slug}`} colorHex={hex} textVariant={text} Icon={Icon} seed={tool.slug} title={titleText} description={descriptionText} size={size}>
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
