"use client";
import { useTranslations } from "next-intl";
import { RotateCcw } from "lucide-react";
import SectionCard from "@/components/tool-ui/SectionCard";
import ToolInput from "@/components/tool-ui/ToolInput";
import { HEART_RATE_SCENARIOS, type HeartRateScenario } from "./types";

type Props = {
  age: string;
  onAgeChange: (value: string) => void;
  useRestingHeartRate: boolean;
  onUseRestingHeartRateChange: (value: boolean) => void;
  restingHeartRate: string;
  onRestingHeartRateChange: (value: string) => void;
  onScenarioPreset: (scenario: HeartRateScenario) => void;
  onClear: () => void;
};

export default function TargetHeartRateInputPanel({
  age,
  onAgeChange,
  useRestingHeartRate,
  onUseRestingHeartRateChange,
  restingHeartRate,
  onRestingHeartRateChange,
  onScenarioPreset,
  onClear,
}: Props) {
  const t = useTranslations("tools.target-heart-rate-calculator.form");
  const tScenarios = useTranslations("tools.target-heart-rate-calculator.scenarios");

  return (
    <SectionCard title={t("inputTitle")}>
      <div className="mb-5">
        <span className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("scenarioLabel")}</span>
        <div className="flex flex-wrap gap-2">
          {HEART_RATE_SCENARIOS.map((scenario) => (
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
        <ToolInput label={t("age")} type="text" inputMode="numeric" value={age} onChange={(e) => onAgeChange(e.target.value)} />

        <label className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300">
          <input
            type="checkbox"
            checked={useRestingHeartRate}
            onChange={(e) => onUseRestingHeartRateChange(e.target.checked)}
            className="h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500 dark:border-zinc-600"
          />
          {t("useRestingHeartRate")}
        </label>

        {useRestingHeartRate && (
          <ToolInput
            label={t("restingHeartRate")}
            type="text"
            inputMode="numeric"
            value={restingHeartRate}
            onChange={(e) => onRestingHeartRateChange(e.target.value)}
          />
        )}
      </div>
      <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">{useRestingHeartRate ? t("hintKarvonen") : t("hintSimple")}</p>

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
