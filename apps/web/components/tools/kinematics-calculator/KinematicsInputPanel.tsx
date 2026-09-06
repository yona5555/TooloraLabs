"use client";
import type { FormEvent } from "react";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import ToolInput from "@/components/tool-ui/ToolInput";
import ToolButton from "@/components/tool-ui/ToolButton";
import KinematicsModeTabs from "./KinematicsModeTabs";
import KinematicsSolveForTabs from "./KinematicsSolveForTabs";
import KinematicsVariablesDiagram from "./KinematicsVariablesDiagram";
import { KINEMATICS_SOLVE_FOR_TIME, KINEMATICS_SOLVE_FOR_DISTANCE } from "./types";
import type { KinematicsMode, KinematicsSolveForDistance, KinematicsSolveForTime } from "./types";

type KinematicsInputPanelProps = {
  mode: KinematicsMode;
  onModeChange: (mode: KinematicsMode) => void;
  solveForTime: KinematicsSolveForTime;
  onSolveForTimeChange: (value: KinematicsSolveForTime) => void;
  solveForDistance: KinematicsSolveForDistance;
  onSolveForDistanceChange: (value: KinematicsSolveForDistance) => void;
  v0: string;
  onV0Change: (value: string) => void;
  v: string;
  onVChange: (value: string) => void;
  a: string;
  onAChange: (value: string) => void;
  t: string;
  onTChange: (value: string) => void;
  dx: string;
  onDxChange: (value: string) => void;
  onCalculate: (e: FormEvent<HTMLFormElement>) => void;
  onClear: () => void;
};

export default function KinematicsInputPanel({
  mode,
  onModeChange,
  solveForTime,
  onSolveForTimeChange,
  solveForDistance,
  onSolveForDistanceChange,
  v0,
  onV0Change,
  v,
  onVChange,
  a,
  onAChange,
  t,
  onTChange,
  dx,
  onDxChange,
  onCalculate,
  onClear,
}: KinematicsInputPanelProps) {
  const t_ = useTranslations("tools.kinematics-calculator.form");

  const v0Field = (
    <ToolInput label={t_("v0Label")} type="text" inputMode="decimal" placeholder={t_("v0Placeholder")} value={v0} onChange={(e) => onV0Change(e.target.value)} />
  );
  const vField = (
    <ToolInput label={t_("vLabel")} type="text" inputMode="decimal" placeholder={t_("vPlaceholder")} value={v} onChange={(e) => onVChange(e.target.value)} />
  );
  const aField = (
    <ToolInput label={t_("aLabel")} type="text" inputMode="decimal" placeholder={t_("aPlaceholder")} value={a} onChange={(e) => onAChange(e.target.value)} />
  );
  const tField = (
    <ToolInput label={t_("tLabel")} type="text" inputMode="decimal" placeholder={t_("tPlaceholder")} value={t} onChange={(e) => onTChange(e.target.value)} />
  );
  const dxField = (
    <ToolInput label={t_("dxLabel")} type="text" inputMode="decimal" placeholder={t_("dxPlaceholder")} value={dx} onChange={(e) => onDxChange(e.target.value)} />
  );

  const solved = mode === "timeBased" ? solveForTime : solveForDistance;
  const variableOrder = mode === "timeBased" ? ["v0", "v", "a", "t"] : ["v0", "v", "a", "dx"];

  return (
    <SectionCard title={t_("inputTitle")}>
      <div className="mb-5">
        <span className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t_("modeLabel")}</span>
        <KinematicsModeTabs mode={mode} onModeChange={onModeChange} />
      </div>

      <div className="mb-5">
        <span className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t_("solveForLabel")}</span>
        {mode === "timeBased" ? (
          <KinematicsSolveForTabs values={KINEMATICS_SOLVE_FOR_TIME} active={solveForTime} onChange={onSolveForTimeChange} translationKey="solveForTime" />
        ) : (
          <KinematicsSolveForTabs values={KINEMATICS_SOLVE_FOR_DISTANCE} active={solveForDistance} onChange={onSolveForDistanceChange} translationKey="solveForDistance" />
        )}
      </div>

      <KinematicsVariablesDiagram
        solved={solved}
        order={variableOrder}
        labels={{ v0: "v₀", v: "v", a: "a", t: "t", dx: "Δx" }}
        caption={t_("variablesCaption")}
      />

      <form onSubmit={onCalculate} className="mt-4 space-y-5">
        {mode === "timeBased" ? (
          <>
            {solveForTime !== "v0" && v0Field}
            {solveForTime !== "v" && vField}
            {solveForTime !== "a" && aField}
            {solveForTime !== "t" && tField}
          </>
        ) : (
          <>
            {solveForDistance !== "v0" && v0Field}
            {solveForDistance !== "v" && vField}
            {solveForDistance !== "a" && aField}
            {solveForDistance !== "dx" && dxField}
          </>
        )}

        <div className="flex flex-wrap gap-4">
          <ToolButton type="submit">{t_("calculate")}</ToolButton>
          <button
            type="button"
            onClick={onClear}
            className="rounded-xl border border-zinc-300 px-6 py-3 font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            {t_("clear")}
          </button>
        </div>
      </form>
    </SectionCard>
  );
}
