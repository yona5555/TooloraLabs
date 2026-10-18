"use client";
import { useMemo } from "react";
import { formatLocalizedNumber, parseLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import { analyzeFileSize, FileSizeConverter, type FileSizeAnalysis, type FileSizeConverterOutput, type FileSizeStandard, type FileSizeUnit } from "@tooloralabs/tools";
import { createLiveToolState } from "@/lib/create-live-tool-state";
import { resolveDigitStyle } from "@/lib/digit-style";

export type FsDraft = { value: string; unit: FileSizeUnit; standard: FileSizeStandard };

/** Opens on a 64 GB USB drive: the classic case where the OS shows 59.6 "GB". */
export const FS_DEFAULTS: FsDraft = { value: "64", unit: "GB", standard: "decimal" };

export const { LiveProvider: FsLiveProvider, useLiveState: useFsLive } = createLiveToolState<FsDraft>();

const tool = new FileSizeConverter();

export type FsModel = {
  draft: FsDraft;
  out: FileSizeConverterOutput | null;
  a: FileSizeAnalysis | null;
  error: string;
  ds: DigitStyle;
  f: (v: number, max?: number) => string;
};

export function buildFsModel(d: FsDraft): FsModel {
  const ds = resolveDigitStyle(d.value);
  const f = (v: number, max = 2) => formatLocalizedNumber(v, ds, { maximumFractionDigits: max });
  if (!d.value.trim()) return { draft: d, out: null, a: null, error: "required", ds, f };
  const v = parseLocalizedNumber(d.value);
  if (Number.isNaN(v)) return { draft: d, out: null, a: null, error: "required", ds, f };
  const r = tool.execute({ value: v, fromUnit: d.unit, standard: d.standard }, { locale: "en-US" });
  if (!r.success) return { draft: d, out: null, a: null, error: "negativeValue", ds, f };
  return { draft: d, out: r.data, a: analyzeFileSize(r.data.bytes), error: "", ds, f };
}

export function useFsModel(): FsModel {
  const { dims } = useFsLive();
  return useMemo(() => buildFsModel(dims), [dims]);
}

/** Human duration with the unit keys of aboveFold.transferTime. */
export function durationParts(seconds: number): { v: number; unit: "seconds" | "minutes" | "hours" | "days" } {
  if (seconds < 60) return { v: seconds, unit: "seconds" };
  if (seconds < 3600) return { v: seconds / 60, unit: "minutes" };
  if (seconds < 86400) return { v: seconds / 3600, unit: "hours" };
  return { v: seconds / 86400, unit: "days" };
}
