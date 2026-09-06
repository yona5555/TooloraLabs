"use client";
import type { FormEvent } from "react";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import ToolInput from "@/components/tool-ui/ToolInput";
import ToolButton from "@/components/tool-ui/ToolButton";
import MolarityModeTabs from "./MolarityModeTabs";
import MolarityBasisTabs from "./MolarityBasisTabs";
import MolarityDilutionSolveForTabs from "./MolarityDilutionSolveForTabs";
import MolarityVariablesDiagram from "./MolarityVariablesDiagram";
import type { ConcentrationBasis, DilutionSolveFor, MolarityMode } from "./types";

type MolarityInputPanelProps = {
  mode: MolarityMode;
  onModeChange: (mode: MolarityMode) => void;
  concentrationBasis: ConcentrationBasis;
  onConcentrationBasisChange: (basis: ConcentrationBasis) => void;
  moles: string;
  onMolesChange: (value: string) => void;
  massGrams: string;
  onMassGramsChange: (value: string) => void;
  molarMass: string;
  onMolarMassChange: (value: string) => void;
  volumeLiters: string;
  onVolumeLitersChange: (value: string) => void;
  dilutionSolveFor: DilutionSolveFor;
  onDilutionSolveForChange: (value: DilutionSolveFor) => void;
  c1: string;
  onC1Change: (value: string) => void;
  v1: string;
  onV1Change: (value: string) => void;
  c2: string;
  onC2Change: (value: string) => void;
  v2: string;
  onV2Change: (value: string) => void;
  onCalculate: (e: FormEvent<HTMLFormElement>) => void;
  onClear: () => void;
};

export default function MolarityInputPanel({
  mode,
  onModeChange,
  concentrationBasis,
  onConcentrationBasisChange,
  moles,
  onMolesChange,
  massGrams,
  onMassGramsChange,
  molarMass,
  onMolarMassChange,
  volumeLiters,
  onVolumeLitersChange,
  dilutionSolveFor,
  onDilutionSolveForChange,
  c1,
  onC1Change,
  v1,
  onV1Change,
  c2,
  onC2Change,
  v2,
  onV2Change,
  onCalculate,
  onClear,
}: MolarityInputPanelProps) {
  const t = useTranslations("tools.molarity-calculator.form");

  return (
    <SectionCard title={t("inputTitle")}>
      <div className="mb-5">
        <span className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("modeLabel")}</span>
        <MolarityModeTabs mode={mode} onModeChange={onModeChange} />
      </div>

      {mode === "concentration" ? (
        <>
          <div className="mb-5">
            <span className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("basisLabel")}</span>
            <MolarityBasisTabs basis={concentrationBasis} onBasisChange={onConcentrationBasisChange} />
          </div>

          <MolarityVariablesDiagram
            solved="molarity"
            order={["moles", "molarity", "volume"]}
            labels={{ moles: "n", molarity: "M", volume: "V" }}
            caption={t("variablesCaption")}
          />

          <form onSubmit={onCalculate} className="mt-4 space-y-5">
            {concentrationBasis === "moles" ? (
              <ToolInput label={t("molesLabel")} type="text" inputMode="decimal" placeholder={t("molesPlaceholder")} value={moles} onChange={(e) => onMolesChange(e.target.value)} />
            ) : (
              <>
                <ToolInput label={t("massLabel")} type="text" inputMode="decimal" placeholder={t("massPlaceholder")} value={massGrams} onChange={(e) => onMassGramsChange(e.target.value)} />
                <ToolInput label={t("molarMassLabel")} type="text" inputMode="decimal" placeholder={t("molarMassPlaceholder")} value={molarMass} onChange={(e) => onMolarMassChange(e.target.value)} />
              </>
            )}
            <ToolInput label={t("volumeLabel")} type="text" inputMode="decimal" placeholder={t("volumePlaceholder")} value={volumeLiters} onChange={(e) => onVolumeLitersChange(e.target.value)} />

            <div className="flex flex-wrap gap-4">
              <ToolButton type="submit">{t("calculate")}</ToolButton>
              <button type="button" onClick={onClear} className="rounded-xl border border-zinc-300 px-6 py-3 font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800">
                {t("clear")}
              </button>
            </div>
          </form>
        </>
      ) : (
        <>
          <div className="mb-5">
            <span className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("solveForLabel")}</span>
            <MolarityDilutionSolveForTabs active={dilutionSolveFor} onChange={onDilutionSolveForChange} />
          </div>

          <MolarityVariablesDiagram
            solved={dilutionSolveFor}
            order={["c1", "v1", "c2", "v2"]}
            labels={{ c1: "C₁", v1: "V₁", c2: "C₂", v2: "V₂" }}
            caption={t("variablesCaption")}
          />

          <form onSubmit={onCalculate} className="mt-4 space-y-5">
            {dilutionSolveFor !== "c1" && (
              <ToolInput label={t("c1Label")} type="text" inputMode="decimal" placeholder={t("c1Placeholder")} value={c1} onChange={(e) => onC1Change(e.target.value)} />
            )}
            {dilutionSolveFor !== "v1" && (
              <ToolInput label={t("v1Label")} type="text" inputMode="decimal" placeholder={t("v1Placeholder")} value={v1} onChange={(e) => onV1Change(e.target.value)} />
            )}
            {dilutionSolveFor !== "c2" && (
              <ToolInput label={t("c2Label")} type="text" inputMode="decimal" placeholder={t("c2Placeholder")} value={c2} onChange={(e) => onC2Change(e.target.value)} />
            )}
            {dilutionSolveFor !== "v2" && (
              <ToolInput label={t("v2Label")} type="text" inputMode="decimal" placeholder={t("v2Placeholder")} value={v2} onChange={(e) => onV2Change(e.target.value)} />
            )}

            <div className="flex flex-wrap gap-4">
              <ToolButton type="submit">{t("calculate")}</ToolButton>
              <button type="button" onClick={onClear} className="rounded-xl border border-zinc-300 px-6 py-3 font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800">
                {t("clear")}
              </button>
            </div>
          </form>
        </>
      )}
    </SectionCard>
  );
}
