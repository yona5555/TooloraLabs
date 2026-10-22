import type { ReactNode, SyntheticEvent } from "react";

/**
 * Phone standard (<768px, 2026-10-22, surface-area-calculator only): one collapsed row per
 * section, native `<details>` (no JS needed for the toggle itself), 44px closed height, "+"
 * marker. Hidden at `md` and up — the desktop rendering of the same section stays untouched and
 * renders its own markup separately, so this never affects any other tool.
 */
export default function SurfaceAreaMobileRow({
  title,
  children,
  onToggle,
}: {
  title: ReactNode;
  children: ReactNode;
  /** Native `<details>` toggle event, fired on both open and close — used by the one row whose
   * content (the 3D scene) must not mount until actually opened (point 7). */
  onToggle?: (e: SyntheticEvent<HTMLDetailsElement>) => void;
}) {
  return (
    <details onToggle={onToggle} className="group border-b border-zinc-200 last:border-b-0 md:hidden dark:border-zinc-800">
      <summary className="flex h-11 cursor-pointer list-none items-center justify-between gap-2 text-[12px] font-semibold tracking-wider text-zinc-500 uppercase marker:content-none dark:text-zinc-400">
        {title}
        <span aria-hidden="true" className="text-base leading-none text-zinc-400 group-open:hidden">
          +
        </span>
      </summary>
      <div className="pb-4 text-[13.5px] leading-6 text-zinc-600 dark:text-zinc-300">{children}</div>
    </details>
  );
}
