import { describe, expect, it } from "vitest";
import { byteEntropy, byteHistogram, fileKind, readZipLayout, sampleZipFiles } from "../zipAnalysis";
import { extractZip, zipFiles } from "../ZipCompressor";

describe("zipAnalysis", () => {
  it("reads the central directory of a real archive", async () => {
    const files = sampleZipFiles();
    const zip = await zipFiles(files);
    const layout = readZipLayout(zip)!;
    expect(layout.entries.map((e) => e.name)).toEqual(["notes.txt", "weather.csv", "photo.bin"]);
    layout.entries.forEach((e, i) => expect(e.uncompressedSize).toBe(files[i].data.length));
    expect(layout.entries[0].method).toBe(8);
    expect(layout.entries[0].compressedSize).toBeLessThan(layout.entries[0].uncompressedSize / 4);
    expect(layout.entries[2].compressedSize).toBeGreaterThan(layout.entries[2].uncompressedSize * 0.95);
    expect(layout.dataBytes + layout.localHeaderBytes + layout.centralDirectoryBytes + layout.endRecordBytes).toBe(layout.archiveBytes);
    const extracted = await extractZip(zip);
    expect(extracted.map((e) => e.size)).toEqual(files.map((f) => f.data.length));
  });

  it("byte statistics and kinds", () => {
    expect(byteEntropy(new Uint8Array(100).fill(65))).toBe(0);
    expect(byteEntropy(Uint8Array.from({ length: 256 }, (_, i) => i))).toBe(8);
    expect(byteHistogram(new TextEncoder().encode("AB"))).toEqual([0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    expect(fileKind("a.CSV")).toBe("data");
    expect(fileKind("x.jpeg")).toBe("image");
    expect(readZipLayout(new Uint8Array(10))).toBeNull();
  });
});
