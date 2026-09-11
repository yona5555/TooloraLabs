"use client";
import { useTranslations } from "next-intl";
import { RotateCcw } from "lucide-react";
import SectionCard from "@/components/tool-ui/SectionCard";
import ToolInput from "@/components/tool-ui/ToolInput";
import { FRACTION_SCENARIOS, type FractionOperation, type FractionScenario } from "./types";

const OPERATIONS: FractionOperation[] = ["add", "subtract", "multiply", "divide"];

type FractionInputPanelProps = {
  operation: FractionOperation;
  onOperationChange: (operation: FractionOperation) => void;
  numeratorA: string;
  onNumeratorAChange: (value: string) => void;
  denominatorA: string;
  onDenominatorAChange: (value: string) => void;
  numeratorB: string;
  onNumeratorBChange: (value: string) => void;
  denominatorB: string;
  onDenominatorBChange: (value: string) => void;
  onClear: () => void;
  onScenarioPreset: (scenario: FractionScenario) => void;
};

export default function FractionInputPanel({
  operation,
  onOperationChange,
  numeratorA,
  onNumeratorAChange,
  denominatorA,
  onDenominatorAChange,
  numeratorB,
  onNumeratorBChange,
  denominatorB,
  onDenominatorBChange,
  onClear,
  onScenarioPreset,
}: FractionInputPanelProps) {
  const t = useTranslations("tools.fraction-calculator.form");
  const tScenarios = useTranslations("tools.fraction-calculator.scenarios");

  return (
    <SectionCard title={t("inputTitle")}>
      <div className="mb-5">
        <span className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("scenarioLabel")}</span>
        <div className="flex flex-wrap gap-2">
          {FRACTION_SCENARIOS.map((scenario) => (
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

      <label className="block space-y-2">
        <span className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("operationLabel")}</span>
        <select
          value={operation}
          onChange={(e) => onOperationChange(e.target.value as FractionOperation)}
          className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-blue-500 dark:focus:ring-blue-500/20"
        >
          {OPERATIONS.map((op) => (
            <option key={op} value={op}>
              {t(`operation.${op}`)}
            </option>
          ))}
        </select>
      </label>

      <div className="mt-5 space-y-3">
        <span className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("fractionALabel")}</span>
        <div dir="ltr" className="grid grid-cols-2 gap-3">
          <ToolInput
            aria-label={t("numeratorLabel")}
            type="text"
            inputMode="decimal"
            placeholder={t("numeratorPlaceholder")}
            value={numeratorA}
            onChange={(e) => onNumeratorAChange(e.target.value)}
          />
          <ToolInput
            aria-label={t("denominatorLabel")}
            type="text"
            inputMode="decimal"
            placeholder={t("denominatorPlaceholder")}
            value={denominatorA}
            onChange={(e) => onDenominatorAChange(e.target.value)}
          />
        </div>
      </div>

      <div className="mt-5 space-y-3">
        <span className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("fractionBLabel")}</span>
        <div dir="ltr" className="grid grid-cols-2 gap-3">
          <ToolInput
            aria-label={t("numeratorLabel")}
            type="text"
            inputMode="decimal"
            placeholder={t("numeratorPlaceholder")}
            value={numeratorB}
            onChange={(e) => onNumeratorBChange(e.target.value)}
          />
          <ToolInput
            aria-label={t("denominatorLabel")}
            type="text"
            inputMode="decimal"
            placeholder={t("denominatorPlaceholder")}
            value={denominatorB}
            onChange={(e) => onDenominatorBChange(e.target.value)}
          />
        </div>
      </div>

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
