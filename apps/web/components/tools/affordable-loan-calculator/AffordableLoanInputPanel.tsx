"use client";
import type { FormEvent } from "react";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import ToolInput from "@/components/tool-ui/ToolInput";
import ToolButton from "@/components/tool-ui/ToolButton";
import CurrencySelector from "@/components/tool-ui/CurrencySelector";
import type { CurrencyCode } from "@/lib/currency";
import type { AffordableLoanMode } from "./types";

type AffordableLoanInputPanelProps = {
  mode: AffordableLoanMode;
  currency: CurrencyCode;
  onCurrencyChange: (value: CurrencyCode) => void;
  monthlyPayment: string;
  onMonthlyPaymentChange: (value: string) => void;
  loanAmount: string;
  onLoanAmountChange: (value: string) => void;
  interestRate: string;
  onInterestRateChange: (value: string) => void;
  loanTermYears: string;
  onLoanTermYearsChange: (value: string) => void;
  onCalculate: (e: FormEvent<HTMLFormElement>) => void;
  onClear: () => void;
};

export default function AffordableLoanInputPanel({
  mode,
  currency,
  onCurrencyChange,
  monthlyPayment,
  onMonthlyPaymentChange,
  loanAmount,
  onLoanAmountChange,
  interestRate,
  onInterestRateChange,
  loanTermYears,
  onLoanTermYearsChange,
  onCalculate,
  onClear,
}: AffordableLoanInputPanelProps) {
  const t = useTranslations("tools.affordable-loan-calculator");

  return (
    <SectionCard title={t("aboveFold.inputTitle")}>
      <form onSubmit={onCalculate} className="space-y-5">
        <CurrencySelector value={currency} onChange={onCurrencyChange} />

        {mode === "maxLoan" ? (
          <ToolInput
            label={`${t("form.monthlyPaymentLabel")} (${currency})`}
            hint={t("form.monthlyPaymentHint")}
            type="text"
            inputMode="decimal"
            placeholder={t("form.monthlyPaymentPlaceholder")}
            value={monthlyPayment}
            onChange={(e) => onMonthlyPaymentChange(e.target.value)}
          />
        ) : (
          <ToolInput
            label={`${t("form.loanAmountLabel")} (${currency})`}
            hint={t("form.loanAmountHint")}
            type="text"
            inputMode="decimal"
            placeholder={t("form.loanAmountPlaceholder")}
            value={loanAmount}
            onChange={(e) => onLoanAmountChange(e.target.value)}
          />
        )}

        <ToolInput
          label={t("form.interestRateLabel")}
          type="text"
          inputMode="decimal"
          placeholder={t("form.interestRatePlaceholder")}
          value={interestRate}
          onChange={(e) => onInterestRateChange(e.target.value)}
        />

        <ToolInput
          label={t("form.loanTermLabel")}
          type="text"
          inputMode="decimal"
          placeholder={t("form.loanTermPlaceholder")}
          value={loanTermYears}
          onChange={(e) => onLoanTermYearsChange(e.target.value)}
        />

        <div className="flex flex-wrap gap-4">
          <ToolButton type="submit">{t("form.calculate")}</ToolButton>
          <button
            type="button"
            onClick={onClear}
            className="rounded-xl border border-zinc-300 px-6 py-3 font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            {t("form.clear")}
          </button>
        </div>
      </form>
    </SectionCard>
  );
}
