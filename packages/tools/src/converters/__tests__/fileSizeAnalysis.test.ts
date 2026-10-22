import { describe, expect, it } from "vitest";
import { analyzeFileSize, bestLevel, prefixGap } from "../fileSizeAnalysis";

describe("fileSizeAnalysis", () => {
  it("64 GB drive shows as 59.6 GiB", () => {
    const a = analyzeFileSize(64e9);
    expect(a.decimalLevel).toBe(3);
    expect(a.binaryLevel).toBe(3);
    expect(a.binaryValue).toBeCloseTo(59.6046, 3);
    expect(a.displayedShrink).toBeCloseTo(6.87, 2);
    expect(a.media.find((m) => m.key === "dvd")?.count).toBe(14);
    expect(a.transfers.find((t) => t.key === "broadbandWifi")?.seconds).toBeCloseTo(5120, 6);
  });

  it("gaps, levels and clusters", () => {
    expect(prefixGap(1)).toBeCloseTo(2.4, 6);
    expect(prefixGap(3)).toBeCloseTo(7.374, 3);
    expect(bestLevel(999, 1000)).toBe(0);
    expect(bestLevel(1024, 1024)).toBe(1);
    const small = analyzeFileSize(5000);
    expect(small.clusters).toBe(2);
    expect(small.sizeOnDisk).toBe(8192);
    expect(small.slack).toBe(3192);
    expect(analyzeFileSize(0).decimalLevel).toBe(0);
  });
});
