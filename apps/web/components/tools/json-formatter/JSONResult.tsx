"use client";
import { useTranslations } from "next-intl";
import { Hand } from "lucide-react";
import type { JSONStats } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import CopyButton from "@/components/tool-ui/CopyButton";
import DownloadButton from "@/components/tool-ui/DownloadButton";
import { useIsDarkMode } from "@/lib/use-dark-mode";
import JSONBulbScene from "./JSONBulbScene";
import JSONCodePanel from "./JSONCodePanel";
import JSONErrorPanel from "./JSONErrorPanel";
import JSONShareExportModal from "./JSONShareExportModal";

type JSONResultProps = {
  json: string;
  result: string;
  stats: JSONStats | null;
  altSizeBytes: number | null;
  errorMessage: string;
  errorLine: number;
  errorColumn: number;
  isEmpty: boolean;
  onApplyFix: (fixedJson: string) => void;
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

export default function JSONResult({ json, result, stats, altSizeBytes, errorMessage, errorLine, errorColumn, isEmpty, onApplyFix }: JSONResultProps) {
  const t = useTranslations("tools.json-formatter");
  const tc = useTranslations("toolPage.indicatorKit");
  const isDark = useIsDarkMode();
  const codeTheme = isDark ? "dark" : "light";

  return (
    <div data-ph-visual data-ph-hero data-ph-result className="flex flex-col leading-normal lg:h-full" style={{ fontFamily: "var(--glass-font)" }}>
      <SectionCard
        id="json-result"
        title={t("aboveFold.resultTitle")}
        className="flex flex-col lg:h-full"
        bodyClassName="flex flex-1 flex-col p-4 lg:p-6"
        action={
          <span className="flex items-center gap-2">
            <span role="img" aria-label={tc("interactive")} title={tc("interactive")} data-ph-interactive className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/20 text-white">
              <Hand size={15} aria-hidden />
            </span>
            {!isEmpty && !errorMessage && stats && (
              <JSONShareExportModal
                operationLabel=""
                inputRows={[]}
                resultRows={[
                  { label: t("aboveFold.statKeys"), value: String(stats.keys) },
                  { label: t("aboveFold.statDepth"), value: String(stats.depth) },
                  { label: t("aboveFold.statFormattedSize"), value: formatBytes(stats.sizeBytes) },
                ]}
                heroLabel={t("aboveFold.statFormattedSize")}
                heroValue={formatBytes(stats.sizeBytes)}
                sentence={t("shareExport.summarySentence", { keys: stats.keys, depth: stats.depth, size: formatBytes(stats.sizeBytes) })}
              />
            )}
          </span>
        }
      >
        {isEmpty ? (
          <p className="rounded-xl border border-dashed border-zinc-300 px-4 py-8 text-center text-sm text-zinc-400 dark:border-zinc-700 dark:text-zinc-500">
            {t("aboveFold.placeholder")}
          </p>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col gap-4">
            <JSONBulbScene valid={!errorMessage} errorLine={errorLine} errorColumn={errorColumn} />

            {errorMessage ? (
              <JSONErrorPanel json={json} errorMessage={errorMessage} errorLine={errorLine} errorColumn={errorColumn} onApplyFix={onApplyFix} />
            ) : (
              <div className="flex min-h-0 flex-1 flex-col gap-4">
                <JSONCodePanel text={result} filename="formatted.json" theme={codeTheme} />

                {stats && (
                  <div data-ph-result-values className="grid grid-cols-2 gap-2 text-center sm:grid-cols-4">
                    <div className="rounded-xl bg-zinc-50 px-2 py-2.5 dark:bg-zinc-800/60">
                      <dt className="text-xs text-zinc-500 dark:text-zinc-400">{t("aboveFold.statKeys")}</dt>
                      <dd className="mt-0.5 font-mono text-sm font-semibold text-zinc-900 dark:text-zinc-100">{stats.keys}</dd>
                    </div>
                    <div className="rounded-xl bg-zinc-50 px-2 py-2.5 dark:bg-zinc-800/60">
                      <dt className="text-xs text-zinc-500 dark:text-zinc-400">{t("aboveFold.statDepth")}</dt>
                      <dd className="mt-0.5 font-mono text-sm font-semibold text-zinc-900 dark:text-zinc-100">{stats.depth}</dd>
                    </div>
                    <div className="rounded-xl bg-zinc-50 px-2 py-2.5 dark:bg-zinc-800/60">
                      <dt className="text-xs text-zinc-500 dark:text-zinc-400">{t("aboveFold.statFormattedSize")}</dt>
                      <dd dir="ltr" className="mt-0.5 font-mono text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        {formatBytes(stats.sizeBytes)}
                      </dd>
                    </div>
                    <div className="rounded-xl bg-zinc-50 px-2 py-2.5 dark:bg-zinc-800/60">
                      <dt className="text-xs text-zinc-500 dark:text-zinc-400">{t("aboveFold.statMinifiedSize")}</dt>
                      <dd dir="ltr" className="mt-0.5 font-mono text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        {altSizeBytes === null ? "—" : formatBytes(altSizeBytes)}
                      </dd>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <CopyButton text={result} className="px-3 py-2 text-xs" />
                  <DownloadButton content={result} filename="formatted.json" mimeType="application/json;charset=utf-8" className="px-3 py-2 text-xs" />
                </div>
              </div>
            )}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
