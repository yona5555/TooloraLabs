"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import ToolInput from "@/components/tool-ui/ToolInput";

type RetirementInputPanelProps = {
  currentAge: string;
  onCurrentAgeChange: (value: string) => void;
  retirementAge: string;
  onRetirementAgeChange: (value: string) => void;
  currentSavings: string;
  onCurrentSavingsChange: (value: string) => void;
  monthlyContribution: string;
  onMonthlyContributionChange: (value: string) => void;
  annualReturnRate: string;
  onAnnualReturnRateChange: (value: string) => void;
};

export default function RetirementInputPanel({
  currentAge,
  onCurrentAgeChange,
  retirementAge,
  onRetirementAgeChange,
  currentSavings,
  onCurrentSavingsChange,
  monthlyContribution,
  onMonthlyContributionChange,
  annualReturnRate,
  onAnnualReturnRateChange,
}: RetirementInputPanelProps) {
  const t = useTranslations("tools.retirement-calculator");

  return (
    <SectionCard title={t("aboveFold.inputTitle")}>
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <ToolInput
            label={t("form.currentAgeLabel")}
            type="text"
            inputMode="numeric"
            placeholder={t("form.currentAgePlaceholder")}
            value={currentAge}
            onChange={(e) => onCurrentAgeChange(e.target.value)}
          />
          <ToolInput
            label={t("form.retirementAgeLabel")}
            type="text"
            inputMode="numeric"
            placeholder={t("form.retirementAgePlaceholder")}
            value={retirementAge}
            onChange={(e) => onRetirementAgeChange(e.target.value)}
          />
        </div>

        <ToolInput
          label={t("form.currentSavingsLabel")}
          type="text"
          inputMode="decimal"
          placeholder={t("form.currentSavingsPlaceholder")}
          value={currentSavings}
          onChange={(e) => onCurrentSavingsChange(e.target.value)}
        />

        <ToolInput
          label={t("form.monthlyContributionLabel")}
          type="text"
          inputMode="decimal"
          placeholder={t("form.monthlyContributionPlaceholder")}
          value={monthlyContribution}
          onChange={(e) => onMonthlyContributionChange(e.target.value)}
        />

        <ToolInput
          label={t("form.annualReturnRateLabel")}
          hint={t("form.annualReturnRateHint")}
          type="text"
          inputMode="decimal"
          placeholder={t("form.annualReturnRatePlaceholder")}
          value={annualReturnRate}
          onChange={(e) => onAnnualReturnRateChange(e.target.value)}
        />
      </div>
    </SectionCard>
  );
}
