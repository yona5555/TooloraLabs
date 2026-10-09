"use client";
import { useLocale } from "next-intl";
import type { DailyRate, UsdRateTable } from "@tooloralabs/tools";
import { getCurrencyDisplayName } from "@/lib/forex/currencyNames";
import { useJson, type Loaded } from "@/components/tools/markets/useJson";

export type { Loaded };

/** ~13 months of ECB fixings for every covered currency against USD. */
export function useForexRecent(): Loaded<UsdRateTable> {
  return useJson("/api/forex/recent", (j) => {
    const t = j as UsdRateTable;
    return Array.isArray(t.dates) && t.dates.length > 1 ? t : null;
  });
}

/** Full daily history of `target` per 1 `base` since 1999; "unsupported" when the ECB doesn't fix either currency. */
export function usePairHistory(base: string, target: string, retry = 0): Loaded<DailyRate[]> {
  const url = base && target && base !== target ? `/api/forex/chart?base=${base}&target=${target}${retry ? `&r=${retry}` : ""}` : null;
  return useJson(url, (j) => {
    const points = (j as { points?: DailyRate[] }).points;
    return points && points.length > 1 ? points : null;
  });
}

/** A currency's name in the page's language: curated English/Arabic names, else the browser's own CLDR names. */
export function useCurrencyName() {
  const locale = useLocale();
  let names: Intl.DisplayNames | null = null;
  try {
    names = locale === "en" || locale === "ar" ? null : new Intl.DisplayNames([locale], { type: "currency" });
  } catch {
    names = null;
  }
  return (code: string, fallback?: string) => {
    const local = names?.of(code);
    return local && local !== code ? local : getCurrencyDisplayName(code, locale, fallback);
  };
}

/** Formats an ECB fixing date (YYYY-MM-DD) in the page's language. */
export function useFixingDate() {
  const locale = useLocale();
  return (date: string) => new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeZone: "UTC" }).format(new Date(`${date}T00:00:00Z`));
}
