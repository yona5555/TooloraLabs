"use client";
import { useMemo } from "react";
import { analyzeFileName, FileNameSanitizer, type FileNameAnalysis, type FileNameSanitizerInput, type SanitizerChangeCode } from "@tooloralabs/tools";
import { createLiveToolState } from "@/lib/create-live-tool-state";

export type FnDraft = { fileName: string; separator: NonNullable<FileNameSanitizerInput["separator"]>; lowercase: boolean; transliterate: boolean };

/** A messy real-world name: accents, a colon, question marks, double dots, an upper-case extension and stray spaces. */
export const FN_DEFAULTS: FnDraft = { fileName: "  Résumé: Final Draft?? (v2)..PDF ", separator: "-", lowercase: true, transliterate: true };

export const FN_EXAMPLES: { id: string; draft: FnDraft }[] = [
  { id: "resume", draft: FN_DEFAULTS },
  { id: "reserved", draft: { ...FN_DEFAULTS, fileName: "CON.txt" } },
  { id: "photo", draft: { ...FN_DEFAULTS, fileName: "IMG 2026/10/18 <Cairo trip>.JPG", transliterate: false } },
  { id: "arabic", draft: { ...FN_DEFAULTS, fileName: "تقرير المبيعات 2026.xlsx", transliterate: false } },
  { id: "underscore", draft: { ...FN_DEFAULTS, fileName: "Quarterly   Report | Q3 * final.docx", separator: "_" } },
];

export const { LiveProvider: FnLiveProvider, useLiveState: useFnLive } = createLiveToolState<FnDraft>();

const tool = new FileNameSanitizer();

export type FnModel = {
  draft: FnDraft;
  result: string;
  changes: SanitizerChangeCode[];
  error: string;
  a: FileNameAnalysis | null;
  f: (v: number, max?: number) => string;
  pct: (part: number, whole: number) => string;
};

const nf = (v: number, max = 2) => v.toLocaleString("en-US", { maximumFractionDigits: max });

export function sanitize(d: FnDraft) {
  return tool.execute({ fileName: d.fileName, separator: d.separator, lowercase: d.lowercase, transliterate: d.transliterate }, { locale: "en-US" });
}

export function buildFnModel(d: FnDraft): FnModel {
  const base = { draft: d, f: nf, pct: (p: number, w: number) => `${nf(w ? (p / w) * 100 : 0, 1)}%` };
  if (!d.fileName.trim()) return { ...base, result: "", changes: [], error: "required", a: null };
  const r = sanitize(d);
  if (!r.success) return { ...base, result: "", changes: [], error: "invalidResult", a: null };
  return { ...base, result: r.data.result, changes: r.data.changes, error: "", a: analyzeFileName(d, r.data.result) };
}

export function useFnModel(): FnModel {
  const { dims } = useFnLive();
  return useMemo(() => buildFnModel(dims), [dims]);
}

export const CLASS_FILL = {
  ascii: "fill-blue-600 dark:fill-blue-400",
  digit: "fill-sky-500 dark:fill-sky-400",
  accented: "fill-violet-500 dark:fill-violet-400",
  nonLatin: "fill-emerald-600 dark:fill-emerald-400",
  space: "fill-zinc-400 dark:fill-zinc-500",
  illegal: "fill-rose-500 dark:fill-rose-400",
  dot: "fill-amber-500 dark:fill-amber-400",
  punct: "fill-teal-500 dark:fill-teal-400",
} as const;
export const CLASS_BG = {
  ascii: "bg-blue-600 dark:bg-blue-500",
  digit: "bg-sky-500",
  accented: "bg-violet-500",
  nonLatin: "bg-emerald-600 dark:bg-emerald-500",
  space: "bg-zinc-400",
  illegal: "bg-rose-500",
  dot: "bg-amber-500",
  punct: "bg-teal-500",
} as const;
