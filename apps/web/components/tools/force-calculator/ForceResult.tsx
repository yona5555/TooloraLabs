"use client";
import { useTranslations } from "next-intl";
import { LiveTableFill } from "@/components/tool-ui/three/LiveTable3DLayout";
import ForceShareExportModal from "./ForceShareExportModal";
import ForceLive3D from "./ForceLive3D";
import { useForceModel } from "./ForceLiveContext";
import type { GravitationSolveFor, SecondLawSolveFor } from "./types";

const GAUGE_DOMAIN_MIN = -12;
const GAUGE_DOMAIN_MAX = 8;

/**
 * Result card: the solved quantity as the hero, then the deep live table beside the 3D drawing of
 * the active law (stacked in this narrow column), filling the stretched column height.
 */
export default function ForceResult() {
  const t = useTranslations("tools.force-calculator.result");
  const tForm = useTranslations("tools.force-calculator.form");
  const { draft, result, f: fmt } = useForceModel();
  const { mode, slSolve: secondLawSolveFor, gSolve: gravitationSolveFor } = draft;

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
  const caption =
    mode === "secondLaw"
      ? `F = m × a = ${fmt(result.mass)} kg × ${fmt(result.acceleration)} m/s² = ${fmt(result.force)} N`
      : `F = G m₁ m₂ / r² = ${fmt(result.force)} N`;

  return (
    <div className="rounded-2xl border border-blue-200 bg-white shadow-sm lg:flex lg:h-full lg:flex-col dark:border-blue-500/30 dark:bg-zinc-900 dark:shadow-none">
      <div className="flex w-full items-center justify-between gap-3 rounded-t-2xl bg-blue-600 px-4 py-2.5 lg:px-6 lg:py-3">
        <h2 className="font-bold text-white">{t("heading")}</h2>
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
            <ForceLive3D />
          </LiveTableFill>
        </div>
      </div>
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
