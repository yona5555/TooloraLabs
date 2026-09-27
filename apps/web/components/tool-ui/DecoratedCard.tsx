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
 */

type DecoratedCardProps = {
  href: string;
  colorHex: string;
  textVariant: "white" | "dark";
  Icon: LucideIcon;
  seed: string;
  size?: DecoratedIconHeaderSize;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
};

export default function DecoratedCard({ href, colorHex, textVariant, Icon, seed, size, children, className = "", disabled = false }: DecoratedCardProps) {
  const chrome = `flex h-full flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white transition-all duration-300 dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-none ${
    disabled ? "opacity-60" : "hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl dark:hover:border-blue-500/40"
  } ${className}`;

  const content = (
    <>
      <DecoratedIconHeader colorHex={colorHex} textVariant={textVariant} Icon={Icon} seed={seed} size={size} />
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
