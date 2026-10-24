"use client";
import { useTranslations } from "next-intl";
import { LiveTableFill } from "@/components/tool-ui/three/LiveTable3DLayout";
import KinematicsShareExportModal from "./KinematicsShareExportModal";
import KinLive3D from "./KinLive3D";
import { solvedFormula, useKinModel } from "./KinLiveContext";

const UNIT: Record<string, string> = { v: "m/s", v0: "m/s", a: "m/s²", t: "s", dx: "m" };
const GAUGE_DOMAIN_MAX = 30;
const GRAVITY = 9.8;

/**
 * Result card: the solved quantity as the hero with its equation, then the deep live table of
 * time steps beside the 3D track drawing (stacked in this narrow column), filling the stretched
 * column height.
 */
export default function KinematicsResult() {
  const t = useTranslations("tools.kinematics-calculator.result");
  const tForm = useTranslations("tools.kinematics-calculator.form");
  const model = useKinModel();
  const { draft, result, solved, f: fmt4 } = model;
  const fmt = (v: number) => fmt4(v, 4);

  if (result.error === "zero-time") return <ErrorCard heading={t("heading")} message={t("zeroTime")} />;
  if (result.error === "zero-acceleration") return <ErrorCard heading={t("heading")} message={t("zeroAcceleration")} />;
  if (result.error === "zero-displacement") return <ErrorCard heading={t("heading")} message={t("zeroDisplacement")} />;
  if (result.error === "negative-discriminant") return <ErrorCard heading={t("heading")} message={t("negativeDiscriminant")} />;

  const valueByField: Record<string, number> = { v: result.v, v0: result.v0, a: result.a, t: result.t, dx: result.dx };
  const headline = valueByField[solved];
  const unit = UNIT[solved];
  const heroValue = `${fmt(headline)} ${unit}`;
  const operationLabel = tForm(`mode.${draft.mode}`);

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

  return (
    <div data-card="" data-fixed="" suppressHydrationWarning className="rounded-2xl border border-blue-200 bg-white shadow-sm lg:flex lg:h-full lg:flex-col dark:border-blue-500/30 dark:bg-zinc-900 dark:shadow-none">
      <div className="flex w-full items-center justify-between gap-3 rounded-t-2xl bg-blue-600 px-4 py-2.5 lg:px-6 lg:py-3">
        <h2 className="font-bold text-white">{t("heading")}</h2>
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
      </div>
      <div className="p-4 lg:flex lg:flex-1 lg:flex-col lg:p-6">
        <p dir="ltr" className="text-center font-mono text-4xl font-bold text-blue-700 dark:text-blue-400">
          {fmt(headline)} <span className="text-xl font-semibold text-blue-500 dark:text-blue-300">{unit}</span>
        </p>
        <p dir="ltr" className="mt-1 text-center font-mono text-sm text-zinc-500 dark:text-zinc-400">
          {solvedFormula(model)}
        </p>
        <div className="mt-4 lg:flex lg:flex-1 lg:flex-col">
          <LiveTableFill>
            <KinLive3D />
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
