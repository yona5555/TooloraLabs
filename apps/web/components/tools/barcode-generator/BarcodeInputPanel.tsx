"use client";
import { useRef } from "react";
import { useTranslations } from "next-intl";
import { Upload, X } from "lucide-react";
import type { BarcodeSymbology } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import ToolInput from "@/components/tool-ui/ToolInput";

const SYMBOLOGIES: BarcodeSymbology[] = ["upc-a", "ean-13", "code128"];

type BarcodeInputPanelProps = {
  symbology: BarcodeSymbology;
  onSymbologyChange: (symbology: BarcodeSymbology) => void;
  value: string;
  onValueChange: (value: string) => void;
  logoDataUrl: string | null;
  onLogoSelect: (file: File) => void;
  onLogoClear: () => void;
  logoPlacement: "beside" | "none";
  onLogoPlacementChange: (placement: "beside" | "none") => void;
};

export default function BarcodeInputPanel({
  symbology,
  onSymbologyChange,
  value,
  onValueChange,
  logoDataUrl,
  onLogoSelect,
  onLogoClear,
  logoPlacement,
  onLogoPlacementChange,
}: BarcodeInputPanelProps) {
  const t = useTranslations("tools.barcode-generator.form");
  const logoInputRef = useRef<HTMLInputElement>(null);

  return (
    <SectionCard title={t("inputTitle")}>
      <div className="flex flex-wrap gap-2">
        {SYMBOLOGIES.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onSymbologyChange(s)}
            className={`rounded-full px-4 py-2.5 text-sm font-semibold transition ${
              symbology === s
                ? "bg-blue-600 text-white"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
            }`}
          >
            {t(`symbology.${s}`)}
          </button>
        ))}
      </div>

      <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">{t(`hint.${symbology}`)}</p>

      <div className="mt-4">
        <ToolInput
          label={t("valueLabel")}
          type="text"
          inputMode={symbology === "code128" ? "text" : "numeric"}
          dir="ltr"
          placeholder={t(`placeholder.${symbology}`)}
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
        />
      </div>

      <div className="mt-5 border-t border-zinc-200 pt-4 dark:border-zinc-800">
        <span className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("logoLabel")}</span>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{t("logoHint")}</p>

        <input
          ref={logoInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onLogoSelect(file);
          }}
          className="hidden"
        />

        {logoDataUrl ? (
          <div className="mt-3 flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logoDataUrl} alt={t("logoPreviewAlt")} className="h-12 w-12 rounded-lg border border-zinc-200 object-contain dark:border-zinc-700" />
            <button
              type="button"
              onClick={onLogoClear}
              className="flex items-center gap-1.5 rounded-lg border border-zinc-300 px-3 py-2 text-xs font-medium text-zinc-600 transition hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-700"
            >
              <X size={14} />
              {t("logoRemove")}
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => logoInputRef.current?.click()}
            className="mt-3 flex items-center gap-2 rounded-lg border border-dashed border-zinc-300 px-3 py-2.5 text-sm text-zinc-500 transition hover:border-blue-400 hover:text-blue-600 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-blue-500"
          >
            <Upload size={16} />
            {t("logoUpload")}
          </button>
        )}

        {logoDataUrl && (
          <label className="mt-3 flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300">
            <input
              type="checkbox"
              checked={logoPlacement === "beside"}
              onChange={(e) => onLogoPlacementChange(e.target.checked ? "beside" : "none")}
              className="h-4 w-4 rounded border-zinc-300 dark:border-zinc-600"
            />
            {t("logoShowBeside")}
          </label>
        )}
      </div>
    </SectionCard>
  );
}
