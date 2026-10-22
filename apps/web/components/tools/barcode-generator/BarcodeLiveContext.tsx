"use client";
import { useMemo } from "react";
import { analyzeBarcode, BarcodeGenerator, type BarcodeAnalysis, type BarcodeOutput, type BarcodeRole, type BarcodeSymbology } from "@tooloralabs/tools";
import { createLiveToolState } from "@/lib/create-live-tool-state";

export type BarcodeDraft = { symbology: BarcodeSymbology; value: string; logoDataUrl: string | null; logoPlacement: "beside" | "none" };

export const DEFAULT_VALUES: Record<BarcodeSymbology, string> = {
  "upc-a": "03600029145",
  "ean-13": "590123412345",
  code128: "TOOLORA-2026",
};

export const BARCODE_DEFAULTS: BarcodeDraft = { symbology: "upc-a", value: DEFAULT_VALUES["upc-a"], logoDataUrl: null, logoPlacement: "none" };

/** Real published codes: GS1/Wikipedia reference numbers and the ISBN-13 standard example. */
export const BARCODE_EXAMPLES: { id: string; symbology: BarcodeSymbology; value: string }[] = [
  { id: "upc", symbology: "upc-a", value: "03600029145" },
  { id: "ean", symbology: "ean-13", value: "590123412345" },
  { id: "germany", symbology: "ean-13", value: "400638133393" },
  { id: "isbn", symbology: "ean-13", value: "978030640615" },
  { id: "code128", symbology: "code128", value: "TOOLORA-2026" },
];

export const { LiveProvider: BarcodeLiveProvider, useLiveState: useBarcodeLive } = createLiveToolState<BarcodeDraft>();

const tool = new BarcodeGenerator();

export type BarcodeModel = {
  draft: BarcodeDraft;
  success: boolean;
  error: string;
  output: BarcodeOutput;
  /** Full analysis; null when the value is not encodable. */
  a: BarcodeAnalysis | null;
  f: (v: number, max?: number) => string;
  pct: (part: number, whole: number) => string;
};

const nf = (v: number, max = 2) => v.toLocaleString("en-US", { maximumFractionDigits: max });

export function buildBarcodeModel(d: BarcodeDraft): BarcodeModel {
  const r = tool.execute({ symbology: d.symbology, value: d.value }, { locale: "en-US" });
  return {
    draft: d,
    success: r.success,
    error: r.success ? "" : String(r.metadata.error),
    output: r.data,
    a: r.success ? analyzeBarcode(d.symbology, d.value) : null,
    f: nf,
    pct: (p, w) => `${nf(w ? (p / w) * 100 : 0, 1)}%`,
  };
}

export function useBarcodeModel(): BarcodeModel {
  const { dims } = useBarcodeLive();
  return useMemo(() => buildBarcodeModel(dims), [dims]);
}

/** One hue per symbol role, shared by every indicator. */
export const ROLE_FILL: Record<BarcodeRole, string> = {
  guard: "fill-zinc-500 dark:fill-zinc-400",
  center: "fill-zinc-500 dark:fill-zinc-400",
  start: "fill-zinc-500 dark:fill-zinc-400",
  stop: "fill-zinc-500 dark:fill-zinc-400",
  left: "fill-blue-600 dark:fill-blue-400",
  right: "fill-emerald-600 dark:fill-emerald-400",
  data: "fill-blue-600 dark:fill-blue-400",
  check: "fill-amber-500 dark:fill-amber-400",
  checksum: "fill-amber-500 dark:fill-amber-400",
};

export const PARITY_FILL = { L: "fill-blue-600 dark:fill-blue-400", G: "fill-violet-500 dark:fill-violet-400", R: "fill-emerald-600 dark:fill-emerald-400" } as const;
