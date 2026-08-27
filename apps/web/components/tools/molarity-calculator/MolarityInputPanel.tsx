"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import ToolInput from "@/components/tool-ui/ToolInput";
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
}: MolarityInputPanelProps) {
  const t = useTranslations("tools.molarity-calculator.form");

  return (
    <SectionCard title={t("inputTitle")}>
      <label className="block space-y-2">
        <span className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("modeLabel")}</span>
        <select
          value={mode}
          onChange={(e) => onModeChange(e.target.value as MolarityMode)}
          className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-blue-500 dark:focus:ring-blue-500/20"
        >
          <option value="concentration">{t("mode.concentration")}</option>
          <option value="dilution">{t("mode.dilution")}</option>
        </select>
      </label>

      {mode === "concentration" ? (
        <div className="mt-5 space-y-5">
          <label className="block space-y-2">
            <span className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("basisLabel")}</span>
            <select
              value={concentrationBasis}
              onChange={(e) => onConcentrationBasisChange(e.target.value as ConcentrationBasis)}
              className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-blue-500 dark:focus:ring-blue-500/20"
            >
              <option value="moles">{t("basis.moles")}</option>
              <option value="mass">{t("basis.mass")}</option>
            </select>
          </label>

          {concentrationBasis === "moles" ? (
            <ToolInput
              label={t("molesLabel")}
              type="text"
              inputMode="decimal"
              placeholder={t("molesPlaceholder")}
              value={moles}
              onChange={(e) => onMolesChange(e.target.value)}
            />
          ) : (
            <>
              <ToolInput
                label={t("massLabel")}
                type="text"
                inputMode="decimal"
                placeholder={t("massPlaceholder")}
                value={massGrams}
                onChange={(e) => onMassGramsChange(e.target.value)}
              />
              <ToolInput
                label={t("molarMassLabel")}
                type="text"
                inputMode="decimal"
                placeholder={t("molarMassPlaceholder")}
                value={molarMass}
                onChange={(e) => onMolarMassChange(e.target.value)}
              />
            </>
          )}

          <ToolInput
            label={t("volumeLabel")}
            type="text"
            inputMode="decimal"
            placeholder={t("volumePlaceholder")}
            value={volumeLiters}
            onChange={(e) => onVolumeLitersChange(e.target.value)}
          />
        </div>
      ) : (
        <div className="mt-5 space-y-5">
          <label className="block space-y-2">
            <span className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("solveForLabel")}</span>
            <select
              value={dilutionSolveFor}
              onChange={(e) => onDilutionSolveForChange(e.target.value as DilutionSolveFor)}
              className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-blue-500 dark:focus:ring-blue-500/20"
            >
              <option value="c1">{t("solveFor.c1")}</option>
              <option value="v1">{t("solveFor.v1")}</option>
              <option value="c2">{t("solveFor.c2")}</option>
              <option value="v2">{t("solveFor.v2")}</option>
            </select>
          </label>

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
        </div>
      )}
    </SectionCard>
  );
}
