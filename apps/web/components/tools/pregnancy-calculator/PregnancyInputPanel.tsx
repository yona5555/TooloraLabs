"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import ToolInput from "@/components/tool-ui/ToolInput";

type Props = {
  lastPeriodDate: string;
  onLastPeriodDateChange: (value: string) => void;
};

export default function PregnancyInputPanel({ lastPeriodDate, onLastPeriodDateChange }: Props) {
  const t = useTranslations("tools.pregnancy-calculator.form");

  return (
    <SectionCard title={t("inputTitle")}>
      <ToolInput label={t("lastPeriodDate")} type="date" value={lastPeriodDate} onChange={(e) => onLastPeriodDateChange(e.target.value)} />
      <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">{t("hint")}</p>
    </SectionCard>
  );
}
