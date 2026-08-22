"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import ToolInput from "@/components/tool-ui/ToolInput";

type HouseAffordabilityInputPanelProps = {
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
  annualHomeInsurance: string;
  onAnnualHomeInsuranceChange: (value: string) => void;
  monthlyHOA: string;
  onMonthlyHOAChange: (value: string) => void;
};

export default function HouseAffordabilityInputPanel({
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
  annualHomeInsurance,
  onAnnualHomeInsuranceChange,
  monthlyHOA,
  onMonthlyHOAChange,
}: HouseAffordabilityInputPanelProps) {
  const t = useTranslations("tools.house-affordability-calculator");

  return (
    <SectionCard title={t("aboveFold.inputTitle")}>
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
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
            hint={t("form.monthlyDebtsHint")}
            type="text"
            inputMode="decimal"
            placeholder={t("form.monthlyDebtsPlaceholder")}
            value={monthlyDebts}
            onChange={(e) => onMonthlyDebtsChange(e.target.value)}
          />
        </div>

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
            inputMode="numeric"
            placeholder={t("form.loanTermPlaceholder")}
            value={loanTermYears}
            onChange={(e) => onLoanTermYearsChange(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <ToolInput
            label={t("form.propertyTaxRateLabel")}
            hint={t("form.propertyTaxRateHint")}
            type="text"
            inputMode="decimal"
            placeholder={t("form.propertyTaxRatePlaceholder")}
            value={propertyTaxRate}
            onChange={(e) => onPropertyTaxRateChange(e.target.value)}
          />
          <ToolInput
            label={t("form.annualHomeInsuranceLabel")}
            type="text"
            inputMode="decimal"
            placeholder={t("form.annualHomeInsurancePlaceholder")}
            value={annualHomeInsurance}
            onChange={(e) => onAnnualHomeInsuranceChange(e.target.value)}
          />
        </div>

        <ToolInput
          label={t("form.monthlyHOALabel")}
          hint={t("form.monthlyHOAHint")}
          type="text"
          inputMode="decimal"
          placeholder={t("form.monthlyHOAPlaceholder")}
          value={monthlyHOA}
          onChange={(e) => onMonthlyHOAChange(e.target.value)}
        />
      </div>
    </SectionCard>
  );
}
