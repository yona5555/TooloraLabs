"use client";
import { useTranslations } from "next-intl";
import { RotateCcw } from "lucide-react";
import SectionCard from "@/components/tool-ui/SectionCard";
import TimeValueGroup from "./TimeValueGroup";
import { TIME_SCENARIOS, type TimeOperation, type TimeScenario } from "./types";

type Props = {
  h1: string; m1: string; s1: string;
  onH1Change: (v: string) => void; onM1Change: (v: string) => void; onS1Change: (v: string) => void;
  h2: string; m2: string; s2: string;
  onH2Change: (v: string) => void; onM2Change: (v: string) => void; onS2Change: (v: string) => void;
  operation: TimeOperation;
  onOperationChange: (op: TimeOperation) => void;
  onScenarioPreset: (scenario: TimeScenario) => void;
  onClear: () => void;
};

export default function TimeInputPanel({
  h1, m1, s1, onH1Change, onM1Change, onS1Change,
  h2, m2, s2, onH2Change, onM2Change, onS2Change,
  operation, onOperationChange,
  onScenarioPreset, onClear,
}: Props) {
  const t = useTranslations("tools.time-calculator.form");
  const tScenarios = useTranslations("tools.time-calculator.scenarios");

  return (
    <SectionCard title={t("inputTitle")}>
      <div className="mb-5">
        <span className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("scenarioLabel")}</span>
        <div className="flex flex-wrap gap-2">
          {TIME_SCENARIOS.map((scenario) => (
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
      <div className="space-y-4">
        <TimeValueGroup label={t("time1")} hours={h1} minutes={m1} seconds={s1} onHoursChange={onH1Change} onMinutesChange={onM1Change} onSecondsChange={onS1Change} />

        <div className="flex gap-2">
          {(["add", "subtract"] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => onOperationChange(value)}
              className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition ${
                operation === value
                  ? "border-blue-400 bg-blue-600 text-white"
                  : "border-zinc-300 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              }`}
            >
              {t(`operations.${value}`)}
            </button>
          ))}
        </div>

        <TimeValueGroup label={t("time2")} hours={h2} minutes={m2} seconds={s2} onHoursChange={onH2Change} onMinutesChange={onM2Change} onSecondsChange={onS2Change} />
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
