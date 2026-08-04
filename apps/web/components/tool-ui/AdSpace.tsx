import { useTranslations } from "next-intl";

/**
 * Two canonical ad treatments site-wide (see §7.7 in
 * TooloraLabs-Claude-Instructions.md): "sidebar" is a fixed 300x600 (IAB
 * Half Page) — explicit pixel dimensions, never fluid, since it sits in a
 * fixed-width column. "leaderboard" is the one deliberately responsive
 * exception: a fixed-height, fluid-width box that renders at exactly
 * 728x90 (IAB Leaderboard) once its container is wide enough, and at
 * 320x50 (IAB Mobile Banner) below the sm breakpoint — both are standard
 * Google-recognized sizes, and the fluid width (capped at the standard's
 * max) is what lets it drop into content columns of varying width
 * (encyclopedia paper padding differs per breakpoint) without overflowing,
 * the same overflow bug the fixed sidebar box hit once already.
 */
const SIDEBAR_SIZE = { width: 300, height: 600 };

type AdSpaceProps = {
  className?: string;
  variant?: "sidebar" | "leaderboard";
};

export default function AdSpace({ className = "", variant = "sidebar" }: AdSpaceProps) {
  const t = useTranslations("common");

  if (variant === "leaderboard") {
    return (
      <div className={`mx-auto flex w-full max-w-[728px] flex-col gap-1.5 ${className}`}>
        <p className="text-xs font-medium text-zinc-400 dark:text-zinc-600">{t("sponsoredLabel")}</p>
        <div className="flex h-[50px] w-full max-w-[320px] items-center justify-center rounded-xl border border-dashed border-zinc-300 text-sm font-medium text-zinc-400 sm:h-[90px] sm:max-w-[728px] dark:border-zinc-700 dark:text-zinc-600">
          {t("adSpace")}
        </div>
      </div>
    );
  }

  const { width, height } = SIDEBAR_SIZE;

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
