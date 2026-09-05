"use client";
import { Calculator } from "lucide-react";
import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import type { CurrencyCode } from "@/lib/currency";
import SectionCard from "@/components/tool-ui/SectionCard";
import RatioGauge from "@/components/tool-ui/RatioGauge";
import SalesTaxBreakdownBar from "./SalesTaxBreakdownBar";
import SalesTaxShareExportModal from "./SalesTaxShareExportModal";
import type { SalesTaxResult as Result } from "./types";

type Props = {
  result: Result | null;
  hasCalculated: boolean;
  errorMessage: string;
  digitStyle: DigitStyle;
  currency: CurrencyCode;
};

const GAUGE_DOMAIN_MAX = 15;

export default function SalesTaxResult({ result, hasCalculated, errorMessage, digitStyle, currency }: Props) {
  const t = useTranslations("tools.sales-tax-calculator");

  const money = (value: number) => formatLocalizedNumber(value, digitStyle, { style: "currency", currency, minimumFractionDigits: 2, maximumFractionDigits: 2 });

  if (!hasCalculated) {
    return (
      <SectionCard title={t("aboveFold.resultTitle")}>
        <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
          <Calculator size={32} className="text-zinc-300 dark:text-zinc-700" />
          <p className="max-w-xs text-sm text-zinc-500 dark:text-zinc-400">{t("aboveFold.emptyStateMessage")}</p>
        </div>
      </SectionCard>
    );
  }

  if (errorMessage || !result) {
    return (
      <SectionCard title={t("aboveFold.resultTitle")}>
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
          {errorMessage}
        </p>
      </SectionCard>
    );
  }

  const modeLabel = result.mode === "add" ? t("form.modeAdd") : t("form.modeReverse");
  const sentence =
    result.mode === "add"
      ? t("aboveFold.sentenceAdd", { price: money(result.price), rate: formatLocalizedNumber(result.taxRate, digitStyle), total: money(result.totalPrice) })
      : t("aboveFold.sentenceReverse", { total: money(result.totalPrice), rate: formatLocalizedNumber(result.taxRate, digitStyle), price: money(result.price) });

  const gaugeZone =
    result.taxRate < 3
      ? t("result.gaugeZones.low")
      : result.taxRate < 6
        ? t("result.gaugeZones.moderate")
        : result.taxRate < 10
          ? t("result.gaugeZones.high")
          : t("result.gaugeZones.veryHigh");

  const inputRows = [
    { label: result.mode === "add" ? t("form.priceLabel") : t("form.totalPriceLabel"), value: money(result.mode === "add" ? result.price : result.totalPrice) },
    { label: t("form.taxRateLabel"), value: `${formatLocalizedNumber(result.taxRate, digitStyle)}%` },
  ];
  const resultRows = [
    { label: t("result.price"), value: money(result.price) },
    { label: t("result.taxAmount"), value: money(result.taxAmount) },
    { label: t("result.totalPrice"), value: money(result.totalPrice) },
  ];

  return (
    <SectionCard
      title={t("aboveFold.resultTitle")}
      action={
        <SalesTaxShareExportModal
          modeLabel={modeLabel}
          inputRows={inputRows}
          resultRows={resultRows}
          heroLabel={result.mode === "add" ? t("result.totalPrice") : t("result.price")}
          heroValue={result.mode === "add" ? money(result.totalPrice) : money(result.price)}
          sentence={sentence}
        />
      }
    >
      <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
        {result.mode === "add" ? t("result.totalPrice") : t("result.price")}
      </p>
      <p dir="ltr" className="text-center font-mono text-4xl font-bold text-blue-700 dark:text-blue-400">
        {result.mode === "add" ? money(result.totalPrice) : money(result.price)}
      </p>

      <div className="mt-5">
        <SalesTaxBreakdownBar
          price={result.price}
          taxAmount={result.taxAmount}
          priceLabel={t("result.price")}
          taxLabel={t("result.taxAmount")}
          priceFormatted={money(result.price)}
          taxFormatted={money(result.taxAmount)}
        />
      </div>

      <div className="mt-5 flex justify-center border-t border-zinc-200 pt-5 dark:border-zinc-800">
        <RatioGauge
          value={result.taxRate}
          domainMin={0}
          domainMax={GAUGE_DOMAIN_MAX}
          zones={[
            { key: "low", from: 0, to: 3, colorClass: "stroke-emerald-500 dark:stroke-emerald-400" },
            { key: "moderate", from: 3, to: 6, colorClass: "stroke-blue-500 dark:stroke-blue-400" },
            { key: "high", from: 6, to: 10, colorClass: "stroke-amber-500 dark:stroke-amber-400" },
            { key: "veryHigh", from: 10, to: GAUGE_DOMAIN_MAX, colorClass: "stroke-red-500 dark:stroke-red-400" },
          ]}
          valueLabel={`${formatLocalizedNumber(result.taxRate, digitStyle)}%`}
          caption={gaugeZone}
          ticks={[0, 3, 6, 10, GAUGE_DOMAIN_MAX]}
          tickFormatter={(tick) => `${tick}%`}
        />
      </div>

      <div className="mt-2 grid grid-cols-2 gap-2 border-t border-zinc-200 pt-5 text-center dark:border-zinc-800">
        <div>
          <dt className="text-xs text-zinc-500 dark:text-zinc-400">{t("result.price")}</dt>
          <dd dir="ltr" className="mt-1 font-mono text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {money(result.price)}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-zinc-500 dark:text-zinc-400">{t("result.totalPrice")}</dt>
          <dd dir="ltr" className="mt-1 font-mono text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {money(result.totalPrice)}
          </dd>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between rounded-xl bg-zinc-50 px-4 py-3 dark:bg-zinc-800/60">
        <span className="text-sm text-zinc-600 dark:text-zinc-300">{t("result.taxAmount")}</span>
        <span dir="ltr" className="font-mono text-lg font-bold text-amber-600 dark:text-amber-400">
          {money(result.taxAmount)}
        </span>
      </div>
      {result.mode === "reverse" && (
        <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
          {t("result.reverseNote", { rate: formatLocalizedNumber(result.taxRate, digitStyle) })}
        </p>
      )}
    </SectionCard>
  );
}
