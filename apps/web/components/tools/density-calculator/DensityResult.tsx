"use client";
import { useTranslations } from "next-intl";
import { LiveTableFill } from "@/components/tool-ui/three/LiveTable3DLayout";
import DensityShareExportModal from "./DensityShareExportModal";
import DensityLive3D from "./DensityLive3D";
import { useDensityModel } from "./DensityLiveContext";

const GAUGE_DOMAIN_MAX = 20;

/**
 * Result card: the solved quantity as the hero with its substituted formula, then the deep live
 * table beside the 3D water tank (stacked in this narrow column), filling the stretched column.
 */
export default function DensityResult() {
  const t = useTranslations("tools.density-calculator.result");
  const tForm = useTranslations("tools.density-calculator.form");
  const tTabs = useTranslations("tools.density-calculator.tabs");
  const tGauge = useTranslations("tools.density-calculator.gauge");
  const { draft, result, a, f: fmt } = useDensityModel();
  const operation = draft.operation;

  if (result.error === "zero-volume") return <ErrorCard heading={t("heading")} message={t("zeroVolume")} />;
  if (result.error === "zero-density") return <ErrorCard heading={t("heading")} message={t("zeroDensity")} />;
  if (!a) return <ErrorCard heading={t("heading")} message={t("positiveOnly")} />;

  const headline = operation === "solveMass" ? result.mass : operation === "solveVolume" ? result.volume : result.density;
  const unit = operation === "solveMass" ? t("unitGrams") : operation === "solveVolume" ? t("unitCm3") : t("unitGPerCm3");
  const heroValue = `${fmt(headline)} ${unit}`;

  const sentence =
    operation === "solveDensity"
      ? t("stepDensity", { mass: fmt(result.mass), volume: fmt(result.volume) })
      : operation === "solveMass"
        ? t("stepMass", { density: fmt(result.density), volume: fmt(result.volume) })
        : t("stepVolume", { mass: fmt(result.mass), density: fmt(result.density) });

  const caption =
    operation === "solveDensity"
      ? `ρ = m / V = ${fmt(result.mass)} g / ${fmt(result.volume)} cm³ = ${fmt(result.densitySI)} kg/m³`
      : operation === "solveMass"
        ? `m = ρ × V = ${fmt(result.density)} g/cm³ × ${fmt(result.volume)} cm³ = ${fmt(a.massKg)} kg`
        : `V = m / ρ = ${fmt(result.mass)} g / ${fmt(result.density)} g/cm³ = ${fmt(a.volumeM3)} m³`;

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
    <div data-card="" data-fixed="" suppressHydrationWarning className="rounded-2xl border border-blue-200 bg-white shadow-sm lg:flex lg:h-full lg:flex-col dark:border-blue-500/30 dark:bg-zinc-900 dark:shadow-none">
      <div className="flex w-full items-center justify-between gap-3 rounded-t-2xl bg-blue-600 px-4 py-2.5 lg:px-6 lg:py-3">
        <h2 className="font-bold text-white">{t("heading")}</h2>
        <DensityShareExportModal
          operationLabel={tTabs(operation)}
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
            valueLabel: fmt(result.specificGravity),
            caption: result.specificGravity < 1 ? tGauge("floats") : tGauge("sinks"),
          }}
        />
      </div>
      <div className="p-4 lg:flex lg:flex-1 lg:flex-col lg:p-6">
        <p dir="ltr" className="text-center font-mono text-4xl font-bold text-blue-700 dark:text-blue-400">
          {fmt(headline)} <span className="text-xl font-semibold text-blue-500 dark:text-blue-300">{unit}</span>
        </p>
        <p dir="ltr" className="mt-1 text-center font-mono text-sm text-zinc-500 dark:text-zinc-400">
          {caption}
        </p>
        <div className="mt-4 lg:flex lg:flex-1 lg:flex-col">
          <LiveTableFill>
            <DensityLive3D />
          </LiveTableFill>
        </div>
      </div>
    </div>
  );
}

function ErrorCard({ heading, message }: { heading: string; message: string }) {
  return (
    <div data-card="" data-fixed="" suppressHydrationWarning className="rounded-2xl border border-blue-200 bg-white shadow-sm dark:border-blue-500/30 dark:bg-zinc-900 dark:shadow-none">
      <div className="rounded-t-2xl bg-blue-600 px-4 py-2.5 lg:px-6 lg:py-3">
        <h2 className="font-bold text-white">{heading}</h2>
      </div>
      <div className="p-4 lg:p-6">
        <p className="text-center text-sm leading-6 text-zinc-600 dark:text-zinc-300">{message}</p>
      </div>
    </div>
  );
}
