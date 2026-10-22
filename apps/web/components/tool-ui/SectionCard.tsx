import { ReactNode } from "react";

type SectionCardProps = {
  title: ReactNode;
  action?: ReactNode;
  onToggle?: () => void;
  children: ReactNode;
  bodyClassName?: string;
  className?: string;
  /** Anchor id for in-page navigation (e.g. SectionNav) — adds scroll-margin so sticky headers don't cover the target. */
  id?: string;
  /**
   * Opt-in per §34/§37 (2026-10-22, surface-area-calculator pilot only — every other caller is
   * unaffected since this defaults to false): below 768px, the framed card and blue header (§34,
   * §37) are desktop-only decoration. The header becomes a small caps label line with a hairline
   * bottom border instead of the filled blue bar, and the body padding drops from 16px to 11px.
   * md and up render exactly as before.
   */
  mobilePlain?: boolean;
};

const headerClassName =
  "flex w-full items-center justify-between gap-3 rounded-t-2xl bg-blue-600 px-4 py-2.5 text-start lg:px-6 lg:py-3";
const headerClassNameMobilePlain =
  "flex w-full items-center justify-between gap-2 border-b border-zinc-200 px-[11px] py-2 text-start max-md:gap-1.5 max-md:rounded-none max-md:border-b max-md:bg-transparent max-md:px-[11px] max-md:py-[3px] md:rounded-t-2xl md:border-b-0 md:bg-blue-600 md:px-4 md:py-2.5 lg:px-6 lg:py-3 dark:border-zinc-800";

export default function SectionCard({
  title,
  action,
  onToggle,
  children,
  bodyClassName = "p-4 lg:p-6",
  className = "",
  id,
  mobilePlain = false,
}: SectionCardProps) {
  const heading = mobilePlain ? (
    <h2 className="max-md:text-[10px] max-md:leading-[14px] max-md:font-semibold max-md:tracking-wider max-md:text-zinc-500 max-md:uppercase md:font-bold md:text-white dark:max-md:text-zinc-400">
      {title}
    </h2>
  ) : (
    <h2 className="font-bold text-white">{title}</h2>
  );

  const resolvedHeaderClassName = mobilePlain ? headerClassNameMobilePlain : headerClassName;
  const resolvedCardClassName = mobilePlain
    ? `rounded-2xl border border-blue-200 bg-white shadow-sm dark:border-blue-500/30 dark:bg-zinc-900 dark:shadow-none max-md:rounded-lg max-md:border-zinc-200 max-md:shadow-none dark:max-md:border-zinc-800 ${id ? "scroll-mt-32" : ""} ${className}`
    : `rounded-2xl border border-blue-200 bg-white shadow-sm dark:border-blue-500/30 dark:bg-zinc-900 dark:shadow-none ${id ? "scroll-mt-32" : ""} ${className}`;

  return (
    <div id={id} data-bp-panel className={resolvedCardClassName}>
      {onToggle ? (
        <button type="button" onClick={onToggle} className={resolvedHeaderClassName}>
          {heading}
          {action}
        </button>
      ) : (
        <div className={resolvedHeaderClassName}>
          {heading}
          {action}
        </div>
      )}

      <div data-card-body className={bodyClassName}>
        {children}
      </div>
    </div>
  );
}
