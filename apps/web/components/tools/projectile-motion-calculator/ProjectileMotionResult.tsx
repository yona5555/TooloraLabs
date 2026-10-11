"use client";
import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import { LiveTableFill } from "@/components/tool-ui/three/LiveTable3DLayout";
import PmLive3D from "./PmLive3D";
import ProjectileShareExportModal from "./ProjectileShareExportModal";
import type { ProjectileMotionResult as Result } from "./types";

type Props = {
  result: Result;
  speed: number;
  angle: number;
  height: number;
  gravity: number;
  gravityPresetLabel: string;
  digitStyle: DigitStyle;
};

const GAUGE_DOMAIN_MAX = 90;

export default function ProjectileMotionResult({ result, speed, angle, height, gravity, gravityPresetLabel, digitStyle }: Props) {
  const t = useTranslations("tools.projectile-motion-calculator.result");
  const fmt = (value: number) => formatLocalizedNumber(value, digitStyle, { maximumFractionDigits: 4 });

  if (result.error === "invalid-gravity") return <ErrorCard heading={t("heading")} message={t("invalidGravity")} />;
  if (result.error === "invalid-speed") return <ErrorCard heading={t("heading")} message={t("invalidSpeed")} />;
  if (result.error === "invalid-height") return <ErrorCard heading={t("heading")} message={t("invalidHeight")} />;

  const heroValue = `${fmt(result.range)} m`;
  const sentence = t("rangeCaption");

  const inputRows = [
    { label: t("speedField"), value: `${fmt(speed)} m/s` },
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

  return (
    <div className="rounded-2xl border border-blue-200 bg-white shadow-sm lg:flex lg:h-full lg:flex-col dark:border-blue-500/30 dark:bg-zinc-900 dark:shadow-none">
      <div className="flex w-full items-center justify-between gap-3 rounded-t-2xl bg-blue-600 px-4 py-2.5 lg:px-6 lg:py-3">
        <h2 className="font-bold text-white">{t("heading")}</h2>
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
      </div>
      <div className="p-4 lg:flex lg:flex-1 lg:flex-col lg:p-6">
        <p dir="ltr" className="text-center font-mono text-4xl font-bold text-blue-700 dark:text-blue-400">
          {`R = ${fmt(result.range)}`} <span className="text-xl font-semibold text-blue-500 dark:text-blue-300">m</span>
        </p>
        <p className="mt-1 text-center text-sm text-zinc-500 dark:text-zinc-400">
          {t("heroCaption", { t: fmt(result.timeOfFlight), h: fmt(result.maxHeight), v: fmt(result.impactSpeed) })}
        </p>
        <div className="mt-4 lg:flex lg:flex-1 lg:flex-col">
          <LiveTableFill>
            <PmLive3D />
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
