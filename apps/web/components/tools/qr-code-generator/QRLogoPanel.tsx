"use client";
import { useRef } from "react";
import { useTranslations } from "next-intl";
import { Upload, X } from "lucide-react";
import SectionCard from "@/components/tool-ui/SectionCard";

export type QRLogoMode = "none" | "center" | "beside";

type QRLogoPanelProps = {
  logoDataUrl: string | null;
  onLogoSelect: (file: File) => void;
  onLogoClear: () => void;
  logoMode: QRLogoMode;
  onLogoModeChange: (mode: QRLogoMode) => void;
};

export default function QRLogoPanel({ logoDataUrl, onLogoSelect, onLogoClear, logoMode, onLogoModeChange }: QRLogoPanelProps) {
  const t = useTranslations("tools.qr-code-generator.logo");
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <SectionCard title={t("title")}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onLogoSelect(file);
        }}
        className="hidden"
      />

      {logoDataUrl ? (
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoDataUrl} alt={t("previewAlt")} className="h-12 w-12 rounded-lg border border-zinc-200 object-contain dark:border-zinc-700" />
          <button
            type="button"
            onClick={onLogoClear}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-300 px-3 py-2 text-xs font-medium text-zinc-600 transition hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-700"
          >
            <X size={14} />
            {t("remove")}
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex w-full items-center gap-2 rounded-lg border border-dashed border-zinc-300 px-3 py-2.5 text-sm text-zinc-500 transition hover:border-blue-400 hover:text-blue-600 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-blue-500"
        >
          <Upload size={16} />
          {t("upload")}
        </button>
      )}

      {logoDataUrl && (
        <div className="mt-4 space-y-2">
          <label className="flex items-start gap-2.5 text-sm">
            <input
              type="radio"
              name="qr-logo-mode"
              checked={logoMode === "center"}
              onChange={() => onLogoModeChange("center")}
              className="mt-0.5 h-4 w-4 accent-blue-600"
            />
            <span>
              <span className="block font-medium text-zinc-800 dark:text-zinc-200">{t("modeCenter")}</span>
              <span className="block text-xs text-zinc-500 dark:text-zinc-400">{t("modeCenterHint")}</span>
            </span>
          </label>
          <label className="flex items-start gap-2.5 text-sm">
            <input
              type="radio"
              name="qr-logo-mode"
              checked={logoMode === "beside"}
              onChange={() => onLogoModeChange("beside")}
              className="mt-0.5 h-4 w-4 accent-blue-600"
            />
            <span>
              <span className="block font-medium text-zinc-800 dark:text-zinc-200">{t("modeBeside")}</span>
              <span className="block text-xs text-zinc-500 dark:text-zinc-400">{t("modeBesideHint")}</span>
            </span>
          </label>
        </div>
      )}
    </SectionCard>
  );
}
