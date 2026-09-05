"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import ToolInput from "@/components/tool-ui/ToolInput";
import SleepModeTabs from "./SleepModeTabs";
import type { SleepMode } from "./types";

type Props = {
  mode: SleepMode;
  onModeChange: (mode: SleepMode) => void;
  time: string;
  onTimeChange: (value: string) => void;
  fallAsleepMinutes: string;
  onFallAsleepMinutesChange: (value: string) => void;
};

export default function SleepInputPanel({ mode, onModeChange, time, onTimeChange, fallAsleepMinutes, onFallAsleepMinutesChange }: Props) {
  const t = useTranslations("tools.sleep-calculator.form");

  return (
    <SectionCard title={t("inputTitle")}>
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
    </SectionCard>
  );
}
