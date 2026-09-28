import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Link } from "@/i18n/navigation";
import DecoratedIconHeader, { type DecoratedIconHeaderSize } from "./DecoratedIconHeader";

/**
 * The one shared card component for both category cards and tool cards —
 * see TooloraLabs-Claude-Instructions.md §34. Wraps the decorated header
 * (colored background + enlarged icon + non-repeating decoration) with the
 * card's outer Link/border/hover chrome; the white/dark body below the
 * header is fully caller-supplied via `children`, since a category card
 * (compact, centered) and a tool card (detailed, left-aligned with tags)
 * legitimately need different body layouts — only the header engine and
 * outer card chrome are shared, per the instruction's own framing ("نفس
 * بنية: خلفية ملوَّنة + أيقونة مركزية + زخرفة").
 *
 * The elevation shadow is on by default (not hover-only) — `shadow-md`,
 * strengthening to `shadow-xl` on hover. Dark mode uses a black-tinted
 * shadow instead of `shadow-none`: the card surface (zinc-900) is lighter
 * than the page background in this theme, so a soft dark shadow still
 * reads as a halo around the card rather than disappearing.
 */

type DecoratedCardProps = {
  href: string;
  colorHex: string;
  textVariant: "white" | "dark";
  Icon: LucideIcon;
  seed: string;
  title: string;
  description: string;
  size?: DecoratedIconHeaderSize;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
};

export default function DecoratedCard({ href, colorHex, textVariant, Icon, seed, title, description, size, children, className = "", disabled = false }: DecoratedCardProps) {
  const chrome = `flex h-full flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-md transition-all duration-300 dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-lg dark:shadow-black/40 ${
    disabled ? "opacity-60" : "hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl dark:hover:border-blue-500/40 dark:hover:shadow-black/60"
  } ${className}`;

  const content = (
    <>
      <DecoratedIconHeader colorHex={colorHex} textVariant={textVariant} Icon={Icon} seed={seed} title={title} description={description} size={size} />
      {children}
    </>
  );

  if (disabled) {
    return (
      <div aria-disabled="true" className={chrome}>
        {content}
      </div>
    );
  }

  return (
    <Link href={href} className={chrome}>
      {content}
    </Link>
  );
}
