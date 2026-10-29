"use client";
import { useTween } from "@/components/tool-ui/motion/motion";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";

/** Number formatters in the batch's own currency, with that currency's minor-unit digits (JPY 0, BHD 3). */
export function invoiceFormatters(digitStyle: DigitStyle, currency: string) {
  const minor = new Intl.NumberFormat("en", { style: "currency", currency }).resolvedOptions().maximumFractionDigits ?? 2;
  const money = (v: number) => formatLocalizedNumber(v, digitStyle, { style: "currency", currency, minimumFractionDigits: minor, maximumFractionDigits: minor });
  const moneyIn = (v: number, code: string) => formatLocalizedNumber(v, digitStyle, { style: "currency", currency: code, maximumFractionDigits: 2 });
  const compact = (v: number) => formatLocalizedNumber(v, digitStyle, { style: "currency", currency, notation: "compact", maximumFractionDigits: 1 });
  const num = (v: number, max = 2) => formatLocalizedNumber(v, digitStyle, { maximumFractionDigits: max });
  const pct = (v: number, max = 1) => `${formatLocalizedNumber(v, digitStyle, { maximumFractionDigits: max })}%`;
  const signed = (v: number) => `${v > 0 ? "+" : v < 0 ? "−" : "±"}${money(Math.abs(v))}`;
  return { money, moneyIn, compact, num, pct, signed, currency, minor };
}

export type InvoiceFormatters = ReturnType<typeof invoiceFormatters>;

/** Animates from the previous value to `target` (ease-out, 600 ms); jumps straight there if motion is reduced. */
export function useCountUp(target: number, duration = 600): number {
  return useTween(target, duration); // tool-ui/motion: one shared loop, instant for reduced motion
}

/** Short ISO date shown in the visitor's locale (UTC so a date never shifts by a day). */
export const shortDate = (iso: string, locale: string) => {
  const d = new Date(`${iso}T00:00:00Z`);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString(locale, { day: "numeric", month: "short", timeZone: "UTC" });
};
