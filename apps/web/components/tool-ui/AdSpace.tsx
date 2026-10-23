import { useTranslations } from "next-intl";

/**
 * Two canonical ad treatments site-wide (see §7.7 in
 * TooloraLabs-Claude-Instructions.md): "sidebar" is a fixed 300x600 (IAB
 * Half Page) — explicit pixel dimensions, never fluid, since it sits in a
 * fixed-width column. "leaderboard" is the one deliberately responsive
 * exception: a fixed-height, fluid-width box that renders at exactly
 * 728x90 (IAB Leaderboard) from md up (capped at the standard's max, so it
 * fits content columns of varying width), and below md (phone, < 768px) at
 * a fixed, centered 300x250 (IAB Medium Rectangle) — never stretched to the
 * column width (Yousef 2026-10-23). Its equal side margins keep it centered
 * even in a column narrower than 300px (encyclopedia paper at 360px is 294px).
 */
const SIDEBAR_SIZE = { width: 300, height: 600 };

type AdSpaceProps = {
  className?: string;
  variant?: "sidebar" | "leaderboard";
  /** Phone pilot (crypto-converter): "Advertisement" instead of "Sponsored" below 768px only. */
  label?: "sponsored" | "advertisement";
};

export default function AdSpace({ className = "", variant = "sidebar", label = "sponsored" }: AdSpaceProps) {
  const t = useTranslations("common");
  const labelText =
    label === "advertisement" ? (
      <>
        <span className="md:hidden">{t("advertisementLabel")}</span>
        <span className="max-md:hidden">{t("sponsoredLabel")}</span>
      </>
    ) : (
      t("sponsoredLabel")
    );

  if (variant === "leaderboard") {
    return (
      <div data-ad-slot="" className={`mx-auto flex w-[300px] max-w-[728px] flex-col gap-1.5 max-md:mx-[calc((100%-300px)/2)] md:w-full ${className}`}>
        <p className="text-xs font-medium text-zinc-400 dark:text-zinc-600">{labelText}</p>
        <div data-ad-box="" className="flex h-[250px] w-[300px] shrink-0 items-center justify-center rounded-xl border border-dashed border-zinc-300 text-sm font-medium text-zinc-400 md:h-[90px] md:w-full md:max-w-[728px] dark:border-zinc-700 dark:text-zinc-600">
          {t("adSpace")}
        </div>
      </div>
    );
  }

  const { width, height } = SIDEBAR_SIZE;

  return (
    <div data-ad-slot="" className={`flex shrink-0 grow-0 flex-col gap-1.5 ${className}`} style={{ width }}>
      <p className="text-xs font-medium text-zinc-400 dark:text-zinc-600">{labelText}</p>
      <div
        data-ad-box=""
        style={{ width, height, minWidth: width, minHeight: height, maxWidth: width, maxHeight: height }}
        className="flex items-center justify-center rounded-xl border border-dashed border-zinc-300 text-sm font-medium text-zinc-400 dark:border-zinc-700 dark:text-zinc-600"
      >
        {t("adSpace")}
      </div>
    </div>
  );
}
