"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import ToolInput from "@/components/tool-ui/ToolInput";
import DueDateModeTabs from "./DueDateModeTabs";
import type { DueDateMethod } from "./types";

type Props = {
  method: DueDateMethod;
  onMethodChange: (method: DueDateMethod) => void;
  date: string;
  onDateChange: (value: string) => void;
  cycleLengthDays: string;
  onCycleLengthDaysChange: (value: string) => void;
};

export default function DueDateInputPanel({ method, onMethodChange, date, onDateChange, cycleLengthDays, onCycleLengthDaysChange }: Props) {
  const t = useTranslations("tools.due-date-calculator.form");

  return (
    <SectionCard title={t("inputTitle")}>
      <div className="mb-4">
        <DueDateModeTabs method={method} onMethodChange={onMethodChange} />
      </div>

      <div className="space-y-3">
        <ToolInput label={t(`dateLabels.${method}`)} type="date" value={date} onChange={(e) => onDateChange(e.target.value)} />
        {method === "lmp" && (
          <ToolInput
            label={t("cycleLengthDays")}
            type="text"
            inputMode="numeric"
            value={cycleLengthDays}
            onChange={(e) => onCycleLengthDaysChange(e.target.value)}
          />
        )}
      </div>
      <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">{t(`hints.${method}`)}</p>
    </SectionCard>
  );
}
