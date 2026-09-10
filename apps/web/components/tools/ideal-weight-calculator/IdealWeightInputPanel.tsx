"use client";
import { useTranslations } from "next-intl";
import { RotateCcw } from "lucide-react";
import type { Gender } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import ToolInput from "@/components/tool-ui/ToolInput";
import { IDEAL_WEIGHT_SCENARIOS, type IdealWeightScenario } from "./types";

type IdealWeightInputPanelProps = {
  gender: Gender;
  onGenderChange: (value: Gender) => void;
  heightCm: string;
  onHeightCmChange: (value: string) => void;
  onScenarioPreset: (scenario: IdealWeightScenario) => void;
  onClear: () => void;
};

export default function IdealWeightInputPanel({
  gender,
  onGenderChange,
  heightCm,
  onHeightCmChange,
  onScenarioPreset,
  onClear,
}: IdealWeightInputPanelProps) {
  const t = useTranslations("tools.ideal-weight-calculator");
  const tScenarios = useTranslations("tools.ideal-weight-calculator.scenarios");

  return (
    <SectionCard title={t("aboveFold.inputTitle")}>
      <div className="mb-5">
        <span className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("form.scenarioLabel")}</span>
        <div className="flex flex-wrap gap-2">
          {IDEAL_WEIGHT_SCENARIOS.map((scenario) => (
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
      <div className="space-y-5">
        <div>
          <span className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("form.genderLabel")}</span>
          <div className="flex gap-3">
            {(["male", "female"] as const).map((value) => (
              <label
                key={value}
                className={`flex flex-1 cursor-pointer items-center justify-center rounded-xl border px-4 py-3 text-sm font-medium transition ${
                  gender === value
                    ? "border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-500 dark:bg-blue-500/10 dark:text-blue-400"
                    : "border-zinc-300 text-zinc-600 hover:border-zinc-400 dark:border-zinc-700 dark:text-zinc-300"
                }`}
              >
                <input type="radio" name="gender" value={value} checked={gender === value} onChange={() => onGenderChange(value)} className="sr-only" />
                {value === "male" ? t("form.genderMale") : t("form.genderFemale")}
              </label>
            ))}
          </div>
        </div>

        <ToolInput
          label={t("form.heightLabel")}
          type="text"
          inputMode="decimal"
          placeholder={t("form.heightPlaceholder")}
          value={heightCm}
          onChange={(e) => onHeightCmChange(e.target.value)}
        />
      </div>

      <button
        type="button"
        onClick={onClear}
        className="mt-5 flex items-center gap-2 rounded-xl border border-zinc-300 px-4 py-2.5 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
      >
        <RotateCcw size={16} />
        {t("form.clear")}
      </button>
    </SectionCard>
  );
}
