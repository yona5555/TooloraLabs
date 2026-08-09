"use client";
import { useLocale, useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import { findCurrencyByCode, type CurrencyRate } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import { FEATURED_CURRENCY_CODES, getCurrencyDisplayName } from "@/lib/forex/currencyNames";
import DataSourceNote from "./DataSourceNote";

type ForexTopListProps = {
  currencies: CurrencyRate[];
  digitStyle: DigitStyle;
};

export default function ForexTopList({ currencies, digitStyle }: ForexTopListProps) {
  const t = useTranslations("tools.forex-converter.topList");
  const locale = useLocale();

  const rows = FEATURED_CURRENCY_CODES.map((code) => findCurrencyByCode(currencies, code)).filter(
    (currency): currency is CurrencyRate => currency !== undefined
  );

  return (
    <SectionCard title={t("title")} bodyClassName="p-0">
      <p className="px-4 pt-4 text-sm text-zinc-500 lg:px-6 dark:text-zinc-400">{t("intro")}</p>
      <div className="mt-2 max-h-[520px] overflow-auto">
        <table className="w-full min-w-[420px] text-sm">
          <thead className="sticky top-0 bg-zinc-50 dark:bg-zinc-800/90">
            <tr className="text-xs text-zinc-500 dark:text-zinc-400">
              <th className="px-4 py-2.5 text-start font-medium lg:px-6">{t("columnCurrency")}</th>
              <th className="px-4 py-2.5 text-end font-medium lg:px-6">{t("columnRatePerUsd")}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((currency) => (
              <tr key={currency.code} className="border-t border-zinc-100 dark:border-zinc-800/60">
                <td className="px-4 py-2.5 lg:px-6">
                  <span className="flex items-center gap-2">
                    <span dir="ltr" className="shrink-0 rounded bg-zinc-100 px-1.5 py-0.5 text-xs font-bold text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300">
                      {currency.code}
                    </span>
                    <span className="truncate font-medium text-zinc-900 dark:text-zinc-100">
                      {getCurrencyDisplayName(currency.code, locale, currency.name)}
                    </span>
                  </span>
                </td>
                <td dir="ltr" className="px-4 py-2.5 text-end font-mono text-zinc-900 lg:px-6 dark:text-zinc-100">
                  {formatLocalizedNumber(currency.ratePerUsd, digitStyle, {
                    maximumFractionDigits: currency.ratePerUsd < 1 ? 6 : 4,
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="p-4 pt-3 lg:px-6">
        <DataSourceNote sourceKey="exchangeRateApi" />
      </div>
    </SectionCard>
  );
}
