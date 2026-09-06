"use client";
import { Calculator } from "lucide-react";
import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import SectionCard from "@/components/tool-ui/SectionCard";
import RatioGauge from "@/components/tool-ui/RatioGauge";
import DilutionFlasksDiagram from "./DilutionFlasksDiagram";
import MolarityBeakerDiagram from "./MolarityBeakerDiagram";
import MolarityConcentrationScaleDiagram from "./MolarityConcentrationScaleDiagram";
import MolarityShareExportModal from "./MolarityShareExportModal";
import type { MolarityMode, MolarityResult as Result } from "./types";

type Props = {
  hasCalculated: boolean;
  result: Result;
  mode: MolarityMode;
  digitStyle: DigitStyle;
};

const CONCENTRATION_GAUGE_MIN = -3.5;
const CONCENTRATION_GAUGE_MAX = 1.5;
const DILUTION_GAUGE_MAX = 50;

export default function MolarityResult({ hasCalculated, result, mode, digitStyle }: Props) {
  const t = useTranslations("tools.molarity-calculator.result");
  const tForm = useTranslations("tools.molarity-calculator.form");
  const tGauge = useTranslations("tools.molarity-calculator.gauge");
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

  if (result.error === "zero-volume") return <ErrorCard heading={t("heading")} message={t("zeroVolume")} />;
  if (result.error === "zero-molar-mass") return <ErrorCard heading={t("heading")} message={t("zeroMolarMass")} />;
  if (result.error === "zero-denominator") return <ErrorCard heading={t("heading")} message={t("zeroDenominator")} />;

  const operationLabel = tForm(`mode.${mode}`);

  if (mode === "concentration") {
    const heroValue = `${fmt(result.molarity)} mol/L`;
    const gaugeValue = Math.log10(Math.max(result.molarity, 1e-4));
    const gaugeCaption = gaugeValue < -1.5 ? tGauge("dilute") : gaugeValue < 0.5 ? tGauge("typical") : tGauge("concentrated");

    return (
      <div className="flex flex-col gap-4">
        <SectionCard
          title={t("heading")}
          action={
            <MolarityShareExportModal
              operationLabel={operationLabel}
              inputRows={[{ label: t("moles"), value: `${fmt(result.moles)} mol` }]}
              resultRows={[{ label: t("molarity"), value: heroValue }]}
              heroLabel={t("molarity")}
              heroValue={heroValue}
              sentence={t("molesSummary", { moles: fmt(result.moles) })}
              gauge={{
                zones: [
                  { from: CONCENTRATION_GAUGE_MIN, to: -1.5, color: "#3b82f6" },
                  { from: -1.5, to: 0.5, color: "#22c55e" },
                  { from: 0.5, to: CONCENTRATION_GAUGE_MAX, color: "#ef4444" },
                ],
                domainMin: CONCENTRATION_GAUGE_MIN,
                domainMax: CONCENTRATION_GAUGE_MAX,
                value: gaugeValue,
                ticks: [CONCENTRATION_GAUGE_MIN, -1.5, 0.5, CONCENTRATION_GAUGE_MAX],
              }}
            />
          }
        >
          <p dir="ltr" className="text-center font-mono text-4xl font-bold text-blue-700 dark:text-blue-400">
            {fmt(result.molarity)} <span className="text-xl font-semibold text-blue-500 dark:text-blue-300">mol/L</span>
          </p>
          <p className="mt-3 text-center text-sm text-zinc-500 dark:text-zinc-400">{t("molesSummary", { moles: fmt(result.moles) })}</p>

          <div className="mt-4 border-t border-zinc-200 pt-4 dark:border-zinc-800">
            <MolarityBeakerDiagram
              dotCount={Math.max(1, Math.min(24, result.molarity * 8))}
              molesLabel={`n = ${fmt(result.moles)} mol`}
              volumeLabel={t("volumeLabel")}
              caption={t("beakerCaption")}
            />
          </div>

          <div className="mt-4 flex justify-center border-t border-zinc-200 pt-5 dark:border-zinc-800">
            <RatioGauge
              value={gaugeValue}
              domainMin={CONCENTRATION_GAUGE_MIN}
              domainMax={CONCENTRATION_GAUGE_MAX}
              zones={[
                { key: "dilute", from: CONCENTRATION_GAUGE_MIN, to: -1.5, colorClass: "stroke-blue-500 dark:stroke-blue-400" },
                { key: "typical", from: -1.5, to: 0.5, colorClass: "stroke-green-500 dark:stroke-green-400" },
                { key: "concentrated", from: 0.5, to: CONCENTRATION_GAUGE_MAX, colorClass: "stroke-red-500 dark:stroke-red-400" },
              ]}
              valueLabel={heroValue}
              caption={gaugeCaption}
              ticks={[CONCENTRATION_GAUGE_MIN, -1.5, 0.5, CONCENTRATION_GAUGE_MAX]}
            />
          </div>

          <div className="mt-4 border-t border-zinc-200 pt-4 dark:border-zinc-800">
            <MolarityConcentrationScaleDiagram
              molarity={result.molarity}
              labels={[t("scaleTrace"), t("scaleDilute"), t("scaleTypical"), t("scaleStock"), t("scaleConcentrated")]}
              caption={t("scaleCaption", { value: fmt(result.molarity) })}
            />
          </div>
        </SectionCard>
      </div>
    );
  }

  const dilutionFactor = result.v1 > 0 ? result.v2 / result.v1 : 1;
  const gaugeValue = Math.max(1, Math.min(DILUTION_GAUGE_MAX, dilutionFactor));
  const gaugeCaption = dilutionFactor < 5 ? tGauge("mild") : dilutionFactor < 20 ? tGauge("moderate") : tGauge("high");
  const heroValue = `${fmt(dilutionFactor)}×`;

  return (
    <div className="flex flex-col gap-4">
      <SectionCard
        title={t("heading")}
        action={
          <MolarityShareExportModal
            operationLabel={operationLabel}
            inputRows={[
              { label: t("c1"), value: fmt(result.c1) },
              { label: t("v1"), value: fmt(result.v1) },
            ]}
            resultRows={[
              { label: t("c2"), value: fmt(result.c2) },
              { label: t("v2"), value: fmt(result.v2) },
            ]}
            heroLabel={t("dilutionFactor")}
            heroValue={heroValue}
            sentence={`C1V1=C2V2 — C1 ${fmt(result.c1)}, V1 ${fmt(result.v1)}, C2 ${fmt(result.c2)}, V2 ${fmt(result.v2)}`}
            gauge={{
              zones: [
                { from: 1, to: 5, color: "#22c55e" },
                { from: 5, to: 20, color: "#f59e0b" },
                { from: 20, to: DILUTION_GAUGE_MAX, color: "#ef4444" },
              ],
              domainMin: 1,
              domainMax: DILUTION_GAUGE_MAX,
              value: gaugeValue,
              ticks: [1, 5, 20, DILUTION_GAUGE_MAX],
            }}
          />
        }
      >
        <dl dir="ltr" className="grid grid-cols-2 gap-4 text-center">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{t("c1")}</dt>
            <dd className="font-mono text-xl font-bold text-blue-700 dark:text-blue-400">{fmt(result.c1)}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{t("v1")}</dt>
            <dd className="font-mono text-xl font-bold text-blue-700 dark:text-blue-400">{fmt(result.v1)}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{t("c2")}</dt>
            <dd className="font-mono text-xl font-bold text-blue-700 dark:text-blue-400">{fmt(result.c2)}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{t("v2")}</dt>
            <dd className="font-mono text-xl font-bold text-blue-700 dark:text-blue-400">{fmt(result.v2)}</dd>
          </div>
        </dl>

        <div className="mt-4 border-t border-zinc-200 pt-4 dark:border-zinc-800">
          <DilutionFlasksDiagram
            concentration1={result.c1}
            volume1={result.v1}
            concentration2={result.c2}
            volume2={result.v2}
            label1={t("diagramStock")}
            label2={t("diagramDiluted")}
            caption={t("diagramCaption")}
          />
        </div>

        <div className="mt-4 flex justify-center border-t border-zinc-200 pt-5 dark:border-zinc-800">
          <RatioGauge
            value={gaugeValue}
            domainMin={1}
            domainMax={DILUTION_GAUGE_MAX}
            zones={[
              { key: "mild", from: 1, to: 5, colorClass: "stroke-green-500 dark:stroke-green-400" },
              { key: "moderate", from: 5, to: 20, colorClass: "stroke-amber-500 dark:stroke-amber-400" },
              { key: "high", from: 20, to: DILUTION_GAUGE_MAX, colorClass: "stroke-red-500 dark:stroke-red-400" },
            ]}
            valueLabel={heroValue}
            caption={gaugeCaption}
            ticks={[1, 5, 20, DILUTION_GAUGE_MAX]}
          />
        </div>
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
