import { describe, it, expect } from "vitest";
import { DuplicateLineRemover } from "../DuplicateLineRemover";

const tool = new DuplicateLineRemover();
const ctx = { locale: "en-US" };

describe("DuplicateLineRemover", () => {
  it("removes exact duplicate lines, keeping the first occurrence", () => {
    const output = tool.execute({ text: "apple\nbanana\napple\ncherry" }, ctx);
    expect(output.success).toBe(true);
    expect(output.data.result).toBe("apple\nbanana\ncherry");
    expect(output.data.removedCount).toBe(1);
  });

  it("trims each line and drops blank lines", () => {
    const output = tool.execute({ text: "  apple  \n\nbanana\n   " }, ctx);
    expect(output.data.result).toBe("apple\nbanana");
  });

  it("is case-sensitive by default", () => {
    const output = tool.execute({ text: "Apple\napple" }, ctx);
    expect(output.data.result).toBe("Apple\napple");
    expect(output.data.removedCount).toBe(0);
  });

  it("can be made case-insensitive", () => {
    const output = tool.execute({ text: "Apple\napple", caseSensitive: false }, ctx);
    expect(output.data.result).toBe("Apple");
    expect(output.data.removedCount).toBe(1);
  });

  it("can sort the resulting lines", () => {
    const output = tool.execute({ text: "banana\napple\ncherry", sort: true }, ctx);
    expect(output.data.result).toBe("apple\nbanana\ncherry");
  });

  it("handles input with no duplicates", () => {
    const output = tool.execute({ text: "a\nb\nc" }, ctx);
    expect(output.data.removedCount).toBe(0);
    expect(output.data.result).toBe("a\nb\nc");
  });
});
