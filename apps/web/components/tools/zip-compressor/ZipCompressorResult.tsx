"use client";
import { useTranslations } from "next-intl";
import { Download, FileArchive, FileIcon, Loader2 } from "lucide-react";
import SectionCard from "@/components/tool-ui/SectionCard";
import { formatBytes } from "../image-converter/formatBytes";
import type { ZipMode } from "./ZipCompressorInputPanel";

export type ExtractedEntry = { name: string; url: string; size: number };

type ZipCompressorResultProps = {
  mode: ZipMode;
  isProcessing: boolean;
  compressedReady: boolean;
  compressedSize: number;
  onDownloadZip: () => void;
  extractedEntries: ExtractedEntry[];
};

export default function ZipCompressorResult({
  mode,
  isProcessing,
  compressedReady,
  compressedSize,
  onDownloadZip,
  extractedEntries,
}: ZipCompressorResultProps) {
  const t = useTranslations("tools.zip-compressor");

  if (isProcessing) {
    return (
      <SectionCard title={t("aboveFold.resultTitle")}>
        <div className="flex flex-col items-center gap-3 px-4 py-10 text-center text-sm text-zinc-400 dark:text-zinc-500">
          <Loader2 size={24} className="animate-spin" />
          {t("aboveFold.processing")}
        </div>
      </SectionCard>
    );
  }

  if (mode === "compress") {
    return (
      <SectionCard title={t("aboveFold.resultTitle")}>
        {compressedReady ? (
          <div className="flex flex-col items-center gap-4 px-4 py-8 text-center">
            <FileArchive size={40} className="text-blue-600 dark:text-blue-400" />
            <p className="text-sm text-zinc-600 dark:text-zinc-300">
              {t("aboveFold.compressReady", { size: formatBytes(compressedSize) })}
            </p>
            <button
              type="button"
              onClick={onDownloadZip}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              <Download size={16} />
              {t("aboveFold.downloadZip")}
            </button>
          </div>
        ) : (
          <p className="rounded-xl border border-dashed border-zinc-300 px-4 py-8 text-center text-sm text-zinc-400 dark:border-zinc-700 dark:text-zinc-500">
            {t("aboveFold.placeholderCompress")}
          </p>
        )}
      </SectionCard>
    );
  }

  return (
    <SectionCard title={t("aboveFold.resultTitle")}>
      {extractedEntries.length > 0 ? (
        <ul className="space-y-2">
          {extractedEntries.map((entry) => (
            <li
              key={entry.name}
              className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800/60"
            >
              <FileIcon size={16} className="shrink-0 text-zinc-400" />
              <span className="min-w-0 flex-1 truncate text-zinc-700 dark:text-zinc-300">{entry.name}</span>
              <span dir="ltr" className="shrink-0 text-xs text-zinc-400 dark:text-zinc-500">
                {formatBytes(entry.size)}
              </span>
              <a
                href={entry.url}
                download={entry.name}
                className="shrink-0 rounded-lg p-1.5 text-blue-600 transition hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-500/10"
                aria-label={t("aboveFold.downloadFile")}
              >
                <Download size={14} />
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-xl border border-dashed border-zinc-300 px-4 py-8 text-center text-sm text-zinc-400 dark:border-zinc-700 dark:text-zinc-500">
          {t("aboveFold.placeholderExtract")}
        </p>
      )}
    </SectionCard>
  );
}
