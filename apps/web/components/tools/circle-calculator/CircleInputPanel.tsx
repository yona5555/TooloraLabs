"use client";
import { useTranslations } from "next-intl";
import { RotateCcw } from "lucide-react";
import SectionCard from "@/components/tool-ui/SectionCard";
import ToolInput from "@/components/tool-ui/ToolInput";
import { CIRCLE_KNOWN_FIELDS, CIRCLE_SCENARIOS } from "./types";
import type { CircleKnownField, CircleScenario } from "./types";

type Props = {
  knownField: CircleKnownField;
  onKnownFieldChange: (field: CircleKnownField) => void;
  value: string;
  onValueChange: (value: string) => void;
  onScenarioPreset: (scenario: CircleScenario) => void;
  onClear: () => void;
};

export default function CircleInputPanel({ knownField, onKnownFieldChange, value, onValueChange, onScenarioPreset, onClear }: Props) {
  const t = useTranslations("tools.circle-calculator.form");
  const tScenarios = useTranslations("tools.circle-calculator.scenarios");

  return (
    <SectionCard title={t("inputTitle")}>
      <div className="mb-5">
        <span className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("scenarioLabel")}</span>
        <div className="flex flex-wrap gap-2">
          {CIRCLE_SCENARIOS.map((scenario) => (
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
      <div>
        <span className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("knownFieldLabel")}</span>
        <div className="grid grid-cols-2 gap-1.5">
          {CIRCLE_KNOWN_FIELDS.map((field) => (
            <button
              key={field}
              type="button"
              onClick={() => onKnownFieldChange(field)}
              className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
                knownField === field
                  ? "border-blue-400 bg-blue-600 text-white"
                  : "border-zinc-300 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              }`}
            >
              {t(`fields.${field}`)}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <ToolInput label={t(`fields.${knownField}`)} type="text" inputMode="decimal" value={value} onChange={(e) => onValueChange(e.target.value)} />
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
