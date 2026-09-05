"use client";
import { useTranslations } from "next-intl";
import type { DistanceUnit } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import ToolInput from "@/components/tool-ui/ToolInput";

const selectClass =
  "w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100";

type ConverterInputPanelProps = {
  fromUnit: DistanceUnit;
  onFromUnitChange: (unit: DistanceUnit) => void;
  minutes: string;
  seconds: string;
  onMinutesChange: (value: string) => void;
  onSecondsChange: (value: string) => void;
};

export default function ConverterInputPanel({ fromUnit, onFromUnitChange, minutes, seconds, onMinutesChange, onSecondsChange }: ConverterInputPanelProps) {
  const t = useTranslations("tools.pace-calculator.form");
  const tConv = useTranslations("tools.pace-calculator.converter");

  return (
    <SectionCard title={tConv("inputTitle")}>
      <p className="mb-4 text-xs text-zinc-500 dark:text-zinc-400">{tConv("hint")}</p>
      <div className="space-y-4">
        <div>
          <span className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-zinc-300">{tConv("fromUnitLabel")}</span>
          <select value={fromUnit} onChange={(e) => onFromUnitChange(e.target.value as DistanceUnit)} className={selectClass} aria-label={tConv("fromUnitLabel")}>
            <option value="km">{t("paceLabelKm")}</option>
            <option value="mi">{t("paceLabelMi")}</option>
          </select>
        </div>
        <div className="space-y-2">
          <span className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">{tConv("paceValueLabel")}</span>
          <div dir="ltr" className="grid grid-cols-2 gap-2">
            <div>
              <ToolInput type="text" inputMode="numeric" value={minutes} onChange={(e) => onMinutesChange(e.target.value)} aria-label={t("minutes")} />
              <span className="mt-1 block text-center text-xs text-zinc-500 dark:text-zinc-400">{t("minutes")}</span>
            </div>
            <div>
              <ToolInput type="text" inputMode="numeric" value={seconds} onChange={(e) => onSecondsChange(e.target.value)} aria-label={t("seconds")} />
              <span className="mt-1 block text-center text-xs text-zinc-500 dark:text-zinc-400">{t("seconds")}</span>
            </div>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}
