import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import CopyButton from "@/components/tool-ui/CopyButton";
import TrajectoryDiagram from "./TrajectoryDiagram";
import type { ProjectileMotionResult as Result } from "./types";

type Props = {
  result: Result;
  speed: number;
  angle: number;
  height: number;
  gravity: number;
  digitStyle: DigitStyle;
};

export default function ProjectileMotionResult({ result, speed, angle, height, gravity, digitStyle }: Props) {
  const t = useTranslations("tools.projectile-motion-calculator.result");
  const fmt = (value: number) => formatLocalizedNumber(value, digitStyle, { maximumFractionDigits: 4 });

  if (result.error === "invalid-gravity") return <ErrorCard heading={t("heading")} message={t("invalidGravity")} />;
  if (result.error === "invalid-speed") return <ErrorCard heading={t("heading")} message={t("invalidSpeed")} />;
  if (result.error === "invalid-height") return <ErrorCard heading={t("heading")} message={t("invalidHeight")} />;

  const copyText = `${t("range")}: ${fmt(result.range)} m, ${t("timeOfFlight")}: ${fmt(result.timeOfFlight)} s`;

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl border border-blue-200 bg-white shadow-sm dark:border-blue-500/30 dark:bg-zinc-900 dark:shadow-none">
        <div className="flex w-full items-center justify-between gap-3 rounded-t-2xl bg-blue-600 px-4 py-2.5 lg:px-6 lg:py-3">
          <h2 className="font-bold text-white">{t("heading")}</h2>
          <CopyButton text={copyText} className="!text-white dark:!text-white" />
        </div>

        <div className="p-4 lg:p-6">
          <p dir="ltr" className="text-center font-mono text-4xl font-bold text-blue-700 dark:text-blue-400">
            {fmt(result.range)} <span className="text-xl font-semibold text-blue-500 dark:text-blue-300">m</span>
          </p>
          <p className="mt-1 text-center text-sm text-zinc-500 dark:text-zinc-400">{t("rangeCaption")}</p>

          <TrajectoryDiagram
            speed={speed}
            angle={angle}
            height={height}
            gravity={gravity}
            timeOfFlight={result.timeOfFlight}
            maxHeight={result.maxHeight}
            range={result.range}
            launchLabel={t("diagramLaunch")}
            peakLabel={t("diagramPeak", { value: fmt(result.maxHeight) })}
            landingLabel={t("diagramLanding")}
            caption={t("diagramCaption")}
          />

          <dl dir="ltr" className="mt-2 grid grid-cols-2 gap-3 border-t border-zinc-200 pt-4 text-sm sm:grid-cols-4 dark:border-zinc-800">
            <Stat label={t("timeOfFlight")} value={`${fmt(result.timeOfFlight)} s`} />
            <Stat label={t("maxHeight")} value={`${fmt(result.maxHeight)} m`} />
            <Stat label={t("impactSpeed")} value={`${fmt(result.impactSpeed)} m/s`} />
            <Stat label={t("impactAngle")} value={`${fmt(result.impactAngle)}°`} />
          </dl>
        </div>
      </div>
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
