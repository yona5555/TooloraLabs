import { ReactNode } from "react";

type TooltipProps = {
  label: string;
  children: ReactNode;
  hidden?: boolean;
};

export default function Tooltip({ label, children, hidden }: TooltipProps) {
  return (
    <div className="group/tooltip relative inline-flex">
      {children}
      {!hidden && (
        <span
          role="tooltip"
          className="pointer-events-none absolute top-full start-1/2 mt-2 -translate-x-1/2 rtl:translate-x-1/2 whitespace-nowrap rounded-md bg-zinc-900 px-2 py-1 text-xs font-medium text-white opacity-0 shadow-lg transition group-hover/tooltip:opacity-100 dark:bg-zinc-700"
        >
          {label}
        </span>
      )}
    </div>
  );
}
