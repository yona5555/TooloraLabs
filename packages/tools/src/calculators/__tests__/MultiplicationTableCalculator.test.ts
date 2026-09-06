import { describe, expect, it } from "vitest";
import { MultiplicationTableCalculator } from "../MultiplicationTableCalculator";

const ctx = { locale: "en-US" };

describe("MultiplicationTableCalculator", () => {
  const tool = new MultiplicationTableCalculator();

  it("generates a single table up to the default multiplier of 12", () => {
    const result = tool.execute({ mode: "single", number: 7 }, ctx);
    expect(result.data.error).toBeNull();
    expect(result.data.singleRows).toHaveLength(12);
    expect(result.data.singleRows?.[0]).toEqual({ multiplier: 1, result: 7 });
    expect(result.data.singleRows?.[11]).toEqual({ multiplier: 12, result: 84 });
  });

  it("generates a single table with a custom max multiplier", () => {
    const result = tool.execute({ mode: "single", number: 5, maxMultiplier: 20 }, ctx);
    expect(result.data.singleRows).toHaveLength(20);
    expect(result.data.singleRows?.[19]).toEqual({ multiplier: 20, result: 100 });
  });

  it("rejects an invalid single-mode number", () => {
    const result = tool.execute({ mode: "single", number: 0 }, ctx);
    expect(result.data.error).toBe("invalid-number");
  });

  it("rejects a non-integer single-mode number", () => {
    const result = tool.execute({ mode: "single", number: 2.5 }, ctx);
    expect(result.data.error).toBe("invalid-number");
  });

  it("rejects an invalid multiplier", () => {
    const result = tool.execute({ mode: "single", number: 5, maxMultiplier: 0 }, ctx);
    expect(result.data.error).toBe("invalid-multiplier");
  });

  it("generates a correct range grid", () => {
    const result = tool.execute({ mode: "range", rangeStart: 1, rangeEnd: 3 }, ctx);
    expect(result.data.error).toBeNull();
    expect(result.data.grid?.headers).toEqual([1, 2, 3]);
    expect(result.data.grid?.rows).toHaveLength(3);
    expect(result.data.grid?.rows[2]).toEqual({ rowNumber: 3, cells: [3, 6, 9] });
  });

  it("rejects a range where start is greater than end", () => {
    const result = tool.execute({ mode: "range", rangeStart: 5, rangeEnd: 2 }, ctx);
    expect(result.data.error).toBe("invalid-range");
  });

  it("rejects an oversized range", () => {
    const result = tool.execute({ mode: "range", rangeStart: 1, rangeEnd: 50 }, ctx);
    expect(result.data.error).toBe("range-too-large");
  });

  it("accepts the maximum allowed range span", () => {
    const result = tool.execute({ mode: "range", rangeStart: 1, rangeEnd: 30 }, ctx);
    expect(result.data.error).toBeNull();
    expect(result.data.grid?.headers).toHaveLength(30);
  });

  it("produces a symmetric grid (n×m equals m×n)", () => {
    const result = tool.execute({ mode: "range", rangeStart: 2, rangeEnd: 5 }, ctx);
    const grid = result.data.grid!;
    const cell = (row: number, col: number) => grid.rows[row].cells[col];
    expect(cell(0, 1)).toBe(cell(1, 0));
  });
});
