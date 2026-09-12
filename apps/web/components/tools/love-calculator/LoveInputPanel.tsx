"use client";
import { useTranslations } from "next-intl";
import { Heart, RotateCcw } from "lucide-react";
import SectionCard from "@/components/tool-ui/SectionCard";
import ToolInput from "@/components/tool-ui/ToolInput";

type Scenario = { key: string; name1: string; name2: string };

type Props = {
  name1: string;
  onName1Change: (value: string) => void;
  name2: string;
  onName2Change: (value: string) => void;
  onCalculate: () => void;
  onClear: () => void;
  scenarios: Scenario[];
  onScenarioPreset: (scenario: Scenario) => void;
};

export default function LoveInputPanel({ name1, onName1Change, name2, onName2Change, onCalculate, onClear, scenarios, onScenarioPreset }: Props) {
  const t = useTranslations("tools.love-calculator.form");
  const tScenarios = useTranslations("tools.love-calculator.form.scenarios");

  return (
    <SectionCard title={t("inputTitle")}>
      <div className="space-y-4">
        <div>
          <span className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("scenarioPresetsLabel")}</span>
          <div className="flex flex-wrap gap-2">
            {scenarios.map((scenario) => (
              <button
                key={scenario.key}
                type="button"
                onClick={() => onScenarioPreset(scenario)}
                className="rounded-lg border border-zinc-300 bg-transparent px-3 py-1.5 text-xs font-medium text-zinc-600 transition hover:border-pink-400 hover:text-pink-600 sm:text-sm dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-pink-400 dark:hover:text-pink-400"
              >
                {tScenarios(scenario.key)}
              </button>
            ))}
          </div>
        </div>

        <ToolInput
          label={t("name1Label")}
          type="text"
          value={name1}
          onChange={(e) => onName1Change(e.target.value)}
          placeholder={t("name1Placeholder")}
        />
        <ToolInput
          label={t("name2Label")}
          type="text"
          value={name2}
          onChange={(e) => onName2Change(e.target.value)}
          placeholder={t("name2Placeholder")}
        />

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCalculate}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-pink-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-pink-700"
          >
            <Heart size={18} />
            {t("calculateButton")}
          </button>
          <button
            type="button"
            onClick={onClear}
            className="flex items-center gap-2 rounded-xl border border-zinc-300 px-4 py-3 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <RotateCcw size={16} />
            {t("clear")}
          </button>
        </div>

        <p className="text-xs text-zinc-500 dark:text-zinc-400">{t("disclaimer")}</p>
      </div>
    </SectionCard>
  );
}
