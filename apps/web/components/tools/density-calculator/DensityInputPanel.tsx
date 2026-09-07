"use client";
import type { FormEvent } from "react";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import ToolInput from "@/components/tool-ui/ToolInput";
import ToolButton from "@/components/tool-ui/ToolButton";
import DensityFormulaTriangleDiagram from "./DensityFormulaTriangleDiagram";
import { MATERIAL_KEYS, type DensityOperation, type MaterialKey } from "./types";

type DensityInputPanelProps = {
  operation: DensityOperation;
  mass: string;
  onMassChange: (value: string) => void;
  volume: string;
  onVolumeChange: (value: string) => void;
  density: string;
  onDensityChange: (value: string) => void;
  onMaterialPreset: (key: MaterialKey) => void;
  onCalculate: (e: FormEvent<HTMLFormElement>) => void;
  onClear: () => void;
};

export default function DensityInputPanel({
  operation,
  mass,
  onMassChange,
  volume,
  onVolumeChange,
  density,
  onDensityChange,
  onMaterialPreset,
  onCalculate,
  onClear,
}: DensityInputPanelProps) {
  const t = useTranslations("tools.density-calculator.form");
  const tMaterials = useTranslations("tools.density-calculator.materials");

  return (
    <SectionCard title={t("inputTitle")}>
      <DensityFormulaTriangleDiagram
        operation={operation}
        massLabel={operation === "solveMass" ? "?" : mass || "–"}
        densityLabel={operation === "solveDensity" ? "?" : density || "–"}
        volumeLabel={operation === "solveVolume" ? "?" : volume || "–"}
        caption={t("triangleCaption")}
      />

      <div className="mt-4">
        <span className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("materialPresetsLabel")}</span>
        <div className="flex flex-wrap gap-2">
          {MATERIAL_KEYS.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => onMaterialPreset(key)}
              className="rounded-lg border border-zinc-300 bg-transparent px-3 py-1.5 text-xs font-medium text-zinc-600 transition hover:border-blue-400 hover:text-blue-600 sm:text-sm dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-blue-400 dark:hover:text-blue-400"
            >
              {tMaterials(key)}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={onCalculate} className="mt-4 space-y-5">
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
