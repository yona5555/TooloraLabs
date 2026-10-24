"use client";
import { useTranslations } from "next-intl";
import { ENERGY_GRAVITY } from "@tooloralabs/tools";
import { LiveTableFill } from "@/components/tool-ui/three/LiveTable3DLayout";
import EnergyShareExportModal from "./EnergyShareExportModal";
import EnergyLive3D from "./EnergyLive3D";
import { useEnergyModel } from "./EnergyLiveContext";

const GAUGE_DOMAIN_MIN = -1;
const GAUGE_DOMAIN_MAX = 6;

/**
 * Result card: the active formula's value as the hero, then the deep live table beside the 3D
 * drawing of that formula (stacked in this narrow column), filling the stretched column height.
 */
export default function EnergyResult() {
  const t = useTranslations("tools.energy-work-power-calculator.result");
  const tForm = useTranslations("tools.energy-work-power-calculator.form");
  const { draft, result, headline, unit, work, kinetic, potential, power, f: fmt } = useEnergyModel();
  const { mode } = draft;

  if (result.error === "zero-time") return <ErrorCard heading={t("heading")} message={t("zeroTime")} />;

  const heroValue = `${fmt(headline)} ${unit}`;
  const operationLabel = tForm(`mode.${mode}`);
  const sentence = t(`caption.${mode}`);
  const resultRows = [{ label: t("heading"), value: heroValue }];
  const gaugeValue = Math.log10(Math.max(headline, 0.01));

  const inputRows =
    mode === "work"
      ? [
          { label: tForm("forceLabel"), value: `${fmt(work.force)} N` },
          { label: tForm("distanceLabel"), value: `${fmt(work.distance)} m` },
          { label: tForm("angleLabel"), value: `${fmt(work.angleDegrees)}°` },
        ]
      : mode === "kineticEnergy"
        ? [
            { label: tForm("massLabel"), value: `${fmt(kinetic.mass)} kg` },
            { label: tForm("velocityLabel"), value: `${fmt(kinetic.velocity)} m/s` },
          ]
        : mode === "potentialEnergy"
          ? [
              { label: tForm("massLabel"), value: `${fmt(potential.mass)} kg` },
              { label: tForm("heightLabel"), value: `${fmt(potential.height)} m` },
            ]
          : [
              { label: tForm("workValueLabel"), value: `${fmt(power?.work ?? 0)} J` },
              { label: tForm("timeLabel"), value: `${fmt(power?.time ?? 0)} s` },
            ];

  const caption =
    mode === "work"
      ? `W = F d cos θ = ${fmt(work.force)} × ${fmt(work.distance)} × cos ${fmt(work.angleDegrees)}° = ${heroValue}`
      : mode === "kineticEnergy"
        ? `KE = ½ m v² = ½ × ${fmt(kinetic.mass)} × ${fmt(kinetic.velocity)}² = ${heroValue}`
        : mode === "potentialEnergy"
          ? `PE = m g h = ${fmt(potential.mass)} × ${ENERGY_GRAVITY} × ${fmt(potential.height)} = ${heroValue}`
          : `P = W / t = ${fmt(power?.work ?? 0)} / ${fmt(power?.time ?? 0)} = ${heroValue}`;

  return (
    <div data-card="" data-fixed="" suppressHydrationWarning className="rounded-2xl border border-blue-200 bg-white shadow-sm lg:flex lg:h-full lg:flex-col dark:border-blue-500/30 dark:bg-zinc-900 dark:shadow-none">
      <div className="flex w-full items-center justify-between gap-3 rounded-t-2xl bg-blue-600 px-4 py-2.5 lg:px-6 lg:py-3">
        <h2 className="font-bold text-white">{t("heading")}</h2>
        <EnergyShareExportModal
          operationLabel={operationLabel}
          inputRows={inputRows}
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
      </div>
      <div className="p-4 lg:flex lg:flex-1 lg:flex-col lg:p-6">
        <p dir="ltr" className="text-center font-mono text-4xl font-bold text-blue-700 dark:text-blue-400">
          {fmt(headline)} <span className="text-xl font-semibold text-blue-500 dark:text-blue-300">{unit}</span>
        </p>
        <p dir="ltr" className="mt-1 text-center font-mono text-sm text-zinc-500 dark:text-zinc-400">
          {caption}
        </p>
        <p className="mt-1 text-center text-xs text-zinc-500 dark:text-zinc-400">{sentence}</p>
        <div className="mt-4 lg:flex lg:flex-1 lg:flex-col">
          <LiveTableFill>
            <EnergyLive3D />
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
