"use client";
import { Calculator } from "lucide-react";
import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import SectionCard from "@/components/tool-ui/SectionCard";
import HouseAffordabilityShareExportModal from "./HouseAffordabilityShareExportModal";
import type {
  HouseAffordabilityResult as HomePriceResult,
  RequiredIncomeResult,
  CarAffordabilityResult,
  PersonalLoanAffordabilityResult,
  BusinessLoanAffordabilityResult,
} from "@tooloralabs/tools";
import type { CurrencyCode } from "@/lib/currency";
import type { HouseAffordabilityMode } from "./types";

type HouseAffordabilityResultProps = {
  mode: HouseAffordabilityMode;
  currency: CurrencyCode;
  hasCalculated: boolean;
  digitStyle: DigitStyle;
  downPayment: number;
  interestRate: number;
  loanTermYears: number;
  annualIncome: number;
  targetHomePrice: number;
  homePriceResult: HomePriceResult;
  requiredIncomeResult: RequiredIncomeResult;

  carAnnualIncome: number;
  carDownPayment: number;
  carResult: CarAffordabilityResult;

  personalAnnualIncome: number;
  personalResult: PersonalLoanAffordabilityResult;

  businessMonthlyRevenue: number;
  businessResult: BusinessLoanAffordabilityResult;
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
  currency,
  hasCalculated,
  digitStyle,
  downPayment,
  interestRate,
  loanTermYears,
  annualIncome,
  targetHomePrice,
  homePriceResult,
  requiredIncomeResult,
  carAnnualIncome,
  carDownPayment,
  carResult,
  personalAnnualIncome,
  personalResult,
  businessMonthlyRevenue,
  businessResult,
}: HouseAffordabilityResultProps) {
  const t = useTranslations("tools.house-affordability-calculator");

  const money = (value: number) => formatLocalizedNumber(value, digitStyle, { style: "currency", currency, maximumFractionDigits: 0 });
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

  const heroLabel =
    mode === "homePrice"
      ? t("aboveFold.maxHomePriceLabel")
      : mode === "requiredIncome"
        ? t("aboveFold.requiredAnnualIncomeLabel")
        : mode === "car"
          ? t("aboveFold.maxCarPriceLabel")
          : mode === "personal"
            ? t("aboveFold.maxPersonalLoanLabel")
            : t("aboveFold.maxBusinessLoanLabel");

  const heroValue =
    mode === "homePrice"
      ? money(homePriceResult.maxHomePrice)
      : mode === "requiredIncome"
        ? money(requiredIncomeResult.requiredAnnualIncome)
        : mode === "car"
          ? money(carResult.maxCarPrice)
          : mode === "personal"
            ? money(personalResult.maxLoanAmount)
            : money(businessResult.maxLoanAmount);

  const sentence =
    mode === "homePrice"
      ? t("aboveFold.sentences.homePrice", { income: money(annualIncome), price: money(homePriceResult.maxHomePrice) })
      : mode === "requiredIncome"
        ? t("aboveFold.sentences.requiredIncome", { price: money(targetHomePrice), income: money(requiredIncomeResult.requiredAnnualIncome) })
        : mode === "car"
          ? t("aboveFold.sentences.car", { income: money(carAnnualIncome), price: money(carResult.maxCarPrice), payment: money(carResult.monthlyPayment) })
          : mode === "personal"
            ? t("aboveFold.sentences.personal", { income: money(personalAnnualIncome), amount: money(personalResult.maxLoanAmount), payment: money(personalResult.monthlyPayment) })
            : t("aboveFold.sentences.business", { revenue: money(businessMonthlyRevenue), amount: money(businessResult.maxLoanAmount), payment: money(businessResult.monthlyPayment) });

  const sharedInputRows = [
    { label: t("form.downPaymentLabel"), value: money(downPayment) },
    { label: t("form.interestRateLabel"), value: percent(interestRate) },
    { label: t("form.loanTermLabel"), value: String(formatLocalizedNumber(loanTermYears, digitStyle)) },
  ];

  const inputRows =
    mode === "homePrice"
      ? [{ label: t("form.annualIncomeLabel"), value: money(annualIncome) }, ...sharedInputRows]
      : mode === "requiredIncome"
        ? [{ label: t("form.targetHomePriceLabel"), value: money(targetHomePrice) }, ...sharedInputRows]
        : mode === "car"
          ? [
              { label: t("form.annualIncomeLabel"), value: money(carAnnualIncome) },
              { label: t("form.downPaymentLabel"), value: money(carDownPayment) },
              { label: t("form.interestRateLabel"), value: percent(interestRate) },
              { label: t("form.loanTermLabel"), value: String(formatLocalizedNumber(loanTermYears, digitStyle)) },
            ]
          : mode === "personal"
            ? [
                { label: t("form.annualIncomeLabel"), value: money(personalAnnualIncome) },
                { label: t("form.interestRateLabel"), value: percent(interestRate) },
                { label: t("form.loanTermLabel"), value: String(formatLocalizedNumber(loanTermYears, digitStyle)) },
              ]
            : [
                { label: t("form.businessMonthlyRevenueLabel"), value: money(businessMonthlyRevenue) },
                { label: t("form.interestRateLabel"), value: percent(interestRate) },
                { label: t("form.loanTermLabel"), value: String(formatLocalizedNumber(loanTermYears, digitStyle)) },
              ];

  const resultRows =
    mode === "homePrice"
      ? [
          { label: t("aboveFold.loanAmountLabel"), value: money(homePriceResult.loanAmount) },
          { label: t("aboveFold.monthlyPaymentLabel"), value: money(homePriceResult.monthlyPayment) },
          { label: t("aboveFold.monthlyPrincipalAndInterestLabel"), value: money(homePriceResult.monthlyPrincipalAndInterest) },
          { label: t("aboveFold.monthlyPropertyTaxLabel"), value: money(homePriceResult.monthlyPropertyTax) },
        ]
      : mode === "requiredIncome"
        ? [
            { label: t("aboveFold.loanAmountLabel"), value: money(requiredIncomeResult.loanAmount) },
            { label: t("aboveFold.monthlyPaymentLabel"), value: money(requiredIncomeResult.monthlyPayment) },
            { label: t("aboveFold.bindingConstraintLabel"), value: t(`aboveFold.bindingConstraint.${requiredIncomeResult.bindingConstraint}`) },
          ]
        : mode === "car"
          ? [
              { label: t("aboveFold.loanAmountLabel"), value: money(carResult.loanAmount) },
              { label: t("aboveFold.monthlyPaymentLabel"), value: money(carResult.monthlyPayment) },
            ]
          : mode === "personal"
            ? [{ label: t("aboveFold.monthlyPaymentLabel"), value: money(personalResult.monthlyPayment) }]
            : [{ label: t("aboveFold.monthlyPaymentLabel"), value: money(businessResult.monthlyPayment) }];

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
        {mode === "homePrice" && (
          <>
            <Stat title={t("aboveFold.loanAmountLabel")} value={money(homePriceResult.loanAmount)} />
            <Stat title={t("aboveFold.monthlyPaymentLabel")} value={money(homePriceResult.monthlyPayment)} />
            <Stat title={t("aboveFold.monthlyPrincipalAndInterestLabel")} value={money(homePriceResult.monthlyPrincipalAndInterest)} />
            <Stat title={t("aboveFold.monthlyPropertyTaxLabel")} value={money(homePriceResult.monthlyPropertyTax)} />
          </>
        )}
        {mode === "requiredIncome" && (
          <>
            <Stat title={t("aboveFold.loanAmountLabel")} value={money(requiredIncomeResult.loanAmount)} />
            <Stat title={t("aboveFold.monthlyPaymentLabel")} value={money(requiredIncomeResult.monthlyPayment)} />
          </>
        )}
        {mode === "car" && (
          <>
            <Stat title={t("aboveFold.loanAmountLabel")} value={money(carResult.loanAmount)} />
            <Stat title={t("aboveFold.monthlyPaymentLabel")} value={money(carResult.monthlyPayment)} />
          </>
        )}
        {mode === "personal" && <Stat title={t("aboveFold.monthlyPaymentLabel")} value={money(personalResult.monthlyPayment)} />}
        {mode === "business" && <Stat title={t("aboveFold.monthlyPaymentLabel")} value={money(businessResult.monthlyPayment)} />}
      </div>
    </SectionCard>
  );
}
