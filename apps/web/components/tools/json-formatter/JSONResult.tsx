"use client";
import { useTranslations } from "next-intl";
import { AlertTriangle } from "lucide-react";
import type { JSONStats } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import CopyButton from "@/components/tool-ui/CopyButton";
import DownloadButton from "@/components/tool-ui/DownloadButton";

type JSONResultProps = {
  result: string;
  stats: JSONStats | null;
  errorMessage: string;
  errorLine: number;
  errorColumn: number;
  isEmpty: boolean;
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

export default function JSONResult({ result, stats, errorMessage, errorLine, errorColumn, isEmpty }: JSONResultProps) {
  const t = useTranslations("tools.json-formatter");

  return (
    <SectionCard title={t("aboveFold.resultTitle")}>
      {isEmpty ? (
        <p className="rounded-xl border border-dashed border-zinc-300 px-4 py-8 text-center text-sm text-zinc-400 dark:border-zinc-700 dark:text-zinc-500">
          {t("aboveFold.placeholder")}
        </p>
      ) : errorMessage ? (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
          <AlertTriangle size={18} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold">{t("aboveFold.errorAt", { line: errorLine, column: errorColumn })}</p>
            <p className="mt-1">{errorMessage}</p>
          </div>
        </div>
      ) : (
        <>
          {stats && (
            <div className="mb-4 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl bg-zinc-50 px-2 py-2.5 dark:bg-zinc-800/60">
                <dt className="text-xs text-zinc-500 dark:text-zinc-400">{t("aboveFold.statKeys")}</dt>
                <dd className="mt-0.5 font-mono text-sm font-semibold text-zinc-900 dark:text-zinc-100">{stats.keys}</dd>
              </div>
              <div className="rounded-xl bg-zinc-50 px-2 py-2.5 dark:bg-zinc-800/60">
                <dt className="text-xs text-zinc-500 dark:text-zinc-400">{t("aboveFold.statDepth")}</dt>
                <dd className="mt-0.5 font-mono text-sm font-semibold text-zinc-900 dark:text-zinc-100">{stats.depth}</dd>
              </div>
              <div className="rounded-xl bg-zinc-50 px-2 py-2.5 dark:bg-zinc-800/60">
                <dt className="text-xs text-zinc-500 dark:text-zinc-400">{t("aboveFold.statSize")}</dt>
                <dd dir="ltr" className="mt-0.5 font-mono text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {formatBytes(stats.sizeBytes)}
                </dd>
              </div>
            </div>
          )}

          <div className="mb-2 flex items-center justify-end gap-2">
            <CopyButton text={result} className="px-3 py-2 text-xs" />
            <DownloadButton content={result} filename="formatted.json" mimeType="application/json;charset=utf-8" className="px-3 py-2 text-xs" />
          </div>
          <textarea
            readOnly
            value={result}
            rows={12}
            dir="ltr"
            spellCheck={false}
            className="w-full rounded-xl border border-zinc-300 bg-zinc-50 px-4 py-3 font-mono text-sm text-zinc-900 outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          />
        </>
      )}
    </SectionCard>
  );
}
