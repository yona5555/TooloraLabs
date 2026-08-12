"use client";
import { useRef } from "react";
import { useTranslations } from "next-intl";
import { Upload } from "lucide-react";
import SectionCard from "@/components/tool-ui/SectionCard";
import { formatBytes } from "./formatBytes";

export type OutputFormat = "image/png" | "image/jpeg" | "image/webp";

type ImageInputPanelProps = {
  file: File | null;
  previewUrl: string;
  onFileSelect: (file: File) => void;
  format: OutputFormat;
  onFormatChange: (format: OutputFormat) => void;
  quality: number;
  onQualityChange: (quality: number) => void;
  resizeEnabled: boolean;
  onResizeEnabledChange: (enabled: boolean) => void;
  maxWidth: string;
  onMaxWidthChange: (value: string) => void;
  error: string;
};

export default function ImageInputPanel({
  file,
  previewUrl,
  onFileSelect,
  format,
  onFormatChange,
  quality,
  onQualityChange,
  resizeEnabled,
  onResizeEnabledChange,
  maxWidth,
  onMaxWidthChange,
  error,
}: ImageInputPanelProps) {
  const t = useTranslations("tools.image-converter");
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleDrop(e: React.DragEvent<HTMLButtonElement>) {
    e.preventDefault();
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) onFileSelect(dropped);
  }

  return (
    <SectionCard title={t("form.inputTitle")}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => {
          const selected = e.target.files?.[0];
          if (selected) onFileSelect(selected);
        }}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className="flex w-full flex-col items-center gap-3 rounded-xl border-2 border-dashed border-zinc-300 px-6 py-8 text-center transition hover:border-blue-400 dark:border-zinc-700 dark:hover:border-blue-500"
      >
        <Upload size={24} className="text-zinc-400 dark:text-zinc-500" />
        <span className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
          {file ? file.name : t("form.chooseFile")}
        </span>
        {file && <span className="text-xs text-zinc-400 dark:text-zinc-500">{formatBytes(file.size)}</span>}
      </button>

      {previewUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={previewUrl}
          alt={t("form.previewAlt")}
          className="mx-auto mt-4 max-h-48 rounded-xl border border-zinc-200 object-contain dark:border-zinc-700"
        />
      )}

      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="mt-4 space-y-4">
        <label className="block space-y-2">
          <span className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("form.formatLabel")}</span>
          <select
            value={format}
            onChange={(e) => onFormatChange(e.target.value as OutputFormat)}
            className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          >
            <option value="image/png">PNG</option>
            <option value="image/jpeg">JPEG</option>
            <option value="image/webp">WEBP</option>
          </select>
        </label>

        {format !== "image/png" && (
          <div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("form.qualityLabel")}</span>
              <span dir="ltr" className="text-sm font-bold text-blue-600 dark:text-blue-400">
                {Math.round(quality * 100)}%
              </span>
            </div>
            <input
              type="range"
              min={0.1}
              max={1}
              step={0.01}
              value={quality}
              onChange={(e) => onQualityChange(Number(e.target.value))}
              className="mt-2 w-full accent-blue-600"
            />
          </div>
        )}

        <div>
          <label className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300">
            <input
              type="checkbox"
              checked={resizeEnabled}
              onChange={(e) => onResizeEnabledChange(e.target.checked)}
              className="h-4 w-4 rounded border-zinc-300 dark:border-zinc-600"
            />
            {t("form.resizeLabel")}
          </label>
          {resizeEnabled && (
            <input
              type="number"
              inputMode="numeric"
              min={1}
              placeholder={t("form.maxWidthPlaceholder")}
              value={maxWidth}
              onChange={(e) => onMaxWidthChange(e.target.value)}
              className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            />
          )}
        </div>
      </div>
    </SectionCard>
  );
}
