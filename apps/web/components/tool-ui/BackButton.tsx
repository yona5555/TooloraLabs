import { ArrowLeft } from "lucide-react";
import { Link } from "@/i18n/navigation";

/**
 * The one shared back-navigation control for every page on the site — see
 * TooloraLabs-Claude-Instructions.md §35. Always sits immediately beside the
 * page's own title via a `flex items-center gap-*` row — flexbox already
 * reorders correctly under `dir="rtl"` with no manual left/right
 * positioning, so the same markup mirrors correctly for Arabic and any
 * future RTL locale without special-casing. The arrow glyph itself also
 * flips (`rtl:rotate-180`) so it still visually points toward "back" (the
 * reading-direction-start edge) in RTL, not literally left.
 *
 * Two variants:
 * - "icon" (default): icon only, no visible text label (the destination
 *   label is exposed to assistive tech only, via `aria-label`/`title`).
 * - "labeled": a prominent pill — border, background, arrow and a visible
 *   `text` (e.g. "Back"), with hover and visible keyboard-focus states.
 *   `label` (the destination) stays available as the hover tooltip.
 *   Switching a page over is one prop: `variant="labeled" text={...}`.
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
  variant?: "icon" | "labeled";
  /** Visible text for the "labeled" variant; falls back to `label`. */
  text?: string;
  /**
   * Phone pilot (Tool.phonePilot): below 768px the icon variant becomes a 36px labeled button
   * (arrow + this text) inside a 44px-tall hit area. From 768px up it renders exactly as the icon variant.
   */
  phoneText?: string;
};

export default function BackButton({ href, label, className = "", size = 20, variant = "icon", text, phoneText }: BackButtonProps) {
  if (variant === "labeled") {
    return (
      <Link
        href={href}
        title={label}
        className={`inline-flex h-10 shrink-0 items-center gap-2 rounded-full border border-zinc-300 bg-white px-4 text-sm font-semibold text-zinc-700 shadow-sm transition hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:border-blue-500 dark:hover:bg-blue-500/10 dark:hover:text-blue-300 dark:focus-visible:ring-blue-400 dark:focus-visible:ring-offset-zinc-950 ${className}`}
      >
        <ArrowLeft size={size} className="shrink-0 rtl:rotate-180" />
        <span>{text ?? label}</span>
      </Link>
    );
  }
  if (phoneText) {
    return (
      <Link
        href={href}
        aria-label={label}
        title={label}
        className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-zinc-500 transition hover:bg-zinc-100 hover:text-blue-600 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-blue-400 ${className} max-md:w-auto max-md:min-w-11 max-md:text-zinc-700 max-md:hover:bg-transparent dark:max-md:text-zinc-200`}
      >
        <span className="flex h-9 items-center gap-1.5 rounded-full border border-zinc-300 bg-white ps-2.5 pe-3 text-sm font-semibold shadow-sm md:contents dark:border-zinc-700 dark:bg-zinc-900">
          <ArrowLeft size={size} className="shrink-0 rtl:rotate-180" />
          <span className="md:hidden">{phoneText}</span>
        </span>
      </Link>
    );
  }
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
