"use client";

import { Copy, Check, Download } from "lucide-react";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { formatResult } from "./formatResult";

export type LogEntry = {
  id: number;
  expression: string;
  result: number | null;
  isError: boolean;
};

type CalculationLogProps = {
  entries: LogEntry[];
};

function formatLine(entry: LogEntry, errorLabel: string): string {
  const rhs = entry.isError ? errorLabel : formatResult(entry.result ?? 0);
  const expression = entry.expression.trim();
  return expression.endsWith("=") ? `${expression} ${rhs}` : `${expression} = ${rhs}`;
}

export default function CalculationLog({ entries }: CalculationLogProps) {
  const t = useTranslations("heroCalculatorLog");
  const { copied, copy } = useCopyToClipboard();

  const text = entries.map((entry) => formatLine(entry, t("error"))).join("\n");
  const hasEntries = entries.length > 0;

  function handleDownload() {
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "calculation-log.txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  const iconButtonClass =
    "flex h-7 w-7 items-center justify-center rounded-lg bg-white/15 text-white transition hover:bg-white/25 disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <SectionCard
      title={t("title")}
      bodyClassName="flex-1 overflow-y-auto p-3"
      className="flex h-full flex-col"
      action={
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => copy(text)}
            disabled={!hasEntries}
            aria-label={t("copy")}
            title={t("copy")}
            className={iconButtonClass}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
          </button>
          <button
            type="button"
            onClick={handleDownload}
            disabled={!hasEntries}
            aria-label={t("download")}
            title={t("download")}
            className={iconButtonClass}
          >
            <Download size={14} />
          </button>
        </div>
      }
    >
      {hasEntries ? (
        <ul dir="ltr" className="space-y-1">
          {entries.map((entry) => (
            <li
              key={entry.id}
              className={`truncate rounded-lg px-2 py-1 font-mono text-xs ${
                entry.isError
                  ? "text-red-600 dark:text-red-400"
                  : "text-zinc-700 dark:text-zinc-300"
              }`}
            >
              {formatLine(entry, t("error"))}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-zinc-500 dark:text-zinc-400">{t("empty")}</p>
      )}
    </SectionCard>
  );
}
