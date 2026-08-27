"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import ToolInput from "@/components/tool-ui/ToolInput";
import type { DensityOperation } from "./types";

type DensityInputPanelProps = {
  operation: DensityOperation;
  onOperationChange: (operation: DensityOperation) => void;
  mass: string;
  onMassChange: (value: string) => void;
  volume: string;
  onVolumeChange: (value: string) => void;
  density: string;
  onDensityChange: (value: string) => void;
};

export default function DensityInputPanel({
  operation,
  onOperationChange,
  mass,
  onMassChange,
  volume,
  onVolumeChange,
  density,
  onDensityChange,
}: DensityInputPanelProps) {
  const t = useTranslations("tools.density-calculator.form");

  return (
    <SectionCard title={t("inputTitle")}>
      <label className="block space-y-2">
        <span className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("operationLabel")}</span>
        <select
          value={operation}
          onChange={(e) => onOperationChange(e.target.value as DensityOperation)}
          className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-blue-500 dark:focus:ring-blue-500/20"
        >
          <option value="solveDensity">{t("operation.solveDensity")}</option>
          <option value="solveMass">{t("operation.solveMass")}</option>
          <option value="solveVolume">{t("operation.solveVolume")}</option>
        </select>
      </label>

      <div className="mt-5 space-y-5">
        {operation !== "solveMass" && (
          <ToolInput
            label={t("massLabel")}
            type="text"
            inputMode="decimal"
            placeholder={t("massPlaceholder")}
            value={mass}
            onChange={(e) => onMassChange(e.target.value)}
          />
        )}
        {operation !== "solveVolume" && (
          <ToolInput
            label={t("volumeLabel")}
            type="text"
            inputMode="decimal"
            placeholder={t("volumePlaceholder")}
            value={volume}
            onChange={(e) => onVolumeChange(e.target.value)}
          />
        )}
        {operation !== "solveDensity" && (
          <ToolInput
            label={t("densityLabel")}
            type="text"
            inputMode="decimal"
            placeholder={t("densityPlaceholder")}
            value={density}
            onChange={(e) => onDensityChange(e.target.value)}
          />
        )}
      </div>
    </SectionCard>
  );
}
