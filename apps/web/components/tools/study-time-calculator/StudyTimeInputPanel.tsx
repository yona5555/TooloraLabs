"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import ToolInput from "@/components/tool-ui/ToolInput";

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
}: StudyTimeInputPanelProps) {
  const t = useTranslations("tools.study-time-calculator.form");

  return (
    <SectionCard title={t("inputTitle")}>
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
    </SectionCard>
  );
}
