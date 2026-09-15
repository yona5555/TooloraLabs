"use client";
import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import { convertCurrencyAmount, type CurrencyRate } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";

type Props = {
  fromCurrency: CurrencyRate | undefined;
  toCurrency: CurrencyRate | undefined;
  digitStyle: DigitStyle;
};

const REFERENCE_AMOUNTS = [1, 10, 100, 1000, 10000];

/**
 * The conversion rate is a fixed multiplier, so every reference amount below scales
 * linearly off the same rate the result card just used — a visual proof, at a glance,
 * that the tool applies one consistent rate rather than a tiered/negotiated one.
 */
export default function ForexQuickAmountsChart({ fromCurrency, toCurrency, digitStyle }: Props) {
  const t = useTranslations("tools.forex-converter.quickAmounts");

  if (!fromCurrency || !toCurrency) return null;

  const rows = REFERENCE_AMOUNTS.map((amount) => ({
    amount,
    converted: convertCurrencyAmount(amount, fromCurrency.ratePerUsd, toCurrency.ratePerUsd),
  }));
  const maxConverted = Math.max(...rows.map((row) => row.converted));

  return (
    <SectionCard title={t("title")}>
      <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">
        {t("intro", { from: fromCurrency.code, to: toCurrency.code })}
      </p>
      <div dir="ltr" className="space-y-2.5">
        {rows.map((row) => (
          <div key={row.amount} className="flex items-center gap-3">
            <span className="w-20 shrink-0 text-end font-mono text-sm text-zinc-600 dark:text-zinc-300">
              {formatLocalizedNumber(row.amount, digitStyle)} {fromCurrency.code}
            </span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
              <div
                className="h-full rounded-full bg-blue-500 dark:bg-blue-400"
                style={{ width: `${Math.max((row.converted / maxConverted) * 100, 4)}%` }}
              />
            </div>
            <span className="w-28 shrink-0 font-mono text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              {formatLocalizedNumber(row.converted, digitStyle, { maximumFractionDigits: row.converted < 1 ? 6 : 2 })} {toCurrency.code}
            </span>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
