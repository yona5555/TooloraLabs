"use client";
import { useMemo } from "react";
import { analyzeDedupe, DuplicateLineRemover, type DedupeAnalysis, type DuplicateLineRemoverInput, type DuplicateLineRemoverOutput } from "@tooloralabs/tools";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import { createLiveToolState } from "@/lib/create-live-tool-state";
import { resolveDigitStyle } from "@/lib/digit-style";

export type DlDraft = { text: string; caseSensitive: boolean; sort: boolean; trimWhitespace: boolean; keepOccurrence: NonNullable<DuplicateLineRemoverInput["keepOccurrence"]> };

/** A mailing list merged from three exports: exact repeats, a case variant, stray spaces and a blank line. */
const SAMPLE = [
  "layla@example.com",
  "omar@example.com",
  "sara@example.com",
  "Layla@example.com",
  "",
  "  omar@example.com",
  "yusuf@example.com",
  "layla@example.com",
  "nour@example.com",
  "sara@example.com",
  "omar@example.com",
  "huda@example.com",
  "layla@example.com",
].join("\n");

export const DL_DEFAULTS: DlDraft = { text: SAMPLE, caseSensitive: true, sort: false, trimWhitespace: true, keepOccurrence: "first" };

export const DL_EXAMPLES: { id: string; draft: DlDraft }[] = [
  { id: "emails", draft: DL_DEFAULTS },
  { id: "caseless", draft: { ...DL_DEFAULTS, caseSensitive: false } },
  { id: "sorted", draft: { ...DL_DEFAULTS, caseSensitive: false, sort: true } },
  { id: "tags", draft: { ...DL_DEFAULTS, text: "react\nnextjs\ntypescript\nReact\ntailwind\nnextjs\nreact\nvitest\ntypescript\nreact", caseSensitive: false } },
  { id: "keepLast", draft: { ...DL_DEFAULTS, keepOccurrence: "last" } },
];

export const { LiveProvider: DlLiveProvider, useLiveState: useDlLive } = createLiveToolState<DlDraft>();

const tool = new DuplicateLineRemover();

export type DlModel = {
  draft: DlDraft;
  out: DuplicateLineRemoverOutput | null;
  a: DedupeAnalysis | null;
  ds: DigitStyle;
  f: (v: number, max?: number) => string;
  pct: (p: number, w: number) => string;
};

export function buildDlModel(d: DlDraft): DlModel {
  const ds = resolveDigitStyle(d.text);
  const f = (v: number, max = 1) => formatLocalizedNumber(v, ds, { maximumFractionDigits: max });
  const pct = (p: number, w: number) => `${f(w ? (p / w) * 100 : 0, 1)}%`;
  if (!d.text.trim()) return { draft: d, out: null, a: null, ds, f, pct };
  const out = tool.execute(d, { locale: "en-US" }).data;
  return { draft: d, out, a: analyzeDedupe(d, out.result), ds, f, pct };
}

export function useDlModel(): DlModel {
  const { dims } = useDlLive();
  return useMemo(() => buildDlModel(dims), [dims]);
}
