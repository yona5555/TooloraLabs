import { useTranslations } from "next-intl";

/**
 * Two canonical ad sizes site-wide (see §7.7 in TooloraLabs-Claude-Instructions.md):
 * "sidebar" (300x600, IAB Half Page) for the related-tools sidebar, and
 * "content" (336x280, IAB Large Rectangle) for in-content slots like the
 * one directly under the result column — chosen because it's the largest
 * standard IAB unit that still fits the ~380-420px result column width at
 * every breakpoint down to mobile, unlike a leaderboard (728x90).
 */
const SIZES = {
  sidebar: { width: 300, height: 600 },
  content: { width: 336, height: 280 },
} as const;

type AdSpaceProps = {
  className?: string;
  variant?: keyof typeof SIZES;
};

export default function AdSpace({ className = "", variant = "sidebar" }: AdSpaceProps) {
  const t = useTranslations("common");
  const { width, height } = SIZES[variant];

  return (
    <div className={`flex shrink-0 grow-0 flex-col gap-1.5 ${className}`} style={{ width }}>
      <p className="text-xs font-medium text-zinc-400 dark:text-zinc-600">{t("sponsoredLabel")}</p>
      <div
        style={{ width, height, minWidth: width, minHeight: height, maxWidth: width, maxHeight: height }}
        className="flex items-center justify-center rounded-xl border border-dashed border-zinc-300 text-sm font-medium text-zinc-400 dark:border-zinc-700 dark:text-zinc-600"
      >
        {t("adSpace")}
      </div>
    </div>
  );
}
