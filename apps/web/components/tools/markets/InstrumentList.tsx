"use client";
import type { ReactNode } from "react";
import { changeColor } from "./fiat";

export type InstrumentRow = {
  id: string;
  name: string;
  /** Ticker or pair code, shown small under the name (always LTR). */
  sub: string;
  icon?: ReactNode;
  price: string;
  change: number | null;
  changeText: string;
  /** Last tick direction, for the flash animation; `flashKey` restarts it on every tick. */
  flash?: "up" | "down" | null;
  flashKey?: number;
};

type InstrumentListProps = {
  title: string;
  /** Badge at the top end of the header, e.g. a pulsing "Live" or a "Daily" label. */
  badge?: ReactNode;
  rows: InstrumentRow[];
  activeId: string | undefined;
  onSelect: (id: string) => void;
  note?: ReactNode;
  /** `data-*` attribute name each row button carries its id under (tests click by it). */
  rowAttr?: string;
};

/** The price list of a market terminal card: name, price and change per row; clicking a row charts it. */
export default function InstrumentList({ title, badge, rows, activeId, onSelect, note, rowAttr = "data-instrument" }: InstrumentListProps) {
  return (
    <div className="mt-4 overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
      <div className="flex items-center justify-between bg-zinc-50 px-3 py-2 dark:bg-zinc-800">
        <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-200">{title}</span>
        {badge}
      </div>
      <ul className="grid max-h-80 grid-cols-1 gap-px overflow-y-auto bg-zinc-100 sm:max-h-none sm:grid-cols-2 lg:grid-cols-4 dark:bg-zinc-800" data-testid="sidebar-ticker">
        {rows.map((r) => {
          const flash = r.flash === "up" ? "animate-flash-up" : r.flash === "down" ? "animate-flash-down" : "";
          const active = r.id === activeId;
          return (
            <li key={r.id} className="bg-white dark:bg-zinc-900">
              <button
                type="button"
                {...{ [rowAttr]: r.id }}
                aria-pressed={active}
                onClick={() => onSelect(r.id)}
                className={`flex h-full w-full items-center gap-2 border-s-2 px-3 py-2 text-start transition ${
                  active ? "border-blue-600 bg-blue-50 dark:border-blue-400 dark:bg-blue-500/10" : "border-transparent hover:bg-zinc-50 dark:hover:bg-zinc-800/60"
                }`}
              >
                {r.icon}
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-xs font-semibold text-zinc-900 dark:text-zinc-100">{r.name}</span>
                  <span dir="ltr" className="block text-[10px] uppercase text-zinc-400">
                    {r.sub}
                  </span>
                </span>
                <span className="flex flex-col items-end">
                  <span key={r.flashKey ?? 0} dir="ltr" className={`rounded px-1 font-mono text-xs text-zinc-900 dark:text-zinc-100 ${flash}`}>
                    {r.price}
                  </span>
                  <span dir="ltr" className={`font-mono text-[10px] ${changeColor(r.change)}`}>
                    {r.changeText}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      {note && <p className="border-t border-zinc-100 px-3 py-1.5 text-[10px] text-zinc-400 dark:border-zinc-800 dark:text-zinc-500">{note}</p>}
    </div>
  );
}

/** The pulsing green badge for a list fed by a live stream. */
export function LiveBadge({ label }: { label: string }) {
  return (
    <span className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
      {label}
    </span>
  );
}
