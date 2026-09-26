import type { LucideIcon } from "lucide-react";

type Props = {
  icon: LucideIcon;
  className?: string;
  iconClassName?: string;
};

/**
 * Shared circular neumorphic icon badge — a soft-UI dual-shadow disc (light
 * mode: pale gray with a light-source highlight + a soft dark shadow; dark
 * mode: near-black with the shadow pair inverted so the highlight still
 * reads as "light coming from the same direction") wrapping a single lucide
 * icon. One component carries both light and dark renderings via Tailwind's
 * `dark:` variant rather than two separate badge components, since both
 * variants share the same size/shape and only the shadow color pair flips.
 */
export default function NeumorphicIconBadge({ icon: Icon, className = "", iconClassName = "text-blue-600 dark:text-blue-400" }: Props) {
  return (
    <span
      className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-zinc-100 shadow-[5px_5px_10px_rgba(0,0,0,0.08),-5px_-5px_10px_rgba(255,255,255,0.9)] dark:bg-zinc-800 dark:shadow-[5px_5px_10px_rgba(0,0,0,0.55),-5px_-5px_10px_rgba(255,255,255,0.04)] ${className}`}
    >
      <Icon size={19} className={iconClassName} aria-hidden="true" />
    </span>
  );
}
