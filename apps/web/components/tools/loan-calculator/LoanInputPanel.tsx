"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import ToolInput from "@/components/tool-ui/ToolInput";

type LoanInputPanelProps = {
  loanAmount: string;
  onLoanAmountChange: (value: string) => void;
  interestRate: string;
  onInterestRateChange: (value: string) => void;
  loanTermYears: string;
  onLoanTermYearsChange: (value: string) => void;
};

export default function LoanInputPanel({
  loanAmount,
  onLoanAmountChange,
  interestRate,
  onInterestRateChange,
  loanTermYears,
  onLoanTermYearsChange,
}: LoanInputPanelProps) {
  const t = useTranslations("tools.loan-calculator");

  return (
    <SectionCard title={t("aboveFold.inputTitle")}>
      <div className="space-y-5">
        <ToolInput
          label={t("form.loanAmountLabel")}
          type="text"
          inputMode="decimal"
          placeholder={t("form.loanAmountPlaceholder")}
          value={loanAmount}
          onChange={(e) => onLoanAmountChange(e.target.value)}
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
