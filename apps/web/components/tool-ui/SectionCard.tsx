import { ReactNode } from "react";

type SectionCardProps = {
  title: ReactNode;
  action?: ReactNode;
  onToggle?: () => void;
  children: ReactNode;
  bodyClassName?: string;
  className?: string;
};

const headerClassName =
  "flex w-full items-center justify-between gap-3 bg-blue-600 px-4 py-2.5 text-start lg:px-6 lg:py-3";

export default function SectionCard({
  title,
  action,
  onToggle,
  children,
  bodyClassName = "p-4 lg:p-6",
  className = "",
}: SectionCardProps) {
  const heading = <h2 className="font-bold text-white">{title}</h2>;

  return (
    <div
      className={`overflow-hidden rounded-2xl border border-blue-200 bg-white shadow-sm dark:border-blue-500/30 dark:bg-zinc-900 dark:shadow-none ${className}`}
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
