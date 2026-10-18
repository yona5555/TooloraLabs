"use client";
import { useTranslations } from "next-intl";
import { Download, Loader2 } from "lucide-react";
import SectionCard from "@/components/tool-ui/SectionCard";
import ZipCompressorShareExportModal from "./ZipCompressorShareExportModal";
import { FILE_FILL, formatBytes, useZipModel } from "./ZipLiveContext";

export type ExtractedEntry = { name: string; url: string; size: number };

/**
 * Result card: the archive as a whole (original → archive size and saving), then every entry read
 * from the archive's central directory — original and compressed bars side by side, method and ratio —
 * with download buttons for extracted files.
 */
export default function ZipCompressorResult({ isProcessing, onDownloadZip, extractedEntries }: { isProcessing: boolean; onDownloadZip: () => void; extractedEntries: ExtractedEntry[] }) {
  const t = useTranslations("tools.zip-compressor");
  const tr = useTranslations("tools.zip-compressor.result");
  const { draft, ready, rows, original, compressed, f, pct } = useZipModel();
  const mode = draft.mode;
  const savedPercent = original ? Math.round(((original - compressed) / original) * 100) : 0;

  if (!ready) {
    return (
      <SectionCard title={t("aboveFold.resultTitle")}>
        <div className="flex flex-col items-center gap-3 px-4 py-10 text-center text-sm text-zinc-500 dark:text-zinc-400">
          {isProcessing ? <Loader2 size={24} className="animate-spin" /> : null}
          {isProcessing ? t("aboveFold.processing") : mode === "compress" ? t("aboveFold.placeholderCompress") : t("aboveFold.placeholderExtract")}
        </div>
      </SectionCard>
    );
  }

  const peak = Math.max(...rows.map((r) => r.size), 1);

  return (
    <SectionCard
      title={t("aboveFold.resultTitle")}
      className="lg:flex lg:h-full lg:flex-col"
      bodyClassName="p-4 lg:flex lg:flex-1 lg:flex-col lg:p-6"
      action={
        <ZipCompressorShareExportModal
          inputRows={[{ label: t("shareExport.originalSizeLabel"), value: formatBytes(original) }]}
          resultRows={[
            { label: t("shareExport.compressedSizeLabel"), value: formatBytes(compressed) },
            { label: t("shareExport.savedPercentLabel"), value: `${savedPercent}%` },
          ]}
          heroLabel={t("shareExport.savedPercentLabel")}
          heroValue={`${savedPercent}%`}
          sentence={t("shareExport.sentence", { original: formatBytes(original), compressed: formatBytes(compressed), percent: savedPercent })}
        />
      }
    >
      <p dir="ltr" className="text-center font-mono text-2xl font-bold text-blue-700 dark:text-blue-400">
        {formatBytes(original)} → {formatBytes(compressed)}
      </p>
      <p className="mt-1 text-center text-sm text-zinc-500 dark:text-zinc-400">{tr("summary", { files: rows.length, saved: pct(original - compressed, original) })}</p>

      <ul data-preview="visual" className="mt-4 grid auto-rows-fr gap-2 overflow-auto lg:min-h-0 lg:flex-1 lg:basis-0">
        {rows.map((r, i) => {
          const entry = extractedEntries.find((e) => e.name === r.name);
          return (
            <li key={r.name} className="flex min-h-36 flex-col rounded-xl bg-zinc-50 px-3 py-2.5 dark:bg-zinc-800/50">
              <div className="flex items-center gap-2 text-sm">
                <svg width={10} height={10} aria-hidden="true">
                  <circle cx={5} cy={5} r={5} className={FILE_FILL[i % FILE_FILL.length]} />
                </svg>
                <span dir="ltr" className="min-w-0 flex-1 truncate font-mono font-semibold text-zinc-800 dark:text-zinc-100">
                  {r.name}
                </span>
                <span className="shrink-0 text-xs text-zinc-500 dark:text-zinc-400">{r.method === 8 ? "DEFLATE" : r.method === 0 ? tr("stored") : `#${r.method}`}</span>
                {entry && (
                  <a
                    href={entry.url}
                    download={entry.name}
                    aria-label={t("aboveFold.downloadFile")}
                    className="shrink-0 rounded-md p-1 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-500/10"
                  >
                    <Download size={14} />
                  </a>
                )}
              </div>
              <svg direction="ltr" viewBox="0 0 300 22" className="mt-1.5 block h-auto w-full" role="img" aria-label={`${formatBytes(r.size)} → ${formatBytes(r.compressed)}`}>
                <rect x={0} y={1} width={Math.max(2, (r.size / peak) * 300)} height={8} rx={3} className="fill-zinc-300 dark:fill-zinc-600" />
                <rect x={0} y={12} width={Math.max(2, (r.compressed / peak) * 300)} height={8} rx={3} className={FILE_FILL[i % FILE_FILL.length]} />
              </svg>
              <div dir="ltr" className="mt-1 flex justify-between font-mono text-xs text-zinc-500 dark:text-zinc-400">
                <span>
                  {formatBytes(r.size)} → {formatBytes(r.compressed)}
                </span>
                <span className="font-semibold text-zinc-700 dark:text-zinc-200">{r.size ? `−${f((1 - r.ratio) * 100, 1)}%` : "0%"}</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
                <span>{tr("entropy", { e: f(r.entropy, 2) })}</span>
                <span dir="ltr" className="font-mono">CRC {r.crc32.toString(16).padStart(8, "0").toUpperCase()}</span>
              </div>
              <div dir="ltr" className="mt-1 flex min-h-6 flex-1 gap-0.5" title={tr("heat")}>
                {r.histogram.map((c, k) => (
                  <div key={k} className="flex-1 rounded-sm bg-blue-600 dark:bg-blue-400" style={{ opacity: c ? 0.12 + 0.88 * (c / Math.max(...r.histogram, 1)) : 0.05 }} />
                ))}
              </div>
            </li>
          );
        })}
      </ul>

      {mode === "compress" && (
        <button
          type="button"
          onClick={onDownloadZip}
          className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          <Download size={16} />
          {t("aboveFold.downloadZip")}
        </button>
      )}
    </SectionCard>
  );
}
