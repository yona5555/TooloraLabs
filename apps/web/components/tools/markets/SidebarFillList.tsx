import { changeColor } from "./fiat";

type Row = { id: string; label: string; sub?: string; value: string; change?: number | null; changeText?: string };

/**
 * Real data under the related-tools sidebar: it takes exactly the column height left beside the
 * input/result columns (via ToolAboveFold's `sidebarFill`) and scrolls inside it, so the top area
 * never shows an empty column however tall the result column grows.
 */
export default function SidebarFillList({ title, note, rows }: { title: string; note?: string; rows: Row[] }) {
  return (
    <div className="relative h-full min-h-0">
    <div className="absolute inset-0 flex flex-col overflow-hidden rounded-2xl border border-blue-200 bg-white dark:border-blue-500/30 dark:bg-zinc-900" data-testid="sidebar-fill">
      <p className="bg-blue-600 px-4 py-2.5 text-sm font-bold text-white">{title}</p>
      <ul className="min-h-0 flex-1 divide-y divide-zinc-100 overflow-y-auto dark:divide-zinc-800">
        {rows.map((r) => (
          <li key={r.id} className="flex items-center gap-2 px-4 py-2">
            <span className="min-w-0 flex-1">
              <span className="block truncate text-xs font-semibold text-zinc-900 dark:text-zinc-100">{r.label}</span>
              {r.sub && (
                <span dir="ltr" className="block text-[10px] uppercase text-zinc-400">
                  {r.sub}
                </span>
              )}
            </span>
            <span className="flex flex-col items-end">
              <span dir="ltr" className="font-mono text-xs text-zinc-900 dark:text-zinc-100">
                {r.value}
              </span>
              {r.changeText && (
                <span dir="ltr" className={`font-mono text-[10px] ${changeColor(r.change)}`}>
                  {r.changeText}
                </span>
              )}
            </span>
          </li>
        ))}
      </ul>
      {note && <p className="border-t border-zinc-100 px-4 py-1.5 text-[10px] text-zinc-400 dark:border-zinc-800 dark:text-zinc-500">{note}</p>}
    </div>
    </div>
  );
}
