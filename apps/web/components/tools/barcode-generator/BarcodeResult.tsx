"use client";
import { useRef } from "react";
import { useTranslations } from "next-intl";
import { AlertTriangle, Download } from "lucide-react";
import SectionCard from "@/components/tool-ui/SectionCard";
import BarcodeSVG, { type BarcodeSegment } from "./BarcodeSVG";

type BarcodeResultProps = {
  segments: BarcodeSegment[] | null;
  displayText: string;
  quietZoneModules: number;
  errorMessage: string;
  logoDataUrl: string | null;
  logoPlacement: "beside" | "none";
};

export default function BarcodeResult({ segments, displayText, quietZoneModules, errorMessage, logoDataUrl, logoPlacement }: BarcodeResultProps) {
  const t = useTranslations("tools.barcode-generator");
  const containerRef = useRef<HTMLDivElement>(null);

  function download() {
    const svg = containerRef.current?.querySelector("svg");
    if (!svg) return;
    const blob = new Blob([svg.outerHTML], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "barcode.svg";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <SectionCard title={t("aboveFold.resultTitle")}>
      {errorMessage ? (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
          <AlertTriangle size={18} className="mt-0.5 shrink-0" />
          <p>{errorMessage}</p>
        </div>
      ) : segments ? (
        <div className="flex flex-col items-center gap-4">
          <div ref={containerRef} dir="ltr" className="w-full rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-700">
            <BarcodeSVG segments={segments} displayText={displayText} quietZoneModules={quietZoneModules} logoDataUrl={logoDataUrl} logoPlacement={logoPlacement} />
          </div>
          <button
            type="button"
            onClick={download}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-300 px-4 py-3 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-700"
          >
            <Download size={16} />
            {t("form.download")}
          </button>
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-zinc-300 px-4 py-8 text-center text-sm text-zinc-400 dark:border-zinc-700 dark:text-zinc-500">
          {t("aboveFold.placeholder")}
        </p>
      )}
    </SectionCard>
  );
}
