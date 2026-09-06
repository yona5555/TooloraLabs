"use client";
import type { FormEvent } from "react";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import ToolInput from "@/components/tool-ui/ToolInput";
import ToolButton from "@/components/tool-ui/ToolButton";
import ForceModeTabs from "./ForceModeTabs";
import ForceSolveForTabs from "./ForceSolveForTabs";
import ForceVariablesDiagram from "./ForceVariablesDiagram";
import { SECOND_LAW_SOLVE_FOR, GRAVITATION_SOLVE_FOR } from "./types";
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
  onCalculate: (e: FormEvent<HTMLFormElement>) => void;
  onClear: () => void;
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
  onCalculate,
  onClear,
}: ForceInputPanelProps) {
  const t = useTranslations("tools.force-calculator.form");

  const solved = mode === "secondLaw" ? secondLawSolveFor : gravitationSolveFor;
  const variableOrder = mode === "secondLaw" ? ["force", "mass", "acceleration"] : ["force", "mass1", "mass2", "distance"];
  const variableLabels: Record<string, string> = { force: "F", mass: "m", acceleration: "a", mass1: "m₁", mass2: "m₂", distance: "d" };

  return (
    <SectionCard title={t("inputTitle")}>
      <div className="mb-5">
        <span className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("modeLabel")}</span>
        <ForceModeTabs mode={mode} onModeChange={onModeChange} />
      </div>

      <div className="mb-5">
        <span className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("solveForLabel")}</span>
        {mode === "secondLaw" ? (
          <ForceSolveForTabs values={SECOND_LAW_SOLVE_FOR} active={secondLawSolveFor} onChange={onSecondLawSolveForChange} translationKey="secondLawSolveFor" />
        ) : (
          <ForceSolveForTabs values={GRAVITATION_SOLVE_FOR} active={gravitationSolveFor} onChange={onGravitationSolveForChange} translationKey="gravitationSolveFor" />
        )}
      </div>

      <ForceVariablesDiagram
        solved={solved}
        order={variableOrder}
        labels={variableLabels}
        values={{
          force: solved === "force" ? "?" : force || "–",
          mass: solved === "mass" ? "?" : mass || "–",
          acceleration: solved === "acceleration" ? "?" : acceleration || "–",
          mass1: solved === "mass1" ? "?" : mass1 || "–",
          mass2: solved === "mass2" ? "?" : mass2 || "–",
          distance: solved === "distance" ? "?" : distance || "–",
        }}
        caption={t("variablesCaption")}
      />

      <form onSubmit={onCalculate} className="mt-4 space-y-5">
        {mode === "secondLaw" ? (
          <>
            {secondLawSolveFor !== "force" && (
              <ToolInput label={t("forceLabel")} type="text" inputMode="decimal" placeholder={t("forcePlaceholder")} value={force} onChange={(e) => onForceChange(e.target.value)} />
            )}
            {secondLawSolveFor !== "mass" && (
              <ToolInput label={t("massLabel")} type="text" inputMode="decimal" placeholder={t("massPlaceholder")} value={mass} onChange={(e) => onMassChange(e.target.value)} />
            )}
            {secondLawSolveFor !== "acceleration" && (
              <ToolInput label={t("accelerationLabel")} type="text" inputMode="decimal" placeholder={t("accelerationPlaceholder")} value={acceleration} onChange={(e) => onAccelerationChange(e.target.value)} />
            )}
          </>
        ) : (
          <>
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
          </>
        )}

        <div className="flex flex-wrap gap-4">
          <ToolButton type="submit">{t("calculate")}</ToolButton>
          <button
            type="button"
            onClick={onClear}
            className="rounded-xl border border-zinc-300 px-6 py-3 font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            {t("clear")}
          </button>
        </div>
      </form>
    </SectionCard>
  );
}
