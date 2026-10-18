"use client";
import { useMemo } from "react";
import { analyzeCsvText, analyzeJsonRecords, CsvJsonConverter, type ColumnType, type CsvDelimiter, type CsvJsonMode, type TableAnalysis } from "@tooloralabs/tools";
import { createLiveToolState } from "@/lib/create-live-tool-state";

export type CsvDraft = { input: string; mode: CsvJsonMode; delimiter: CsvDelimiter; hasHeader: boolean };

/** A small fictional inventory: quoted fields with commas and quotes, decimals, booleans, dates and one empty cell. */
export const SAMPLE_CSV = `sku,product,category,price,stock,in_stock,updated
A-100,"Notebook, A5",Stationery,3.5,120,true,2026-10-01
A-101,Gel pen,Stationery,1.25,0,false,2026-10-02
B-200,"Desk ""Pro"" lamp",Lighting,24,8,true,2026-09-28
B-201,LED bulb,Lighting,4.75,64,true,
C-300,USB-C cable,Electronics,9.9,35,true,2026-10-03
C-301,Wireless mouse,Electronics,18,0,false,2026-09-30`;

export const SAMPLE_JSON = JSON.stringify(
  [
    { id: 1, name: "Layla", contact: { city: "Amman", email: "layla@example.com" }, active: true },
    { id: 2, name: "Omar", contact: { city: "Cairo" }, active: false, tags: ["vip"] },
    { id: 3, name: "Sara", contact: { city: "Dubai", email: "sara@example.com" }, active: true },
  ],
  null,
  2,
);

export const CSV_EXAMPLES: { id: string; draft: CsvDraft }[] = [
  { id: "inventory", draft: { input: SAMPLE_CSV, mode: "csvToJson", delimiter: "auto", hasHeader: true } },
  { id: "semicolon", draft: { input: "city;country;lat;lng\nAmman;Jordan;31.95;35.93\nCairo;Egypt;30.04;31.24\nRabat;Morocco;34.02;-6.84", mode: "csvToJson", delimiter: "auto", hasHeader: true } },
  { id: "noHeader", draft: { input: "2026-10-01,42\n2026-10-02,38\n2026-10-03,51", mode: "csvToJson", delimiter: ",", hasHeader: false } },
  { id: "nested", draft: { input: SAMPLE_JSON, mode: "jsonToCsv", delimiter: ",", hasHeader: true } },
  { id: "ragged", draft: { input: "a,b,c\n1,2,3\n4,5\n6,7,8,9", mode: "csvToJson", delimiter: ",", hasHeader: true } },
];

export const { LiveProvider: CsvLiveProvider, useLiveState: useCsvLive } = createLiveToolState<CsvDraft>();

const tool = new CsvJsonConverter();

export type CsvModel = {
  draft: CsvDraft;
  result: string;
  error: string;
  delimiter: string;
  a: TableAnalysis | null;
  f: (v: number, max?: number) => string;
  pct: (part: number, whole: number) => string;
};

const nf = (v: number, max = 2) => v.toLocaleString("en-US", { maximumFractionDigits: max });

export function buildCsvModel(d: CsvDraft): CsvModel {
  const base = { draft: d, f: nf, pct: (p: number, w: number) => `${nf(w ? (p / w) * 100 : 0, 1)}%` };
  if (!d.input.trim()) return { ...base, result: "", error: "EMPTY_INPUT", delimiter: ",", a: null };
  const r = tool.execute({ text: d.input, mode: d.mode, delimiter: d.delimiter, hasHeader: d.hasHeader }, { locale: "en-US" });
  if (!r.success) return { ...base, result: "", error: String(r.metadata.error), delimiter: ",", a: null };
  const delim = r.data.resolvedDelimiter;
  const a = d.mode === "csvToJson" ? analyzeCsvText(d.input, delim, d.hasHeader) : analyzeJsonRecords(JSON.parse(d.input) as Record<string, unknown>[], delim);
  return { ...base, result: r.data.result, error: "", delimiter: delim, a: a.headers.length ? a : null };
}

export function useCsvModel(): CsvModel {
  const { dims } = useCsvLive();
  return useMemo(() => buildCsvModel(dims), [dims]);
}

export const TYPE_FILL: Record<ColumnType, string> = {
  integer: "fill-blue-600 dark:fill-blue-400",
  decimal: "fill-sky-500 dark:fill-sky-400",
  boolean: "fill-rose-500 dark:fill-rose-400",
  date: "fill-violet-500 dark:fill-violet-400",
  text: "fill-emerald-600 dark:fill-emerald-400",
  empty: "fill-zinc-400 dark:fill-zinc-500",
};
export const TYPE_BG: Record<ColumnType, string> = {
  integer: "bg-blue-600 dark:bg-blue-500",
  decimal: "bg-sky-500",
  boolean: "bg-rose-500",
  date: "bg-violet-500",
  text: "bg-emerald-600 dark:bg-emerald-500",
  empty: "bg-zinc-400",
};

export const delimiterName = (d: string) => (d === "\t" ? "TAB" : d);
