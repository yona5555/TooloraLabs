"use client";
import { useMemo } from "react";
import { describeRanges, paperName, parsePageRanges, planSplit, type PaperName, type PdfInfo, type RangeToken, type SplitPlan } from "@tooloralabs/tools";
import { createLiveToolState } from "@/lib/create-live-tool-state";
import type { PdfMode } from "./PdfMergeSplitInputPanel";

export type PdfDocInfo = PdfInfo & { name: string };

/** Everything the indicators need, as plain data: inspected inputs and the measured outputs. */
export type PdfDraft = {
  mode: PdfMode;
  rangesInput: string;
  mergeDocs: PdfDocInfo[];
  splitDoc: PdfDocInfo | null;
  /** Byte size of each output file (one for merge, one per part for split); empty until processed. */
  outputSizes: number[];
};

export const { LiveProvider: PdfLiveProvider, useLiveState: usePdfLive } = createLiveToolState<PdfDraft>();

export type OutputPage = { source: number; page: number; width: number; height: number; paper: PaperName; landscape: boolean };

export type PdfModel = {
  draft: PdfDraft;
  ready: boolean;
  /** Pages of the output in order, with the input (merge) or part (split) each belongs to. */
  pages: OutputPage[];
  /** Labels of the sources: input file names (merge) or part ranges (split). */
  sources: string[];
  plan: SplitPlan | null;
  tokens: RangeToken[];
  inputBytes: number;
  outputBytes: number;
  f: (v: number, max?: number) => string;
  pct: (part: number, whole: number) => string;
};

const nf = (v: number, max = 2) => v.toLocaleString("en-US", { maximumFractionDigits: max });

export function buildPdfModel(d: PdfDraft): PdfModel {
  const base = { draft: d, f: nf, pct: (p: number, w: number) => `${nf(w ? (p / w) * 100 : 0, 1)}%`, tokens: describeRanges(d.rangesInput) };
  const outputBytes = d.outputSizes.reduce((s, v) => s + v, 0);
  const page = (source: number, p: number, size: { width: number; height: number }): OutputPage => {
    const { name, landscape } = paperName(size.width, size.height);
    return { source, page: p, ...size, paper: name, landscape };
  };
  if (d.mode === "merge") {
    const pages = d.mergeDocs.flatMap((doc, i) => doc.pageSizes.map((s, k) => page(i, k + 1, s)));
    return {
      ...base,
      ready: d.mergeDocs.length >= 2 && d.outputSizes.length > 0,
      pages,
      sources: d.mergeDocs.map((x) => x.name),
      plan: null,
      inputBytes: d.mergeDocs.reduce((s, x) => s + x.bytes, 0),
      outputBytes,
    };
  }
  const doc = d.splitDoc;
  if (!doc) return { ...base, ready: false, pages: [], sources: [], plan: null, inputBytes: 0, outputBytes };
  const plan = planSplit(doc.pageCount, parsePageRanges(d.rangesInput));
  const pages = plan.parts.flatMap((part, i) => Array.from({ length: part.pages }, (_, k) => page(i, part.start + k, doc.pageSizes[part.start + k - 1])));
  return { ...base, ready: d.outputSizes.length > 0, pages, sources: plan.parts.map((p) => (p.start === p.end ? `p.${p.start}` : `p.${p.start}–${p.end}`)), plan, inputBytes: doc.bytes, outputBytes };
}

export function usePdfModel(): PdfModel {
  const { dims } = usePdfLive();
  return useMemo(() => buildPdfModel(dims), [dims]);
}

export const SOURCE_FILL = [
  "fill-blue-600 dark:fill-blue-400",
  "fill-emerald-600 dark:fill-emerald-400",
  "fill-amber-500 dark:fill-amber-400",
  "fill-violet-500 dark:fill-violet-400",
  "fill-rose-500 dark:fill-rose-400",
  "fill-sky-500 dark:fill-sky-400",
];

export function formatBytes(b: number): string {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${nf(b / 1024, 1)} KB`;
  return `${nf(b / 1024 / 1024, 2)} MB`;
}
