"use client";
import { Calculator } from "lucide-react";
import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import type { CurrencyCode } from "@/lib/currency";
import SectionCard from "@/components/tool-ui/SectionCard";
import RatioGauge from "@/components/tool-ui/RatioGauge";
import TipBreakdownDonut from "./TipBreakdownDonut";
import TipShareExportModal from "./TipShareExportModal";
import type { TipResult as Result } from "./types";

type Props = {
  result: Result | null;
  hasCalculated: boolean;
  errorMessage: string;
  digitStyle: DigitStyle;
  currency: CurrencyCode;
};

const GAUGE_DOMAIN_MAX = 40;

export default function TipResult({ result, hasCalculated, errorMessage, digitStyle, currency }: Props) {
  const t = useTranslations("tools.tip-calculator");

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

  const sentence = t("aboveFold.sentence", {
    people: formatLocalizedNumber(result.people, digitStyle),
    total: money(result.totalPerPerson),
    tip: formatLocalizedNumber(result.tipPercent / 100, digitStyle, { style: "percent", maximumFractionDigits: 0 }),
  });

  const gaugeZone =
    result.tipPercent < 15
      ? t("result.gaugeZones.belowStandard")
      : result.tipPercent < 20
        ? t("result.gaugeZones.standard")
        : result.tipPercent < 25
          ? t("result.gaugeZones.generous")
          : t("result.gaugeZones.veryGenerous");

  const inputRows = [
    { label: t("result.billAmount"), value: money(result.billAmount) },
    { label: t("form.tipLabel"), value: `${formatLocalizedNumber(result.tipPercent, digitStyle)}%` },
    { label: t("result.people"), value: formatLocalizedNumber(result.people, digitStyle) },
  ];
  const resultRows = [
    { label: t("result.tipAmount"), value: money(result.tipAmount) },
    { label: t("result.totalAmount"), value: money(result.totalAmount) },
    { label: t("result.tipPerPerson"), value: money(result.tipPerPerson) },
  ];

  return (
    <SectionCard
      title={t("aboveFold.resultTitle")}
      action={
        <TipShareExportModal inputRows={inputRows} resultRows={resultRows} heroLabel={t("result.totalPerPerson")} heroValue={money(result.totalPerPerson)} sentence={sentence} />
      }
    >
      <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">{t("result.totalPerPerson")}</p>
      <p dir="ltr" className="text-center font-mono text-4xl font-bold text-blue-700 dark:text-blue-400">
        {money(result.totalPerPerson)}
      </p>
      {result.roundedUp && (
        <p className="mt-1 text-center text-xs text-blue-600 dark:text-blue-400">{t("aboveFold.roundedUpNote")}</p>
      )}

      <div className="mt-5">
        <TipBreakdownDonut
          centerValue={money(result.totalAmount)}
          centerLabel={t("result.totalAmount")}
          segments={[
            { key: "bill", value: result.billAmount, label: t("result.billAmount"), colorClass: "stroke-zinc-400 dark:stroke-zinc-600" },
            { key: "tip", value: result.tipAmount, label: t("result.tipAmount"), colorClass: "stroke-blue-600 dark:stroke-blue-400" },
          ]}
        />
      </div>

      <div className="mt-5 flex justify-center border-t border-zinc-200 pt-5 dark:border-zinc-800">
        <RatioGauge
          value={result.tipPercent}
          domainMin={0}
          domainMax={GAUGE_DOMAIN_MAX}
          zones={[
            { key: "belowStandard", from: 0, to: 15, colorClass: "stroke-amber-400 dark:stroke-amber-500" },
            { key: "standard", from: 15, to: 20, colorClass: "stroke-emerald-500 dark:stroke-emerald-400" },
            { key: "generous", from: 20, to: 25, colorClass: "stroke-blue-500 dark:stroke-blue-400" },
            { key: "veryGenerous", from: 25, to: GAUGE_DOMAIN_MAX, colorClass: "stroke-purple-500 dark:stroke-purple-400" },
          ]}
          valueLabel={`${formatLocalizedNumber(result.tipPercent, digitStyle)}%`}
          caption={gaugeZone}
          ticks={[0, 15, 20, 25, GAUGE_DOMAIN_MAX]}
          tickFormatter={(tick) => `${tick}%`}
        />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2 border-t border-zinc-200 pt-5 text-center dark:border-zinc-800">
        <div>
          <dt className="text-xs text-zinc-500 dark:text-zinc-400">{t("result.tipPerPerson")}</dt>
          <dd dir="ltr" className="mt-1 font-mono text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {money(result.tipPerPerson)}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-zinc-500 dark:text-zinc-400">{t("result.people")}</dt>
          <dd dir="ltr" className="mt-1 font-mono text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {formatLocalizedNumber(result.people, digitStyle)}
          </dd>
        </div>
      </div>
    </SectionCard>
  );
}
