import { describe, it, expect } from "vitest";
import { FileSizeConverter, estimateTransferSeconds } from "../FileSizeConverter";

const tool = new FileSizeConverter();
const ctx = { locale: "en-US" };

function amount(list: { unit: string; value: number }[], unit: string): number {
  return list.find((u) => u.unit === unit)!.value;
}

describe("FileSizeConverter", () => {
  it("converts a decimal MB input to bytes using powers of 1000", () => {
    const output = tool.execute({ value: 1, fromUnit: "MB", standard: "decimal" }, ctx);
    expect(output.success).toBe(true);
    expect(output.data.bytes).toBe(1_000_000);
  });

  it("converts a binary MB (MiB) input to bytes using powers of 1024", () => {
    const output = tool.execute({ value: 1, fromUnit: "MB", standard: "binary" }, ctx);
    expect(output.data.bytes).toBe(1_048_576);
  });

  it("defaults to the decimal standard when none is given", () => {
    const output = tool.execute({ value: 1, fromUnit: "GB" }, ctx);
    expect(output.data.bytes).toBe(1_000_000_000);
  });

  it("produces every decimal unit for the same byte count", () => {
    const output = tool.execute({ value: 1, fromUnit: "GB", standard: "decimal" }, ctx);
    expect(amount(output.data.decimal, "B")).toBe(1_000_000_000);
    expect(amount(output.data.decimal, "MB")).toBe(1_000);
    expect(amount(output.data.decimal, "GB")).toBe(1);
  });

  it("produces every binary unit for the same byte count", () => {
    const output = tool.execute({ value: 1, fromUnit: "GB", standard: "binary" }, ctx);
    expect(amount(output.data.binary, "B")).toBe(1_073_741_824);
    expect(amount(output.data.binary, "MiB")).toBe(1024);
    expect(amount(output.data.binary, "GiB")).toBe(1);
  });

  it("demonstrates the classic 1 TB drive showing less than 1 TiB", () => {
    // A "1 TB" drive is manufactured using the decimal definition (10^12 bytes),
    // but an OS reporting free space in binary GiB/TiB shows a smaller number.
    const output = tool.execute({ value: 1, fromUnit: "TB", standard: "decimal" }, ctx);
    const inBinaryTiB = amount(output.data.binary, "TiB");
    expect(inBinaryTiB).toBeLessThan(1);
    expect(inBinaryTiB).toBeCloseTo(0.9095, 3);
  });

  it("returns a failure result for a negative value", () => {
    const output = tool.execute({ value: -5, fromUnit: "MB" }, ctx);
    expect(output.success).toBe(false);
    expect(output.metadata.error).toBe("NEGATIVE_VALUE");
  });

  it("allows zero as a valid value", () => {
    const output = tool.execute({ value: 0, fromUnit: "MB" }, ctx);
    expect(output.success).toBe(true);
    expect(output.data.bytes).toBe(0);
  });
});

describe("estimateTransferSeconds", () => {
  it("computes download time from bytes and megabits-per-second link speed", () => {
    // 125 MB = 1,000,000,000 bits; at 100 Mbps that is exactly 10 seconds.
    const seconds = estimateTransferSeconds(125_000_000, 100);
    expect(seconds).toBe(10);
  });

  it("returns 0 for a non-positive link speed", () => {
    expect(estimateTransferSeconds(1_000_000, 0)).toBe(0);
    expect(estimateTransferSeconds(1_000_000, -5)).toBe(0);
  });
});
