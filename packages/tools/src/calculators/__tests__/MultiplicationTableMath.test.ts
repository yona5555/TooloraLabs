import { describe, expect, it } from "vitest";
import {
  mtCellsWithProduct,
  mtDifferenceOfSquares,
  mtDigitalRoot,
  mtDigitalRootRow,
  mtDistinctProducts,
  mtDistinctTrend,
  mtDistributive,
  mtFactorPairs,
  mtFriendlySplit,
  mtGridSum,
  mtHardFacts,
  mtMemorySteps,
  mtNeighbours,
  mtPrimeFactors,
  mtRangeSum,
  mtRowSum,
  mtSkipCount,
  mtUnitsCycle,
} from "../MultiplicationTableMath";

describe("MultiplicationTableMath", () => {
  it("skip counts to the product", () => {
    expect(mtSkipCount(7, 4)).toEqual([0, 7, 14, 21, 28]);
  });

  it("splits a factor into friendly parts", () => {
    expect(mtFriendlySplit(7)).toEqual([5, 2]);
    expect(mtFriendlySplit(13)).toEqual([10, 3]);
    expect(mtFriendlySplit(40)).toEqual([40, 0]);
    expect(mtFriendlySplit(4)).toEqual([4, 0]);
    expect(mtFriendlySplit(127)).toEqual([120, 7]);
  });

  it("keeps a × b equal to the two partial products for every cut", () => {
    for (let c = 0; c <= 8; c++) expect(mtDistributive(7, 8, c).total).toBe(56);
    expect(mtDistributive(7, 8, 3)).toMatchObject({ left: 21, right: 35 });
    expect(mtDistributive(7, 8, 99).c).toBe(8);
  });

  it("neighbouring facts differ by one group", () => {
    expect(mtNeighbours(7, 8)).toEqual({ prev: 49, current: 56, next: 63, step: 7 });
  });

  it("sums a row and the whole grid", () => {
    expect(mtRangeSum(1, 12)).toBe(78);
    expect(mtRowSum(7, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]).sum).toBe(546);
    expect(mtGridSum(1, 12)).toEqual({ side: 78, sum: 6084 });
    let brute = 0;
    for (let i = 3; i <= 9; i++) for (let j = 3; j <= 9; j++) brute += i * j;
    expect(mtGridSum(3, 9).sum).toBe(brute);
  });

  it("finds the units-digit cycle", () => {
    expect(mtUnitsCycle(7)).toMatchObject({ digits: [7, 4, 1, 8, 5, 2, 9, 6, 3, 0], period: 10 });
    expect(mtUnitsCycle(5).period).toBe(2);
    expect(mtUnitsCycle(12)).toMatchObject({ period: 5, distinct: [0, 2, 4, 6, 8] });
    expect(mtUnitsCycle(20).period).toBe(1);
  });

  it("computes digital roots and their period", () => {
    expect(mtDigitalRoot(56)).toBe(2);
    expect(mtDigitalRoot(81)).toBe(9);
    expect(mtDigitalRootRow(9, [1, 2, 3]).roots).toEqual([9, 9, 9]);
    expect(mtDigitalRootRow(3, [1, 2, 3, 4]).period).toBe(3);
    expect(mtDigitalRootRow(7, [1]).period).toBe(9);
  });

  it("factorises products", () => {
    expect(mtPrimeFactors(56)).toEqual([[2, 3], [7, 1]]);
    expect(mtPrimeFactors(1)).toEqual([]);
    expect(mtFactorPairs(24)).toEqual([[1, 24], [2, 12], [3, 8], [4, 6]]);
    expect(mtCellsWithProduct(24, 1, 12)).toBe(6);
    expect(mtCellsWithProduct(36, 1, 12)).toBe(5);
  });

  it("counts the facts left after each memory shortcut", () => {
    const steps = mtMemorySteps(1, 12);
    expect(steps.map((s) => s.remaining)).toEqual([144, 78, 55, 36, 21, 15]);
    expect(steps.at(-1)!.remaining).toBe(mtHardFacts(1, 12).length);
  });

  it("counts distinct products (Erdős multiplication table)", () => {
    expect(mtDistinctProducts(1, 10)).toBe(42);
    expect(mtDistinctProducts(1, 12)).toBe(59);
    const trend = mtDistinctTrend(12);
    expect(trend[9].distinct).toBe(42);
    expect(trend[11]).toMatchObject({ n: 12, distinct: 59 });
  });

  it("writes a product as a difference of squares", () => {
    expect(mtDifferenceOfSquares(7, 9)).toEqual({ mid: 8, half: 1, exact: true });
    expect(mtDifferenceOfSquares(7, 8).exact).toBe(false);
  });
});
