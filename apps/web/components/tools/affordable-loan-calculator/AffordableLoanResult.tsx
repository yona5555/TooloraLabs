"use client";
import { Calculator } from "lucide-react";
import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import SectionCard from "@/components/tool-ui/SectionCard";
import AffordableLoanShareExportModal from "./AffordableLoanShareExportModal";
import type { AffordableLoanResult as MaxLoanResult, LoanResult as RequiredPaymentResult } from "@tooloralabs/tools";
import type { CurrencyCode } from "@/lib/currency";
import type { AffordableLoanMode } from "./types";

type AffordableLoanResultProps = {
  mode: AffordableLoanMode;
  currency: CurrencyCode;
  hasCalculated: boolean;
  digitStyle: DigitStyle;
  interestRate: number;
  loanTermYears: number;
  loanAmount: number;
  maxLoanResult: MaxLoanResult;
  requiredPaymentResult: RequiredPaymentResult;
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

export default function AffordableLoanResult({
  mode,
  currency,
  hasCalculated,
  digitStyle,
  interestRate,
  loanTermYears,
  loanAmount,
  maxLoanResult,
  requiredPaymentResult,
}: AffordableLoanResultProps) {
  const t = useTranslations("tools.affordable-loan-calculator");

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

  const heroLabel = mode === "maxLoan" ? t("aboveFold.maxLoanAmountLabel") : t("aboveFold.requiredPaymentLabel");
  const heroValue = mode === "maxLoan" ? money(maxLoanResult.maxLoanAmount) : money(requiredPaymentResult.monthlyPayment);
  const sentence =
    mode === "maxLoan"
      ? t("aboveFold.sentences.maxLoan", { payment: money(maxLoanResult.monthlyPayment), amount: money(maxLoanResult.maxLoanAmount) })
      : t("aboveFold.sentences.requiredPayment", { amount: money(loanAmount), payment: money(requiredPaymentResult.monthlyPayment) });

  const inputRows =
    mode === "maxLoan"
      ? [
          { label: t("form.monthlyPaymentLabel"), value: money(maxLoanResult.monthlyPayment) },
          { label: t("form.interestRateLabel"), value: percent(interestRate) },
          { label: t("form.loanTermLabel"), value: String(formatLocalizedNumber(loanTermYears, digitStyle)) },
        ]
      : [
          { label: t("form.loanAmountLabel"), value: money(loanAmount) },
          { label: t("form.interestRateLabel"), value: percent(interestRate) },
          { label: t("form.loanTermLabel"), value: String(formatLocalizedNumber(loanTermYears, digitStyle)) },
        ];

  const resultRows =
    mode === "maxLoan"
      ? [
          { label: t("aboveFold.totalPaymentLabel"), value: money(maxLoanResult.totalPayment) },
          { label: t("aboveFold.totalInterestLabel"), value: money(maxLoanResult.totalInterest) },
        ]
      : [
          { label: t("aboveFold.totalPaymentLabel"), value: money(requiredPaymentResult.totalPayment) },
          { label: t("aboveFold.totalInterestLabel"), value: money(requiredPaymentResult.totalInterest) },
        ];

  return (
    <SectionCard
      title={t("aboveFold.resultTitle")}
      action={<AffordableLoanShareExportModal mode={mode} inputRows={inputRows} resultRows={resultRows} heroLabel={heroLabel} heroValue={heroValue} sentence={sentence} />}
    >
      <p className="text-center text-sm leading-6 text-zinc-500 dark:text-zinc-400">{sentence}</p>

      <p className="mt-4 text-center text-sm text-zinc-500 dark:text-zinc-400">{heroLabel}</p>
      <p dir="ltr" className="text-center font-mono text-4xl font-bold text-blue-700 dark:text-blue-400">
        {heroValue}
      </p>

      <div className="mt-5 grid grid-cols-2 gap-2">
        {mode === "maxLoan" ? (
          <>
            <Stat title={t("aboveFold.totalPaymentLabel")} value={money(maxLoanResult.totalPayment)} />
            <Stat title={t("aboveFold.totalInterestLabel")} value={money(maxLoanResult.totalInterest)} />
          </>
        ) : (
          <>
            <Stat title={t("aboveFold.totalPaymentLabel")} value={money(requiredPaymentResult.totalPayment)} />
            <Stat title={t("aboveFold.totalInterestLabel")} value={money(requiredPaymentResult.totalInterest)} />
          </>
        )}
      </div>
    </SectionCard>
  );
}
