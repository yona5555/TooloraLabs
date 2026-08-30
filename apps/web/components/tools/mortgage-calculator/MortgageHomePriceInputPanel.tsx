"use client";
import type { FormEvent } from "react";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import ToolInput from "@/components/tool-ui/ToolInput";
import ToolButton from "@/components/tool-ui/ToolButton";

type MortgageHomePriceInputPanelProps = {
  annualIncome: string;
  onAnnualIncomeChange: (value: string) => void;
  monthlyDebts: string;
  onMonthlyDebtsChange: (value: string) => void;
  downPayment: string;
  onDownPaymentChange: (value: string) => void;
  interestRate: string;
  onInterestRateChange: (value: string) => void;
  loanTermYears: string;
  onLoanTermYearsChange: (value: string) => void;
  propertyTaxRate: string;
  onPropertyTaxRateChange: (value: string) => void;
  annualInsurance: string;
  onAnnualInsuranceChange: (value: string) => void;
  monthlyHoa: string;
  onMonthlyHoaChange: (value: string) => void;
  onCalculate: (e: FormEvent<HTMLFormElement>) => void;
  onClear: () => void;
};

export default function MortgageHomePriceInputPanel({
  annualIncome,
  onAnnualIncomeChange,
  monthlyDebts,
  onMonthlyDebtsChange,
  downPayment,
  onDownPaymentChange,
  interestRate,
  onInterestRateChange,
  loanTermYears,
  onLoanTermYearsChange,
  propertyTaxRate,
  onPropertyTaxRateChange,
  annualInsurance,
  onAnnualInsuranceChange,
  monthlyHoa,
  onMonthlyHoaChange,
  onCalculate,
  onClear,
}: MortgageHomePriceInputPanelProps) {
  const t = useTranslations("tools.mortgage-calculator.homePriceMode");

  return (
    <SectionCard title={t("inputTitle")}>
      <form onSubmit={onCalculate} className="space-y-5">
        <ToolInput
          label={t("form.annualIncomeLabel")}
          type="text"
          inputMode="decimal"
          placeholder={t("form.annualIncomePlaceholder")}
          value={annualIncome}
          onChange={(e) => onAnnualIncomeChange(e.target.value)}
        />
        <ToolInput
          label={t("form.monthlyDebtsLabel")}
          type="text"
          inputMode="decimal"
          placeholder={t("form.monthlyDebtsPlaceholder")}
          value={monthlyDebts}
          onChange={(e) => onMonthlyDebtsChange(e.target.value)}
        />
        <ToolInput
          label={t("form.downPaymentLabel")}
          type="text"
          inputMode="decimal"
          placeholder={t("form.downPaymentPlaceholder")}
          value={downPayment}
          onChange={(e) => onDownPaymentChange(e.target.value)}
        />
        <div className="grid grid-cols-2 gap-4">
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
        </div>
        <ToolInput
          label={t("form.propertyTaxRateLabel")}
          hint={t("form.propertyTaxRateHint")}
          type="text"
          inputMode="decimal"
          placeholder={t("form.propertyTaxRatePlaceholder")}
          value={propertyTaxRate}
          onChange={(e) => onPropertyTaxRateChange(e.target.value)}
        />
        <div className="grid grid-cols-2 gap-4">
          <ToolInput
            label={t("form.annualInsuranceLabel")}
            type="text"
            inputMode="decimal"
            placeholder={t("form.annualInsurancePlaceholder")}
            value={annualInsurance}
            onChange={(e) => onAnnualInsuranceChange(e.target.value)}
          />
          <ToolInput
            label={t("form.monthlyHoaLabel")}
            type="text"
            inputMode="decimal"
            placeholder={t("form.monthlyHoaPlaceholder")}
            value={monthlyHoa}
            onChange={(e) => onMonthlyHoaChange(e.target.value)}
          />
        </div>

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
