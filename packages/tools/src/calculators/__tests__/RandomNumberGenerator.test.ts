import { describe, it, expect } from "vitest";
import { generateRandomNumbers } from "../RandomNumberGenerator";

describe("RandomNumberGenerator", () => {
  it("generates the requested count of numbers within range, with duplicates allowed", () => {
    const r = generateRandomNumbers({ min: 1, max: 6, count: 20, allowDuplicates: true, sortOrder: "none" });
    expect(r.error).toBeNull();
    expect(r.numbers).toHaveLength(20);
    for (const n of r.numbers) {
      expect(n).toBeGreaterThanOrEqual(1);
      expect(n).toBeLessThanOrEqual(6);
      expect(Number.isInteger(n)).toBe(true);
    }
  });

  it("generates unique numbers with no duplicates when disallowed", () => {
    const r = generateRandomNumbers({ min: 1, max: 49, count: 6, allowDuplicates: false, sortOrder: "none" });
    expect(r.error).toBeNull();
    expect(new Set(r.numbers).size).toBe(6);
  });

  it("covers the exact pool when count equals the range size with duplicates disallowed", () => {
    const r = generateRandomNumbers({ min: 1, max: 10, count: 10, allowDuplicates: false, sortOrder: "ascending" });
    expect(r.numbers).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  it("sorts ascending and descending on request", () => {
    const asc = generateRandomNumbers({ min: 1, max: 100, count: 15, allowDuplicates: false, sortOrder: "ascending" });
    for (let i = 1; i < asc.numbers.length; i++) expect(asc.numbers[i]).toBeGreaterThan(asc.numbers[i - 1]);

    const desc = generateRandomNumbers({ min: 1, max: 100, count: 15, allowDuplicates: false, sortOrder: "descending" });
    for (let i = 1; i < desc.numbers.length; i++) expect(desc.numbers[i]).toBeLessThan(desc.numbers[i - 1]);
  });

  it("computes sum and average correctly", () => {
    const r = generateRandomNumbers({ min: 5, max: 5, count: 4, allowDuplicates: true, sortOrder: "none" });
    expect(r.numbers).toEqual([5, 5, 5, 5]);
    expect(r.sum).toBe(20);
    expect(r.average).toBe(5);
  });

  it("flags a non-integer range as invalid", () => {
    expect(generateRandomNumbers({ min: 1.5, max: 10, count: 1, allowDuplicates: true, sortOrder: "none" }).error).toBe("invalid-range");
  });

  it("flags a non-positive or oversized count as invalid", () => {
    expect(generateRandomNumbers({ min: 1, max: 10, count: 0, allowDuplicates: true, sortOrder: "none" }).error).toBe("invalid-count");
    expect(generateRandomNumbers({ min: 1, max: 10, count: -3, allowDuplicates: true, sortOrder: "none" }).error).toBe("invalid-count");
  });

  it("flags requesting more unique numbers than the range can hold", () => {
    const r = generateRandomNumbers({ min: 1, max: 5, count: 10, allowDuplicates: false, sortOrder: "none" });
    expect(r.error).toBe("range-too-small");
  });

  it("uses an injected random source deterministically", () => {
    const sequence = [0, 0.5, 0.99];
    let i = 0;
    const fakeRandom = () => sequence[i++ % sequence.length];
    const r = generateRandomNumbers({ min: 1, max: 10, count: 3, allowDuplicates: true, sortOrder: "none" }, fakeRandom);
    // lo=1, rangeSize=10: floor(0*10)+1=1, floor(0.5*10)+1=6, floor(0.99*10)+1=10
    expect(r.numbers).toEqual([1, 6, 10]);
  });

  it("normalizes min/max given in reverse order", () => {
    const r = generateRandomNumbers({ min: 10, max: 1, count: 5, allowDuplicates: false, sortOrder: "ascending" });
    expect(r.error).toBeNull();
    expect(r.numbers[0]).toBeGreaterThanOrEqual(1);
    expect(r.numbers[r.numbers.length - 1]).toBeLessThanOrEqual(10);
  });
});
