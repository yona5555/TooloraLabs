/**
 * Analysis behind the File Size Converter's indicators: the decimal (SI) vs binary (IEC) gap at every
 * prefix, how many standard storage media the size fills, transfer times, the space a file really takes
 * on disk with 4 KiB allocation clusters, and how common systems label the same byte count.
 */

/** Standard capacities in bytes: 3.5" HD floppy (1,474,560), CD-ROM 700 MiB, DVD-5 4.7 GB, single-layer Blu-ray 25 GB. */
export const STORAGE_MEDIA = [
  { key: "floppy", bytes: 1_474_560 },
  { key: "cd", bytes: 700 * 1024 * 1024 },
  { key: "dvd", bytes: 4_700_000_000 },
  { key: "bluray", bytes: 25_000_000_000 },
] as const;

/** Link speeds in megabits per second used by the transfer indicators. */
export const LINK_SPEEDS = [
  { key: "dialUp", mbps: 0.056 },
  { key: "mobile4g", mbps: 25 },
  { key: "broadbandWifi", mbps: 100 },
  { key: "gigabitFiber", mbps: 1000 },
] as const;

export const DECIMAL_UNITS = ["B", "KB", "MB", "GB", "TB", "PB"];
export const BINARY_UNITS = ["B", "KiB", "MiB", "GiB", "TiB", "PiB"];

/** Percentage by which a binary unit is larger than the decimal unit of the same prefix level: (1.024^k − 1) × 100. */
export function prefixGap(level: number): number {
  return (Math.pow(1.024, level) - 1) * 100;
}

/** The largest unit in which the value is at least 1 (B for zero). */
export function bestLevel(bytes: number, base: 1000 | 1024): number {
  if (bytes < base) return 0;
  return Math.min(5, Math.floor(Math.log(bytes) / Math.log(base)));
}

export type FileSizeAnalysis = {
  bytes: number;
  bits: number;
  decimalLevel: number;
  binaryLevel: number;
  /** Value in the best decimal and best binary unit. */
  decimalValue: number;
  binaryValue: number;
  /** How much smaller the number looks when shown in binary units at the same prefix level, in %. */
  displayedShrink: number;
  media: { key: string; capacity: number; count: number; fill: number }[];
  transfers: { key: string; mbps: number; seconds: number }[];
  /** Size on disk with 4 KiB clusters and the slack it wastes. */
  sizeOnDisk: number;
  slack: number;
  clusters: number;
};

const CLUSTER = 4096;

export function analyzeFileSize(bytes: number): FileSizeAnalysis {
  const decimalLevel = bestLevel(bytes, 1000);
  const binaryLevel = bestLevel(bytes, 1024);
  const clusters = Math.ceil(bytes / CLUSTER);
  return {
    bytes,
    bits: bytes * 8,
    decimalLevel,
    binaryLevel,
    decimalValue: bytes / Math.pow(1000, decimalLevel),
    binaryValue: bytes / Math.pow(1024, binaryLevel),
    displayedShrink: decimalLevel === 0 ? 0 : (1 - 1 / Math.pow(1.024, decimalLevel)) * 100,
    media: STORAGE_MEDIA.map((m) => ({ key: m.key, capacity: m.bytes, count: Math.ceil(bytes / m.bytes), fill: (bytes / m.bytes) * 100 })),
    transfers: LINK_SPEEDS.map((l) => ({ key: l.key, mbps: l.mbps, seconds: (bytes * 8) / (l.mbps * 1_000_000) })),
    sizeOnDisk: clusters * CLUSTER,
    slack: clusters * CLUSTER - bytes,
    clusters,
  };
}
