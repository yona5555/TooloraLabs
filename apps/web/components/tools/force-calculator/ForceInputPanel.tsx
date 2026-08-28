"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import ToolInput from "@/components/tool-ui/ToolInput";
import type { ForceMode, GravitationSolveFor, SecondLawSolveFor } from "./types";

type ForceInputPanelProps = {
  mode: ForceMode;
  onModeChange: (mode: ForceMode) => void;
  secondLawSolveFor: SecondLawSolveFor;
  onSecondLawSolveForChange: (value: SecondLawSolveFor) => void;
  gravitationSolveFor: GravitationSolveFor;
  onGravitationSolveForChange: (value: GravitationSolveFor) => void;
  force: string;
  onForceChange: (value: string) => void;
  mass: string;
  onMassChange: (value: string) => void;
  acceleration: string;
  onAccelerationChange: (value: string) => void;
  mass1: string;
  onMass1Change: (value: string) => void;
  mass2: string;
  onMass2Change: (value: string) => void;
  distance: string;
  onDistanceChange: (value: string) => void;
};

export default function ForceInputPanel({
  mode,
  onModeChange,
  secondLawSolveFor,
  onSecondLawSolveForChange,
  gravitationSolveFor,
  onGravitationSolveForChange,
  force,
  onForceChange,
  mass,
  onMassChange,
  acceleration,
  onAccelerationChange,
  mass1,
  onMass1Change,
  mass2,
  onMass2Change,
  distance,
  onDistanceChange,
}: ForceInputPanelProps) {
  const t = useTranslations("tools.force-calculator.form");

  return (
    <SectionCard title={t("inputTitle")}>
      <label className="block space-y-2">
        <span className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("modeLabel")}</span>
        <select
          value={mode}
          onChange={(e) => onModeChange(e.target.value as ForceMode)}
          className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-blue-500 dark:focus:ring-blue-500/20"
        >
          <option value="secondLaw">{t("mode.secondLaw")}</option>
          <option value="gravitation">{t("mode.gravitation")}</option>
        </select>
      </label>

      {mode === "secondLaw" ? (
        <div className="mt-5 space-y-5">
          <label className="block space-y-2">
            <span className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("solveForLabel")}</span>
            <select
              value={secondLawSolveFor}
              onChange={(e) => onSecondLawSolveForChange(e.target.value as SecondLawSolveFor)}
              className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-blue-500 dark:focus:ring-blue-500/20"
            >
              <option value="force">{t("secondLawSolveFor.force")}</option>
              <option value="mass">{t("secondLawSolveFor.mass")}</option>
              <option value="acceleration">{t("secondLawSolveFor.acceleration")}</option>
            </select>
          </label>
          {secondLawSolveFor !== "force" && (
            <ToolInput label={t("forceLabel")} type="text" inputMode="decimal" placeholder={t("forcePlaceholder")} value={force} onChange={(e) => onForceChange(e.target.value)} />
          )}
          {secondLawSolveFor !== "mass" && (
            <ToolInput label={t("massLabel")} type="text" inputMode="decimal" placeholder={t("massPlaceholder")} value={mass} onChange={(e) => onMassChange(e.target.value)} />
          )}
          {secondLawSolveFor !== "acceleration" && (
            <ToolInput label={t("accelerationLabel")} type="text" inputMode="decimal" placeholder={t("accelerationPlaceholder")} value={acceleration} onChange={(e) => onAccelerationChange(e.target.value)} />
          )}
        </div>
      ) : (
        <div className="mt-5 space-y-5">
          <label className="block space-y-2">
            <span className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("solveForLabel")}</span>
            <select
              value={gravitationSolveFor}
              onChange={(e) => onGravitationSolveForChange(e.target.value as GravitationSolveFor)}
              className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-blue-500 dark:focus:ring-blue-500/20"
            >
              <option value="force">{t("gravitationSolveFor.force")}</option>
              <option value="mass1">{t("gravitationSolveFor.mass1")}</option>
              <option value="mass2">{t("gravitationSolveFor.mass2")}</option>
              <option value="distance">{t("gravitationSolveFor.distance")}</option>
            </select>
          </label>
          {gravitationSolveFor !== "force" && (
            <ToolInput label={t("forceLabel")} type="text" inputMode="decimal" placeholder={t("forcePlaceholder")} value={force} onChange={(e) => onForceChange(e.target.value)} />
          )}
          {gravitationSolveFor !== "mass1" && (
            <ToolInput label={t("mass1Label")} type="text" inputMode="decimal" placeholder={t("mass1Placeholder")} value={mass1} onChange={(e) => onMass1Change(e.target.value)} />
          )}
          {gravitationSolveFor !== "mass2" && (
            <ToolInput label={t("mass2Label")} type="text" inputMode="decimal" placeholder={t("mass2Placeholder")} value={mass2} onChange={(e) => onMass2Change(e.target.value)} />
          )}
          {gravitationSolveFor !== "distance" && (
            <ToolInput label={t("distanceLabel")} type="text" inputMode="decimal" placeholder={t("distancePlaceholder")} value={distance} onChange={(e) => onDistanceChange(e.target.value)} />
          )}
        </div>
      )}
    </SectionCard>
  );
}
