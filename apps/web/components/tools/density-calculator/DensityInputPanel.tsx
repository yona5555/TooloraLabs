"use client";
import type { FormEvent } from "react";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import ToolInput from "@/components/tool-ui/ToolInput";
import ToolButton from "@/components/tool-ui/ToolButton";
import DensityModeTabs from "./DensityModeTabs";
import DensityFormulaTriangleDiagram from "./DensityFormulaTriangleDiagram";
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
  onCalculate: (e: FormEvent<HTMLFormElement>) => void;
  onClear: () => void;
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
  onCalculate,
  onClear,
}: DensityInputPanelProps) {
  const t = useTranslations("tools.density-calculator.form");

  return (
    <SectionCard title={t("inputTitle")}>
      <div className="mb-5">
        <span className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("operationLabel")}</span>
        <DensityModeTabs operation={operation} onOperationChange={onOperationChange} />
      </div>

      <DensityFormulaTriangleDiagram
        operation={operation}
        massLabel={t("massShort")}
        densityLabel={t("densityShort")}
        volumeLabel={t("volumeShort")}
        caption={t("triangleCaption")}
      />

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
