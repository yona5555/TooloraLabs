import { describe, expect, it } from "vitest";
import { LoveCalculator } from "../LoveCalculator";

const ctx = { locale: "en-US" };

describe("LoveCalculator", () => {
  const tool = new LoveCalculator();

  it("computes a percentage between 0 and 100 for valid names", () => {
    const result = tool.execute({ name1: "Alice", name2: "Bob" }, ctx);
    expect(result.data.error).toBeNull();
    expect(result.data.percentage).toBeGreaterThanOrEqual(0);
    expect(result.data.percentage).toBeLessThanOrEqual(100);
  });

  it("is deterministic for the same pair of names", () => {
    const r1 = tool.execute({ name1: "Alice", name2: "Bob" }, ctx);
    const r2 = tool.execute({ name1: "Alice", name2: "Bob" }, ctx);
    expect(r1.data.percentage).toBe(r2.data.percentage);
  });

  it("is symmetric regardless of name order", () => {
    const r1 = tool.execute({ name1: "Alice", name2: "Bob" }, ctx);
    const r2 = tool.execute({ name1: "Bob", name2: "Alice" }, ctx);
    expect(r1.data.percentage).toBe(r2.data.percentage);
  });

  it("is case-insensitive", () => {
    const r1 = tool.execute({ name1: "alice", name2: "bob" }, ctx);
    const r2 = tool.execute({ name1: "ALICE", name2: "BOB" }, ctx);
    expect(r1.data.percentage).toBe(r2.data.percentage);
  });

  it("ignores surrounding whitespace", () => {
    const r1 = tool.execute({ name1: "  Alice  ", name2: "Bob" }, ctx);
    const r2 = tool.execute({ name1: "Alice", name2: "Bob" }, ctx);
    expect(r1.data.percentage).toBe(r2.data.percentage);
  });

  it("rejects an empty first name", () => {
    const result = tool.execute({ name1: "", name2: "Bob" }, ctx);
    expect(result.data.error).toBe("empty-name");
  });

  it("rejects an empty second name", () => {
    const result = tool.execute({ name1: "Alice", name2: "" }, ctx);
    expect(result.data.error).toBe("empty-name");
  });

  it("rejects a name made only of punctuation", () => {
    const result = tool.execute({ name1: "!!!", name2: "Bob" }, ctx);
    expect(result.data.error).toBe("empty-name");
  });

  it("produces different percentages for different name pairs (spot check)", () => {
    const r1 = tool.execute({ name1: "Alice", name2: "Bob" }, ctx);
    const r2 = tool.execute({ name1: "Charlie", name2: "Diana" }, ctx);
    expect(r1.data.percentage).not.toBe(r2.data.percentage);
  });

  it("supports non-Latin names", () => {
    const result = tool.execute({ name1: "علي", name2: "سارة" }, ctx);
    expect(result.data.error).toBeNull();
    expect(result.data.percentage).toBeGreaterThanOrEqual(0);
    expect(result.data.percentage).toBeLessThanOrEqual(100);
  });
});
