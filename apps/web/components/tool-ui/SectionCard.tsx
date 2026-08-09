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
};

const headerClassName =
  "flex w-full items-center justify-between gap-3 rounded-t-2xl bg-blue-600 px-4 py-2.5 text-start lg:px-6 lg:py-3";

export default function SectionCard({
  title,
  action,
  onToggle,
  children,
  bodyClassName = "p-4 lg:p-6",
  className = "",
  id,
}: SectionCardProps) {
  const heading = <h2 className="font-bold text-white">{title}</h2>;

  return (
    <div
      id={id}
      className={`rounded-2xl border border-blue-200 bg-white shadow-sm dark:border-blue-500/30 dark:bg-zinc-900 dark:shadow-none ${id ? "scroll-mt-32" : ""} ${className}`}
    >
      {onToggle ? (
        <button type="button" onClick={onToggle} className={headerClassName}>
          {heading}
          {action}
        </button>
      ) : (
        <div className={headerClassName}>
          {heading}
          {action}
        </div>
      )}

      <div className={bodyClassName}>{children}</div>
    </div>
  );
}
