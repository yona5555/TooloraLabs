import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import CopyButton from "@/components/tool-ui/CopyButton";
import DensityMaterialScaleDiagram from "./DensityMaterialScaleDiagram";
import { DIAGRAM_MATERIAL_KEYS, MATERIAL_DENSITIES } from "./types";
import type { DensityOperation, DensityResult as Result } from "./types";

type Props = {
  result: Result;
  operation: DensityOperation;
  digitStyle: DigitStyle;
};

export default function DensityResult({ result, operation, digitStyle }: Props) {
  const t = useTranslations("tools.density-calculator.result");
  const tMaterials = useTranslations("tools.density-calculator.materials");
  const fmt = (value: number) => formatLocalizedNumber(value, digitStyle, { maximumFractionDigits: 4 });

  if (result.error === "zero-volume") {
    return <ErrorCard heading={t("heading")} message={t("zeroVolume")} />;
  }
  if (result.error === "zero-density") {
    return <ErrorCard heading={t("heading")} message={t("zeroDensity")} />;
  }

  const headline = operation === "solveMass" ? result.mass : operation === "solveVolume" ? result.volume : result.density;
  const unit = operation === "solveMass" ? t("unitGrams") : operation === "solveVolume" ? t("unitCm3") : t("unitGPerCm3");
  const copyText = `${fmt(headline)} ${unit}`;

  const materials = DIAGRAM_MATERIAL_KEYS.map((key) => ({ label: tMaterials(key), value: MATERIAL_DENSITIES[key] }));

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl border border-blue-200 bg-white shadow-sm dark:border-blue-500/30 dark:bg-zinc-900 dark:shadow-none">
        <div className="flex w-full items-center justify-between gap-3 rounded-t-2xl bg-blue-600 px-4 py-2.5 lg:px-6 lg:py-3">
          <h2 className="font-bold text-white">{t("heading")}</h2>
          <CopyButton text={copyText} className="!text-white dark:!text-white" />
        </div>

        <div className="p-4 lg:p-6">
          <p dir="ltr" className="text-center font-mono text-4xl font-bold text-blue-700 dark:text-blue-400">
            {fmt(headline)} <span className="text-xl font-semibold text-blue-500 dark:text-blue-300">{unit}</span>
          </p>

          {operation === "solveDensity" && (
            <p className="mt-3 text-center text-sm text-zinc-500 dark:text-zinc-400">
              {t("siSummary", { si: fmt(result.densitySI), sg: fmt(result.specificGravity) })}
            </p>
          )}

          <DensityMaterialScaleDiagram
            densityGPerCm3={result.density}
            caption={t("diagramCaption", { value: fmt(result.density) })}
            materials={materials}
          />

          <p className="mt-4 border-t border-zinc-200 pt-4 text-sm leading-6 text-zinc-600 dark:border-zinc-800 dark:text-zinc-300">
            {operation === "solveDensity"
              ? t("stepDensity", { mass: fmt(result.mass), volume: fmt(result.volume) })
              : operation === "solveMass"
                ? t("stepMass", { density: fmt(result.density), volume: fmt(result.volume) })
                : t("stepVolume", { mass: fmt(result.mass), density: fmt(result.density) })}
          </p>
        </div>
      </div>
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
