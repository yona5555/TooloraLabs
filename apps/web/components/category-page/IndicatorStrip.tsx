import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";

/**
 * The generic indicator row that sits beside a category page's title. It knows nothing about any
 * one category: each section passes its own items (label, value, optional drawing and note), so a
 * new section only writes an items builder and reuses this layout. Same chip as the /tools strip:
 * 40px tall (the labeled back button's height), logical properties only. On wide screens the items
 * share the full row equally whatever their count; narrow screens stack them, never scrolling sideways.
 */
export type IndicatorItem = {
  id: string;
  href: string;
  label: string;
  value: ReactNode;
  trailing?: ReactNode;
  note?: string;
};

const CHIP =
  "flex h-10 w-full items-center justify-between gap-2 rounded-lg border border-zinc-200 bg-white px-2.5 transition hover:border-blue-400 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-blue-500 dark:hover:bg-blue-500/10";

export default function IndicatorStrip({ label, items }: { label: string; items: IndicatorItem[] }) {
  return (
    <ul aria-label={label} className="grid grid-cols-1 gap-2 sm:grid-cols-3 lg:auto-cols-fr lg:grid-flow-col">
      {items.map((item) => {
        const noteId = `indicator-note-${item.id}`;
        return (
          <li key={item.id} className="group relative min-w-0">
            <Link href={item.href} aria-describedby={item.note ? noteId : undefined} className={CHIP}>
              <span className="flex min-w-0 flex-col leading-4">
                <span className="truncate text-[11px] font-medium text-zinc-500 dark:text-zinc-400">{item.label}</span>
                <span className="truncate text-xs font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">{item.value}</span>
              </span>
              {item.trailing}
            </Link>
            {item.note && (
              <span
                id={noteId}
                role="tooltip"
                className="pointer-events-none absolute inset-x-0 top-full z-30 mt-1 hidden rounded-md border border-zinc-200 bg-white p-2 text-[11px] leading-4 text-zinc-600 shadow-lg group-focus-within:block group-hover:block dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
              >
                {item.note}
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
