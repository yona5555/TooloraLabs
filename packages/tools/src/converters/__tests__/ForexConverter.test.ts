import { describe, it, expect } from "vitest";
import {
  convertCurrencyAmount,
  filterCurrenciesByQuery,
  findCurrencyByCode,
  type CurrencyRate,
} from "../ForexConverter";

const mockCurrencies: CurrencyRate[] = [
  { code: "USD", name: "United States Dollar", ratePerUsd: 1 },
  { code: "EUR", name: "Euro", ratePerUsd: 0.8659 },
  { code: "SAR", name: "Saudi Riyal", ratePerUsd: 3.75 },
  { code: "KWD", name: "Kuwaiti Dinar", ratePerUsd: 0.307 },
];

describe("convertCurrencyAmount", () => {
  it("converts using USD as the pivot", () => {
    // 100 USD -> SAR at 3.75 SAR/USD
    expect(convertCurrencyAmount(100, 1, 3.75)).toBeCloseTo(375, 5);
  });

  it("converts between two non-USD currencies", () => {
    // 3.75 SAR -> USD -> EUR
    expect(convertCurrencyAmount(3.75, 3.75, 0.8659)).toBeCloseTo(0.8659, 4);
  });

  it("returns the same amount when converting a currency to itself", () => {
    expect(convertCurrencyAmount(50, 3.75, 3.75)).toBe(50);
  });

  it("returns 0 for a zero or negative source rate", () => {
    expect(convertCurrencyAmount(100, 0, 3.75)).toBe(0);
    expect(convertCurrencyAmount(100, -1, 3.75)).toBe(0);
  });

  it("returns 0 for non-finite inputs", () => {
    expect(convertCurrencyAmount(NaN, 1, 3.75)).toBe(0);
    expect(convertCurrencyAmount(100, Infinity, 3.75)).toBe(0);
  });
});

describe("filterCurrenciesByQuery", () => {
  it("returns all currencies when the query is empty", () => {
    expect(filterCurrenciesByQuery(mockCurrencies, "")).toHaveLength(4);
    expect(filterCurrenciesByQuery(mockCurrencies, "   ")).toHaveLength(4);
  });

  it("matches by name case-insensitively", () => {
    expect(filterCurrenciesByQuery(mockCurrencies, "riyal")).toEqual([mockCurrencies[2]]);
    expect(filterCurrenciesByQuery(mockCurrencies, "EURO")).toEqual([mockCurrencies[1]]);
  });

  it("matches by code", () => {
    expect(filterCurrenciesByQuery(mockCurrencies, "kwd")).toEqual([mockCurrencies[3]]);
  });

  it("returns an empty array when nothing matches", () => {
    expect(filterCurrenciesByQuery(mockCurrencies, "yen")).toEqual([]);
  });
});

describe("findCurrencyByCode", () => {
  it("finds a currency by code", () => {
    expect(findCurrencyByCode(mockCurrencies, "SAR")).toEqual(mockCurrencies[2]);
  });

  it("returns undefined when not found", () => {
    expect(findCurrencyByCode(mockCurrencies, "JPY")).toBeUndefined();
  });
});
