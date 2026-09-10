"use client";
import { useTranslations } from "next-intl";
import { RotateCcw } from "lucide-react";
import SectionCard from "@/components/tool-ui/SectionCard";
import ToolInput from "@/components/tool-ui/ToolInput";
import SleepModeTabs from "./SleepModeTabs";
import { SLEEP_SCENARIOS, type SleepMode, type SleepScenario } from "./types";

type Props = {
  mode: SleepMode;
  onModeChange: (mode: SleepMode) => void;
  time: string;
  onTimeChange: (value: string) => void;
  fallAsleepMinutes: string;
  onFallAsleepMinutesChange: (value: string) => void;
  onScenarioPreset: (scenario: SleepScenario) => void;
  onClear: () => void;
};

export default function SleepInputPanel({
  mode,
  onModeChange,
  time,
  onTimeChange,
  fallAsleepMinutes,
  onFallAsleepMinutesChange,
  onScenarioPreset,
  onClear,
}: Props) {
  const t = useTranslations("tools.sleep-calculator.form");
  const tScenarios = useTranslations("tools.sleep-calculator.scenarios");

  return (
    <SectionCard title={t("inputTitle")}>
      <div className="mb-5">
        <span className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("scenarioLabel")}</span>
        <div className="flex flex-wrap gap-2">
          {SLEEP_SCENARIOS.map((scenario) => (
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
      <div className="mb-4">
        <SleepModeTabs mode={mode} onModeChange={onModeChange} />
      </div>

      <div className="space-y-3">
        <ToolInput label={mode === "wakeUp" ? t("wakeUpTime") : t("bedtime")} type="time" value={time} onChange={(e) => onTimeChange(e.target.value)} />
        <ToolInput
          label={t("fallAsleepMinutes")}
          type="text"
          inputMode="numeric"
          value={fallAsleepMinutes}
          onChange={(e) => onFallAsleepMinutesChange(e.target.value)}
        />
      </div>
      <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">{mode === "wakeUp" ? t("hintWakeUp") : t("hintBedtime")}</p>

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
