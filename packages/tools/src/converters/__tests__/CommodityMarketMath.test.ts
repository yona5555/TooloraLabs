import { describe, it, expect } from "vitest";
import {
  brentWtiSpread,
  goldSilverRatio,
  goldSilverRatioZone,
  karatPurity,
  metalValueUsd,
  monthlyRatioSeries,
  monthlyVolatility,
  oilValueUsd,
  toBarrels,
  toTroyOunces,
} from "../CommodityMarketMath";

describe("units", () => {
  it("converts weights to troy ounces", () => {
    expect(toTroyOunces(31.1034768, "gram")).toBeCloseTo(1);
    expect(toTroyOunces(1, "kilogram")).toBeCloseTo(32.1507, 3);
    expect(toTroyOunces(1, "tola")).toBeCloseTo(0.375, 3);
  });
  it("converts oil volumes to barrels", () => {
    expect(toBarrels(42, "usGallon")).toBeCloseTo(1);
    expect(toBarrels(158.987294928, "liter")).toBeCloseTo(1);
    expect(toBarrels(1, "cubicMeter")).toBeCloseTo(6.2898, 3);
  });
});

describe("values", () => {
  it("prices metal with purity", () => {
    expect(metalValueUsd(1, "troyOunce", 4000)).toBe(4000);
    expect(metalValueUsd(31.1034768, "gram", 4000, karatPurity(18))).toBeCloseTo(3000);
    expect(metalValueUsd(-1, "gram", 4000)).toBe(0);
  });
  it("prices oil", () => {
    expect(oilValueUsd(42, "usGallon", 80)).toBeCloseTo(80);
  });
});

describe("ratios and spreads", () => {
  it("gold/silver ratio and zones", () => {
    expect(goldSilverRatio(4000, 50)).toBe(80);
    expect(goldSilverRatio(4000, 0)).toBeNull();
    expect(goldSilverRatioZone(45)).toBe("tight");
    expect(goldSilverRatioZone(65)).toBe("average");
    expect(goldSilverRatioZone(85)).toBe("wide");
    expect(goldSilverRatioZone(110)).toBe("extreme");
  });
  it("brent-wti spread", () => {
    expect(brentWtiSpread(84, 80)).toEqual({ spread: 4, percent: 5 });
    expect(brentWtiSpread(0, 80)).toBeNull();
  });
  it("monthly ratio series matches months", () => {
    const r = monthlyRatioSeries([{ date: "2026-01-01", rate: 100 }, { date: "2026-02-01", rate: 90 }], [{ date: "2026-02-01", rate: 3 }]);
    expect(r).toEqual([{ date: "2026-02-01", rate: 30 }]);
  });
  it("monthly volatility annualizes with √12", () => {
    const v = monthlyVolatility([10, 11, 10, 11, 10])!;
    expect(v.returns).toBe(4);
    expect(v.annualizedPercent).toBeCloseTo(v.monthlyPercent * Math.sqrt(12));
  });
});
