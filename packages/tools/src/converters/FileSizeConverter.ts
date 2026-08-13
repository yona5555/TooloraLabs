import type { ToolContext, ToolResult } from "@tooloralabs/core";
import { BaseTool } from "@tooloralabs/sdk";

export type FileSizeUnit = "B" | "KB" | "MB" | "GB" | "TB" | "PB";
export type FileSizeStandard = "decimal" | "binary";

export type FileSizeConverterInput = {
  value: number;
  fromUnit: FileSizeUnit;
  /** Which base the input value is measured in: decimal (SI, ×1000) or binary (IEC, ×1024). Defaults to decimal. */
  standard?: FileSizeStandard;
};

export type UnitAmount = {
  unit: string;
  value: number;
};

export type FileSizeConverterOutput = {
  bytes: number;
  /** The byte count expressed in every decimal (SI) unit: B, KB, MB, GB, TB, PB. */
  decimal: UnitAmount[];
  /** The byte count expressed in every binary (IEC) unit: B, KiB, MiB, GiB, TiB, PiB. */
  binary: UnitAmount[];
};

const UNIT_LEVEL: Record<FileSizeUnit, number> = {
  B: 0,
  KB: 1,
  MB: 2,
  GB: 3,
  TB: 4,
  PB: 5,
};

const DECIMAL_LABELS = ["B", "KB", "MB", "GB", "TB", "PB"];
const BINARY_LABELS = ["B", "KiB", "MiB", "GiB", "TiB", "PiB"];

/** Estimated time, in seconds, to transfer `bytes` at a given link speed in megabits per second. */
export function estimateTransferSeconds(bytes: number, megabitsPerSecond: number): number {
  if (megabitsPerSecond <= 0) return 0;
  const bits = bytes * 8;
  return bits / (megabitsPerSecond * 1_000_000);
}

export class FileSizeConverter extends BaseTool<
  FileSizeConverterInput,
  FileSizeConverterOutput
> {
  metadata = {
    id: "file-size-converter",
    slug: "file-size-converter",
    name: "File Size Converter",
    category: "file-tools",
    description:
      "Convert file sizes across every unit at once, compare decimal (SI) vs binary (IEC) standards, and estimate download time.",
    version: "2.0.0",
  };

  execute(
    input: FileSizeConverterInput,
    _context: ToolContext
  ): ToolResult<FileSizeConverterOutput> {
    const empty: FileSizeConverterOutput = { bytes: 0, decimal: [], binary: [] };

    if (!(input.value >= 0)) {
      return { success: false, data: empty, metadata: { error: "NEGATIVE_VALUE" } };
    }

    const standard = input.standard ?? "decimal";
    const base = standard === "binary" ? 1024 : 1000;
    const bytes = input.value * Math.pow(base, UNIT_LEVEL[input.fromUnit]);

    const decimal: UnitAmount[] = DECIMAL_LABELS.map((unit, level) => ({
      unit,
      value: bytes / Math.pow(1000, level),
    }));
    const binary: UnitAmount[] = BINARY_LABELS.map((unit, level) => ({
      unit,
      value: bytes / Math.pow(1024, level),
    }));

    return { success: true, data: { bytes, decimal, binary }, metadata: {} };
  }
}
