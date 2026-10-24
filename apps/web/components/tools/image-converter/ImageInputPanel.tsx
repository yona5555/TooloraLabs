"use client";
import { useRef } from "react";
import { useTranslations } from "next-intl";
import { RotateCcw, Upload } from "lucide-react";
import SectionCard from "@/components/tool-ui/SectionCard";
import { KitControls, KitTrack } from "@/components/tool-ui/indicator-kit/CardKit";
import { formatBytes } from "./formatBytes";
import { qualityStepper } from "./qualityStepper";

export type OutputFormat = "image/png" | "image/jpeg" | "image/webp";

type ImageInputPanelProps = {
  file: File | null;
  /** The file is the built-in sample (labelled as such until the visitor uploads an image). */
  isSample: boolean;
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
  onClear: () => void;
};

export default function ImageInputPanel({
  file,
  isSample,
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
  onClear,
}: ImageInputPanelProps) {
  const t = useTranslations("tools.image-converter");
  const tv = useTranslations("tools.image-converter.visuals.result");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const qs = qualityStepper(quality, onQualityChange);

  function handleDrop(e: React.DragEvent<HTMLButtonElement>) {
    e.preventDefault();
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) onFileSelect(dropped);
  }

  return (
    <SectionCard phoneRole="input"
      title={t("form.inputTitle")}
      action={
        file && !isSample ? (
          <button
            type="button"
            onClick={onClear}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-semibold text-zinc-600 transition hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <RotateCcw size={14} />
            {t("form.clear")}
          </button>
        ) : undefined
      }
    >
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
          {file && !isSample ? file.name : t("form.chooseFile")}
        </span>
        {isSample && (
          <span data-testid="image-input-sample" className="rounded-full px-2.5 py-0.5 text-xs font-semibold" style={{ background: "var(--ph-accent-soft)", color: "var(--ph-accent-strong)" }}>
            {tv("sample")}
          </span>
        )}
        {file && <span className="text-xs text-zinc-400 dark:text-zinc-500">{formatBytes(file.size)}</span>}
      </button>

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
              <span dir="ltr" data-testid="image-quality-readout" className="text-sm font-bold tabular-nums" style={{ color: "var(--ph-accent-strong)" }}>
                {qs.value} %
              </span>
            </div>
            {/* §40/§43: the shared drag handle + − / + / reset, the same state as the gauge's outer ring. */}
            <div className="mt-1">
              <KitTrack
                s={qs}
                label={t("form.qualityLabel")}
                valueText={`${qs.value} %`}
                testId="image-quality"
                ticks={[10, 30, 55, 80, 100].map((at) => ({ at, text: `${at}` }))}
              />
            </div>
            <div className="mt-2">
              <KitControls s={qs} valueText={`Q ${qs.value} %`} testId="image-quality" />
            </div>
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
