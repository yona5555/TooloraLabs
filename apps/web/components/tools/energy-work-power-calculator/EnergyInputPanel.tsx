"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import ToolInput from "@/components/tool-ui/ToolInput";
import type { EnergyWorkPowerMode } from "./types";

type EnergyInputPanelProps = {
  mode: EnergyWorkPowerMode;
  onModeChange: (mode: EnergyWorkPowerMode) => void;
  force: string;
  onForceChange: (value: string) => void;
  distance: string;
  onDistanceChange: (value: string) => void;
  angleDegrees: string;
  onAngleDegreesChange: (value: string) => void;
  mass: string;
  onMassChange: (value: string) => void;
  velocity: string;
  onVelocityChange: (value: string) => void;
  height: string;
  onHeightChange: (value: string) => void;
  workValue: string;
  onWorkValueChange: (value: string) => void;
  time: string;
  onTimeChange: (value: string) => void;
};

export default function EnergyInputPanel({
  mode,
  onModeChange,
  force,
  onForceChange,
  distance,
  onDistanceChange,
  angleDegrees,
  onAngleDegreesChange,
  mass,
  onMassChange,
  velocity,
  onVelocityChange,
  height,
  onHeightChange,
  workValue,
  onWorkValueChange,
  time,
  onTimeChange,
}: EnergyInputPanelProps) {
  const t = useTranslations("tools.energy-work-power-calculator.form");

  return (
    <SectionCard title={t("inputTitle")}>
      <label className="block space-y-2">
        <span className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("modeLabel")}</span>
        <select
          value={mode}
          onChange={(e) => onModeChange(e.target.value as EnergyWorkPowerMode)}
          className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-blue-500 dark:focus:ring-blue-500/20"
        >
          <option value="work">{t("mode.work")}</option>
          <option value="kineticEnergy">{t("mode.kineticEnergy")}</option>
          <option value="potentialEnergy">{t("mode.potentialEnergy")}</option>
          <option value="power">{t("mode.power")}</option>
        </select>
      </label>

      <div className="mt-5 space-y-5">
        {mode === "work" && (
          <>
            <ToolInput label={t("forceLabel")} type="text" inputMode="decimal" placeholder={t("forcePlaceholder")} value={force} onChange={(e) => onForceChange(e.target.value)} />
            <ToolInput label={t("distanceLabel")} type="text" inputMode="decimal" placeholder={t("distancePlaceholder")} value={distance} onChange={(e) => onDistanceChange(e.target.value)} />
            <ToolInput label={t("angleLabel")} type="text" inputMode="decimal" placeholder={t("anglePlaceholder")} value={angleDegrees} onChange={(e) => onAngleDegreesChange(e.target.value)} />
          </>
        )}
        {mode === "kineticEnergy" && (
          <>
            <ToolInput label={t("massLabel")} type="text" inputMode="decimal" placeholder={t("massPlaceholder")} value={mass} onChange={(e) => onMassChange(e.target.value)} />
            <ToolInput label={t("velocityLabel")} type="text" inputMode="decimal" placeholder={t("velocityPlaceholder")} value={velocity} onChange={(e) => onVelocityChange(e.target.value)} />
          </>
        )}
        {mode === "potentialEnergy" && (
          <>
            <ToolInput label={t("massLabel")} type="text" inputMode="decimal" placeholder={t("massPlaceholder")} value={mass} onChange={(e) => onMassChange(e.target.value)} />
            <ToolInput label={t("heightLabel")} type="text" inputMode="decimal" placeholder={t("heightPlaceholder")} value={height} onChange={(e) => onHeightChange(e.target.value)} />
          </>
        )}
        {mode === "power" && (
          <>
            <ToolInput label={t("workValueLabel")} type="text" inputMode="decimal" placeholder={t("workValuePlaceholder")} value={workValue} onChange={(e) => onWorkValueChange(e.target.value)} />
            <ToolInput label={t("timeLabel")} type="text" inputMode="decimal" placeholder={t("timePlaceholder")} value={time} onChange={(e) => onTimeChange(e.target.value)} />
          </>
        )}
      </div>
    </SectionCard>
  );
}
