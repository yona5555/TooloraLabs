"use client";
import { Calculator, Hand } from "lucide-react";
import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import SectionCard from "@/components/tool-ui/SectionCard";
import { useTokenColors } from "@/components/tool-ui/indicator-kit/tokenColors";
import GasLawShareExportModal from "./GasLawShareExportModal";
import GasLawModeTabs from "./GasLawModeTabs";
import GasResultScene from "./GasResultScene";
import { SEED, shownGas } from "./gasMath";
import type { GasLawSolveFor, GasLawResult as Result } from "./types";

type Props = {
  hasCalculated: boolean;
  result: Result;
  solveFor: GasLawSolveFor;
  digitStyle: DigitStyle;
  onSetTemperature: (t: number) => void;
  onSolveForChange: (value: GasLawSolveFor) => void;
};

const UNIT_BY_FIELD: Record<GasLawSolveFor, string> = {
  pressure: "atm",
  volume: "L",
  moles: "mol",
  temperature: "K",
};

const GAUGE_DOMAIN_MAX = 5;

/**
 * §44: the Result card is the 3D card — the piston scene first, directly under the header band,
 * then the solved quantity and P / V / n / T, then the solve-for tabs, all inside this one card.
 */
export default function GasLawResult({ hasCalculated, result, solveFor, digitStyle, onSetTemperature, onSolveForChange }: Props) {
  const t = useTranslations("tools.ideal-gas-law-calculator.result");
  const tForm = useTranslations("tools.ideal-gas-law-calculator.form");
  const tc = useTranslations("tools.ph-calculator.visuals.common");
  const fmt = (value: number) => formatLocalizedNumber(value, digitStyle, { maximumFractionDigits: 4 });
  const zone = useTokenColors(["--chem-cold", "--ph-neutral", "--chem-hot"]);
  const z = (k: string) => zone?.[k] ?? "currentColor";
  const errorKey =
    result.error === "zero-volume" ? "zeroVolume" : result.error === "zero-pressure" ? "zeroPressure" : result.error === "zero-temperature" ? "zeroTemperature" : result.error === "zero-moles" ? "zeroMoles" : null;
  const valid = hasCalculated && !errorKey;

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

  const scene = {
    volume: valid ? result.volumeLiters : SEED.volume,
    temperature: valid ? result.temperatureKelvin : SEED.temperature,
    particles: shownGas(valid ? result.moles : SEED.moles),
  };

  const inputRows = [
    { label: t("pressure"), value: `${fmt(result.pressureAtm)} atm` },
    { label: t("volume"), value: `${fmt(result.volumeLiters)} L` },
    { label: t("moles"), value: `${fmt(result.moles)} mol` },
    { label: t("temperature"), value: `${fmt(result.temperatureKelvin)} K` },
  ];
  const dtClass = "text-xs font-semibold tracking-wide text-zinc-600 normal-case dark:text-zinc-300";
  const ddClass = "text-xs font-semibold whitespace-nowrap tabular-nums text-zinc-800 sm:text-sm dark:text-zinc-100";
  const cells: { key: string; value: string }[] = [
    { key: "pressure", value: `${fmt(result.pressureAtm)} atm` },
    { key: "volume", value: `${fmt(result.volumeLiters)} L` },
    { key: "moles", value: `${fmt(result.moles)} mol` },
    { key: "temperature", value: `${fmt(result.temperatureKelvin)} K` },
  ];

  return (
    <div data-ph-visual data-ph-hero data-ph-result className="flex flex-col leading-normal lg:flex-1" style={{ fontFamily: "var(--glass-font)" }}>
      <SectionCard phoneRole="output"
        id="gas-result"
        title={t("heading")}
        className="flex flex-col lg:flex-1"
        bodyClassName="flex flex-1 flex-col p-4 lg:p-6"
        action={
          <span className="flex items-center gap-2">
            <span role="img" aria-label={tc("interactive")} title={tc("interactive")} data-ph-interactive className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/20 text-white">
              <Hand size={15} aria-hidden />
            </span>
            {valid && (
              <GasLawShareExportModal
                operationLabel={operationLabel}
                inputRows={inputRows}
                resultRows={[{ label: operationLabel, value: heroValue }]}
                heroLabel={operationLabel}
                heroValue={heroValue}
                sentence={heroValue}
                gauge={{
                  zones: [
                    { from: 0, to: 0.9, color: z("--chem-cold") },
                    { from: 0.9, to: 1.5, color: z("--ph-neutral") },
                    { from: 1.5, to: GAUGE_DOMAIN_MAX, color: z("--chem-hot") },
                  ],
                  domainMin: 0,
                  domainMax: GAUGE_DOMAIN_MAX,
                  value: Math.max(0, Math.min(GAUGE_DOMAIN_MAX, result.pressureAtm)),
                  ticks: [0, 0.9, 1, 1.5, GAUGE_DOMAIN_MAX],
                }}
              />
            )}
          </span>
        }
      >
        <GasResultScene p={scene} seed={SEED.temperature} onSetTemperature={onSetTemperature} />

        <hr data-ph-divider className="my-3 border-zinc-200 dark:border-zinc-800" />
        <div data-ph-result-values>
          {!hasCalculated ? (
            <div className="flex flex-col items-center gap-2 text-center">
              <Calculator size={28} className="text-zinc-400 dark:text-zinc-500" />
              <p className="text-sm text-zinc-600 dark:text-zinc-300">{t("emptyStateMessage")}</p>
            </div>
          ) : errorKey ? (
            <p className="text-center text-sm leading-6 text-zinc-600 dark:text-zinc-300">{t(errorKey)}</p>
          ) : (
            <>
              <p dir="ltr" data-testid="gas-result-main" className="text-center text-4xl font-bold tabular-nums text-blue-700 dark:text-blue-400">
                {fmt(headline)} <span className="text-xl font-semibold text-blue-600 dark:text-blue-300">{unit}</span>
              </p>
              <p className="mt-1 text-center text-sm font-semibold text-zinc-600 dark:text-zinc-300">{operationLabel}</p>
              <hr data-ph-divider className="my-3 border-zinc-200 dark:border-zinc-800" />
              <dl dir="ltr" data-ph-subvalues className="grid grid-cols-2 gap-3 text-center text-sm sm:grid-cols-4">
                {cells.map((c) => (
                  <div key={c.key}>
                    <dt className={dtClass}>{t(c.key)}</dt>
                    <dd className={ddClass}>{c.value}</dd>
                  </div>
                ))}
              </dl>
            </>
          )}
        </div>

        <hr data-ph-divider className="my-3 border-zinc-200 dark:border-zinc-800" />
        <div data-ph-mode-tabs>
          <GasLawModeTabs solveFor={solveFor} onSolveForChange={onSolveForChange} />
        </div>
      </SectionCard>
    </div>
  );
}
