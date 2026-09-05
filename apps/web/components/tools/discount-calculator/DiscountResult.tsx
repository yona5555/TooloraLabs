"use client";
import { Calculator } from "lucide-react";
import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import type { CurrencyCode } from "@/lib/currency";
import SectionCard from "@/components/tool-ui/SectionCard";
import RatioGauge from "@/components/tool-ui/RatioGauge";
import DiscountPriceBar from "./DiscountPriceBar";
import DiscountShareExportModal from "./DiscountShareExportModal";
import type { DiscountResult as Result } from "./types";

type Props = {
  result: Result | null;
  hasCalculated: boolean;
  errorMessage: string;
  digitStyle: DigitStyle;
  currency: CurrencyCode;
};

const GAUGE_DOMAIN_MAX = 60;

export default function DiscountResult({ result, hasCalculated, errorMessage, digitStyle, currency }: Props) {
  const t = useTranslations("tools.discount-calculator");

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

  const isStacked = result.mode === "apply" && result.discounts.length > 1;
  const modeLabel = result.mode === "apply" ? t("form.modeApply") : t("form.modeReverse");

  const sentence =
    result.mode === "apply"
      ? t("aboveFold.sentenceApply", { original: money(result.originalPrice), final: money(result.finalPrice), percent: formatLocalizedNumber(result.effectiveDiscountPercent, digitStyle) })
      : t("aboveFold.sentenceReverse", { final: money(result.finalPrice), original: money(result.originalPrice), percent: formatLocalizedNumber(result.effectiveDiscountPercent, digitStyle) });

  const gaugeZone =
    result.effectiveDiscountPercent < 10
      ? t("result.gaugeZones.small")
      : result.effectiveDiscountPercent < 25
        ? t("result.gaugeZones.moderate")
        : result.effectiveDiscountPercent < 50
          ? t("result.gaugeZones.big")
          : t("result.gaugeZones.huge");

  const inputRows = [
    { label: result.mode === "apply" ? t("form.priceLabel") : t("form.finalPriceLabel"), value: money(result.mode === "apply" ? result.originalPrice : result.finalPrice) },
    { label: t("form.discountsLabel"), value: result.discounts.map((d) => `${formatLocalizedNumber(d, digitStyle)}%`).join(" + ") },
  ];
  const resultRows = [
    { label: t("result.originalPrice"), value: money(result.originalPrice) },
    { label: t("result.finalPrice"), value: money(result.finalPrice) },
    { label: t("result.saved"), value: money(result.saved) },
    { label: t("result.discountLabel"), value: `${formatLocalizedNumber(result.effectiveDiscountPercent, digitStyle)}%` },
  ];

  return (
    <SectionCard
      title={t("aboveFold.resultTitle")}
      action={<DiscountShareExportModal modeLabel={modeLabel} inputRows={inputRows} resultRows={resultRows} heroLabel={result.mode === "apply" ? t("result.finalPrice") : t("result.originalPrice")} heroValue={result.mode === "apply" ? money(result.finalPrice) : money(result.originalPrice)} sentence={sentence} />}
    >
      <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
        {result.mode === "apply" ? t("result.finalPrice") : t("result.originalPrice")}
      </p>
      <p dir="ltr" className="text-center font-mono text-4xl font-bold text-blue-700 dark:text-blue-400">
        {result.mode === "apply" ? money(result.finalPrice) : money(result.originalPrice)}
      </p>

      <div className="mt-5">
        <DiscountPriceBar
          originalPrice={result.originalPrice}
          finalPrice={result.finalPrice}
          finalLabel={t("result.finalPrice")}
          savedLabel={t("result.saved")}
          finalFormatted={money(result.finalPrice)}
          savedFormatted={money(result.saved)}
        />
      </div>

      <div className="mt-5 flex justify-center border-t border-zinc-200 pt-5 dark:border-zinc-800">
        <RatioGauge
          value={result.effectiveDiscountPercent}
          domainMin={0}
          domainMax={GAUGE_DOMAIN_MAX}
          zones={[
            { key: "small", from: 0, to: 10, colorClass: "stroke-zinc-400 dark:stroke-zinc-500" },
            { key: "moderate", from: 10, to: 25, colorClass: "stroke-blue-500 dark:stroke-blue-400" },
            { key: "big", from: 25, to: 50, colorClass: "stroke-emerald-500 dark:stroke-emerald-400" },
            { key: "huge", from: 50, to: GAUGE_DOMAIN_MAX, colorClass: "stroke-purple-500 dark:stroke-purple-400" },
          ]}
          valueLabel={`${formatLocalizedNumber(result.effectiveDiscountPercent, digitStyle)}%`}
          caption={gaugeZone}
          ticks={[0, 10, 25, 50, GAUGE_DOMAIN_MAX]}
          tickFormatter={(tick) => `${tick}%`}
        />
      </div>

      <div className="mt-2 grid grid-cols-2 gap-2 border-t border-zinc-200 pt-5 text-center dark:border-zinc-800">
        <div>
          <dt className="text-xs text-zinc-500 dark:text-zinc-400">{t("result.originalPrice")}</dt>
          <dd dir="ltr" className="mt-1 font-mono text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {money(result.originalPrice)}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-zinc-500 dark:text-zinc-400">{t("result.saved")}</dt>
          <dd dir="ltr" className="mt-1 font-mono text-sm font-semibold text-emerald-600 dark:text-emerald-400">
            {money(result.saved)}
          </dd>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between rounded-xl bg-zinc-50 px-4 py-3 dark:bg-zinc-800/60">
        <span className="text-sm text-zinc-600 dark:text-zinc-300">
          {isStacked ? t("result.effectiveDiscountLabel") : t("result.discountLabel")}
        </span>
        <span dir="ltr" className="font-mono text-lg font-bold text-zinc-900 dark:text-zinc-100">
          {formatLocalizedNumber(result.effectiveDiscountPercent, digitStyle)}%
        </span>
      </div>
      {isStacked && (
        <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
          {t("result.stackedNote", { stages: result.discounts.map((d) => `${d}%`).join(" + ") })}
        </p>
      )}
    </SectionCard>
  );
}
