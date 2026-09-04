"use client";
import { useTranslations } from "next-intl";
import type { DistanceUnit } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import ToolInput from "@/components/tool-ui/ToolInput";
import TimeInputGroup from "./TimeInputGroup";
import { RACE_PRESETS } from "./types";

const selectClass =
  "w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100";

type FinishTimeInputPanelProps = {
  distanceUnit: DistanceUnit;
  onDistanceUnitChange: (unit: DistanceUnit) => void;
  knownDistance: string;
  onKnownDistanceChange: (value: string) => void;
  hours: string;
  minutes: string;
  seconds: string;
  onHoursChange: (value: string) => void;
  onMinutesChange: (value: string) => void;
  onSecondsChange: (value: string) => void;
  targetPreset: string;
  onTargetPresetChange: (preset: string) => void;
  targetDistance: string;
  onTargetDistanceChange: (value: string) => void;
};

export default function FinishTimeInputPanel({
  distanceUnit,
  onDistanceUnitChange,
  knownDistance,
  onKnownDistanceChange,
  hours,
  minutes,
  seconds,
  onHoursChange,
  onMinutesChange,
  onSecondsChange,
  targetPreset,
  onTargetPresetChange,
  targetDistance,
  onTargetDistanceChange,
}: FinishTimeInputPanelProps) {
  const t = useTranslations("tools.pace-calculator.form");
  const tFinish = useTranslations("tools.pace-calculator.finishTime");

  return (
    <SectionCard title={tFinish("inputTitle")}>
      <p className="mb-4 text-xs text-zinc-500 dark:text-zinc-400">{tFinish("hint")}</p>
      <div className="space-y-4">
        <div>
          <span className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-zinc-300">{tFinish("knownDistanceLabel")}</span>
          <div className="flex gap-2">
            <div className="flex-1">
              <ToolInput type="text" inputMode="decimal" value={knownDistance} onChange={(e) => onKnownDistanceChange(e.target.value)} aria-label={tFinish("knownDistanceLabel")} />
            </div>
            <select value={distanceUnit} onChange={(e) => onDistanceUnitChange(e.target.value as DistanceUnit)} className={`${selectClass} w-28`} aria-label={t("unitLabel")}>
              <option value="km">{t("unitKm")}</option>
              <option value="mi">{t("unitMi")}</option>
            </select>
          </div>
        </div>

        <TimeInputGroup
          label={tFinish("knownTimeLabel")}
          hours={hours}
          minutes={minutes}
          seconds={seconds}
          onHoursChange={onHoursChange}
          onMinutesChange={onMinutesChange}
          onSecondsChange={onSecondsChange}
        />

        <div>
          <span className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-zinc-300">{tFinish("targetDistanceLabel")}</span>
          <select
            value={targetPreset}
            onChange={(e) => onTargetPresetChange(e.target.value)}
            className={`${selectClass} mb-2`}
            aria-label={tFinish("targetDistanceLabel")}
          >
            {RACE_PRESETS.map((preset) => (
              <option key={preset} value={preset}>
                {t(`racePresets.${preset}`)}
              </option>
            ))}
            <option value="">{t("racePresetCustom")}</option>
          </select>
          {targetPreset === "" && (
            <ToolInput
              type="text"
              inputMode="decimal"
              value={targetDistance}
              onChange={(e) => onTargetDistanceChange(e.target.value)}
              placeholder={distanceUnit === "km" ? t("unitKm") : t("unitMi")}
              aria-label={tFinish("targetDistanceLabel")}
            />
          )}
        </div>
      </div>
    </SectionCard>
  );
}
