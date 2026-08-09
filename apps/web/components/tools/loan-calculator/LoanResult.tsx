"use client";
import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import SectionCard from "@/components/tool-ui/SectionCard";
import LoanBreakdownDonut from "./LoanBreakdownDonut";

type LoanResultProps = {
  monthlyPayment: number;
  loanAmount: number;
  totalInterest: number;
  totalPayment: number;
  digitStyle: DigitStyle;
};

export default function LoanResult({ monthlyPayment, loanAmount, totalInterest, totalPayment, digitStyle }: LoanResultProps) {
  const t = useTranslations("tools.loan-calculator");

  const currency = (value: number) =>
    formatLocalizedNumber(value, digitStyle, { style: "currency", currency: "USD", maximumFractionDigits: 0 });

  return (
    <SectionCard title={t("aboveFold.resultTitle")}>
      <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">{t("aboveFold.monthlyPaymentLabel")}</p>
      <p dir="ltr" className="text-center font-mono text-4xl font-bold text-blue-700 dark:text-blue-400">
        {currency(monthlyPayment)}
      </p>

      <div className="mt-5">
        <LoanBreakdownDonut
          centerValue={currency(totalPayment)}
          centerLabel={t("aboveFold.totalPaymentLabel")}
          segments={[
            { key: "principal", value: loanAmount, label: t("aboveFold.loanAmountLabel"), colorClass: "stroke-zinc-400 dark:stroke-zinc-600" },
            { key: "interest", value: totalInterest, label: t("aboveFold.totalInterestLabel"), colorClass: "stroke-amber-400 dark:stroke-amber-500" },
          ]}
        />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2 border-t border-zinc-200 pt-5 text-center dark:border-zinc-800">
        <div>
          <dt className="text-xs text-zinc-500 dark:text-zinc-400">{t("aboveFold.loanAmountLabel")}</dt>
          <dd dir="ltr" className="mt-1 font-mono text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {currency(loanAmount)}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-zinc-500 dark:text-zinc-400">{t("aboveFold.totalInterestLabel")}</dt>
          <dd dir="ltr" className="mt-1 font-mono text-sm font-semibold text-amber-600 dark:text-amber-400">
            {currency(totalInterest)}
          </dd>
        </div>
      </div>
    </SectionCard>
  );
}
