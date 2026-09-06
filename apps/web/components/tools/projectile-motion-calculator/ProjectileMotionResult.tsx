"use client";
import { Calculator } from "lucide-react";
import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import SectionCard from "@/components/tool-ui/SectionCard";
import RatioGauge from "@/components/tool-ui/RatioGauge";
import TrajectoryDiagram from "./TrajectoryDiagram";
import ProjectileImpactVelocityDiagram from "./ProjectileImpactVelocityDiagram";
import ProjectileShareExportModal from "./ProjectileShareExportModal";
import type { ProjectileMotionResult as Result } from "./types";

type Props = {
  hasCalculated: boolean;
  result: Result;
  speed: number;
  angle: number;
  height: number;
  gravity: number;
  gravityPresetLabel: string;
  digitStyle: DigitStyle;
};

const GAUGE_DOMAIN_MAX = 90;

export default function ProjectileMotionResult({ hasCalculated, result, speed, angle, height, gravity, gravityPresetLabel, digitStyle }: Props) {
  const t = useTranslations("tools.projectile-motion-calculator.result");
  const tGauge = useTranslations("tools.projectile-motion-calculator.gauge");
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

  if (result.error === "invalid-gravity") return <ErrorCard heading={t("heading")} message={t("invalidGravity")} />;
  if (result.error === "invalid-speed") return <ErrorCard heading={t("heading")} message={t("invalidSpeed")} />;
  if (result.error === "invalid-height") return <ErrorCard heading={t("heading")} message={t("invalidHeight")} />;

  const heroValue = `${fmt(result.range)} m`;
  const sentence = t("rangeCaption");

  const inputRows = [
    { label: t("speed"), value: `${fmt(speed)} m/s` },
    { label: t("angleField"), value: `${fmt(angle)}°` },
    { label: t("heightField"), value: `${fmt(height)} m` },
    { label: t("gravityField"), value: `${fmt(gravity)} m/s²` },
  ];
  const resultRows = [
    { label: t("timeOfFlight"), value: `${fmt(result.timeOfFlight)} s` },
    { label: t("maxHeight"), value: `${fmt(result.maxHeight)} m` },
    { label: t("impactSpeed"), value: `${fmt(result.impactSpeed)} m/s` },
    { label: t("impactAngle"), value: `${fmt(result.impactAngle)}°` },
  ];

  const gaugeCaption = angle < 30 ? tGauge("low") : angle < 60 ? tGauge("optimal") : tGauge("steep");

  return (
    <div className="flex flex-col gap-4">
      <SectionCard
        title={t("heading")}
        action={
          <ProjectileShareExportModal
            operationLabel={gravityPresetLabel}
            inputRows={inputRows}
            resultRows={resultRows}
            heroLabel={t("range")}
            heroValue={heroValue}
            sentence={sentence}
            gauge={{
              zones: [
                { from: 0, to: 30, color: "#3b82f6" },
                { from: 30, to: 60, color: "#22c55e" },
                { from: 60, to: GAUGE_DOMAIN_MAX, color: "#f59e0b" },
              ],
              domainMin: 0,
              domainMax: GAUGE_DOMAIN_MAX,
              value: angle,
              ticks: [0, 30, 45, 60, GAUGE_DOMAIN_MAX],
            }}
          />
        }
      >
        <p dir="ltr" className="text-center font-mono text-4xl font-bold text-blue-700 dark:text-blue-400">
          {fmt(result.range)} <span className="text-xl font-semibold text-blue-500 dark:text-blue-300">m</span>
        </p>
        <p className="mt-1 text-center text-sm text-zinc-500 dark:text-zinc-400">{sentence}</p>

        <div className="mt-4 border-t border-zinc-200 pt-4 dark:border-zinc-800">
          <TrajectoryDiagram
            speed={speed}
            angle={angle}
            height={height}
            gravity={gravity}
            timeOfFlight={result.timeOfFlight}
            maxHeight={result.maxHeight}
            range={result.range}
            launchLabel={t("diagramLaunch")}
            peakLabel={t("diagramPeak", { value: fmt(result.maxHeight) })}
            landingLabel={t("diagramLanding")}
            caption={t("diagramCaption")}
          />
        </div>

        <div className="mt-4 border-t border-zinc-200 pt-4 dark:border-zinc-800">
          <ProjectileImpactVelocityDiagram
            impactAngleDegrees={result.impactAngle}
            speedLabel={`v=${fmt(result.impactSpeed)} m/s`}
            angleLabel={`${fmt(result.impactAngle)}°`}
            caption={t("impactDiagramCaption")}
          />
        </div>

        <div className="mt-4 flex justify-center border-t border-zinc-200 pt-5 dark:border-zinc-800">
          <RatioGauge
            value={angle}
            domainMin={0}
            domainMax={GAUGE_DOMAIN_MAX}
            zones={[
              { key: "low", from: 0, to: 30, colorClass: "stroke-blue-500 dark:stroke-blue-400" },
              { key: "optimal", from: 30, to: 60, colorClass: "stroke-green-500 dark:stroke-green-400" },
              { key: "steep", from: 60, to: GAUGE_DOMAIN_MAX, colorClass: "stroke-amber-500 dark:stroke-amber-400" },
            ]}
            valueLabel={`${fmt(angle)}°`}
            caption={gaugeCaption}
            ticks={[0, 30, 45, 60, GAUGE_DOMAIN_MAX]}
          />
        </div>

        <dl dir="ltr" className="mt-4 grid grid-cols-2 gap-3 border-t border-zinc-200 pt-4 text-sm sm:grid-cols-4 dark:border-zinc-800">
          <Stat label={t("timeOfFlight")} value={`${fmt(result.timeOfFlight)} s`} />
          <Stat label={t("maxHeight")} value={`${fmt(result.maxHeight)} m`} />
          <Stat label={t("impactSpeed")} value={`${fmt(result.impactSpeed)} m/s`} />
          <Stat label={t("impactAngle")} value={`${fmt(result.impactAngle)}°`} />
        </dl>
      </SectionCard>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{label}</dt>
      <dd className="font-mono font-semibold text-zinc-800 dark:text-zinc-100">{value}</dd>
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
