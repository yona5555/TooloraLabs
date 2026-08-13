"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import ToolInput from "@/components/tool-ui/ToolInput";

type BreakEvenInputPanelProps = {
  fixedCosts: string;
  onFixedCostsChange: (value: string) => void;
  variableCostPerUnit: string;
  onVariableCostPerUnitChange: (value: string) => void;
  pricePerUnit: string;
  onPricePerUnitChange: (value: string) => void;
  targetProfit: string;
  onTargetProfitChange: (value: string) => void;
};

export default function BreakEvenInputPanel({
  fixedCosts,
  onFixedCostsChange,
  variableCostPerUnit,
  onVariableCostPerUnitChange,
  pricePerUnit,
  onPricePerUnitChange,
  targetProfit,
  onTargetProfitChange,
}: BreakEvenInputPanelProps) {
  const t = useTranslations("tools.break-even-calculator.form");

  return (
    <SectionCard title={t("inputTitle")}>
      <div className="space-y-5">
        <ToolInput
          label={t("fixedCosts")}
          hint={t("fixedCostsHint")}
          type="text"
          inputMode="decimal"
          value={fixedCosts}
          onChange={(e) => onFixedCostsChange(e.target.value)}
        />
        <ToolInput
          label={t("variableCostPerUnit")}
          hint={t("variableCostHint")}
          type="text"
          inputMode="decimal"
          value={variableCostPerUnit}
          onChange={(e) => onVariableCostPerUnitChange(e.target.value)}
        />
        <ToolInput
          label={t("pricePerUnit")}
          type="text"
          inputMode="decimal"
          value={pricePerUnit}
          onChange={(e) => onPricePerUnitChange(e.target.value)}
        />
        <ToolInput
          label={t("targetProfit")}
          hint={t("targetProfitHint")}
          type="text"
          inputMode="decimal"
          placeholder={t("targetProfitPlaceholder")}
          value={targetProfit}
          onChange={(e) => onTargetProfitChange(e.target.value)}
        />
      </div>
    </SectionCard>
  );
}
