"use client";
import { useTranslations } from "next-intl";
import { RotateCcw } from "lucide-react";
import SectionCard from "@/components/tool-ui/SectionCard";
import ToolInput from "@/components/tool-ui/ToolInput";
import { STUDY_SESSION_SCENARIOS, type StudySessionScenario } from "./types";

type StudyTimeInputPanelProps = {
  totalMinutes: string;
  onTotalMinutesChange: (value: string) => void;
  workMinutes: string;
  onWorkMinutesChange: (value: string) => void;
  shortBreakMinutes: string;
  onShortBreakMinutesChange: (value: string) => void;
  longBreakMinutes: string;
  onLongBreakMinutesChange: (value: string) => void;
  pomodorosBeforeLongBreak: string;
  onPomodorosBeforeLongBreakChange: (value: string) => void;
  onScenarioPreset: (scenario: StudySessionScenario) => void;
  onClear: () => void;
};

export default function StudyTimeInputPanel({
  totalMinutes,
  onTotalMinutesChange,
  workMinutes,
  onWorkMinutesChange,
  shortBreakMinutes,
  onShortBreakMinutesChange,
  longBreakMinutes,
  onLongBreakMinutesChange,
  pomodorosBeforeLongBreak,
  onPomodorosBeforeLongBreakChange,
  onScenarioPreset,
  onClear,
}: StudyTimeInputPanelProps) {
  const t = useTranslations("tools.study-time-calculator.form");
  const tScenarios = useTranslations("tools.study-time-calculator.scenarios");

  return (
    <SectionCard title={t("inputTitle")}>
      <div className="mb-5">
        <span className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("scenarioLabel")}</span>
        <div className="flex flex-wrap gap-2">
          {STUDY_SESSION_SCENARIOS.map((scenario) => (
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
        <ToolInput
          label={t("totalMinutesLabel")}
          hint={t("totalMinutesHint")}
          type="text"
          inputMode="decimal"
          placeholder={t("totalMinutesPlaceholder")}
          value={totalMinutes}
          onChange={(e) => onTotalMinutesChange(e.target.value)}
        />
        <ToolInput
          label={t("workMinutesLabel")}
          type="text"
          inputMode="decimal"
          placeholder={t("workMinutesPlaceholder")}
          value={workMinutes}
          onChange={(e) => onWorkMinutesChange(e.target.value)}
        />
        <ToolInput
          label={t("shortBreakMinutesLabel")}
          type="text"
          inputMode="decimal"
          placeholder={t("shortBreakMinutesPlaceholder")}
          value={shortBreakMinutes}
          onChange={(e) => onShortBreakMinutesChange(e.target.value)}
        />
        <ToolInput
          label={t("longBreakMinutesLabel")}
          type="text"
          inputMode="decimal"
          placeholder={t("longBreakMinutesPlaceholder")}
          value={longBreakMinutes}
          onChange={(e) => onLongBreakMinutesChange(e.target.value)}
        />
        <ToolInput
          label={t("pomodorosBeforeLongBreakLabel")}
          hint={t("pomodorosBeforeLongBreakHint")}
          type="text"
          inputMode="numeric"
          placeholder={t("pomodorosBeforeLongBreakPlaceholder")}
          value={pomodorosBeforeLongBreak}
          onChange={(e) => onPomodorosBeforeLongBreakChange(e.target.value)}
        />
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
