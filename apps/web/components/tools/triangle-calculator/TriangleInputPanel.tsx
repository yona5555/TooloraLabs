"use client";
import { useTranslations } from "next-intl";
import { RotateCcw } from "lucide-react";
import SectionCard from "@/components/tool-ui/SectionCard";
import ToolInput from "@/components/tool-ui/ToolInput";
import TriangleModeTabs from "./TriangleModeTabs";
import { TRIANGLE_SCENARIOS, type TriangleMode, type TriangleScenario } from "./types";

type Props = {
  mode: TriangleMode;
  onModeChange: (mode: TriangleMode) => void;
  field1: string;
  field2: string;
  field3: string;
  onField1Change: (value: string) => void;
  onField2Change: (value: string) => void;
  onField3Change: (value: string) => void;
  onClear: () => void;
  onScenarioPreset: (scenario: TriangleScenario) => void;
};

const FIELD_LABEL_KEYS: Record<TriangleMode, [string, string, string]> = {
  sss: ["sideA", "sideB", "sideC"],
  sas: ["sideA", "includedAngleC", "sideB"],
  asa: ["angleA", "includedSideC", "angleB"],
  aas: ["angleA", "angleB", "oppositeSideA"],
};

export default function TriangleInputPanel({ mode, onModeChange, field1, field2, field3, onField1Change, onField2Change, onField3Change, onClear, onScenarioPreset }: Props) {
  const t = useTranslations("tools.triangle-calculator.form");
  const tScenarios = useTranslations("tools.triangle-calculator.scenarios");
  const [label1, label2, label3] = FIELD_LABEL_KEYS[mode];

  return (
    <SectionCard title={t("inputTitle")}>
      <div className="mb-4">
        <TriangleModeTabs mode={mode} onModeChange={onModeChange} />
      </div>

      {mode === "sss" && (
        <div className="mb-4">
          <span className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("scenarioLabel")}</span>
          <div className="flex flex-wrap gap-2">
            {TRIANGLE_SCENARIOS.map((scenario) => (
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
        <ToolInput label={t(`fields.${label1}`)} type="text" inputMode="decimal" value={field1} onChange={(e) => onField1Change(e.target.value)} />
        <ToolInput label={t(`fields.${label2}`)} type="text" inputMode="decimal" value={field2} onChange={(e) => onField2Change(e.target.value)} />
        <ToolInput label={t(`fields.${label3}`)} type="text" inputMode="decimal" value={field3} onChange={(e) => onField3Change(e.target.value)} />
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
