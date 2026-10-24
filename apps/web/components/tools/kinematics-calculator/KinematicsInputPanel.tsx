"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import ToolInput from "@/components/tool-ui/ToolInput";
import KinematicsSolveForTabs from "./KinematicsSolveForTabs";
import KinematicsModeTabs from "./KinematicsModeTabs";
import { KINEMATICS_SOLVE_FOR_TIME, KINEMATICS_SOLVE_FOR_DISTANCE } from "./types";
import type { KinDraft } from "./KinLiveContext";

type NumericKey = "v0" | "v" | "a" | "t" | "dx";

type KinematicsInputPanelProps = {
  draft: KinDraft;
  onChange: <K extends keyof KinDraft>(key: K, value: KinDraft[K]) => void;
  onClear: () => void;
};

/** Known quantities, solve-for and the known values; every keystroke updates the whole page live. */
export default function KinematicsInputPanel({ draft, onChange, onClear }: KinematicsInputPanelProps) {
  const t = useTranslations("tools.kinematics-calculator.form");
  const { mode, tSolve, dSolve } = draft;
  const solved = mode === "timeBased" ? tSolve : dSolve;
  const order: NumericKey[] = mode === "timeBased" ? ["v0", "v", "a", "t"] : ["v0", "v", "a", "dx"];
  const fields = order.filter((k) => k !== solved);

  return (
    <SectionCard phoneRole="input" title={t("inputTitle")}>
      <div className="mb-5">
        <span className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("modeLabel")}</span>
        <KinematicsModeTabs mode={mode} onModeChange={(m) => onChange("mode", m)} />
      </div>

      <div className="mb-5">
        <span className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("solveForLabel")}</span>
        {mode === "timeBased" ? (
          <KinematicsSolveForTabs values={KINEMATICS_SOLVE_FOR_TIME} active={tSolve} onChange={(v) => onChange("tSolve", v)} translationKey="solveForTime" />
        ) : (
          <KinematicsSolveForTabs values={KINEMATICS_SOLVE_FOR_DISTANCE} active={dSolve} onChange={(v) => onChange("dSolve", v)} translationKey="solveForDistance" />
        )}
      </div>

      <form onSubmit={(e) => e.preventDefault()} className="space-y-5">
        {fields.map((key) => (
          <ToolInput
            key={key}
            label={t(`${key}Label`)}
            type="text"
            inputMode="decimal"
            placeholder={t(`${key}Placeholder`)}
            value={draft[key]}
            onChange={(e) => onChange(key, e.target.value)}
          />
        ))}

        <button
          type="button"
          onClick={onClear}
          className="rounded-xl border border-zinc-300 px-6 py-3 font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          {t("clear")}
        </button>
      </form>
    </SectionCard>
  );
}
