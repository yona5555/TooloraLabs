"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import ToolInput from "@/components/tool-ui/ToolInput";
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
}: GasLawInputPanelProps) {
  const t = useTranslations("tools.ideal-gas-law-calculator.form");

  return (
    <SectionCard title={t("inputTitle")}>
      <label className="block space-y-2">
        <span className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("solveForLabel")}</span>
        <select
          value={solveFor}
          onChange={(e) => onSolveForChange(e.target.value as GasLawSolveFor)}
          className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-blue-500 dark:focus:ring-blue-500/20"
        >
          <option value="pressure">{t("solveFor.pressure")}</option>
          <option value="volume">{t("solveFor.volume")}</option>
          <option value="moles">{t("solveFor.moles")}</option>
          <option value="temperature">{t("solveFor.temperature")}</option>
        </select>
      </label>

      <div className="mt-5 space-y-5">
        {solveFor !== "pressure" && (
          <ToolInput
            label={t("pressureLabel")}
            type="text"
            inputMode="decimal"
            placeholder={t("pressurePlaceholder")}
            value={pressureAtm}
            onChange={(e) => onPressureAtmChange(e.target.value)}
          />
        )}
        {solveFor !== "volume" && (
          <ToolInput
            label={t("volumeLabel")}
            type="text"
            inputMode="decimal"
            placeholder={t("volumePlaceholder")}
            value={volumeLiters}
            onChange={(e) => onVolumeLitersChange(e.target.value)}
          />
        )}
        {solveFor !== "moles" && (
          <ToolInput
            label={t("molesLabel")}
            type="text"
            inputMode="decimal"
            placeholder={t("molesPlaceholder")}
            value={moles}
            onChange={(e) => onMolesChange(e.target.value)}
          />
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
      </div>
    </SectionCard>
  );
}
