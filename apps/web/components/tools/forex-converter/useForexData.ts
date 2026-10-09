"use client";
import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import type { DailyRate, UsdRateTable } from "@tooloralabs/tools";
import { getCurrencyDisplayName } from "@/lib/forex/currencyNames";

export type Loaded<T> = { status: "loading" } | { status: "error" } | { status: "unsupported" } | { status: "ready"; data: T };

/** One request per URL per page view: several indicators read the same history without refetching. */
const requests = new Map<string, Promise<Response>>();
function fetchOnce(url: string): Promise<Response> {
  let p = requests.get(url);
  if (!p) {
    p = fetch(url);
    requests.set(url, p);
    // A failed request may be retried later.
    p.then((r) => !r.ok && r.status !== 404 && requests.delete(url)).catch(() => requests.delete(url));
  }
  return p.then((r) => r.clone());
}

function useJson<T>(url: string | null, pick: (json: unknown) => T | null): Loaded<T> {
  const [state, setState] = useState<{ url: string; value: Loaded<T> } | null>(null);
  useEffect(() => {
    if (!url) return;
    let cancelled = false;
    fetchOnce(url)
      .then(async (res) => {
        const json = (await res.json()) as unknown;
        if (cancelled) return;
        const data = res.ok ? pick(json) : null;
        const value: Loaded<T> = res.status === 404 ? { status: "unsupported" } : data ? { status: "ready", data } : { status: "error" };
        setState({ url, value });
      })
      .catch(() => !cancelled && setState({ url, value: { status: "error" } }));
    return () => {
      cancelled = true;
    };
    // `pick` is a pure parser; re-running on its identity would refetch every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);
  if (!url) return { status: "unsupported" };
  return state && state.url === url ? state.value : { status: "loading" };
}

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
