"use client";
import { createContext, useContext } from "react";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import { USD_RATE, type FiatRate } from "./types";

/** The visitor's chosen display currency; every price on the page is quoted in it. */
export const FiatContext = createContext<FiatRate>(USD_RATE);
export const useFiat = () => useContext(FiatContext);

/** The currency's own minor-unit digits (JPY 0, USD 2, KWD 3), so a smaller cap never throws. */
const minorDigits = (code: string) => new Intl.NumberFormat("en", { style: "currency", currency: code }).resolvedOptions().maximumFractionDigits ?? 2;

/**
 * Shared number formatters for the crypto indicators, so every card rounds prices the same way.
 * `money`/`compactMoney` take a USD amount and show it in the chosen fiat currency.
 */
export function cryptoFormatters(digitStyle: DigitStyle, fiat: FiatRate = USD_RATE) {
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
  const signedPct = (v: number, max = 2) => `${v > 0 ? "+" : ""}${formatLocalizedNumber(v, digitStyle, { maximumFractionDigits: max })}%`;
  return { money, compactMoney, compact, num, amount, signedPct, currency: fiat.code };
}

export const useCryptoFormatters = (digitStyle: DigitStyle) => cryptoFormatters(digitStyle, useFiat());

export const changeColor = (v: number | null | undefined) =>
  v == null ? "text-zinc-400" : v >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400";
