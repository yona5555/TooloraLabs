"use client";
import { useTranslations } from "next-intl";
import { RotateCcw } from "lucide-react";
import SectionCard from "@/components/tool-ui/SectionCard";
import ToolInput from "@/components/tool-ui/ToolInput";
import { COUNTDOWN_SCENARIOS, type CountdownScenario } from "./types";

type Props = {
  eventName: string;
  onEventNameChange: (value: string) => void;
  date: string;
  onDateChange: (value: string) => void;
  time: string;
  onTimeChange: (value: string) => void;
  onScenarioPreset: (scenario: CountdownScenario) => void;
  onClear: () => void;
};

export default function CountdownInputPanel({
  eventName,
  onEventNameChange,
  date,
  onDateChange,
  time,
  onTimeChange,
  onScenarioPreset,
  onClear,
}: Props) {
  const t = useTranslations("tools.countdown-to-event-calculator.form");
  const tScenarios = useTranslations("tools.countdown-to-event-calculator.scenarios");

  return (
    <SectionCard title={t("inputTitle")}>
      <div className="mb-5">
        <span className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("scenarioLabel")}</span>
        <div className="flex flex-wrap gap-2">
          {COUNTDOWN_SCENARIOS.map((scenario) => (
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
        <ToolInput
          label={t("eventNameLabel")}
          type="text"
          placeholder={t("eventNamePlaceholder")}
          value={eventName}
          onChange={(e) => onEventNameChange(e.target.value)}
        />
        <div className="grid grid-cols-2 gap-3">
          <ToolInput label={t("dateLabel")} type="date" value={date} onChange={(e) => onDateChange(e.target.value)} />
          <ToolInput label={t("timeLabel")} type="time" value={time} onChange={(e) => onTimeChange(e.target.value)} />
        </div>
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
