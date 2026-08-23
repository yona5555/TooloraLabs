import { describe, it, expect } from "vitest";
import { zipFiles, extractZip, getTotalSize } from "../ZipCompressor";

function textBytes(text: string): Uint8Array {
  return new TextEncoder().encode(text);
}

describe("zipFiles / extractZip round trip", () => {
  it("zips and extracts a single file with matching content", async () => {
    const zipped = await zipFiles([{ name: "hello.txt", data: textBytes("Hello, world!") }]);
    const extracted = await extractZip(zipped);
    expect(extracted).toHaveLength(1);
    expect(extracted[0].name).toBe("hello.txt");
    expect(new TextDecoder().decode(extracted[0].data)).toBe("Hello, world!");
  });

  it("zips and extracts multiple files, preserving each one's content", async () => {
    const zipped = await zipFiles([
      { name: "a.txt", data: textBytes("first file") },
      { name: "b.txt", data: textBytes("second file, a bit longer") },
      { name: "c.json", data: textBytes(JSON.stringify({ ok: true })) },
    ]);
    const extracted = await extractZip(zipped);
    expect(extracted).toHaveLength(3);

    const byName = Object.fromEntries(extracted.map((e) => [e.name, new TextDecoder().decode(e.data)]));
    expect(byName["a.txt"]).toBe("first file");
    expect(byName["b.txt"]).toBe("second file, a bit longer");
    expect(byName["c.json"]).toBe(JSON.stringify({ ok: true }));
  });

  it("preserves binary content exactly, byte for byte", async () => {
    const bytes = new Uint8Array([0, 1, 2, 255, 254, 128, 64, 32, 16, 8]);
    const zipped = await zipFiles([{ name: "data.bin", data: bytes }]);
    const extracted = await extractZip(zipped);
    expect(Array.from(extracted[0].data)).toEqual(Array.from(bytes));
  });

  it("produces a real ZIP file with the correct local-file-header signature", async () => {
    const zipped = await zipFiles([{ name: "x.txt", data: textBytes("x") }]);
    expect(zipped[0]).toBe(0x50);
    expect(zipped[1]).toBe(0x4b);
  });

  it("reports each extracted entry's decompressed size correctly", async () => {
    const zipped = await zipFiles([{ name: "sized.txt", data: textBytes("0123456789") }]);
    const extracted = await extractZip(zipped);
    expect(extracted[0].size).toBe(10);
  });
});

describe("getTotalSize", () => {
  it("sums the sizes of multiple files", () => {
    expect(getTotalSize([{ size: 100 }, { size: 250 }, { size: 50 }])).toBe(400);
  });

  it("returns 0 for an empty list", () => {
    expect(getTotalSize([])).toBe(0);
  });
});
