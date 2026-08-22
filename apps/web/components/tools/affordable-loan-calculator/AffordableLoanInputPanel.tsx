"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import ToolInput from "@/components/tool-ui/ToolInput";

type AffordableLoanInputPanelProps = {
  monthlyPayment: string;
  onMonthlyPaymentChange: (value: string) => void;
  interestRate: string;
  onInterestRateChange: (value: string) => void;
  loanTermYears: string;
  onLoanTermYearsChange: (value: string) => void;
};

export default function AffordableLoanInputPanel({
  monthlyPayment,
  onMonthlyPaymentChange,
  interestRate,
  onInterestRateChange,
  loanTermYears,
  onLoanTermYearsChange,
}: AffordableLoanInputPanelProps) {
  const t = useTranslations("tools.affordable-loan-calculator");

  return (
    <SectionCard title={t("aboveFold.inputTitle")}>
      <div className="space-y-5">
        <ToolInput
          label={t("form.monthlyPaymentLabel")}
          hint={t("form.monthlyPaymentHint")}
          type="text"
          inputMode="decimal"
          placeholder={t("form.monthlyPaymentPlaceholder")}
          value={monthlyPayment}
          onChange={(e) => onMonthlyPaymentChange(e.target.value)}
        />

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
    </SectionCard>
  );
}
