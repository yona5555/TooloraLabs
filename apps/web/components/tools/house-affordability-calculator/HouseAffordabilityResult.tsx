"use client";
import { Calculator } from "lucide-react";
import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import SectionCard from "@/components/tool-ui/SectionCard";
import HouseAffordabilityShareExportModal from "./HouseAffordabilityShareExportModal";
import type { HouseAffordabilityResult as HomePriceResult, RequiredIncomeResult } from "@tooloralabs/tools";
import type { HouseAffordabilityMode } from "./types";

type HouseAffordabilityResultProps = {
  mode: HouseAffordabilityMode;
  hasCalculated: boolean;
  digitStyle: DigitStyle;
  downPayment: number;
  interestRate: number;
  loanTermYears: number;
  annualIncome: number;
  targetHomePrice: number;
  homePriceResult: HomePriceResult;
  requiredIncomeResult: RequiredIncomeResult;
};

function Stat({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-xl bg-zinc-50 px-3 py-2.5 text-center dark:bg-zinc-800/60">
      <dt className="text-xs text-zinc-500 dark:text-zinc-400">{title}</dt>
      <dd dir="ltr" className="mt-0.5 font-mono text-sm font-semibold text-zinc-900 dark:text-zinc-100">
        {value}
      </dd>
    </div>
  );
}

export default function HouseAffordabilityResult({
  mode,
  hasCalculated,
  digitStyle,
  downPayment,
  interestRate,
  loanTermYears,
  annualIncome,
  targetHomePrice,
  homePriceResult,
  requiredIncomeResult,
}: HouseAffordabilityResultProps) {
  const t = useTranslations("tools.house-affordability-calculator");

  const money = (value: number) => formatLocalizedNumber(value, digitStyle, { style: "currency", currency: "USD", maximumFractionDigits: 0 });
  const percent = (value: number) => `${formatLocalizedNumber(value, digitStyle, { maximumFractionDigits: 2 })}%`;

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

  const heroLabel = mode === "homePrice" ? t("aboveFold.maxHomePriceLabel") : t("aboveFold.requiredAnnualIncomeLabel");
  const heroValue = mode === "homePrice" ? money(homePriceResult.maxHomePrice) : money(requiredIncomeResult.requiredAnnualIncome);
  const sentence =
    mode === "homePrice"
      ? t("aboveFold.sentences.homePrice", { income: money(annualIncome), price: money(homePriceResult.maxHomePrice) })
      : t("aboveFold.sentences.requiredIncome", { price: money(targetHomePrice), income: money(requiredIncomeResult.requiredAnnualIncome) });

  const sharedInputRows = [
    { label: t("form.downPaymentLabel"), value: money(downPayment) },
    { label: t("form.interestRateLabel"), value: percent(interestRate) },
    { label: t("form.loanTermLabel"), value: String(formatLocalizedNumber(loanTermYears, digitStyle)) },
  ];
  const inputRows =
    mode === "homePrice"
      ? [{ label: t("form.annualIncomeLabel"), value: money(annualIncome) }, ...sharedInputRows]
      : [{ label: t("form.targetHomePriceLabel"), value: money(targetHomePrice) }, ...sharedInputRows];

  const resultRows =
    mode === "homePrice"
      ? [
          { label: t("aboveFold.loanAmountLabel"), value: money(homePriceResult.loanAmount) },
          { label: t("aboveFold.monthlyPaymentLabel"), value: money(homePriceResult.monthlyPayment) },
          { label: t("aboveFold.monthlyPrincipalAndInterestLabel"), value: money(homePriceResult.monthlyPrincipalAndInterest) },
          { label: t("aboveFold.monthlyPropertyTaxLabel"), value: money(homePriceResult.monthlyPropertyTax) },
        ]
      : [
          { label: t("aboveFold.loanAmountLabel"), value: money(requiredIncomeResult.loanAmount) },
          { label: t("aboveFold.monthlyPaymentLabel"), value: money(requiredIncomeResult.monthlyPayment) },
          { label: t("aboveFold.bindingConstraintLabel"), value: t(`aboveFold.bindingConstraint.${requiredIncomeResult.bindingConstraint}`) },
        ];

  return (
    <SectionCard
      title={t("aboveFold.resultTitle")}
      action={<HouseAffordabilityShareExportModal mode={mode} inputRows={inputRows} resultRows={resultRows} heroLabel={heroLabel} heroValue={heroValue} sentence={sentence} />}
    >
      <p className="text-center text-sm leading-6 text-zinc-500 dark:text-zinc-400">{sentence}</p>

      <p className="mt-4 text-center text-sm text-zinc-500 dark:text-zinc-400">{heroLabel}</p>
      <p dir="ltr" className="text-center font-mono text-4xl font-bold text-blue-700 dark:text-blue-400">
        {heroValue}
      </p>

      <div className="mt-5 grid grid-cols-2 gap-2">
        {mode === "homePrice" ? (
          <>
            <Stat title={t("aboveFold.loanAmountLabel")} value={money(homePriceResult.loanAmount)} />
            <Stat title={t("aboveFold.monthlyPaymentLabel")} value={money(homePriceResult.monthlyPayment)} />
            <Stat title={t("aboveFold.monthlyPrincipalAndInterestLabel")} value={money(homePriceResult.monthlyPrincipalAndInterest)} />
            <Stat title={t("aboveFold.monthlyPropertyTaxLabel")} value={money(homePriceResult.monthlyPropertyTax)} />
          </>
        ) : (
          <>
            <Stat title={t("aboveFold.loanAmountLabel")} value={money(requiredIncomeResult.loanAmount)} />
            <Stat title={t("aboveFold.monthlyPaymentLabel")} value={money(requiredIncomeResult.monthlyPayment)} />
          </>
        )}
      </div>
    </SectionCard>
  );
}
