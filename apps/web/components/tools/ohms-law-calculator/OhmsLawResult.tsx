"use client";
import { Calculator } from "lucide-react";
import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import SectionCard from "@/components/tool-ui/SectionCard";
import RatioGauge from "@/components/tool-ui/RatioGauge";
import OhmsLawTriangleDiagram from "./OhmsLawTriangleDiagram";
import OhmsLawCircuitDiagram from "./OhmsLawCircuitDiagram";
import OhmsLawPowerFormulasDiagram from "./OhmsLawPowerFormulasDiagram";
import OhmsLawShareExportModal from "./OhmsLawShareExportModal";
import type { OhmsLawKnownPair, OhmsLawResult as Result } from "./types";

type Props = {
  hasCalculated: boolean;
  result: Result;
  knownPair: OhmsLawKnownPair;
  digitStyle: DigitStyle;
};

const COMPUTED_BY_PAIR: Record<OhmsLawKnownPair, ("voltage" | "current" | "resistance")[]> = {
  VI: ["resistance"],
  VR: ["current"],
  IR: ["voltage"],
  VP: ["current", "resistance"],
  IP: ["voltage", "resistance"],
  RP: ["voltage", "current"],
};

const GAUGE_DOMAIN_MAX = 5;

export default function OhmsLawResult({ hasCalculated, result, knownPair, digitStyle }: Props) {
  const t = useTranslations("tools.ohms-law-calculator.result");
  const tForm = useTranslations("tools.ohms-law-calculator.form");
  const tGauge = useTranslations("tools.ohms-law-calculator.gauge");
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

  if (result.error === "zero-current") return <ErrorCard heading={t("heading")} message={t("zeroCurrent")} />;
  if (result.error === "zero-resistance") return <ErrorCard heading={t("heading")} message={t("zeroResistance")} />;
  if (result.error === "zero-voltage") return <ErrorCard heading={t("heading")} message={t("zeroVoltage")} />;
  if (result.error === "zero-power") return <ErrorCard heading={t("heading")} message={t("zeroPower")} />;

  const operationLabel = tForm(`pair.${knownPair}`);
  const heroValue = `${fmt(result.power)} W`;
  const sentence = t("sentence", { voltage: fmt(result.voltage), current: fmt(result.current), resistance: fmt(result.resistance) });

  const inputRows = [
    { label: tForm("voltageLabel"), value: `${fmt(result.voltage)} V` },
    { label: tForm("currentLabel"), value: `${fmt(result.current)} A` },
  ];

  const resultRows = [
    { label: t("voltage"), value: `${fmt(result.voltage)} V` },
    { label: t("current"), value: `${fmt(result.current)} A` },
    { label: t("resistance"), value: `${fmt(result.resistance)} Ω` },
    { label: t("power"), value: `${fmt(result.power)} W` },
  ];

  const gaugeCaption = result.power < 0.5 ? tGauge("low") : result.power < 2 ? tGauge("moderate") : tGauge("high");

  return (
    <div className="flex flex-col gap-4">
      <SectionCard
        title={t("heading")}
        action={
          <OhmsLawShareExportModal
            operationLabel={operationLabel}
            inputRows={inputRows}
            resultRows={resultRows}
            heroLabel={t("power")}
            heroValue={heroValue}
            sentence={sentence}
            gauge={{
              zones: [
                { from: 0, to: 0.5, color: "#22c55e" },
                { from: 0.5, to: 2, color: "#f59e0b" },
                { from: 2, to: GAUGE_DOMAIN_MAX, color: "#ef4444" },
              ],
              domainMin: 0,
              domainMax: GAUGE_DOMAIN_MAX,
              value: result.power,
              ticks: [0, 0.5, 2, GAUGE_DOMAIN_MAX],
            }}
          />
        }
      >
        <dl dir="ltr" className="grid grid-cols-2 gap-4 text-center">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{t("voltage")}</dt>
            <dd className="font-mono text-2xl font-bold text-blue-700 dark:text-blue-400">{fmt(result.voltage)} V</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{t("current")}</dt>
            <dd className="font-mono text-2xl font-bold text-blue-700 dark:text-blue-400">{fmt(result.current)} A</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{t("resistance")}</dt>
            <dd className="font-mono text-2xl font-bold text-blue-700 dark:text-blue-400">{fmt(result.resistance)} Ω</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{t("power")}</dt>
            <dd className="font-mono text-2xl font-bold text-blue-700 dark:text-blue-400">{fmt(result.power)} W</dd>
          </div>
        </dl>

        <div className="mt-4 border-t border-zinc-200 pt-4 dark:border-zinc-800">
          <OhmsLawTriangleDiagram
            voltageText={`V=${fmt(result.voltage)}`}
            currentText={`I=${fmt(result.current)}`}
            resistanceText={`R=${fmt(result.resistance)}`}
            highlighted={COMPUTED_BY_PAIR[knownPair]}
            caption={t("diagramCaption")}
          />
        </div>

        <div className="mt-4 border-t border-zinc-200 pt-4 dark:border-zinc-800">
          <OhmsLawCircuitDiagram
            voltageText={`V=${fmt(result.voltage)}`}
            currentText={`I=${fmt(result.current)}`}
            resistanceText={`R=${fmt(result.resistance)}`}
            caption={t("circuitCaption")}
          />
        </div>

        <div className="mt-4 flex justify-center border-t border-zinc-200 pt-5 dark:border-zinc-800">
          <RatioGauge
            value={result.power}
            domainMin={0}
            domainMax={GAUGE_DOMAIN_MAX}
            zones={[
              { key: "low", from: 0, to: 0.5, colorClass: "stroke-green-500 dark:stroke-green-400" },
              { key: "moderate", from: 0.5, to: 2, colorClass: "stroke-amber-500 dark:stroke-amber-400" },
              { key: "high", from: 2, to: GAUGE_DOMAIN_MAX, colorClass: "stroke-red-500 dark:stroke-red-400" },
            ]}
            valueLabel={`${fmt(result.power)} W`}
            caption={gaugeCaption}
            ticks={[0, 0.5, 2, GAUGE_DOMAIN_MAX]}
          />
        </div>

        <div className="mt-4 border-t border-zinc-200 pt-4 dark:border-zinc-800">
          <OhmsLawPowerFormulasDiagram
            viText={`V×I = ${fmt(result.voltage)}×${fmt(result.current)}`}
            i2rText={`I²R = ${fmt(result.current)}²×${fmt(result.resistance)}`}
            v2rText={`V²/R = ${fmt(result.voltage)}²/${fmt(result.resistance)}`}
            powerText={`P = ${fmt(result.power)} W`}
            caption={t("powerFormulasCaption")}
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
