"use client";
import { Calculator } from "lucide-react";
import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import SectionCard from "@/components/tool-ui/SectionCard";
import RatioGauge from "@/components/tool-ui/RatioGauge";
import ForceBlockDiagram from "./ForceBlockDiagram";
import GravitationDiagram from "./GravitationDiagram";
import ForceInverseSquareDiagram from "./ForceInverseSquareDiagram";
import ForceShareExportModal from "./ForceShareExportModal";
import type { ForceMode, ForceResult as Result, GravitationSolveFor, SecondLawSolveFor } from "./types";

type Props = {
  hasCalculated: boolean;
  result: Result;
  mode: ForceMode;
  secondLawSolveFor: SecondLawSolveFor;
  gravitationSolveFor: GravitationSolveFor;
  digitStyle: DigitStyle;
};

const GAUGE_DOMAIN_MIN = -12;
const GAUGE_DOMAIN_MAX = 8;

export default function ForceResult({ hasCalculated, result, mode, secondLawSolveFor, gravitationSolveFor, digitStyle }: Props) {
  const t = useTranslations("tools.force-calculator.result");
  const tForm = useTranslations("tools.force-calculator.form");
  const tGauge = useTranslations("tools.force-calculator.gauge");
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

  if (result.error === "zero-acceleration") return <ErrorCard heading={t("heading")} message={t("zeroAcceleration")} />;
  if (result.error === "zero-mass") return <ErrorCard heading={t("heading")} message={t("zeroMass")} />;
  if (result.error === "zero-mass1") return <ErrorCard heading={t("heading")} message={t("zeroMass1")} />;
  if (result.error === "zero-mass2") return <ErrorCard heading={t("heading")} message={t("zeroMass2")} />;
  if (result.error === "zero-distance") return <ErrorCard heading={t("heading")} message={t("zeroDistance")} />;
  if (result.error === "zero-force") return <ErrorCard heading={t("heading")} message={t("zeroForce")} />;

  const secondLawUnit: Record<SecondLawSolveFor, string> = { force: "N", mass: "kg", acceleration: "m/s²" };
  const gravitationUnit: Record<GravitationSolveFor, string> = { force: "N", mass1: "kg", mass2: "kg", distance: "m" };

  const headline =
    mode === "secondLaw"
      ? { force: result.force, mass: result.mass, acceleration: result.acceleration }[secondLawSolveFor]
      : { force: result.force, mass1: result.mass1, mass2: result.mass2, distance: result.distance }[gravitationSolveFor];
  const unit = mode === "secondLaw" ? secondLawUnit[secondLawSolveFor] : gravitationUnit[gravitationSolveFor];
  const heroValue = `${fmt(headline)} ${unit}`;
  const operationLabel = tForm(`mode.${mode}`);

  const inputRows =
    mode === "secondLaw"
      ? [
          { label: t("force"), value: `${fmt(result.force)} N` },
          { label: t("mass"), value: `${fmt(result.mass)} kg` },
          { label: t("acceleration"), value: `${fmt(result.acceleration)} m/s²` },
        ]
      : [
          { label: t("mass1"), value: `${fmt(result.mass1)} kg` },
          { label: t("mass2"), value: `${fmt(result.mass2)} kg` },
          { label: t("distance"), value: `${fmt(result.distance)} m` },
        ];
  const resultRows = [{ label: t("force"), value: `${fmt(result.force)} N` }];

  const gaugeValue = Math.log10(Math.max(Math.abs(result.force), 1e-12));
  const gaugeCaption = gaugeValue < -3 ? tGauge("tiny") : gaugeValue < 3 ? tGauge("everyday") : tGauge("massive");

  return (
    <div className="flex flex-col gap-4">
      <SectionCard
        title={t("heading")}
        action={
          <ForceShareExportModal
            operationLabel={operationLabel}
            inputRows={inputRows}
            resultRows={resultRows}
            heroLabel={t("heading")}
            heroValue={heroValue}
            sentence={t("sentence", { value: fmt(result.force) })}
            gauge={{
              zones: [
                { from: GAUGE_DOMAIN_MIN, to: -3, color: "#3b82f6" },
                { from: -3, to: 3, color: "#22c55e" },
                { from: 3, to: GAUGE_DOMAIN_MAX, color: "#ef4444" },
              ],
              domainMin: GAUGE_DOMAIN_MIN,
              domainMax: GAUGE_DOMAIN_MAX,
              value: gaugeValue,
              ticks: [GAUGE_DOMAIN_MIN, -3, 3, GAUGE_DOMAIN_MAX],
            }}
          />
        }
      >
        <p dir="ltr" className="text-center font-mono text-4xl font-bold text-blue-700 dark:text-blue-400">
          {fmt(headline)} <span className="text-xl font-semibold text-blue-500 dark:text-blue-300">{unit}</span>
        </p>

        <div className="mt-4 border-t border-zinc-200 pt-4 dark:border-zinc-800">
          {mode === "secondLaw" ? (
            <ForceBlockDiagram
              force={result.force}
              acceleration={result.acceleration}
              forceLabel={t("diagramForce", { value: fmt(result.force) })}
              accelerationLabel={t("diagramAcceleration", { value: fmt(result.acceleration) })}
              caption={t("diagramCaptionSecondLaw")}
            />
          ) : (
            <>
              <GravitationDiagram
                mass1={result.mass1}
                mass2={result.mass2}
                label1={t("diagramMass1", { value: fmt(result.mass1) })}
                label2={t("diagramMass2", { value: fmt(result.mass2) })}
                caption={t("diagramCaptionGravitation")}
              />
              <div className="mt-4 border-t border-zinc-200 pt-4 dark:border-zinc-800">
                <ForceInverseSquareDiagram xLabel={t("inverseSquareXLabel")} yLabel={t("inverseSquareYLabel")} caption={t("inverseSquareCaption")} />
              </div>
            </>
          )}
        </div>

        <div className="mt-4 flex justify-center border-t border-zinc-200 pt-5 dark:border-zinc-800">
          <RatioGauge
            value={gaugeValue}
            domainMin={GAUGE_DOMAIN_MIN}
            domainMax={GAUGE_DOMAIN_MAX}
            zones={[
              { key: "tiny", from: GAUGE_DOMAIN_MIN, to: -3, colorClass: "stroke-blue-500 dark:stroke-blue-400" },
              { key: "everyday", from: -3, to: 3, colorClass: "stroke-green-500 dark:stroke-green-400" },
              { key: "massive", from: 3, to: GAUGE_DOMAIN_MAX, colorClass: "stroke-red-500 dark:stroke-red-400" },
            ]}
            valueLabel={heroValue}
            caption={gaugeCaption}
            ticks={[GAUGE_DOMAIN_MIN, -3, 3, GAUGE_DOMAIN_MAX]}
            tickFormatter={(tick) => `10^${tick}`}
          />
        </div>

        {mode === "secondLaw" ? (
          <dl dir="ltr" className="mt-4 grid grid-cols-3 gap-3 border-t border-zinc-200 pt-4 text-sm dark:border-zinc-800">
            <Stat label={t("force")} value={`${fmt(result.force)} N`} />
            <Stat label={t("mass")} value={`${fmt(result.mass)} kg`} />
            <Stat label={t("acceleration")} value={`${fmt(result.acceleration)} m/s²`} />
          </dl>
        ) : (
          <dl dir="ltr" className="mt-4 grid grid-cols-2 gap-3 border-t border-zinc-200 pt-4 text-sm sm:grid-cols-4 dark:border-zinc-800">
            <Stat label={t("force")} value={`${fmt(result.force)} N`} />
            <Stat label={t("mass1")} value={`${fmt(result.mass1)} kg`} />
            <Stat label={t("mass2")} value={`${fmt(result.mass2)} kg`} />
            <Stat label={t("distance")} value={`${fmt(result.distance)} m`} />
          </dl>
        )}
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
