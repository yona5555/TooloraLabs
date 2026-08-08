import { describe, it, expect } from "vitest";
import {
  convertCryptoAmount,
  convertUsdToFiat,
  filterCoinsByQuery,
  calculateInvestmentReturn,
  isWithinSupportedHistory,
  findCoinById,
  MAX_HISTORY_DAYS,
  type CryptoCoin,
} from "../CryptoConverter";

const mockCoins: CryptoCoin[] = [
  {
    id: "bitcoin",
    symbol: "btc",
    name: "Bitcoin",
    image: "https://example.com/btc.png",
    currentPrice: 65000,
    priceChangePercentage24h: 1.5,
    marketCap: 1_300_000_000_000,
    marketCapRank: 1,
  },
  {
    id: "ethereum",
    symbol: "eth",
    name: "Ethereum",
    image: "https://example.com/eth.png",
    currentPrice: 1900,
    priceChangePercentage24h: -0.8,
    marketCap: 230_000_000_000,
    marketCapRank: 2,
  },
  {
    id: "dogecoin",
    symbol: "doge",
    name: "Dogecoin",
    image: "https://example.com/doge.png",
    currentPrice: 0.08,
    priceChangePercentage24h: 3.2,
    marketCap: 12_000_000_000,
    marketCapRank: 11,
  },
];

describe("convertCryptoAmount", () => {
  it("converts using USD price as the pivot", () => {
    expect(convertCryptoAmount(1, 65000, 1900)).toBeCloseTo(34.21, 2);
  });

  it("returns the same amount when converting a coin to itself", () => {
    expect(convertCryptoAmount(5, 65000, 65000)).toBe(5);
  });

  it("returns 0 for a zero or negative destination price", () => {
    expect(convertCryptoAmount(1, 65000, 0)).toBe(0);
    expect(convertCryptoAmount(1, 65000, -5)).toBe(0);
  });

  it("returns 0 for non-finite inputs", () => {
    expect(convertCryptoAmount(NaN, 65000, 1900)).toBe(0);
    expect(convertCryptoAmount(1, Infinity, 1900)).toBe(0);
  });
});

describe("convertUsdToFiat", () => {
  it("multiplies by the fiat-per-USD rate", () => {
    expect(convertUsdToFiat(100, 3.75)).toBeCloseTo(375, 5);
  });

  it("returns 0 for non-finite inputs", () => {
    expect(convertUsdToFiat(NaN, 3.75)).toBe(0);
  });
});

describe("filterCoinsByQuery", () => {
  it("returns all coins when the query is empty", () => {
    expect(filterCoinsByQuery(mockCoins, "")).toHaveLength(3);
    expect(filterCoinsByQuery(mockCoins, "   ")).toHaveLength(3);
  });

  it("matches by name case-insensitively", () => {
    expect(filterCoinsByQuery(mockCoins, "ether")).toEqual([mockCoins[1]]);
    expect(filterCoinsByQuery(mockCoins, "BITCOIN")).toEqual([mockCoins[0]]);
  });

  it("matches by symbol", () => {
    expect(filterCoinsByQuery(mockCoins, "doge")).toEqual([mockCoins[2]]);
  });

  it("returns an empty array when nothing matches", () => {
    expect(filterCoinsByQuery(mockCoins, "solana")).toEqual([]);
  });
});

describe("calculateInvestmentReturn", () => {
  it("computes coins purchased, current value, and profit", () => {
    const result = calculateInvestmentReturn(1000, 100, 250);
    expect(result).not.toBeNull();
    expect(result!.coinsPurchased).toBeCloseTo(10, 5);
    expect(result!.valueNow).toBeCloseTo(2500, 5);
    expect(result!.profitLoss).toBeCloseTo(1500, 5);
    expect(result!.profitLossPercentage).toBeCloseTo(150, 5);
    expect(result!.isProfit).toBe(true);
  });

  it("reports a loss when the price dropped", () => {
    const result = calculateInvestmentReturn(1000, 100, 40);
    expect(result!.valueNow).toBeCloseTo(400, 5);
    expect(result!.profitLoss).toBeCloseTo(-600, 5);
    expect(result!.profitLossPercentage).toBeCloseTo(-60, 5);
    expect(result!.isProfit).toBe(false);
  });

  it("treats break-even as a profit (isProfit true at exactly zero change)", () => {
    const result = calculateInvestmentReturn(1000, 100, 100);
    expect(result!.profitLoss).toBe(0);
    expect(result!.isProfit).toBe(true);
  });

  it("returns null for invalid inputs", () => {
    expect(calculateInvestmentReturn(0, 100, 250)).toBeNull();
    expect(calculateInvestmentReturn(-100, 100, 250)).toBeNull();
    expect(calculateInvestmentReturn(1000, 0, 250)).toBeNull();
    expect(calculateInvestmentReturn(1000, -10, 250)).toBeNull();
    expect(calculateInvestmentReturn(1000, 100, -5)).toBeNull();
    expect(calculateInvestmentReturn(NaN, 100, 250)).toBeNull();
  });

  it("allows a price of exactly zero today (total loss)", () => {
    const result = calculateInvestmentReturn(1000, 100, 0);
    expect(result!.valueNow).toBe(0);
    expect(result!.profitLossPercentage).toBe(-100);
  });
});

describe("isWithinSupportedHistory", () => {
  const now = new Date("2026-08-08T00:00:00Z");

  it("accepts today", () => {
    expect(isWithinSupportedHistory(now, now)).toBe(true);
  });

  it(`accepts exactly ${MAX_HISTORY_DAYS} days ago`, () => {
    const boundary = new Date(now.getTime() - MAX_HISTORY_DAYS * 24 * 60 * 60 * 1000);
    expect(isWithinSupportedHistory(boundary, now)).toBe(true);
  });

  it("rejects dates further back than the supported window", () => {
    const tooOld = new Date(now.getTime() - (MAX_HISTORY_DAYS + 1) * 24 * 60 * 60 * 1000);
    expect(isWithinSupportedHistory(tooOld, now)).toBe(false);
  });

  it("rejects future dates", () => {
    const future = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    expect(isWithinSupportedHistory(future, now)).toBe(false);
  });
});

describe("findCoinById", () => {
  it("finds a coin by id", () => {
    expect(findCoinById(mockCoins, "ethereum")).toEqual(mockCoins[1]);
  });

  it("returns undefined when not found", () => {
    expect(findCoinById(mockCoins, "solana")).toBeUndefined();
  });
});
