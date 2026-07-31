import { describe, it, expect } from "vitest";
import { FileSizeConverter } from "../FileSizeConverter";

const tool = new FileSizeConverter();
const ctx = { locale: "en-US" };

describe("FileSizeConverter", () => {
  it("converts MB to KB", () => {
    const output = tool.execute({ value: 1, from: "MB", to: "KB" }, ctx);
    expect(output.success).toBe(true);
    expect(output.data.result).toBe(1024);
  });

  it("converts GB to MB", () => {
    const output = tool.execute({ value: 2, from: "GB", to: "MB" }, ctx);
    expect(output.data.result).toBe(2048);
  });

  it("converts bytes to KB", () => {
    const output = tool.execute({ value: 2048, from: "B", to: "KB" }, ctx);
    expect(output.data.result).toBe(2);
  });

  it("converts between the same unit as a no-op", () => {
    const output = tool.execute({ value: 42, from: "TB", to: "TB" }, ctx);
    expect(output.data.result).toBe(42);
  });

  it("converts a large unit down to bytes", () => {
    const output = tool.execute({ value: 1, from: "PB", to: "B" }, ctx);
    expect(output.data.result).toBe(Math.pow(1024, 5));
  });

  it("returns a failure result for a negative value", () => {
    const output = tool.execute({ value: -5, from: "MB", to: "KB" }, ctx);
    expect(output.success).toBe(false);
    expect(output.metadata.error).toBe("NEGATIVE_VALUE");
  });
});
