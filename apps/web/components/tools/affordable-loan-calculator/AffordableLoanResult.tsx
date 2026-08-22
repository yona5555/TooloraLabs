"use client";
import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import SectionCard from "@/components/tool-ui/SectionCard";
import PdfDownloadButton from "@/components/tool-ui/PdfDownloadButton";
import type { AffordableLoanResult as AffordableLoanResultData } from "@tooloralabs/tools";

type AffordableLoanResultProps = {
  result: AffordableLoanResultData | null;
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

export default function AffordableLoanResult({ result, interestRate, loanTermYears, digitStyle }: AffordableLoanResultProps) {
  const t = useTranslations("tools.affordable-loan-calculator");

  const money = (value: number) =>
    formatLocalizedNumber(value, digitStyle, { style: "currency", currency: "USD", maximumFractionDigits: 0 });

  const hasResult = result !== null && result.maxLoanAmount > 0;

  return (
    <SectionCard
      title={t("aboveFold.resultTitle")}
      action={
        hasResult ? (
          <PdfDownloadButton
            toolName={t("title")}
            inputs={[
              { label: t("form.monthlyPaymentLabel"), value: money(result.monthlyPayment) },
              { label: t("form.interestRateLabel"), value: `${formatLocalizedNumber(interestRate, digitStyle)}%` },
              { label: t("form.loanTermLabel"), value: String(formatLocalizedNumber(loanTermYears, digitStyle)) },
            ]}
            results={[
              { label: t("aboveFold.maxLoanAmountLabel"), value: money(result.maxLoanAmount) },
              { label: t("aboveFold.totalPaymentLabel"), value: money(result.totalPayment) },
              { label: t("aboveFold.totalInterestLabel"), value: money(result.totalInterest) },
            ]}
            filename="affordable-loan-calculator-result.pdf"
          />
        ) : undefined
      }
    >
      {hasResult ? (
        <>
          <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">{t("aboveFold.maxLoanAmountLabel")}</p>
          <p dir="ltr" className="text-center font-mono text-4xl font-bold text-blue-700 dark:text-blue-400">
            {money(result.maxLoanAmount)}
          </p>

          <div className="mt-5 grid grid-cols-2 gap-2">
            <Stat title={t("aboveFold.totalPaymentLabel")} value={money(result.totalPayment)} />
            <Stat title={t("aboveFold.totalInterestLabel")} value={money(result.totalInterest)} />
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
