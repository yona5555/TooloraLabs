"use client";
import type { FormEvent } from "react";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import ToolInput from "@/components/tool-ui/ToolInput";
import ToolButton from "@/components/tool-ui/ToolButton";
import GasLawModeTabs from "./GasLawModeTabs";
import GasVariablesDiagram from "./GasVariablesDiagram";
import type { GasLawSolveFor } from "./types";

type GasLawInputPanelProps = {
  solveFor: GasLawSolveFor;
  onSolveForChange: (value: GasLawSolveFor) => void;
  pressureAtm: string;
  onPressureAtmChange: (value: string) => void;
  volumeLiters: string;
  onVolumeLitersChange: (value: string) => void;
  moles: string;
  onMolesChange: (value: string) => void;
  temperatureKelvin: string;
  onTemperatureKelvinChange: (value: string) => void;
  onCalculate: (e: FormEvent<HTMLFormElement>) => void;
  onClear: () => void;
};

export default function GasLawInputPanel({
  solveFor,
  onSolveForChange,
  pressureAtm,
  onPressureAtmChange,
  volumeLiters,
  onVolumeLitersChange,
  moles,
  onMolesChange,
  temperatureKelvin,
  onTemperatureKelvinChange,
  onCalculate,
  onClear,
}: GasLawInputPanelProps) {
  const t = useTranslations("tools.ideal-gas-law-calculator.form");

  return (
    <SectionCard title={t("inputTitle")}>
      <div className="mb-5">
        <span className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("solveForLabel")}</span>
        <GasLawModeTabs solveFor={solveFor} onSolveForChange={onSolveForChange} />
      </div>

      <GasVariablesDiagram
        solved={solveFor}
        labels={{ pressure: "P", volume: "V", moles: "n", temperature: "T" }}
        values={{
          pressure: solveFor === "pressure" ? "?" : pressureAtm || "–",
          volume: solveFor === "volume" ? "?" : volumeLiters || "–",
          moles: solveFor === "moles" ? "?" : moles || "–",
          temperature: solveFor === "temperature" ? "?" : temperatureKelvin || "–",
        }}
        caption={t("variablesCaption")}
      />

      <form onSubmit={onCalculate} className="mt-4 space-y-5">
        {solveFor !== "pressure" && (
          <ToolInput label={t("pressureLabel")} type="text" inputMode="decimal" placeholder={t("pressurePlaceholder")} value={pressureAtm} onChange={(e) => onPressureAtmChange(e.target.value)} />
        )}
        {solveFor !== "volume" && (
          <ToolInput label={t("volumeLabel")} type="text" inputMode="decimal" placeholder={t("volumePlaceholder")} value={volumeLiters} onChange={(e) => onVolumeLitersChange(e.target.value)} />
        )}
        {solveFor !== "moles" && (
          <ToolInput label={t("molesLabel")} type="text" inputMode="decimal" placeholder={t("molesPlaceholder")} value={moles} onChange={(e) => onMolesChange(e.target.value)} />
        )}
        {solveFor !== "temperature" && (
          <ToolInput
            label={t("temperatureLabel")}
            type="text"
            inputMode="decimal"
            placeholder={t("temperaturePlaceholder")}
            value={temperatureKelvin}
            onChange={(e) => onTemperatureKelvinChange(e.target.value)}
          />
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
