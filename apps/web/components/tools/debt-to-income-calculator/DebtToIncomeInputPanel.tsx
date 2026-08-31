"use client";
import type { FormEvent } from "react";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import ToolInput from "@/components/tool-ui/ToolInput";
import ToolButton from "@/components/tool-ui/ToolButton";
import CurrencySelector from "@/components/tool-ui/CurrencySelector";
import type { CurrencyCode } from "@/lib/currency";
import type { DtiMode } from "./types";

type DebtToIncomeInputPanelProps = {
  mode: DtiMode;
  currency: CurrencyCode;
  onCurrencyChange: (value: CurrencyCode) => void;
  monthlyGrossIncome: string;
  onMonthlyGrossIncomeChange: (value: string) => void;
  housingPayment: string;
  onHousingPaymentChange: (value: string) => void;
  carPayments: string;
  onCarPaymentsChange: (value: string) => void;
  studentLoanPayments: string;
  onStudentLoanPaymentsChange: (value: string) => void;
  creditCardPayments: string;
  onCreditCardPaymentsChange: (value: string) => void;
  otherPayments: string;
  onOtherPaymentsChange: (value: string) => void;
  targetBackEndRatio: string;
  onTargetBackEndRatioChange: (value: string) => void;
  existingMonthlyDebt: string;
  onExistingMonthlyDebtChange: (value: string) => void;
  proposedMonthlyPayment: string;
  onProposedMonthlyPaymentChange: (value: string) => void;
  onCalculate: (e: FormEvent<HTMLFormElement>) => void;
  onClear: () => void;
};

export default function DebtToIncomeInputPanel({
  mode,
  currency,
  onCurrencyChange,
  monthlyGrossIncome,
  onMonthlyGrossIncomeChange,
  housingPayment,
  onHousingPaymentChange,
  carPayments,
  onCarPaymentsChange,
  studentLoanPayments,
  onStudentLoanPaymentsChange,
  creditCardPayments,
  onCreditCardPaymentsChange,
  otherPayments,
  onOtherPaymentsChange,
  targetBackEndRatio,
  onTargetBackEndRatioChange,
  existingMonthlyDebt,
  onExistingMonthlyDebtChange,
  proposedMonthlyPayment,
  onProposedMonthlyPaymentChange,
  onCalculate,
  onClear,
}: DebtToIncomeInputPanelProps) {
  const t = useTranslations("tools.debt-to-income-calculator");

  return (
    <SectionCard title={t("aboveFold.inputTitle")}>
      <form onSubmit={onCalculate} className="space-y-5">
        <CurrencySelector value={currency} onChange={onCurrencyChange} />

        <ToolInput
          label={`${t("form.monthlyGrossIncomeLabel")} (${currency})`}
          type="text"
          inputMode="decimal"
          placeholder={t("form.monthlyGrossIncomePlaceholder")}
          value={monthlyGrossIncome}
          onChange={(e) => onMonthlyGrossIncomeChange(e.target.value)}
        />

        {mode !== "maxDebt" ? (
          <>
            <ToolInput
              label={`${t("form.housingPaymentLabel")} (${currency})`}
              hint={t("form.housingPaymentHint")}
              type="text"
              inputMode="decimal"
              placeholder={t("form.housingPaymentPlaceholder")}
              value={housingPayment}
              onChange={(e) => onHousingPaymentChange(e.target.value)}
            />

            <div className="grid grid-cols-2 gap-4">
              <ToolInput
                label={`${t("form.carPaymentsLabel")} (${currency})`}
                type="text"
                inputMode="decimal"
                placeholder={t("form.carPaymentsPlaceholder")}
                value={carPayments}
                onChange={(e) => onCarPaymentsChange(e.target.value)}
              />
              <ToolInput
                label={`${t("form.studentLoanPaymentsLabel")} (${currency})`}
                type="text"
                inputMode="decimal"
                placeholder={t("form.studentLoanPaymentsPlaceholder")}
                value={studentLoanPayments}
                onChange={(e) => onStudentLoanPaymentsChange(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <ToolInput
                label={`${t("form.creditCardPaymentsLabel")} (${currency})`}
                type="text"
                inputMode="decimal"
                placeholder={t("form.creditCardPaymentsPlaceholder")}
                value={creditCardPayments}
                onChange={(e) => onCreditCardPaymentsChange(e.target.value)}
              />
              <ToolInput
                label={`${t("form.otherPaymentsLabel")} (${currency})`}
                hint={t("form.otherPaymentsHint")}
                type="text"
                inputMode="decimal"
                placeholder={t("form.otherPaymentsPlaceholder")}
                value={otherPayments}
                onChange={(e) => onOtherPaymentsChange(e.target.value)}
              />
            </div>

            {mode === "scenario" && (
              <ToolInput
                label={`${t("form.proposedMonthlyPaymentLabel")} (${currency})`}
                hint={t("form.proposedMonthlyPaymentHint")}
                type="text"
                inputMode="decimal"
                placeholder={t("form.proposedMonthlyPaymentPlaceholder")}
                value={proposedMonthlyPayment}
                onChange={(e) => onProposedMonthlyPaymentChange(e.target.value)}
              />
            )}
          </>
        ) : (
          <>
            <ToolInput
              label={t("form.targetBackEndRatioLabel")}
              hint={t("form.targetBackEndRatioHint")}
              type="text"
              inputMode="decimal"
              placeholder={t("form.targetBackEndRatioPlaceholder")}
              value={targetBackEndRatio}
              onChange={(e) => onTargetBackEndRatioChange(e.target.value)}
            />
            <ToolInput
              label={`${t("form.existingMonthlyDebtLabel")} (${currency})`}
              hint={t("form.existingMonthlyDebtHint")}
              type="text"
              inputMode="decimal"
              placeholder={t("form.existingMonthlyDebtPlaceholder")}
              value={existingMonthlyDebt}
              onChange={(e) => onExistingMonthlyDebtChange(e.target.value)}
            />
          </>
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
