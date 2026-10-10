"use client";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";

export type TapeEntry = { id: string; label: string; value: number; valueText: string };

/**
 * General history/tape panel body (every tool with a history): click an entry to reuse its
 * result, × deletes one entry, and the footer keeps a live grand total of all results, the
 * entry count and "Clear all". Persistence lives in the caller (lib/use-persisted-list).
 */
export default function HistoryTape({
  entries,
  onSelect,
  onDelete,
  onClear,
  formatTotal,
  emptyText,
  maxHeightClass = "max-h-[360px]",
}: {
  entries: TapeEntry[];
  onSelect: (entry: TapeEntry) => void;
  onDelete: (id: string) => void;
  onClear: () => void;
  formatTotal: (total: number) => string;
  emptyText: string;
  maxHeightClass?: string;
}) {
  const t = useTranslations("common.historyTape");
  const total = entries.reduce((s, e) => s + (Number.isFinite(e.value) ? e.value : 0), 0);

  return (
    <div data-testid="history-tape">
      {entries.length === 0 ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">{emptyText}</p>
      ) : (
        <ul className={`${maxHeightClass} space-y-1.5 overflow-y-auto`}>
          {entries.map((e) => (
            <li key={e.id} className="group flex items-stretch gap-1" data-entry={e.id}>
              <button
                type="button"
                onClick={() => onSelect(e)}
                title={t("reuse")}
                className="flex min-w-0 flex-1 flex-col items-start gap-0.5 rounded-xl border border-zinc-200 px-3 py-2 text-start transition hover:border-blue-300 hover:bg-blue-50 dark:border-zinc-800 dark:hover:border-blue-500/40 dark:hover:bg-blue-500/10"
              >
                <span dir="ltr" className="w-full truncate text-start text-xs text-zinc-500 dark:text-zinc-400">{e.label}</span>
                <span dir="ltr" className="w-full truncate text-start font-mono text-sm font-semibold text-zinc-900 dark:text-zinc-100">{e.valueText}</span>
              </button>
              <button
                type="button"
                onClick={() => onDelete(e.id)}
                aria-label={t("delete")}
                title={t("delete")}
                data-testid="tape-delete"
                className="flex w-8 shrink-0 items-center justify-center rounded-xl border border-zinc-200 text-zinc-400 transition hover:border-red-300 hover:bg-red-50 hover:text-red-600 dark:border-zinc-800 dark:hover:border-red-500/40 dark:hover:bg-red-500/10 dark:hover:text-red-400"
              >
                <X size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-3 rounded-xl bg-blue-50 px-3 py-2.5 dark:bg-blue-500/10">
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-xs font-bold uppercase tracking-wide text-blue-800 dark:text-blue-300">{t("total")}</span>
          <span dir="ltr" className="truncate font-mono text-lg font-bold text-blue-700 dark:text-blue-300" data-testid="tape-total">
            {formatTotal(total)}
          </span>
        </div>
        <div className="mt-1.5 flex items-center justify-between gap-3">
          <span className="text-xs text-zinc-600 dark:text-zinc-400" data-testid="tape-count">
            {t("count", { n: entries.length })}
          </span>
          <button
            type="button"
            onClick={onClear}
            disabled={entries.length === 0}
            data-testid="tape-clear"
            className="rounded-lg border border-zinc-300 px-2.5 py-1 text-xs font-semibold text-zinc-700 transition hover:border-red-300 hover:text-red-600 disabled:opacity-40 dark:border-zinc-600 dark:text-zinc-300 dark:hover:text-red-400"
          >
            {t("clearAll")}
          </button>
        </div>
      </div>
    </div>
  );
}
