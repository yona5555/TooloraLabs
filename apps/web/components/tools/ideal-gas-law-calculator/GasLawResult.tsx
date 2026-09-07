"use client";
import { Calculator } from "lucide-react";
import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import SectionCard from "@/components/tool-ui/SectionCard";
import RatioGauge from "@/components/tool-ui/RatioGauge";
import GasCylinderDiagram from "./GasCylinderDiagram";
import GasPressureGaugeDiagram from "./GasPressureGaugeDiagram";
import GasLawShareExportModal from "./GasLawShareExportModal";
import type { GasLawSolveFor, GasLawResult as Result } from "./types";

type Props = {
  hasCalculated: boolean;
  result: Result;
  solveFor: GasLawSolveFor;
  digitStyle: DigitStyle;
};

const UNIT_BY_FIELD: Record<GasLawSolveFor, string> = {
  pressure: "atm",
  volume: "L",
  moles: "mol",
  temperature: "K",
};

const GAUGE_DOMAIN_MAX = 5;

export default function GasLawResult({ hasCalculated, result, solveFor, digitStyle }: Props) {
  const t = useTranslations("tools.ideal-gas-law-calculator.result");
  const tForm = useTranslations("tools.ideal-gas-law-calculator.form");
  const tGauge = useTranslations("tools.ideal-gas-law-calculator.gauge");
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
  if (result.error === "zero-pressure") return <ErrorCard heading={t("heading")} message={t("zeroPressure")} />;
  if (result.error === "zero-temperature") return <ErrorCard heading={t("heading")} message={t("zeroTemperature")} />;
  if (result.error === "zero-moles") return <ErrorCard heading={t("heading")} message={t("zeroMoles")} />;

  const valueByField: Record<GasLawSolveFor, number> = {
    pressure: result.pressureAtm,
    volume: result.volumeLiters,
    moles: result.moles,
    temperature: result.temperatureKelvin,
  };
  const headline = valueByField[solveFor];
  const unit = UNIT_BY_FIELD[solveFor];
  const heroValue = `${fmt(headline)} ${unit}`;
  const operationLabel = tForm(`solveFor.${solveFor}`);

  const inputRows = [
    { label: t("pressure"), value: `${fmt(result.pressureAtm)} atm` },
    { label: t("volume"), value: `${fmt(result.volumeLiters)} L` },
    { label: t("moles"), value: `${fmt(result.moles)} mol` },
    { label: t("temperature"), value: `${fmt(result.temperatureKelvin)} K` },
  ];
  const resultRows = [{ label: operationLabel, value: heroValue }];

  const gaugeValue = Math.max(0, Math.min(GAUGE_DOMAIN_MAX, result.pressureAtm));
  const gaugeCaption = result.pressureAtm < 0.9 ? tGauge("low") : result.pressureAtm < 1.5 ? tGauge("atmospheric") : tGauge("high");

  return (
    <div className="flex flex-col gap-4">
      <SectionCard
        title={t("heading")}
        action={
          <GasLawShareExportModal
            operationLabel={operationLabel}
            inputRows={inputRows}
            resultRows={resultRows}
            heroLabel={operationLabel}
            heroValue={heroValue}
            sentence={heroValue}
            gauge={{
              zones: [
                { from: 0, to: 0.9, color: "#3b82f6" },
                { from: 0.9, to: 1.5, color: "#22c55e" },
                { from: 1.5, to: GAUGE_DOMAIN_MAX, color: "#ef4444" },
              ],
              domainMin: 0,
              domainMax: GAUGE_DOMAIN_MAX,
              value: gaugeValue,
              ticks: [0, 0.9, 1, 1.5, GAUGE_DOMAIN_MAX],
            }}
          />
        }
      >
        <p dir="ltr" className="text-center font-mono text-4xl font-bold text-blue-700 dark:text-blue-400">
          {fmt(headline)} <span className="text-xl font-semibold text-blue-500 dark:text-blue-300">{unit}</span>
        </p>

        <div className="mt-4 flex justify-center border-t border-zinc-200 pt-4 dark:border-zinc-800">
          <GasCylinderDiagram volumeLiters={result.volumeLiters} moles={result.moles} temperatureKelvin={result.temperatureKelvin} caption={t("diagramCaption")} />
        </div>

        <div className="mt-4 border-t border-zinc-200 pt-4 dark:border-zinc-800">
          <GasPressureGaugeDiagram pressureAtm={result.pressureAtm} label={`${fmt(result.pressureAtm)} atm`} caption={t("pressureGaugeCaption")} />
        </div>

        <div className="mt-4 flex justify-center border-t border-zinc-200 pt-5 dark:border-zinc-800">
          <RatioGauge
            value={gaugeValue}
            domainMin={0}
            domainMax={GAUGE_DOMAIN_MAX}
            zones={[
              { key: "low", from: 0, to: 0.9, colorClass: "stroke-blue-500 dark:stroke-blue-400" },
              { key: "atmospheric", from: 0.9, to: 1.5, colorClass: "stroke-green-500 dark:stroke-green-400" },
              { key: "high", from: 1.5, to: GAUGE_DOMAIN_MAX, colorClass: "stroke-red-500 dark:stroke-red-400" },
            ]}
            valueLabel={`${fmt(result.pressureAtm)} atm`}
            caption={gaugeCaption}
            ticks={[0, 1, GAUGE_DOMAIN_MAX]}
          />
        </div>

        <dl dir="ltr" className="mt-4 grid grid-cols-2 gap-3 border-t border-zinc-200 pt-4 text-sm sm:grid-cols-4 dark:border-zinc-800">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{t("pressure")}</dt>
            <dd className="font-mono font-semibold text-zinc-800 dark:text-zinc-100">{fmt(result.pressureAtm)} atm</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{t("volume")}</dt>
            <dd className="font-mono font-semibold text-zinc-800 dark:text-zinc-100">{fmt(result.volumeLiters)} L</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{t("moles")}</dt>
            <dd className="font-mono font-semibold text-zinc-800 dark:text-zinc-100">{fmt(result.moles)} mol</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{t("temperature")}</dt>
            <dd className="font-mono font-semibold text-zinc-800 dark:text-zinc-100">{fmt(result.temperatureKelvin)} K</dd>
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
