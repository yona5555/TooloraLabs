"use client";
import { Calculator } from "lucide-react";
import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import SectionCard from "@/components/tool-ui/SectionCard";
import RatioGauge from "@/components/tool-ui/RatioGauge";
import DensityMaterialScaleDiagram from "./DensityMaterialScaleDiagram";
import DensityBlockDiagram from "./DensityBlockDiagram";
import DensityUnitConversionDiagram from "./DensityUnitConversionDiagram";
import DensityShareExportModal from "./DensityShareExportModal";
import { DIAGRAM_MATERIAL_KEYS, MATERIAL_DENSITIES } from "./types";
import type { DensityOperation, DensityResult as Result } from "./types";

type Props = {
  hasCalculated: boolean;
  result: Result;
  operation: DensityOperation;
  digitStyle: DigitStyle;
};

const GAUGE_DOMAIN_MAX = 20;

export default function DensityResult({ hasCalculated, result, operation, digitStyle }: Props) {
  const t = useTranslations("tools.density-calculator.result");
  const tForm = useTranslations("tools.density-calculator.form");
  const tTabs = useTranslations("tools.density-calculator.tabs");
  const tMaterials = useTranslations("tools.density-calculator.materials");
  const tGauge = useTranslations("tools.density-calculator.gauge");
  const fmt = (value: number) => formatLocalizedNumber(value, digitStyle, { maximumFractionDigits: 4 });

  if (!hasCalculated) {
    return (
      <SectionCard title={t("heading")}>
        <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
          <Calculator size={32} className="text-zinc-300 dark:text-zinc-700" />
          <p className="max-w-xs text-sm text-zinc-500 dark:text-zinc-400">{t("emptyStateMessage")}</p>
        </div>
      </SectionCard>
    );
  }

  if (result.error === "zero-volume") {
    return <ErrorCard heading={t("heading")} message={t("zeroVolume")} />;
  }
  if (result.error === "zero-density") {
    return <ErrorCard heading={t("heading")} message={t("zeroDensity")} />;
  }

  const headline = operation === "solveMass" ? result.mass : operation === "solveVolume" ? result.volume : result.density;
  const unit = operation === "solveMass" ? t("unitGrams") : operation === "solveVolume" ? t("unitCm3") : t("unitGPerCm3");
  const heroValue = `${fmt(headline)} ${unit}`;
  const operationLabel = tTabs(operation);

  const materials = DIAGRAM_MATERIAL_KEYS.map((key) => ({ label: tMaterials(key), value: MATERIAL_DENSITIES[key] }));

  const sentence =
    operation === "solveDensity"
      ? t("stepDensity", { mass: fmt(result.mass), volume: fmt(result.volume) })
      : operation === "solveMass"
        ? t("stepMass", { density: fmt(result.density), volume: fmt(result.volume) })
        : t("stepVolume", { mass: fmt(result.mass), density: fmt(result.density) });

  const inputRows = [
    ...(operation !== "solveMass" ? [{ label: tForm("massLabel"), value: `${fmt(result.mass)} ${t("unitGrams")}` }] : []),
    ...(operation !== "solveVolume" ? [{ label: tForm("volumeLabel"), value: `${fmt(result.volume)} ${t("unitCm3")}` }] : []),
    ...(operation !== "solveDensity" ? [{ label: tForm("densityLabel"), value: `${fmt(result.density)} ${t("unitGPerCm3")}` }] : []),
  ];

  const resultRows = [
    { label: t("heading"), value: heroValue },
    { label: t("siLabel"), value: `${fmt(result.densitySI)} kg/m³` },
    { label: t("specificGravityLabel"), value: fmt(result.specificGravity) },
  ];

  return (
    <div className="flex flex-col gap-4">
      <SectionCard
        title={t("heading")}
        action={
          <DensityShareExportModal
            operationLabel={operationLabel}
            inputRows={inputRows}
            resultRows={resultRows}
            heroLabel={t("heading")}
            heroValue={heroValue}
            sentence={sentence}
            gauge={{
              zones: [
                { from: 0, to: 1, color: "#3b82f6" },
                { from: 1, to: GAUGE_DOMAIN_MAX, color: "#71717a" },
              ],
              domainMin: 0,
              domainMax: GAUGE_DOMAIN_MAX,
              value: result.specificGravity,
              ticks: [0, 1, 5, 10, GAUGE_DOMAIN_MAX],
            }}
          />
        }
      >
        <p dir="ltr" className="text-center font-mono text-4xl font-bold text-blue-700 dark:text-blue-400">
          {fmt(headline)} <span className="text-xl font-semibold text-blue-500 dark:text-blue-300">{unit}</span>
        </p>

        {operation === "solveDensity" && (
          <p className="mt-3 text-center text-sm text-zinc-500 dark:text-zinc-400">
            {t("siSummary", { si: fmt(result.densitySI), sg: fmt(result.specificGravity) })}
          </p>
        )}

        <div className="mt-4 border-t border-zinc-200 pt-4 dark:border-zinc-800">
          <DensityBlockDiagram
            volume={result.volume}
            density={result.density}
            massLabel={`${t("massShortLabel")} = ${fmt(result.mass)}`}
            volumeLabel={`${t("volumeShortLabel")} = ${fmt(result.volume)}`}
            densityLabel={`${t("densityShortLabel")} = ${fmt(result.density)}`}
            caption={t("blockCaption")}
          />
        </div>

        <div className="mt-4 flex justify-center border-t border-zinc-200 pt-5 dark:border-zinc-800">
          <RatioGauge
            value={result.specificGravity}
            domainMin={0}
            domainMax={GAUGE_DOMAIN_MAX}
            zones={[
              { key: "floats", from: 0, to: 1, colorClass: "stroke-blue-500 dark:stroke-blue-400" },
              { key: "sinks", from: 1, to: GAUGE_DOMAIN_MAX, colorClass: "stroke-zinc-400 dark:stroke-zinc-500" },
            ]}
            valueLabel={fmt(result.specificGravity)}
            caption={result.specificGravity < 1 ? tGauge("floats") : tGauge("sinks")}
            ticks={[0, 1, 5, 10, GAUGE_DOMAIN_MAX]}
          />
        </div>

        <div className="mt-4 border-t border-zinc-200 pt-4 dark:border-zinc-800">
          <DensityUnitConversionDiagram
            density={fmt(result.density)}
            densitySI={fmt(result.densitySI)}
            specificGravity={fmt(result.specificGravity)}
            siStepLabel={t("siStepLabel")}
            sgStepLabel={t("sgStepLabel")}
            caption={t("unitConversionCaption")}
          />
        </div>

        <div className="mt-4 border-t border-zinc-200 pt-4 dark:border-zinc-800">
          <DensityMaterialScaleDiagram
            densityGPerCm3={result.density}
            caption={t("diagramCaption", { value: fmt(result.density) })}
            materials={materials}
          />
        </div>

        <p className="mt-4 border-t border-zinc-200 pt-4 text-sm leading-6 text-zinc-600 dark:border-zinc-800 dark:text-zinc-300">{sentence}</p>
      </SectionCard>
    </div>
  );
}

function ErrorCard({ heading, message }: { heading: string; message: string }) {
  return (
    <div className="rounded-2xl border border-blue-200 bg-white shadow-sm dark:border-blue-500/30 dark:bg-zinc-900 dark:shadow-none">
      <div className="rounded-t-2xl bg-blue-600 px-4 py-2.5 lg:px-6 lg:py-3">
        <h2 className="font-bold text-white">{heading}</h2>
      </div>
      <div className="p-4 lg:p-6">
        <p className="text-center text-sm leading-6 text-zinc-600 dark:text-zinc-300">{message}</p>
      </div>
    </div>
  );
}
