"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import ToolInput from "@/components/tool-ui/ToolInput";
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

  return (
    <SectionCard title={t_("inputTitle")}>
      <label className="block space-y-2">
        <span className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t_("modeLabel")}</span>
        <select
          value={mode}
          onChange={(e) => onModeChange(e.target.value as KinematicsMode)}
          className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-blue-500 dark:focus:ring-blue-500/20"
        >
          <option value="timeBased">{t_("mode.timeBased")}</option>
          <option value="distanceBased">{t_("mode.distanceBased")}</option>
        </select>
      </label>

      {mode === "timeBased" ? (
        <div className="mt-5 space-y-5">
          <label className="block space-y-2">
            <span className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t_("solveForLabel")}</span>
            <select
              value={solveForTime}
              onChange={(e) => onSolveForTimeChange(e.target.value as KinematicsSolveForTime)}
              className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-blue-500 dark:focus:ring-blue-500/20"
            >
              <option value="v">{t_("solveForTime.v")}</option>
              <option value="v0">{t_("solveForTime.v0")}</option>
              <option value="a">{t_("solveForTime.a")}</option>
              <option value="t">{t_("solveForTime.t")}</option>
            </select>
          </label>
          {solveForTime !== "v0" && v0Field}
          {solveForTime !== "v" && vField}
          {solveForTime !== "a" && aField}
          {solveForTime !== "t" && tField}
        </div>
      ) : (
        <div className="mt-5 space-y-5">
          <label className="block space-y-2">
            <span className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t_("solveForLabel")}</span>
            <select
              value={solveForDistance}
              onChange={(e) => onSolveForDistanceChange(e.target.value as KinematicsSolveForDistance)}
              className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-blue-500 dark:focus:ring-blue-500/20"
            >
              <option value="v">{t_("solveForDistance.v")}</option>
              <option value="v0">{t_("solveForDistance.v0")}</option>
              <option value="a">{t_("solveForDistance.a")}</option>
              <option value="dx">{t_("solveForDistance.dx")}</option>
            </select>
          </label>
          {solveForDistance !== "v0" && v0Field}
          {solveForDistance !== "v" && vField}
          {solveForDistance !== "a" && aField}
          {solveForDistance !== "dx" && dxField}
        </div>
      )}
    </SectionCard>
  );
}
