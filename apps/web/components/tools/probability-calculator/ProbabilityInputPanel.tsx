"use client";
import { useTranslations } from "next-intl";
import { RotateCcw } from "lucide-react";
import SectionCard from "@/components/tool-ui/SectionCard";
import ToolInput from "@/components/tool-ui/ToolInput";
import ProbabilityModeTabs from "./ProbabilityModeTabs";
import { PROBABILITY_SCENARIOS, type ProbabilityMode, type ProbabilityScenario } from "./types";

export type ProbabilityFields = {
  favorable: string;
  total: string;
  pA: string;
  pB: string;
  pBoth: string;
  pAAndB: string;
};

type Props = {
  mode: ProbabilityMode;
  onModeChange: (mode: ProbabilityMode) => void;
  fields: ProbabilityFields;
  onFieldChange: (field: keyof ProbabilityFields, value: string) => void;
  onClear: () => void;
  onScenarioPreset: (scenario: ProbabilityScenario) => void;
};

export default function ProbabilityInputPanel({ mode, onModeChange, fields, onFieldChange, onClear, onScenarioPreset }: Props) {
  const t = useTranslations("tools.probability-calculator.form");
  const tScenarios = useTranslations("tools.probability-calculator.scenarios");

  return (
    <SectionCard title={t("inputTitle")}>
      <div className="mb-4">
        <ProbabilityModeTabs mode={mode} onModeChange={onModeChange} />
      </div>

      {mode === "single" && (
        <div className="mb-4">
          <span className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("scenarioLabel")}</span>
          <div className="flex flex-wrap gap-2">
            {PROBABILITY_SCENARIOS.map((scenario) => (
              <button
                key={scenario.key}
                type="button"
                onClick={() => onScenarioPreset(scenario)}
                className="rounded-lg border border-zinc-300 bg-transparent px-3 py-1.5 text-xs font-medium text-zinc-600 transition hover:border-blue-300 hover:text-blue-600 dark:border-zinc-700 dark:text-zinc-300 sm:text-sm"
              >
                {tScenarios(scenario.key)}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3">
        {mode === "single" && (
          <>
            <ToolInput label={t("fields.favorable")} type="text" inputMode="decimal" value={fields.favorable} onChange={(e) => onFieldChange("favorable", e.target.value)} />
            <ToolInput label={t("fields.total")} type="text" inputMode="decimal" value={fields.total} onChange={(e) => onFieldChange("total", e.target.value)} />
          </>
        )}

        {mode === "and" && (
          <>
            <ToolInput label={t("fields.pA")} type="text" inputMode="decimal" value={fields.pA} onChange={(e) => onFieldChange("pA", e.target.value)} />
            <ToolInput label={t("fields.pB")} type="text" inputMode="decimal" value={fields.pB} onChange={(e) => onFieldChange("pB", e.target.value)} />
          </>
        )}

        {mode === "or" && (
          <>
            <ToolInput label={t("fields.pA")} type="text" inputMode="decimal" value={fields.pA} onChange={(e) => onFieldChange("pA", e.target.value)} />
            <ToolInput label={t("fields.pB")} type="text" inputMode="decimal" value={fields.pB} onChange={(e) => onFieldChange("pB", e.target.value)} />
            <ToolInput label={t("fields.pBoth")} type="text" inputMode="decimal" value={fields.pBoth} onChange={(e) => onFieldChange("pBoth", e.target.value)} />
          </>
        )}

        {mode === "conditional" && (
          <>
            <ToolInput label={t("fields.pAAndB")} type="text" inputMode="decimal" value={fields.pAAndB} onChange={(e) => onFieldChange("pAAndB", e.target.value)} />
            <ToolInput label={t("fields.pB")} type="text" inputMode="decimal" value={fields.pB} onChange={(e) => onFieldChange("pB", e.target.value)} />
          </>
        )}
      </div>
      <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">{t(`hints.${mode}`)}</p>

      <button
        type="button"
        onClick={onClear}
        className="mt-5 flex items-center gap-2 rounded-xl border border-zinc-300 px-4 py-2.5 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
      >
        <RotateCcw size={16} />
        {t("clear")}
      </button>
    </SectionCard>
  );
}
