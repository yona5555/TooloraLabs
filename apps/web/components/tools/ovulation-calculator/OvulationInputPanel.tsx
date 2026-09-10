"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { RotateCcw } from "lucide-react";
import SectionCard from "@/components/tool-ui/SectionCard";
import ToolInput from "@/components/tool-ui/ToolInput";
import { OVULATION_SCENARIOS, type OvulationScenario } from "./types";

type Props = {
  lastPeriodDate: string;
  onLastPeriodDateChange: (value: string) => void;
  cycleLengthDays: string;
  onCycleLengthDaysChange: (value: string) => void;
  lutealPhaseDays: string;
  onLutealPhaseDaysChange: (value: string) => void;
  onScenarioPreset: (scenario: OvulationScenario) => void;
  onClear: () => void;
};

export default function OvulationInputPanel({
  lastPeriodDate,
  onLastPeriodDateChange,
  cycleLengthDays,
  onCycleLengthDaysChange,
  lutealPhaseDays,
  onLutealPhaseDaysChange,
  onScenarioPreset,
  onClear,
}: Props) {
  const t = useTranslations("tools.ovulation-calculator.form");
  const tScenarios = useTranslations("tools.ovulation-calculator.scenarios");
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <SectionCard title={t("inputTitle")}>
      <div className="mb-5">
        <span className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("scenarioLabel")}</span>
        <div className="flex flex-wrap gap-2">
          {OVULATION_SCENARIOS.map((scenario) => (
            <button
              key={scenario.key}
              type="button"
              onClick={() => onScenarioPreset(scenario)}
              className="rounded-lg border border-current/20 bg-transparent px-3 py-1.5 text-xs font-medium text-current/70 transition hover:border-blue-300 hover:text-current sm:text-sm"
            >
              {tScenarios(scenario.key)}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-3">
        <ToolInput label={t("lastPeriodDate")} type="date" value={lastPeriodDate} onChange={(e) => onLastPeriodDateChange(e.target.value)} />
        <ToolInput
          label={t("cycleLengthDays")}
          type="text"
          inputMode="numeric"
          value={cycleLengthDays}
          onChange={(e) => onCycleLengthDaysChange(e.target.value)}
        />

        {showAdvanced ? (
          <ToolInput
            label={t("lutealPhaseDays")}
            type="text"
            inputMode="numeric"
            value={lutealPhaseDays}
            onChange={(e) => onLutealPhaseDaysChange(e.target.value)}
          />
        ) : (
          <button type="button" onClick={() => setShowAdvanced(true)} className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400">
            {t("showAdvanced")}
          </button>
        )}
      </div>
      <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">{t("hint")}</p>

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
