"use client";

import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import { formatResult } from "./formatResult";
import type { HistoryEntry } from "./reducer";

type ScientificHistoryPanelProps = {
  history: HistoryEntry[];
  onSelect: (value: number) => void;
};

export default function ScientificHistoryPanel({ history, onSelect }: ScientificHistoryPanelProps) {
  const t = useTranslations("tools.scientific-calculator.history");

  return (
    <SectionCard title={t("title")}>
      {history.length === 0 ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("empty")}</p>
      ) : (
        <ul dir="ltr" className="max-h-[420px] space-y-1.5 overflow-y-auto">
          {history.map((entry) => (
            <li key={entry.id}>
              <button
                type="button"
                onClick={() => onSelect(entry.result)}
                className="flex w-full flex-col items-start gap-0.5 rounded-xl border border-zinc-200 px-3 py-2 text-start transition hover:border-blue-300 hover:bg-blue-50 dark:border-zinc-800 dark:hover:border-blue-500/40 dark:hover:bg-blue-500/10"
              >
                <span className="w-full truncate text-xs text-zinc-500 dark:text-zinc-400">{entry.expression}</span>
                <span className="w-full truncate font-mono text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {formatResult(entry.result)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
}
