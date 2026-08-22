"use client";
import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import SectionCard from "@/components/tool-ui/SectionCard";
import PdfDownloadButton from "@/components/tool-ui/PdfDownloadButton";
import type { HouseAffordabilityResult as HouseAffordabilityResultData } from "@tooloralabs/tools";

type HouseAffordabilityResultProps = {
  result: HouseAffordabilityResultData | null;
  annualIncome: number;
  downPayment: number;
  interestRate: number;
  loanTermYears: number;
  digitStyle: DigitStyle;
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
  result,
  annualIncome,
  downPayment,
  interestRate,
  loanTermYears,
  digitStyle,
}: HouseAffordabilityResultProps) {
  const t = useTranslations("tools.house-affordability-calculator");

  const money = (value: number) =>
    formatLocalizedNumber(value, digitStyle, { style: "currency", currency: "USD", maximumFractionDigits: 0 });

  const hasResult = result !== null && result.maxHomePrice > 0;

  return (
    <SectionCard
      title={t("aboveFold.resultTitle")}
      action={
        hasResult ? (
          <PdfDownloadButton
            toolName={t("title")}
            inputs={[
              { label: t("form.annualIncomeLabel"), value: money(annualIncome) },
              { label: t("form.downPaymentLabel"), value: money(downPayment) },
              { label: t("form.interestRateLabel"), value: `${formatLocalizedNumber(interestRate, digitStyle)}%` },
              { label: t("form.loanTermLabel"), value: String(formatLocalizedNumber(loanTermYears, digitStyle)) },
            ]}
            results={[
              { label: t("aboveFold.maxHomePriceLabel"), value: money(result.maxHomePrice) },
              { label: t("aboveFold.loanAmountLabel"), value: money(result.loanAmount) },
              { label: t("aboveFold.monthlyPaymentLabel"), value: money(result.monthlyPayment) },
            ]}
            filename="house-affordability-calculator-result.pdf"
          />
        ) : undefined
      }
    >
      {hasResult ? (
        <>
          <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">{t("aboveFold.maxHomePriceLabel")}</p>
          <p dir="ltr" className="text-center font-mono text-4xl font-bold text-blue-700 dark:text-blue-400">
            {money(result.maxHomePrice)}
          </p>

          <div className="mt-5 grid grid-cols-2 gap-2">
            <Stat title={t("aboveFold.loanAmountLabel")} value={money(result.loanAmount)} />
            <Stat title={t("aboveFold.monthlyPaymentLabel")} value={money(result.monthlyPayment)} />
            <Stat title={t("aboveFold.monthlyPrincipalAndInterestLabel")} value={money(result.monthlyPrincipalAndInterest)} />
            <Stat title={t("aboveFold.monthlyPropertyTaxLabel")} value={money(result.monthlyPropertyTax)} />
          </div>
        </>
      ) : (
        <p className="rounded-xl border border-dashed border-zinc-300 px-4 py-8 text-center text-sm text-zinc-400 dark:border-zinc-700 dark:text-zinc-500">
          {t("aboveFold.placeholder")}
        </p>
      )}
    </SectionCard>
  );
}
