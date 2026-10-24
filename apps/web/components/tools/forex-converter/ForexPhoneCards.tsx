"use client";
import { useLocale, useTranslations } from "next-intl";
import PhoneMiniCards, { type PhoneMiniCard } from "@/components/tool-ui/PhoneMiniCards";
import type { CurrencyRate } from "@tooloralabs/tools";

export type UsdTable = { dates: string[]; rates: Record<string, number[]> } | null;

/**
 * Phone top cards: EUR/USD and the converter's selected pair (it follows the pickers). Each value is
 * the page's own ExchangeRate-API snapshot; the 1-day change and the line are the ECB fixings of the
 * last 10 days (Frankfurter, the same table /tools reads). A pair the ECB does not fix (e.g. SAR)
 * shows its value alone.
 */
export default function ForexPhoneCards({ currencies, table, from, to }: { currencies: CurrencyRate[]; table: UsdTable; from: string; to: string }) {
  const t = useTranslations("common.phoneTicker");
  const locale = useLocale();
  const perUsd = (code: string) => (code === "USD" ? 1 : currencies.find((c) => c.code === code)?.ratePerUsd);
  const series = (code: string) => (code === "USD" ? table?.dates.map(() => 1) : table?.rates[code]);

  function card(key: string, label: string, base: string, quote: string): PhoneMiniCard | null {
    const b = perUsd(base);
    const q = perUsd(quote);
    if (!b || !q || !Number.isFinite(q / b)) return null;
    const value = q / b;
    const sb = series(base);
    const sq = series(quote);
    const trend = sb && sq ? sb.map((v, i) => sq[i] / v).filter((v) => Number.isFinite(v) && v > 0) : [];
    const ok = trend.length >= 2;
    const digits = value < 10 ? 4 : 2;
    return {
      key,
      label,
      value: new Intl.NumberFormat(`${locale}-u-nu-latn`, { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(value),
      change: ok ? ((trend[trend.length - 1] - trend[trend.length - 2]) / trend[trend.length - 2]) * 100 : null,
      changeLabel: t("change1d"),
      trend: ok ? trend : null,
    };
  }

  const cards = [card("eurUsd", t("eurUsd"), "EUR", "USD"), card("pair", `${from}/${to}`, from, to)].filter((c): c is PhoneMiniCard => c !== null);
  return <PhoneMiniCards label={t("label")} cards={cards} />;
}
