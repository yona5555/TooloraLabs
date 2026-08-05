"use client";

import { useState } from "react";
import { FileDown, Check } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { generateToolPdf, type PdfRow } from "@/lib/pdf/generateToolPdf";
import type { GaugeSpec } from "@/lib/pdf/gauge";

type PdfDownloadButtonProps = {
  toolName: string;
  inputs: PdfRow[];
  results: PdfRow[];
  gauge?: GaugeSpec;
  filename: string;
  className?: string;
};

export default function PdfDownloadButton({
  toolName,
  inputs,
  results,
  gauge,
  filename,
  className = "",
}: PdfDownloadButtonProps) {
  const t = useTranslations("common.actions");
  const locale = useLocale();
  const [state, setState] = useState<"idle" | "generating" | "done">("idle");

  async function handleClick() {
    setState("generating");
    try {
      await generateToolPdf({ locale, toolName, inputs, results, gauge, filename });
      setState("done");
      setTimeout(() => setState("idle"), 1500);
    } catch {
      setState("idle");
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={state === "generating"}
      className={`flex items-center gap-1.5 rounded-lg border border-zinc-300 px-3 py-3 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 disabled:opacity-60 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-700 ${className}`}
    >
      {state === "done" ? <Check size={16} /> : <FileDown size={16} />}
      {state === "generating" ? t("generatingPdf") : state === "done" ? t("downloaded") : t("downloadPdf")}
    </button>
  );
}
