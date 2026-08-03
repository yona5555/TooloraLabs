import { useTranslations } from "next-intl";

/**
 * Fixed at the IAB "Half Page" size (300x600) — one of AdSense's best-performing
 * global ad sizes and an exact match for the sidebar column width. Explicit
 * pixel dimensions (not a flexible percentage) so a real ad unit slots in later
 * without triggering layout shift. This is the one ad size used site-wide; do
 * not override it per tool.
 */
export default function AdSpace({ className = "" }: { className?: string }) {
  const t = useTranslations("common");

  return (
    <div
      style={{ width: 300, height: 600, minWidth: 300, minHeight: 600, maxWidth: 300, maxHeight: 600 }}
      className={`flex shrink-0 grow-0 items-center justify-center rounded-xl border border-dashed border-zinc-300 text-sm font-medium text-zinc-400 dark:border-zinc-700 dark:text-zinc-600 ${className}`}
    >
      {t("adSpace")}
    </div>
  );
}
