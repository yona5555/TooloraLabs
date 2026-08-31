"use client";
import type { FormEvent } from "react";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import ToolInput from "@/components/tool-ui/ToolInput";
import ToolButton from "@/components/tool-ui/ToolButton";
import CurrencySelector from "@/components/tool-ui/CurrencySelector";
import type { CurrencyCode } from "@/lib/currency";
import type { LoanMode, TermUnit, CompoundingFrequency, PaymentFrequency } from "./types";

const COMPOUND_FREQUENCIES: CompoundingFrequency[] = ["annually", "semiannually", "quarterly", "monthly", "daily"];
const PAYMENT_FREQUENCIES: PaymentFrequency[] = ["annually", "semiannually", "quarterly", "monthly", "biweekly", "weekly"];

type LoanInputPanelProps = {
  mode: LoanMode;
  currency: CurrencyCode;
  onCurrencyChange: (value: CurrencyCode) => void;
  loanAmount: string;
  onLoanAmountChange: (value: string) => void;
  dueAmount: string;
  onDueAmountChange: (value: string) => void;
  interestRate: string;
  onInterestRateChange: (value: string) => void;
  termValue: string;
  onTermValueChange: (value: string) => void;
  termUnit: TermUnit;
  onTermUnitChange: (unit: TermUnit) => void;
  compoundFrequency: CompoundingFrequency;
  onCompoundFrequencyChange: (value: CompoundingFrequency) => void;
  paymentFrequency: PaymentFrequency;
  onPaymentFrequencyChange: (value: PaymentFrequency) => void;
  onCalculate: (e: FormEvent<HTMLFormElement>) => void;
  onClear: () => void;
};

export default function LoanInputPanel({
  mode,
  currency,
  onCurrencyChange,
  loanAmount,
  onLoanAmountChange,
  dueAmount,
  onDueAmountChange,
  interestRate,
  onInterestRateChange,
  termValue,
  onTermValueChange,
  termUnit,
  onTermUnitChange,
  compoundFrequency,
  onCompoundFrequencyChange,
  paymentFrequency,
  onPaymentFrequencyChange,
  onCalculate,
  onClear,
}: LoanInputPanelProps) {
  const t = useTranslations("tools.loan-calculator");

  return (
    <SectionCard title={t("aboveFold.inputTitle")}>
      <form onSubmit={onCalculate} className="space-y-5">
        <CurrencySelector value={currency} onChange={onCurrencyChange} />

        {mode === "bond" ? (
          <ToolInput
            label={`${t("form.dueAmountLabel")} (${currency})`}
            type="text"
            inputMode="decimal"
            placeholder={t("form.dueAmountPlaceholder")}
            value={dueAmount}
            onChange={(e) => onDueAmountChange(e.target.value)}
          />
        ) : (
          <ToolInput
            label={`${t("form.loanAmountLabel")} (${currency})`}
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

        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("form.loanTermLabel")}</span>
            <div className="inline-flex rounded-lg border border-zinc-200 p-0.5 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => onTermUnitChange("years")}
                className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition ${
                  termUnit === "years" ? "bg-blue-600 text-white" : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                }`}
              >
                {t("form.termUnitYears")}
              </button>
              <button
                type="button"
                onClick={() => onTermUnitChange("months")}
                className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition ${
                  termUnit === "months" ? "bg-blue-600 text-white" : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                }`}
              >
                {t("form.termUnitMonths")}
              </button>
            </div>
          </div>
          <ToolInput type="text" inputMode="decimal" placeholder={t("form.loanTermPlaceholder")} value={termValue} onChange={(e) => onTermValueChange(e.target.value)} />
        </div>

        <label className="block space-y-2">
          <span className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("form.compoundLabel")}</span>
          <select
            value={compoundFrequency}
            onChange={(e) => onCompoundFrequencyChange(e.target.value as CompoundingFrequency)}
            className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-blue-500 dark:focus:ring-blue-500/20"
          >
            {COMPOUND_FREQUENCIES.map((value) => (
              <option key={value} value={value}>
                {t(`form.frequency.${value}`)}
              </option>
            ))}
          </select>
        </label>

        {mode === "amortized" && (
          <label className="block space-y-2">
            <span className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("form.payBackLabel")}</span>
            <select
              value={paymentFrequency}
              onChange={(e) => onPaymentFrequencyChange(e.target.value as PaymentFrequency)}
              className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-blue-500 dark:focus:ring-blue-500/20"
            >
              {PAYMENT_FREQUENCIES.map((value) => (
                <option key={value} value={value}>
                  {t(`form.payFrequency.${value}`)}
                </option>
              ))}
            </select>
          </label>
        )}

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
