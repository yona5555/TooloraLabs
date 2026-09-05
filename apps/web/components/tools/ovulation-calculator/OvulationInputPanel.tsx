"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import ToolInput from "@/components/tool-ui/ToolInput";

type Props = {
  lastPeriodDate: string;
  onLastPeriodDateChange: (value: string) => void;
  cycleLengthDays: string;
  onCycleLengthDaysChange: (value: string) => void;
  lutealPhaseDays: string;
  onLutealPhaseDaysChange: (value: string) => void;
};

export default function OvulationInputPanel({
  lastPeriodDate,
  onLastPeriodDateChange,
  cycleLengthDays,
  onCycleLengthDaysChange,
  lutealPhaseDays,
  onLutealPhaseDaysChange,
}: Props) {
  const t = useTranslations("tools.ovulation-calculator.form");
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <SectionCard title={t("inputTitle")}>
      <div className="space-y-3">
        <ToolInput label={t("lastPeriodDate")} type="date" value={lastPeriodDate} onChange={(e) => onLastPeriodDateChange(e.target.value)} />
        <ToolInput
          label={t("cycleLengthDays")}
          type="text"
          inputMode="numeric"
          value={cycleLengthDays}
          onChange={(e) => onCycleLengthDaysChange(e.target.value)}
        />

        {showAdvanced ? (
          <ToolInput
            label={t("lutealPhaseDays")}
            type="text"
            inputMode="numeric"
            value={lutealPhaseDays}
            onChange={(e) => onLutealPhaseDaysChange(e.target.value)}
          />
        ) : (
          <button type="button" onClick={() => setShowAdvanced(true)} className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400">
            {t("showAdvanced")}
          </button>
        )}
      </div>
      <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">{t("hint")}</p>
    </SectionCard>
  );
}
