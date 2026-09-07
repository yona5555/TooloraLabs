"use client";
import { Calculator } from "lucide-react";
import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import SectionCard from "@/components/tool-ui/SectionCard";
import RatioGauge from "@/components/tool-ui/RatioGauge";
import MotionDiagram from "./MotionDiagram";
import KinematicsVelocityTimeDiagram from "./KinematicsVelocityTimeDiagram";
import KinematicsShareExportModal from "./KinematicsShareExportModal";
import type { KinematicsMode, KinematicsResult as Result, KinematicsSolveForDistance, KinematicsSolveForTime } from "./types";

type Props = {
  hasCalculated: boolean;
  result: Result;
  mode: KinematicsMode;
  solveForTime: KinematicsSolveForTime;
  solveForDistance: KinematicsSolveForDistance;
  digitStyle: DigitStyle;
};

const UNIT: Record<string, string> = { v: "m/s", v0: "m/s", a: "m/s²", t: "s", dx: "m" };
const GAUGE_DOMAIN_MAX = 30;
const GRAVITY = 9.8;

export default function KinematicsResult({ hasCalculated, result, mode, solveForTime, solveForDistance, digitStyle }: Props) {
  const t = useTranslations("tools.kinematics-calculator.result");
  const tForm = useTranslations("tools.kinematics-calculator.form");
  const tGauge = useTranslations("tools.kinematics-calculator.gauge");
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

  if (result.error === "zero-time") return <ErrorCard heading={t("heading")} message={t("zeroTime")} />;
  if (result.error === "zero-acceleration") return <ErrorCard heading={t("heading")} message={t("zeroAcceleration")} />;
  if (result.error === "zero-displacement") return <ErrorCard heading={t("heading")} message={t("zeroDisplacement")} />;
  if (result.error === "negative-discriminant") return <ErrorCard heading={t("heading")} message={t("negativeDiscriminant")} />;

  const solveFor = mode === "timeBased" ? solveForTime : solveForDistance;
  const valueByField: Record<string, number> = { v: result.v, v0: result.v0, a: result.a, t: result.t, dx: result.dx };
  const headline = valueByField[solveFor];
  const unit = UNIT[solveFor];
  const heroValue = `${fmt(headline)} ${unit}`;
  const operationLabel = tForm(`mode.${mode}`);

  const inputRows = [
    { label: t("v0"), value: `${fmt(result.v0)} m/s` },
    { label: t("v"), value: `${fmt(result.v)} m/s` },
    { label: t("a"), value: `${fmt(result.a)} m/s²` },
  ];
  const resultRows = [
    { label: t("t"), value: result.tAvailable ? `${fmt(result.t)} s` : t("undefined") },
    { label: t("dx"), value: `${fmt(result.dx)} m` },
  ];

  const gaugeValue = Math.min(Math.abs(result.a), GAUGE_DOMAIN_MAX);
  const gaugeCaption = Math.abs(result.a) < GRAVITY ? tGauge("gentle") : Math.abs(result.a) < 20 ? tGauge("strong") : tGauge("extreme");

  return (
    <div className="flex flex-col gap-4">
      <SectionCard
        title={t("heading")}
        action={
          <KinematicsShareExportModal
            operationLabel={operationLabel}
            inputRows={inputRows}
            resultRows={resultRows}
            heroLabel={t("heading")}
            heroValue={heroValue}
            sentence={t("sentence", { v0: fmt(result.v0), v: fmt(result.v) })}
            gauge={{
              zones: [
                { from: 0, to: GRAVITY, color: "#22c55e" },
                { from: GRAVITY, to: 20, color: "#f59e0b" },
                { from: 20, to: GAUGE_DOMAIN_MAX, color: "#ef4444" },
              ],
              domainMin: 0,
              domainMax: GAUGE_DOMAIN_MAX,
              value: gaugeValue,
              ticks: [0, GRAVITY, 20, GAUGE_DOMAIN_MAX],
            }}
          />
        }
      >
        <p dir="ltr" className="text-center font-mono text-4xl font-bold text-blue-700 dark:text-blue-400">
          {fmt(headline)} <span className="text-xl font-semibold text-blue-500 dark:text-blue-300">{unit}</span>
        </p>

        <div className="mt-4 border-t border-zinc-200 pt-4 dark:border-zinc-800">
          <MotionDiagram v0={result.v0} v={result.v} startLabel={t("diagramStart")} endLabel={t("diagramEnd")} caption={t("diagramCaption")} />
        </div>

        <div className="mt-4 border-t border-zinc-200 pt-4 dark:border-zinc-800">
          <KinematicsVelocityTimeDiagram
            v0={result.v0}
            v={result.v}
            xLabel={t("vtXLabel")}
            yLabel={t("vtYLabel")}
            areaLabel={t("vtAreaLabel", { dx: fmt(result.dx) })}
            caption={t("vtCaption")}
          />
        </div>

        <div className="mt-4 flex justify-center border-t border-zinc-200 pt-5 dark:border-zinc-800">
          <RatioGauge
            value={gaugeValue}
            domainMin={0}
            domainMax={GAUGE_DOMAIN_MAX}
            zones={[
              { key: "gentle", from: 0, to: GRAVITY, colorClass: "stroke-green-500 dark:stroke-green-400" },
              { key: "strong", from: GRAVITY, to: 20, colorClass: "stroke-amber-500 dark:stroke-amber-400" },
              { key: "extreme", from: 20, to: GAUGE_DOMAIN_MAX, colorClass: "stroke-red-500 dark:stroke-red-400" },
            ]}
            valueLabel={`${fmt(result.a)} m/s²`}
            caption={gaugeCaption}
            ticks={[0, GRAVITY, 20, GAUGE_DOMAIN_MAX]}
          />
        </div>

        <dl dir="ltr" className="mt-4 grid grid-cols-2 gap-3 border-t border-zinc-200 pt-4 text-sm sm:grid-cols-5 dark:border-zinc-800">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{t("v0")}</dt>
            <dd className="font-mono font-semibold text-zinc-800 dark:text-zinc-100">{fmt(result.v0)}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{t("v")}</dt>
            <dd className="font-mono font-semibold text-zinc-800 dark:text-zinc-100">{fmt(result.v)}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{t("a")}</dt>
            <dd className="font-mono font-semibold text-zinc-800 dark:text-zinc-100">{fmt(result.a)}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{t("t")}</dt>
            <dd className="font-mono font-semibold text-zinc-800 dark:text-zinc-100">{result.tAvailable ? fmt(result.t) : t("undefined")}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{t("dx")}</dt>
            <dd className="font-mono font-semibold text-zinc-800 dark:text-zinc-100">{fmt(result.dx)}</dd>
          </div>
        </dl>
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
