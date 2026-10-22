"use client";
import { useMemo } from "react";
import type { FileKind, ZipLayout } from "@tooloralabs/tools";
import { createLiveToolState } from "@/lib/create-live-tool-state";
import type { ZipMode } from "./ZipCompressorInputPanel";

/** Per-file byte statistics measured from the uncompressed data. */
export type ZipFileStat = { name: string; size: number; entropy: number; histogram: number[]; kind: FileKind };

export type ZipDraft = { mode: ZipMode; files: ZipFileStat[]; layout: ZipLayout | null };

export const { LiveProvider: ZipLiveProvider, useLiveState: useZipLive } = createLiveToolState<ZipDraft>();

export type ZipRow = ZipFileStat & { compressed: number; method: number; crc32: number; saved: number; ratio: number };

export type ZipModel = {
  draft: ZipDraft;
  ready: boolean;
  rows: ZipRow[];
  original: number;
  compressed: number;
  f: (v: number, max?: number) => string;
  pct: (part: number, whole: number) => string;
};

const nf = (v: number, max = 2) => v.toLocaleString("en-US", { maximumFractionDigits: max });

export function buildZipModel(d: ZipDraft): ZipModel {
  const base = { draft: d, f: nf, pct: (p: number, w: number) => `${nf(w ? (p / w) * 100 : 0, 1)}%` };
  if (!d.layout) return { ...base, ready: false, rows: [], original: 0, compressed: 0 };
  const rows = d.layout.entries.map((e) => {
    const stat = d.files.find((x) => x.name === e.name) ?? { name: e.name, size: e.uncompressedSize, entropy: 0, histogram: new Array(16).fill(0), kind: "other" as FileKind };
    return {
      ...stat,
      size: e.uncompressedSize,
      compressed: e.compressedSize,
      method: e.method,
      crc32: e.crc32,
      saved: e.uncompressedSize - e.compressedSize,
      ratio: e.uncompressedSize ? e.compressedSize / e.uncompressedSize : 1,
    };
  });
  return { ...base, ready: rows.length > 0, rows, original: rows.reduce((s, r) => s + r.size, 0), compressed: d.layout.archiveBytes };
}

export function useZipModel(): ZipModel {
  const { dims } = useZipLive();
  return useMemo(() => buildZipModel(dims), [dims]);
}

export const FILE_FILL = [
  "fill-blue-600 dark:fill-blue-400",
  "fill-emerald-600 dark:fill-emerald-400",
  "fill-amber-500 dark:fill-amber-400",
  "fill-violet-500 dark:fill-violet-400",
  "fill-rose-500 dark:fill-rose-400",
  "fill-sky-500 dark:fill-sky-400",
];

export function formatBytes(b: number): string {
  if (b < 1024) return `${Math.round(b)} B`;
  if (b < 1024 * 1024) return `${nf(b / 1024, 1)} KB`;
  return `${nf(b / 1024 / 1024, 2)} MB`;
}
