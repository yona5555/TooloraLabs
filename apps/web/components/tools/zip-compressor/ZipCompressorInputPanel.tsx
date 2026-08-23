"use client";
import { useRef } from "react";
import { useTranslations } from "next-intl";
import { Upload, X } from "lucide-react";
import SectionCard from "@/components/tool-ui/SectionCard";
import { formatBytes } from "../image-converter/formatBytes";

export type ZipMode = "compress" | "extract";

type FileEntry = { file: File; id: string };

type ZipCompressorInputPanelProps = {
  mode: ZipMode;
  onModeChange: (mode: ZipMode) => void;
  compressFiles: FileEntry[];
  onCompressFilesAdd: (files: FileList) => void;
  onCompressFileRemove: (id: string) => void;
  extractFile: File | null;
  onExtractFileSelect: (file: File) => void;
  error: string;
};

export default function ZipCompressorInputPanel({
  mode,
  onModeChange,
  compressFiles,
  onCompressFilesAdd,
  onCompressFileRemove,
  extractFile,
  onExtractFileSelect,
  error,
}: ZipCompressorInputPanelProps) {
  const t = useTranslations("tools.zip-compressor");
  const compressInputRef = useRef<HTMLInputElement>(null);
  const extractInputRef = useRef<HTMLInputElement>(null);

  const totalSize = compressFiles.reduce((sum, entry) => sum + entry.file.size, 0);

  return (
    <SectionCard title={t("form.inputTitle")}>
      <div className="mb-4 flex gap-3">
        {(["compress", "extract"] as const).map((value) => (
          <label
            key={value}
            className={`flex flex-1 cursor-pointer items-center justify-center rounded-xl border px-4 py-3 text-sm font-medium transition ${
              mode === value
                ? "border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-500 dark:bg-blue-500/10 dark:text-blue-400"
                : "border-zinc-300 text-zinc-600 hover:border-zinc-400 dark:border-zinc-700 dark:text-zinc-300"
            }`}
          >
            <input type="radio" name="zip-mode" value={value} checked={mode === value} onChange={() => onModeChange(value)} className="sr-only" />
            {value === "compress" ? t("form.modeCompress") : t("form.modeExtract")}
          </label>
        ))}
      </div>

      {mode === "compress" ? (
        <div>
          <input
            ref={compressInputRef}
            type="file"
            multiple
            onChange={(e) => e.target.files && onCompressFilesAdd(e.target.files)}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => compressInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (e.dataTransfer.files?.length) onCompressFilesAdd(e.dataTransfer.files);
            }}
            className="flex w-full flex-col items-center gap-3 rounded-xl border-2 border-dashed border-zinc-300 px-6 py-8 text-center transition hover:border-blue-400 dark:border-zinc-700 dark:hover:border-blue-500"
          >
            <Upload size={24} className="text-zinc-400 dark:text-zinc-500" />
            <span className="text-sm font-medium text-zinc-600 dark:text-zinc-300">{t("form.chooseFiles")}</span>
          </button>

          {compressFiles.length > 0 && (
            <>
              <ul className="mt-4 space-y-2">
                {compressFiles.map((entry) => (
                  <li
                    key={entry.id}
                    className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800/60"
                  >
                    <span className="min-w-0 flex-1 truncate text-zinc-700 dark:text-zinc-300">{entry.file.name}</span>
                    <span dir="ltr" className="shrink-0 text-xs text-zinc-400 dark:text-zinc-500">
                      {formatBytes(entry.file.size)}
                    </span>
                    <button
                      type="button"
                      onClick={() => onCompressFileRemove(entry.id)}
                      className="rounded px-1 text-red-500 hover:text-red-700"
                      aria-label={t("form.remove")}
                    >
                      <X size={14} />
                    </button>
                  </li>
                ))}
              </ul>
              <p dir="ltr" className="mt-2 text-end text-xs text-zinc-400 dark:text-zinc-500">
                {t("form.totalSize", { size: formatBytes(totalSize) })}
              </p>
            </>
          )}
        </div>
      ) : (
        <div>
          <input
            ref={extractInputRef}
            type="file"
            accept=".zip,application/zip,application/x-zip-compressed"
            onChange={(e) => e.target.files?.[0] && onExtractFileSelect(e.target.files[0])}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => extractInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const dropped = e.dataTransfer.files?.[0];
              if (dropped) onExtractFileSelect(dropped);
            }}
            className="flex w-full flex-col items-center gap-3 rounded-xl border-2 border-dashed border-zinc-300 px-6 py-8 text-center transition hover:border-blue-400 dark:border-zinc-700 dark:hover:border-blue-500"
          >
            <Upload size={24} className="text-zinc-400 dark:text-zinc-500" />
            <span className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
              {extractFile ? extractFile.name : t("form.chooseZip")}
            </span>
            {extractFile && (
              <span dir="ltr" className="text-xs text-zinc-400 dark:text-zinc-500">
                {formatBytes(extractFile.size)}
              </span>
            )}
          </button>
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
          {error}
        </div>
      )}
    </SectionCard>
  );
}
