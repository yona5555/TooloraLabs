"use client";
import type { FormEvent } from "react";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import ToolInput from "@/components/tool-ui/ToolInput";
import ToolButton from "@/components/tool-ui/ToolButton";
import StoichiometryEquationDiagram from "./StoichiometryEquationDiagram";
import type { AmountUnit } from "./types";

const selectClassName =
  "w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-blue-500 dark:focus:ring-blue-500/20";

type StoichiometryInputPanelProps = {
  knownFormula: string;
  onKnownFormulaChange: (value: string) => void;
  knownCoefficient: string;
  onKnownCoefficientChange: (value: string) => void;
  knownAmount: string;
  onKnownAmountChange: (value: string) => void;
  knownUnit: AmountUnit;
  onKnownUnitChange: (value: AmountUnit) => void;
  targetFormula: string;
  onTargetFormulaChange: (value: string) => void;
  targetCoefficient: string;
  onTargetCoefficientChange: (value: string) => void;
  targetUnit: AmountUnit;
  onTargetUnitChange: (value: AmountUnit) => void;
  scenarioKeys: string[];
  onScenarioPreset: (key: string) => void;
  onCalculate: (e: FormEvent<HTMLFormElement>) => void;
  onClear: () => void;
};

export default function StoichiometryInputPanel({
  knownFormula,
  onKnownFormulaChange,
  knownCoefficient,
  onKnownCoefficientChange,
  knownAmount,
  onKnownAmountChange,
  knownUnit,
  onKnownUnitChange,
  targetFormula,
  onTargetFormulaChange,
  targetCoefficient,
  onTargetCoefficientChange,
  targetUnit,
  onTargetUnitChange,
  scenarioKeys,
  onScenarioPreset,
  onCalculate,
  onClear,
}: StoichiometryInputPanelProps) {
  const t = useTranslations("tools.stoichiometry-calculator.form");
  const tScenarios = useTranslations("tools.stoichiometry-calculator.form.scenarios");

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

      <StoichiometryEquationDiagram
        knownCoefficient={knownCoefficient}
        knownFormula={knownFormula}
        targetCoefficient={targetCoefficient}
        targetFormula={targetFormula}
        caption={t("equationDiagramCaption")}
      />

      <form onSubmit={onCalculate} className="mt-4 space-y-6">
        <div>
          <p className="mb-3 text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("knownLabel")}</p>
          <div className="space-y-3">
            <ToolInput label={t("formulaLabel")} dir="ltr" value={knownFormula} onChange={(e) => onKnownFormulaChange(e.target.value)} placeholder={t("knownFormulaPlaceholder")} />
            <ToolInput label={t("coefficientLabel")} type="text" inputMode="numeric" value={knownCoefficient} onChange={(e) => onKnownCoefficientChange(e.target.value)} />
            <div className="grid grid-cols-2 gap-3">
              <ToolInput label={t("amountLabel")} type="text" inputMode="decimal" value={knownAmount} onChange={(e) => onKnownAmountChange(e.target.value)} />
              <label className="block space-y-2">
                <span className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("unitLabel")}</span>
                <select value={knownUnit} onChange={(e) => onKnownUnitChange(e.target.value as AmountUnit)} className={selectClassName}>
                  <option value="grams">{t("unit.grams")}</option>
                  <option value="moles">{t("unit.moles")}</option>
                </select>
              </label>
            </div>
          </div>
        </div>

        <div>
          <p className="mb-3 text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("targetLabel")}</p>
          <div className="space-y-3">
            <ToolInput label={t("formulaLabel")} dir="ltr" value={targetFormula} onChange={(e) => onTargetFormulaChange(e.target.value)} placeholder={t("targetFormulaPlaceholder")} />
            <ToolInput label={t("coefficientLabel")} type="text" inputMode="numeric" value={targetCoefficient} onChange={(e) => onTargetCoefficientChange(e.target.value)} />
            <label className="block space-y-2">
              <span className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("unitLabel")}</span>
              <select value={targetUnit} onChange={(e) => onTargetUnitChange(e.target.value as AmountUnit)} className={selectClassName}>
                <option value="grams">{t("unit.grams")}</option>
                <option value="moles">{t("unit.moles")}</option>
              </select>
            </label>
          </div>
        </div>

        <p className="text-xs text-zinc-500 dark:text-zinc-400">{t("coefficientHint")}</p>

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
