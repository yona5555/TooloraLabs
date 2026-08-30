"use client";
import { Calculator } from "lucide-react";
import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import type { LoanPaymentRow, LoanGrowthRow } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import LoanBreakdownDonut from "./LoanBreakdownDonut";
import LoanShareExportModal from "./LoanShareExportModal";
import type { LoanMode, CompoundingFrequency, PaymentFrequency } from "./types";

type LoanResultProps = {
  mode: LoanMode;
  hasCalculated: boolean;
  heroLabel: string;
  heroValue: string;
  sentence: string;
  principalForDonut: number;
  totalInterest: number;
  digitStyle: DigitStyle;
  loanAmount: number;
  dueAmount: number;
  interestRate: number;
  termYears: number;
  compoundFrequency: CompoundingFrequency;
  paymentFrequency: PaymentFrequency;
  paymentSchedule: LoanPaymentRow[];
  growthSchedule: LoanGrowthRow[];
};

export default function LoanResult({
  mode,
  hasCalculated,
  heroLabel,
  heroValue,
  sentence,
  principalForDonut,
  totalInterest,
  digitStyle,
  loanAmount,
  dueAmount,
  interestRate,
  termYears,
  compoundFrequency,
  paymentFrequency,
  paymentSchedule,
  growthSchedule,
}: LoanResultProps) {
  const t = useTranslations("tools.loan-calculator");

  const currency = (value: number) => formatLocalizedNumber(value, digitStyle, { style: "currency", currency: "USD", maximumFractionDigits: 0 });

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

  const total = principalForDonut + totalInterest;

  return (
    <SectionCard
      title={t("aboveFold.resultTitle")}
      action={
        <LoanShareExportModal
          mode={mode}
          digitStyle={digitStyle}
          loanAmount={loanAmount}
          dueAmount={dueAmount}
          interestRate={interestRate}
          termYears={termYears}
          compoundFrequency={compoundFrequency}
          paymentFrequency={paymentFrequency}
          totalInterest={totalInterest}
          heroLabel={heroLabel}
          heroValue={heroValue}
          sentence={sentence}
          paymentSchedule={paymentSchedule}
          growthSchedule={growthSchedule}
        />
      }
    >
      <p className="text-center text-sm leading-6 text-zinc-500 dark:text-zinc-400">{sentence}</p>

      <p className="mt-4 text-center text-sm text-zinc-500 dark:text-zinc-400">{heroLabel}</p>
      <p dir="ltr" className="text-center font-mono text-4xl font-bold text-blue-700 dark:text-blue-400">
        {heroValue}
      </p>

      <div className="mt-5">
        <LoanBreakdownDonut
          centerValue={currency(total)}
          centerLabel={t("aboveFold.totalLabel")}
          segments={[
            { key: "principal", value: principalForDonut, label: t("aboveFold.loanAmountLabel"), colorClass: "stroke-zinc-400 dark:stroke-zinc-600" },
            { key: "interest", value: totalInterest, label: t("aboveFold.totalInterestLabel"), colorClass: "stroke-amber-400 dark:stroke-amber-500" },
          ]}
        />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2 border-t border-zinc-200 pt-5 text-center dark:border-zinc-800">
        <div>
          <dt className="text-xs text-zinc-500 dark:text-zinc-400">{t("aboveFold.loanAmountLabel")}</dt>
          <dd dir="ltr" className="mt-1 font-mono text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {currency(principalForDonut)}
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
