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
  scenarioKeys: string[];
  onScenarioPreset: (key: string) => void;
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

export default function MolarMassInputPanel({ formula, onFormulaChange, scenarioKeys, onScenarioPreset, onCalculate, onClear }: MolarMassInputPanelProps) {
  const t = useTranslations("tools.molar-mass-calculator.form");
  const tScenarios = useTranslations("tools.molar-mass-calculator.form.scenarios");
  const elements = safeParse(formula);

  return (
    <SectionCard title={t("inputTitle")}>
      <div className="mb-5">
        <span className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("scenarioPresetsLabel")}</span>
        <div className="flex flex-wrap gap-2">
          {scenarioKeys.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => onScenarioPreset(key)}
              className="rounded-lg border border-zinc-300 bg-transparent px-3 py-1.5 text-xs font-medium text-zinc-600 transition hover:border-blue-400 hover:text-blue-600 sm:text-sm dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-blue-400 dark:hover:text-blue-400"
            >
              {tScenarios(key)}
            </button>
          ))}
        </div>
      </div>

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
