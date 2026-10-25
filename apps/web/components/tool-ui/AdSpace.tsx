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
 * Desktop leaderboards are placed only by DesktopAdSlot (3 per tool page, lib/ads.ts) and grow to
 * 970x250 (IAB Billboard) in a column at least 970px wide.
 */
const SIDEBAR_SIZE = { width: 300, height: 600 };

type AdSpaceProps = {
  className?: string;
  variant?: "sidebar" | "leaderboard";
  /**
   * APPROVED PHONE STANDARD (visuals.md): a phone-only 300×250 slot labelled "Advertisement",
   * display:none from 768px up. Every other leaderboard is an in-content desktop slot and is
   * display:none below 768px, so a phone only ever shows the phone slots.
   */
  phone?: boolean;
};

export default function AdSpace({ className = "", variant = "sidebar", phone = false }: AdSpaceProps) {
  const t = useTranslations("common");
  const labelText = t("advertisementLabel");
  // Desktop in-content slots (DesktopAdSlot) sit in a size container: 970x250 where the column is that wide.
  const wide = phone ? "" : "@min-[970px]:max-w-[970px]";

  if (variant === "leaderboard") {
    return (
      // suppressHydrationWarning: the phone layout pass (lib/phone/layout.ts) may mark this slot
      // `data-phone-hide` while the HTML is parsed, before hydration (same as InfoSection's slots).
      <div data-ad-slot="" suppressHydrationWarning className={`mx-auto flex w-[300px] max-w-[728px] flex-col gap-1.5 max-md:mx-[calc((100%-300px)/2)] md:w-full ${wide} ${phone ? "md:hidden" : "max-md:hidden"} ${className}`}>
        <p className="text-xs font-medium text-zinc-400 dark:text-zinc-600">{labelText}</p>
        <div data-ad-box="" className={`flex h-[250px] w-[300px] shrink-0 items-center justify-center rounded-xl border border-dashed border-zinc-300 text-sm font-medium text-zinc-400 md:h-[90px] md:w-full md:max-w-[728px] ${phone ? "" : "md:@min-[970px]:h-[250px] @min-[970px]:max-w-[970px]"} dark:border-zinc-700 dark:text-zinc-600`}>
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
