"use client";
import type { FormEvent } from "react";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import ToolInput from "@/components/tool-ui/ToolInput";
import ToolButton from "@/components/tool-ui/ToolButton";
import type { BreakEvenMode } from "./types";

type BreakEvenInputPanelProps = {
  mode: BreakEvenMode;
  fixedCosts: string;
  onFixedCostsChange: (value: string) => void;
  variableCostPerUnit: string;
  onVariableCostPerUnitChange: (value: string) => void;
  pricePerUnit: string;
  onPricePerUnitChange: (value: string) => void;
  targetProfit: string;
  onTargetProfitChange: (value: string) => void;
  onCalculate: (e: FormEvent<HTMLFormElement>) => void;
  onClear: () => void;
};

export default function BreakEvenInputPanel({
  mode,
  fixedCosts,
  onFixedCostsChange,
  variableCostPerUnit,
  onVariableCostPerUnitChange,
  pricePerUnit,
  onPricePerUnitChange,
  targetProfit,
  onTargetProfitChange,
  onCalculate,
  onClear,
}: BreakEvenInputPanelProps) {
  const t = useTranslations("tools.break-even-calculator.form");

  return (
    <SectionCard title={t("inputTitle")}>
      <form onSubmit={onCalculate} className="space-y-5">
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
        <ToolInput label={t("pricePerUnit")} type="text" inputMode="decimal" value={pricePerUnit} onChange={(e) => onPricePerUnitChange(e.target.value)} />

        {mode === "targetProfit" && (
          <ToolInput
            label={t("targetProfit")}
            hint={t("targetProfitHint")}
            type="text"
            inputMode="decimal"
            placeholder={t("targetProfitPlaceholder")}
            value={targetProfit}
            onChange={(e) => onTargetProfitChange(e.target.value)}
          />
        )}

        <div className="flex flex-wrap gap-4">
          <ToolButton type="submit">{t("calculate")}</ToolButton>
          <button
            type="button"
            onClick={onClear}
            className="rounded-xl border border-zinc-300 px-6 py-3 font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            {t("clear")}
          </button>
        </div>
      </form>
    </SectionCard>
  );
}
