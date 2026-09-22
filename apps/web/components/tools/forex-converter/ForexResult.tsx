"use client";
import { useLocale, useTranslations } from "next-intl";
import { AlertTriangle } from "lucide-react";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import type { CurrencyRate } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import CopyButton from "@/components/tool-ui/CopyButton";
import { getCurrencyDisplayName } from "@/lib/forex/currencyNames";
import DataSourceNote from "./DataSourceNote";
import ForexShareExportModal from "./ForexShareExportModal";

type ForexResultProps = {
  fromCurrency: CurrencyRate | undefined;
  toCurrency: CurrencyRate | undefined;
  amount: string;
  convertedAmount: number;
  lastUpdatedUnix: number | null;
  dataUnavailable: boolean;
  digitStyle: DigitStyle;
};

function RateTile({ currency, digitStyle, locale }: { currency: CurrencyRate; digitStyle: DigitStyle; locale: string }) {
  return (
    <div className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-800/60">
      <dt className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
        <span dir="ltr" className="font-bold">{currency.code}</span>
        <span className="truncate">{getCurrencyDisplayName(currency.code, locale, currency.name)}</span>
      </dt>
      <dd dir="ltr" className="mt-1 font-mono font-semibold text-zinc-900 dark:text-zinc-100">
        {formatLocalizedNumber(currency.ratePerUsd, digitStyle, { maximumFractionDigits: currency.ratePerUsd < 1 ? 6 : 4 })}
      </dd>
    </div>
  );
}

export default function ForexResult({
  fromCurrency,
  toCurrency,
  amount,
  convertedAmount,
  lastUpdatedUnix,
  dataUnavailable,
  digitStyle,
}: ForexResultProps) {
  const t = useTranslations("tools.forex-converter.aboveFold");
  const locale = useLocale();

  const updatedLabel =
    lastUpdatedUnix === null
      ? null
      : new Intl.DateTimeFormat(locale === "ar" ? "ar" : "en-US", {
          dateStyle: "medium",
          timeStyle: "short",
          numberingSystem: digitStyle === "eastern" ? "arab" : "latn",
        }).format(new Date(lastUpdatedUnix * 1000));

  const resultText = toCurrency
    ? formatLocalizedNumber(convertedAmount, digitStyle, { maximumFractionDigits: convertedAmount < 1 ? 6 : 2 })
    : "";
  const summaryText = toCurrency ? `${resultText} ${toCurrency.code}` : "";

  return (
    <SectionCard
      title={t("resultTitle")}
      action={
        toCurrency && fromCurrency ? (
          <div className="flex items-center gap-2">
            <CopyButton text={summaryText} />
            <ForexShareExportModal
              operationLabel={`${fromCurrency.code} → ${toCurrency.code}`}
              inputRows={[{ label: fromCurrency.code, value: `${amount} ${fromCurrency.code}` }]}
              resultRows={[
                { label: toCurrency.code, value: summaryText },
                { label: `1 ${fromCurrency.code}`, value: formatLocalizedNumber(fromCurrency.ratePerUsd, digitStyle, { maximumFractionDigits: fromCurrency.ratePerUsd < 1 ? 6 : 4 }) },
                { label: `1 ${toCurrency.code}`, value: formatLocalizedNumber(toCurrency.ratePerUsd, digitStyle, { maximumFractionDigits: toCurrency.ratePerUsd < 1 ? 6 : 4 }) },
              ]}
              heroLabel={toCurrency.code}
              heroValue={summaryText}
              sentence={`${amount} ${fromCurrency.code} = ${summaryText} (${t("lastUpdated", { time: updatedLabel ?? "" })}).`}
            />
          </div>
        ) : undefined
      }
    >
      {dataUnavailable && (
        <div className="mb-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
          <AlertTriangle size={18} className="mt-0.5 shrink-0" />
          <p>{t("dataUnavailable")}</p>
        </div>
      )}

      <div className="text-center">
        {toCurrency ? (
          <>
            <p dir="ltr" className="break-all font-mono text-3xl font-bold text-zinc-900 dark:text-zinc-50">
              {resultText}
            </p>
            <p dir="ltr" className="mt-1 text-sm font-semibold text-zinc-500 dark:text-zinc-400">
              {toCurrency.code}
            </p>
          </>
        ) : (
          !dataUnavailable && <p className="text-zinc-400">{t("pickerPlaceholder")}</p>
        )}
      </div>

      {updatedLabel !== null && (
        <p className="mt-4 border-t border-zinc-200 pt-4 text-center text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
          {t("lastUpdated", { time: updatedLabel })}
        </p>
      )}

      {(fromCurrency || toCurrency) && (
        <dl className="mt-4 grid grid-cols-2 gap-3">
          {fromCurrency && <RateTile currency={fromCurrency} digitStyle={digitStyle} locale={locale} />}
          {toCurrency && <RateTile currency={toCurrency} digitStyle={digitStyle} locale={locale} />}
        </dl>
      )}

      <DataSourceNote sourceKey="exchangeRateApi" className="mt-4" />
    </SectionCard>
  );
}
