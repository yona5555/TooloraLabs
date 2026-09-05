"use client";
import { useTranslations } from "next-intl";
import type { DistanceUnit } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import ToolInput from "@/components/tool-ui/ToolInput";
import TimeInputGroup from "./TimeInputGroup";
import { SOLVE_FIELDS, RACE_PRESETS, type SolveField } from "./types";

const selectClass =
  "w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100";

type PaceCalcInputPanelProps = {
  solveFor: SolveField;
  onSolveForChange: (field: SolveField) => void;
  distanceUnit: DistanceUnit;
  onDistanceUnitChange: (unit: DistanceUnit) => void;
  distance: string;
  onDistanceChange: (value: string) => void;
  racePreset: string;
  onRacePresetChange: (preset: string) => void;
  hours: string;
  minutes: string;
  seconds: string;
  onHoursChange: (value: string) => void;
  onMinutesChange: (value: string) => void;
  onSecondsChange: (value: string) => void;
  paceMinutes: string;
  paceSeconds: string;
  onPaceMinutesChange: (value: string) => void;
  onPaceSecondsChange: (value: string) => void;
};

export default function PaceCalcInputPanel({
  solveFor,
  onSolveForChange,
  distanceUnit,
  onDistanceUnitChange,
  distance,
  onDistanceChange,
  racePreset,
  onRacePresetChange,
  hours,
  minutes,
  seconds,
  onHoursChange,
  onMinutesChange,
  onSecondsChange,
  paceMinutes,
  paceSeconds,
  onPaceMinutesChange,
  onPaceSecondsChange,
}: PaceCalcInputPanelProps) {
  const t = useTranslations("tools.pace-calculator.form");
  const tSolve = useTranslations("tools.pace-calculator.solveTabs");

  return (
    <SectionCard title={t("inputTitle")}>
      <div role="tablist" aria-label={tSolve("groupLabel")} className="mb-4 flex flex-wrap gap-1.5">
        {SOLVE_FIELDS.map((field) => (
          <button
            key={field}
            type="button"
            role="tab"
            aria-selected={solveFor === field}
            onClick={() => onSolveForChange(field)}
            className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition sm:text-sm ${
              solveFor === field
                ? "border-blue-400 bg-blue-600 text-white"
                : "border-zinc-300 text-zinc-600 hover:bg-zinc-100 hover:text-blue-600 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-blue-600"
            }`}
          >
            {tSolve(field)}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {solveFor !== "distance" && (
          <div>
            <span className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("distanceLabel")}</span>
            <div className="flex gap-2">
              <div className="flex-1">
                <ToolInput type="text" inputMode="decimal" value={distance} onChange={(e) => onDistanceChange(e.target.value)} aria-label={t("distanceLabel")} />
              </div>
              <select
                value={distanceUnit}
                onChange={(e) => onDistanceUnitChange(e.target.value as DistanceUnit)}
                className={`${selectClass} w-28`}
                aria-label={t("unitLabel")}
              >
                <option value="km">{t("unitKm")}</option>
                <option value="mi">{t("unitMi")}</option>
              </select>
            </div>
            <select
              value={racePreset}
              onChange={(e) => onRacePresetChange(e.target.value)}
              className={`${selectClass} mt-2`}
              aria-label={t("racePresetLabel")}
            >
              <option value="">{t("racePresetCustom")}</option>
              {RACE_PRESETS.map((preset) => (
                <option key={preset} value={preset}>
                  {t(`racePresets.${preset}`)}
                </option>
              ))}
            </select>
          </div>
        )}

        {solveFor === "distance" && (
          <select
            value={distanceUnit}
            onChange={(e) => onDistanceUnitChange(e.target.value as DistanceUnit)}
            className={selectClass}
            aria-label={t("unitLabel")}
          >
            <option value="km">{t("unitKm")}</option>
            <option value="mi">{t("unitMi")}</option>
          </select>
        )}

        {solveFor !== "time" && (
          <TimeInputGroup
            label={t("timeLabel")}
            hours={hours}
            minutes={minutes}
            seconds={seconds}
            onHoursChange={onHoursChange}
            onMinutesChange={onMinutesChange}
            onSecondsChange={onSecondsChange}
          />
        )}

        {solveFor !== "pace" && (
          <div className="space-y-2">
            <span className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              {distanceUnit === "km" ? t("paceLabelKm") : t("paceLabelMi")}
            </span>
            <div dir="ltr" className="grid grid-cols-2 gap-2">
              <div>
                <ToolInput type="text" inputMode="numeric" value={paceMinutes} onChange={(e) => onPaceMinutesChange(e.target.value)} aria-label={t("minutes")} />
                <span className="mt-1 block text-center text-xs text-zinc-500 dark:text-zinc-400">{t("minutes")}</span>
              </div>
              <div>
                <ToolInput type="text" inputMode="numeric" value={paceSeconds} onChange={(e) => onPaceSecondsChange(e.target.value)} aria-label={t("seconds")} />
                <span className="mt-1 block text-center text-xs text-zinc-500 dark:text-zinc-400">{t("seconds")}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </SectionCard>
  );
}
