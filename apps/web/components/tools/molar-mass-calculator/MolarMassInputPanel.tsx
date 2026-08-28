"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import ToolInput from "@/components/tool-ui/ToolInput";

type MolarMassInputPanelProps = {
  formula: string;
  onFormulaChange: (value: string) => void;
};

export default function MolarMassInputPanel({ formula, onFormulaChange }: MolarMassInputPanelProps) {
  const t = useTranslations("tools.molar-mass-calculator.form");

  return (
    <SectionCard title={t("inputTitle")}>
      <ToolInput
        label={t("formulaLabel")}
        hint={t("formulaHint")}
        type="text"
        dir="ltr"
        placeholder={t("formulaPlaceholder")}
        value={formula}
        onChange={(e) => onFormulaChange(e.target.value)}
      />
    </SectionCard>
  );
}
