import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import CopyButton from "@/components/tool-ui/CopyButton";
import MotionDiagram from "./MotionDiagram";
import type { KinematicsMode, KinematicsResult as Result, KinematicsSolveForDistance, KinematicsSolveForTime } from "./types";

type Props = {
  result: Result;
  mode: KinematicsMode;
  solveForTime: KinematicsSolveForTime;
  solveForDistance: KinematicsSolveForDistance;
  digitStyle: DigitStyle;
};

const UNIT: Record<string, string> = { v: "m/s", v0: "m/s", a: "m/s²", t: "s", dx: "m" };

export default function KinematicsResult({ result, mode, solveForTime, solveForDistance, digitStyle }: Props) {
  const t = useTranslations("tools.kinematics-calculator.result");
  const fmt = (value: number) => formatLocalizedNumber(value, digitStyle, { maximumFractionDigits: 4 });

  if (result.error === "zero-time") {
    return <ErrorCard heading={t("heading")} message={t("zeroTime")} />;
  }
  if (result.error === "zero-acceleration") {
    return <ErrorCard heading={t("heading")} message={t("zeroAcceleration")} />;
  }
  if (result.error === "zero-displacement") {
    return <ErrorCard heading={t("heading")} message={t("zeroDisplacement")} />;
  }
  if (result.error === "negative-discriminant") {
    return <ErrorCard heading={t("heading")} message={t("negativeDiscriminant")} />;
  }

  const solveFor = mode === "timeBased" ? solveForTime : solveForDistance;
  const valueByField: Record<string, number> = { v: result.v, v0: result.v0, a: result.a, t: result.t, dx: result.dx };
  const headline = valueByField[solveFor];
  const unit = UNIT[solveFor];
  const copyText = `${fmt(headline)} ${unit}`;

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl border border-blue-200 bg-white shadow-sm dark:border-blue-500/30 dark:bg-zinc-900 dark:shadow-none">
        <div className="flex w-full items-center justify-between gap-3 rounded-t-2xl bg-blue-600 px-4 py-2.5 lg:px-6 lg:py-3">
          <h2 className="font-bold text-white">{t("heading")}</h2>
          <CopyButton text={copyText} className="!text-white dark:!text-white" />
        </div>

        <div className="p-4 lg:p-6">
          <p dir="ltr" className="text-center font-mono text-4xl font-bold text-blue-700 dark:text-blue-400">
            {fmt(headline)} <span className="text-xl font-semibold text-blue-500 dark:text-blue-300">{unit}</span>
          </p>

          <MotionDiagram v0={result.v0} v={result.v} startLabel={t("diagramStart")} endLabel={t("diagramEnd")} caption={t("diagramCaption")} />

          <dl dir="ltr" className="mt-2 grid grid-cols-2 gap-3 border-t border-zinc-200 pt-4 text-sm sm:grid-cols-5 dark:border-zinc-800">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{t("v0")}</dt>
              <dd className="font-mono font-semibold text-zinc-800 dark:text-zinc-100">{fmt(result.v0)}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{t("v")}</dt>
              <dd className="font-mono font-semibold text-zinc-800 dark:text-zinc-100">{fmt(result.v)}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{t("a")}</dt>
              <dd className="font-mono font-semibold text-zinc-800 dark:text-zinc-100">{fmt(result.a)}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{t("t")}</dt>
              <dd className="font-mono font-semibold text-zinc-800 dark:text-zinc-100">{result.tAvailable ? fmt(result.t) : t("undefined")}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{t("dx")}</dt>
              <dd className="font-mono font-semibold text-zinc-800 dark:text-zinc-100">{fmt(result.dx)}</dd>
            </div>
          </dl>
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
