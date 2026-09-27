import { ArrowLeft } from "lucide-react";
import { Link } from "@/i18n/navigation";

/**
 * The one shared back-navigation control for every page on the site — see
 * TooloraLabs-Claude-Instructions.md §35. Icon only, no visible text label
 * (the destination label is exposed to assistive tech only, via
 * `aria-label`/`title`). Always sits immediately beside the page's own
 * title via a `flex items-center gap-*` row — flexbox already reorders
 * correctly under `dir="rtl"` with no manual left/right positioning, so
 * the same markup mirrors correctly for Arabic and any future RTL locale
 * without special-casing. The arrow glyph itself also flips
 * (`rtl:rotate-180`) so it still visually points toward "back" (the
 * reading-direction-start edge) in RTL, not literally left.
 *
 * This is deliberate in-site navigation to a specific parent page (tool →
 * its category, category → home, doc → docs index, etc.) — never the
 * browser's history-back behavior.
 */

type BackButtonProps = {
  href: string;
  label: string;
  className?: string;
  size?: number;
};

export default function BackButton({ href, label, className = "", size = 20 }: BackButtonProps) {
  return (
    <Link
      href={href}
      aria-label={label}
      title={label}
      className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-zinc-500 transition hover:bg-zinc-100 hover:text-blue-600 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-blue-400 ${className}`}
    >
      <ArrowLeft size={size} className="rtl:rotate-180" />
    </Link>
  );
}
