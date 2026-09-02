"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import ToolInput from "@/components/tool-ui/ToolInput";

type BalancerInputPanelProps = {
  equation: string;
  onEquationChange: (value: string) => void;
};

export default function BalancerInputPanel({ equation, onEquationChange }: BalancerInputPanelProps) {
  const t = useTranslations("tools.chemical-equation-balancer.form");

  return (
    <SectionCard title={t("inputTitle")}>
      <ToolInput
        label={t("equationLabel")}
        hint={t("equationHint")}
        type="text"
        dir="ltr"
        placeholder={t("equationPlaceholder")}
        value={equation}
        onChange={(e) => onEquationChange(e.target.value)}
      />
    </SectionCard>
  );
}
