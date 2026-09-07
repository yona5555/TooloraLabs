"use client";
import type { FormEvent } from "react";
import { useTranslations } from "next-intl";
import { parseFormula } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import ToolInput from "@/components/tool-ui/ToolInput";
import ToolButton from "@/components/tool-ui/ToolButton";
import MolarMassFormulaBreakdownDiagram from "./MolarMassFormulaBreakdownDiagram";

type MolarMassInputPanelProps = {
  formula: string;
  onFormulaChange: (value: string) => void;
  onCalculate: (e: FormEvent<HTMLFormElement>) => void;
  onClear: () => void;
};

function safeParse(formula: string): { symbol: string; count: number }[] {
  try {
    const counts = parseFormula(formula);
    return Object.entries(counts).map(([symbol, count]) => ({ symbol, count }));
  } catch {
    return [];
  }
}

export default function MolarMassInputPanel({ formula, onFormulaChange, onCalculate, onClear }: MolarMassInputPanelProps) {
  const t = useTranslations("tools.molar-mass-calculator.form");
  const elements = safeParse(formula);

  return (
    <SectionCard title={t("inputTitle")}>
      <MolarMassFormulaBreakdownDiagram elements={elements} caption={t("breakdownDiagramCaption")} />

      <form onSubmit={onCalculate} className="mt-4 space-y-5">
        <ToolInput
          label={t("formulaLabel")}
          hint={t("formulaHint")}
          type="text"
          dir="ltr"
          placeholder={t("formulaPlaceholder")}
          value={formula}
          onChange={(e) => onFormulaChange(e.target.value)}
        />

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
