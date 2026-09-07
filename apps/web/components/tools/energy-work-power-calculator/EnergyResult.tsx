"use client";
import { Calculator } from "lucide-react";
import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import SectionCard from "@/components/tool-ui/SectionCard";
import RatioGauge from "@/components/tool-ui/RatioGauge";
import WorkVectorDiagram from "./WorkVectorDiagram";
import EnergyMagnitudeDiagram from "./EnergyMagnitudeDiagram";
import EnergyKineticDiagram from "./EnergyKineticDiagram";
import EnergyPotentialDiagram from "./EnergyPotentialDiagram";
import EnergyPowerRateDiagram from "./EnergyPowerRateDiagram";
import EnergyShareExportModal from "./EnergyShareExportModal";
import type { EnergyWorkPowerMode, EnergyResult as Result } from "./types";

type Props = {
  hasCalculated: boolean;
  result: Result;
  mode: EnergyWorkPowerMode;
  force: number;
  distance: number;
  angleDegrees: number;
  mass: number;
  velocity: number;
  height: number;
  workValue: number;
  time: number;
  digitStyle: DigitStyle;
};

const GAUGE_DOMAIN_MIN = -1;
const GAUGE_DOMAIN_MAX = 6;

export default function EnergyResult({ hasCalculated, result, mode, force, distance, angleDegrees, mass, velocity, height, workValue, time, digitStyle }: Props) {
  const t = useTranslations("tools.energy-work-power-calculator.result");
  const tForm = useTranslations("tools.energy-work-power-calculator.form");
  const tGauge = useTranslations("tools.energy-work-power-calculator.gauge");
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

  if (result.error === "zero-time") {
    return <ErrorCard heading={t("heading")} message={t("zeroTime")} />;
  }

  const headline = mode === "work" ? result.work : mode === "kineticEnergy" ? result.kineticEnergy : mode === "potentialEnergy" ? result.potentialEnergy : result.power;
  const unit = mode === "power" ? "W" : "J";
  const heroValue = `${fmt(headline)} ${unit}`;
  const operationLabel = tForm(`mode.${mode}`);
  const sentence = t(`caption.${mode}`);

  const resultRows = [{ label: t("heading"), value: heroValue }];

  const gaugeValue = Math.log10(Math.max(headline, 0.01));
  const gaugeCaption = gaugeValue < 2 ? tGauge("small") : gaugeValue < 4 ? tGauge("moderate") : tGauge("large");

  return (
    <div className="flex flex-col gap-4">
      <SectionCard
        title={t("heading")}
        action={
          <EnergyShareExportModal
            operationLabel={operationLabel}
            inputRows={buildInputRows()}
            resultRows={resultRows}
            heroLabel={t("heading")}
            heroValue={heroValue}
            sentence={sentence}
            gauge={{
              zones: [
                { from: GAUGE_DOMAIN_MIN, to: 2, color: "#22c55e" },
                { from: 2, to: 4, color: "#f59e0b" },
                { from: 4, to: GAUGE_DOMAIN_MAX, color: "#ef4444" },
              ],
              domainMin: GAUGE_DOMAIN_MIN,
              domainMax: GAUGE_DOMAIN_MAX,
              value: gaugeValue,
              ticks: [GAUGE_DOMAIN_MIN, 0, 2, 4, GAUGE_DOMAIN_MAX],
            }}
          />
        }
      >
        <p dir="ltr" className="text-center font-mono text-4xl font-bold text-blue-700 dark:text-blue-400">
          {fmt(headline)} <span className="text-xl font-semibold text-blue-500 dark:text-blue-300">{unit}</span>
        </p>
        <p className="mt-2 text-center text-sm text-zinc-500 dark:text-zinc-400">{sentence}</p>

        <div className="mt-4 border-t border-zinc-200 pt-4 dark:border-zinc-800">
          {mode === "work" && <WorkVectorDiagram angleDegrees={angleDegrees} caption={t("diagramCaptionWork", { angle: fmt(angleDegrees) })} />}
          {mode === "kineticEnergy" && (
            <EnergyKineticDiagram massLabel={`m = ${fmt(mass)} kg`} velocityLabel={`v = ${fmt(velocity)} m/s`} caption={t("diagramCaptionKinetic")} />
          )}
          {mode === "potentialEnergy" && (
            <EnergyPotentialDiagram
              heightFraction={Math.min(1, height / 50)}
              massLabel={`m = ${fmt(mass)} kg`}
              heightLabel={`h = ${fmt(height)} m`}
              caption={t("diagramCaptionPotential")}
            />
          )}
          {mode === "power" && (
            <EnergyPowerRateDiagram workLabel={`W = ${fmt(workValue)} J`} timeLabel={`t = ${fmt(time)} s`} caption={t("diagramCaptionPower")} />
          )}
        </div>

        <div className="mt-4 flex justify-center border-t border-zinc-200 pt-5 dark:border-zinc-800">
          <RatioGauge
            value={gaugeValue}
            domainMin={GAUGE_DOMAIN_MIN}
            domainMax={GAUGE_DOMAIN_MAX}
            zones={[
              { key: "small", from: GAUGE_DOMAIN_MIN, to: 2, colorClass: "stroke-green-500 dark:stroke-green-400" },
              { key: "moderate", from: 2, to: 4, colorClass: "stroke-amber-500 dark:stroke-amber-400" },
              { key: "large", from: 4, to: GAUGE_DOMAIN_MAX, colorClass: "stroke-red-500 dark:stroke-red-400" },
            ]}
            valueLabel={heroValue}
            caption={gaugeCaption}
            ticks={[GAUGE_DOMAIN_MIN, 0, 2, 4, GAUGE_DOMAIN_MAX]}
            tickFormatter={(tick) => `10^${tick}`}
          />
        </div>

        <div className="mt-4 border-t border-zinc-200 pt-4 dark:border-zinc-800">
          <EnergyMagnitudeDiagram value={headline} unit={unit} caption={t("diagramCaptionMagnitude", { value: fmt(headline), unit })} />
        </div>
      </SectionCard>
    </div>
  );

  function buildInputRows() {
    if (mode === "work") {
      return [
        { label: tForm("forceLabel"), value: `${fmt(force)} N` },
        { label: tForm("distanceLabel"), value: `${fmt(distance)} m` },
        { label: tForm("angleLabel"), value: `${fmt(angleDegrees)}°` },
      ];
    }
    if (mode === "kineticEnergy") {
      return [
        { label: tForm("massLabel"), value: `${fmt(mass)} kg` },
        { label: tForm("velocityLabel"), value: `${fmt(velocity)} m/s` },
      ];
    }
    if (mode === "potentialEnergy") {
      return [
        { label: tForm("massLabel"), value: `${fmt(mass)} kg` },
        { label: tForm("heightLabel"), value: `${fmt(height)} m` },
      ];
    }
    return [
      { label: tForm("workValueLabel"), value: `${fmt(workValue)} J` },
      { label: tForm("timeLabel"), value: `${fmt(time)} s` },
    ];
  }
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
