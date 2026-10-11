"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import ToolInput from "@/components/tool-ui/ToolInput";
import ForceSolveForTabs from "./ForceSolveForTabs";
import ForceModeTabs from "./ForceModeTabs";
import { SECOND_LAW_SOLVE_FOR, GRAVITATION_SOLVE_FOR } from "./types";
import type { ForceDraft } from "./ForceLiveContext";

type NumericKey = "force" | "mass" | "acceleration" | "mass1" | "mass2" | "distance";

type ForceInputPanelProps = {
  draft: ForceDraft;
  onChange: <K extends keyof ForceDraft>(key: K, value: ForceDraft[K]) => void;
  onClear: () => void;
};

/** Law, solve-for and the known values; every keystroke updates the whole page live. */
export default function ForceInputPanel({ draft, onChange, onClear }: ForceInputPanelProps) {
  const t = useTranslations("tools.force-calculator.form");
  const { mode, slSolve, gSolve } = draft;

  const fields: { key: NumericKey; label: string; placeholder: string }[] =
    mode === "secondLaw"
      ? [
          { key: "force" as const, label: t("forceLabel"), placeholder: t("forcePlaceholder") },
          { key: "mass" as const, label: t("massLabel"), placeholder: t("massPlaceholder") },
          { key: "acceleration" as const, label: t("accelerationLabel"), placeholder: t("accelerationPlaceholder") },
        ].filter((x) => x.key !== slSolve)
      : [
          { key: "force" as const, label: t("forceLabel"), placeholder: t("forcePlaceholder") },
          { key: "mass1" as const, label: t("mass1Label"), placeholder: t("mass1Placeholder") },
          { key: "mass2" as const, label: t("mass2Label"), placeholder: t("mass2Placeholder") },
          { key: "distance" as const, label: t("distanceLabel"), placeholder: t("distancePlaceholder") },
        ].filter((x) => x.key !== gSolve);

  return (
    <SectionCard title={t("inputTitle")}>
      <div className="mb-5">
        <span className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("modeLabel")}</span>
        <ForceModeTabs mode={mode} onModeChange={(m) => onChange("mode", m)} />
      </div>

      <div className="mb-5">
        <span className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("solveForLabel")}</span>
        {mode === "secondLaw" ? (
          <ForceSolveForTabs values={SECOND_LAW_SOLVE_FOR} active={slSolve} onChange={(v) => onChange("slSolve", v)} translationKey="secondLawSolveFor" />
        ) : (
          <ForceSolveForTabs values={GRAVITATION_SOLVE_FOR} active={gSolve} onChange={(v) => onChange("gSolve", v)} translationKey="gravitationSolveFor" />
        )}
      </div>

      <form onSubmit={(e) => e.preventDefault()} className="space-y-5">
        {fields.map((field) => (
          <ToolInput
            key={field.key}
            label={field.label}
            type="text"
            inputMode="decimal"
            placeholder={field.placeholder}
            value={draft[field.key]}
            onChange={(e) => onChange(field.key, e.target.value)}
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
