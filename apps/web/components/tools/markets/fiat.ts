"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";

/** A display currency: ISO code, English name, and units per 1 USD. */
export type FiatRate = { code: string; name: string; perUsd: number };

export const USD_RATE: FiatRate = { code: "USD", name: "US Dollar", perUsd: 1 };

/** The visitor's chosen display currency; every price on a market page is quoted in it. */
export const FiatContext = createContext<FiatRate>(USD_RATE);
export const useFiat = () => useContext(FiatContext);

/** The currency's own minor-unit digits (JPY 0, USD 2, KWD 3), so a smaller cap never throws. */
const minorDigits = (code: string) => new Intl.NumberFormat("en", { style: "currency", currency: code }).resolvedOptions().maximumFractionDigits ?? 2;

/**
 * Shared number formatters for the market tools (crypto, forex, commodities), so every card rounds
 * prices the same way. `money`/`compactMoney` take a USD amount and show it in the chosen currency.
 */
export function marketFormatters(digitStyle: DigitStyle, fiat: FiatRate = USD_RATE) {
  const minor = minorDigits(fiat.code);
  const money = (usd: number, max?: number) => {
    const v = usd * fiat.perUsd;
    return formatLocalizedNumber(v, digitStyle, {
      style: "currency",
      currency: fiat.code,
      maximumFractionDigits: Math.max(minor, max ?? (v !== 0 && Math.abs(v) < 1 ? 6 : minor)),
    });
  };
  const compactMoney = (usd: number) =>
    formatLocalizedNumber(usd * fiat.perUsd, digitStyle, { style: "currency", currency: fiat.code, notation: "compact", maximumFractionDigits: Math.max(minor, 2) });
  const compact = (v: number) => formatLocalizedNumber(v, digitStyle, { notation: "compact", maximumFractionDigits: 2 });
  const num = (v: number, max = 2) => formatLocalizedNumber(v, digitStyle, { maximumFractionDigits: max });
  const amount = (v: number) => formatLocalizedNumber(v, digitStyle, { maximumFractionDigits: v !== 0 && Math.abs(v) < 1 ? 8 : 4 });
  /** An exchange rate: always 4 significant decimals, more for tiny rates. */
  const rate = (v: number) => formatLocalizedNumber(v, digitStyle, { maximumFractionDigits: v !== 0 && Math.abs(v) < 0.01 ? 8 : 4 });
  /** Exactly `digits` decimals, so 4.996 reads "5.00" and not a suspiciously round "5". */
  const fixed = (v: number, digits = 2) => formatLocalizedNumber(v, digitStyle, { minimumFractionDigits: digits, maximumFractionDigits: digits });
  const signedPct = (v: number, max = 2) => `${v > 0 ? "+" : ""}${formatLocalizedNumber(v, digitStyle, { maximumFractionDigits: max })}%`;
  return { money, compactMoney, compact, num, amount, rate, fixed, signedPct, currency: fiat.code };
}

export const useMarketFormatters = (digitStyle: DigitStyle) => marketFormatters(digitStyle, useFiat());

export const changeColor = (v: number | null | undefined) =>
  v == null ? "text-zinc-400" : v >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400";

/**
 * The display currency remembered per visitor in localStorage (default USD). The saved value is read
 * after mount so the server render (always USD) hydrates cleanly.
 */
export function useFiatPreference(storageKey: string, rates: FiatRate[]) {
  const [code, setCode] = useState("USD");

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(storageKey);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time restore of a client-only preference
      if (saved && rates.some((r) => r.code === saved)) setCode(saved);
    } catch {
      /* storage blocked: keep USD */
    }
  }, [storageKey, rates]);

  function change(next: string) {
    setCode(next);
    try {
      window.localStorage.setItem(storageKey, next);
    } catch {
      /* storage blocked: the choice lasts for this visit only */
    }
  }

  const fiat = rates.find((r) => r.code === code) ?? USD_RATE;
  return [fiat, change] as const;
}
