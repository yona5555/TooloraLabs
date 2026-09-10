"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { GpaCalculator as GpaCalculatorTool } from "@tooloralabs/tools";
import { formatLocalizedNumber } from "@tooloralabs/core";
import EncyclopediaLiveWidget from "@/components/tool-ui/EncyclopediaLiveWidget";
import GpaMainGauge from "./GpaMainGauge";
import { GRADE_POINTS, GPA_SCENARIOS } from "./types";

const tool = new GpaCalculatorTool();

/**
 * Client-interactive island (see EncyclopediaLiveWidget) letting a reader
 * click between four real semester course loads and watch the gauge and
 * GPA respond immediately — the same GRADE_POINTS table and engine the
 * above-the-fold calculator itself uses, not a separate illustration.
 */
export default function GpaScenarioWidget() {
  const t = useTranslations("tools.gpa-calculator.education.scenarioWidget");
  const tScenarios = useTranslations("tools.gpa-calculator.scenarios");
  const [selectedKey, setSelectedKey] = useState(GPA_SCENARIOS[0].key);

  const selected = GPA_SCENARIOS.find((s) => s.key === selectedKey) ?? GPA_SCENARIOS[0];
  const output = tool.execute(
    {
      operation: "calculate",
      courses: selected.courses.map((c) => ({ gradePoints: GRADE_POINTS[c.grade], creditHours: Number(c.creditHours) })),
      currentGpa: 0,
      currentCredits: 0,
      targetGpa: 0,
      plannedCredits: 0,
    },
    { locale: "en-US" }
  ).data;

  const fmt = (value: number) => formatLocalizedNumber(value, "western", { maximumFractionDigits: 3 });

  return (
    <EncyclopediaLiveWidget title={t("title")}>
      <p className="mb-4 text-sm leading-6 opacity-80">{t("intro")}</p>

      <GpaMainGauge gpa={output.gpa} valueLabel={fmt(output.gpa)} />

      <div role="tablist" className="mt-2 flex flex-wrap justify-center gap-2">
        {GPA_SCENARIOS.map((s) => (
          <button
            key={s.key}
            type="button"
            role="tab"
            aria-selected={selectedKey === s.key}
            onClick={() => setSelectedKey(s.key)}
            className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition sm:text-sm ${
              selectedKey === s.key
                ? "border-blue-400 bg-blue-600 text-white"
                : "border-current/20 bg-transparent text-current/70 hover:border-blue-300 hover:text-current"
            }`}
          >
            {tScenarios(s.key)}
          </button>
        ))}
      </div>

      <p className="mt-4 text-center text-sm leading-6">
        {t("summary", { credits: fmt(output.totalCredits), points: fmt(output.totalQualityPoints), gpa: fmt(output.gpa) })}
      </p>
    </EncyclopediaLiveWidget>
  );
}
