import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import CopyButton from "@/components/tool-ui/CopyButton";
import ForceBlockDiagram from "./ForceBlockDiagram";
import GravitationDiagram from "./GravitationDiagram";
import type { ForceMode, ForceResult as Result, GravitationSolveFor, SecondLawSolveFor } from "./types";

type Props = {
  result: Result;
  mode: ForceMode;
  secondLawSolveFor: SecondLawSolveFor;
  gravitationSolveFor: GravitationSolveFor;
  digitStyle: DigitStyle;
};

export default function ForceResult({ result, mode, secondLawSolveFor, gravitationSolveFor, digitStyle }: Props) {
  const t = useTranslations("tools.force-calculator.result");
  const fmt = (value: number) => formatLocalizedNumber(value, digitStyle, { maximumFractionDigits: 4 });

  if (result.error === "zero-acceleration") return <ErrorCard heading={t("heading")} message={t("zeroAcceleration")} />;
  if (result.error === "zero-mass") return <ErrorCard heading={t("heading")} message={t("zeroMass")} />;
  if (result.error === "zero-mass1") return <ErrorCard heading={t("heading")} message={t("zeroMass1")} />;
  if (result.error === "zero-mass2") return <ErrorCard heading={t("heading")} message={t("zeroMass2")} />;
  if (result.error === "zero-distance") return <ErrorCard heading={t("heading")} message={t("zeroDistance")} />;
  if (result.error === "zero-force") return <ErrorCard heading={t("heading")} message={t("zeroForce")} />;

  const secondLawUnit: Record<SecondLawSolveFor, string> = { force: "N", mass: "kg", acceleration: "m/s²" };
  const gravitationUnit: Record<GravitationSolveFor, string> = { force: "N", mass1: "kg", mass2: "kg", distance: "m" };

  const headline = mode === "secondLaw" ? { force: result.force, mass: result.mass, acceleration: result.acceleration }[secondLawSolveFor] : { force: result.force, mass1: result.mass1, mass2: result.mass2, distance: result.distance }[gravitationSolveFor];
  const unit = mode === "secondLaw" ? secondLawUnit[secondLawSolveFor] : gravitationUnit[gravitationSolveFor];
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

          {mode === "secondLaw" ? (
            <ForceBlockDiagram
              force={result.force}
              acceleration={result.acceleration}
              forceLabel={t("diagramForce", { value: fmt(result.force) })}
              accelerationLabel={t("diagramAcceleration", { value: fmt(result.acceleration) })}
              caption={t("diagramCaptionSecondLaw")}
            />
          ) : (
            <GravitationDiagram
              mass1={result.mass1}
              mass2={result.mass2}
              label1={t("diagramMass1", { value: fmt(result.mass1) })}
              label2={t("diagramMass2", { value: fmt(result.mass2) })}
              caption={t("diagramCaptionGravitation")}
            />
          )}

          {mode === "secondLaw" ? (
            <dl dir="ltr" className="mt-2 grid grid-cols-3 gap-3 border-t border-zinc-200 pt-4 text-sm dark:border-zinc-800">
              <Stat label={t("force")} value={`${fmt(result.force)} N`} />
              <Stat label={t("mass")} value={`${fmt(result.mass)} kg`} />
              <Stat label={t("acceleration")} value={`${fmt(result.acceleration)} m/s²`} />
            </dl>
          ) : (
            <dl dir="ltr" className="mt-2 grid grid-cols-2 gap-3 border-t border-zinc-200 pt-4 text-sm sm:grid-cols-4 dark:border-zinc-800">
              <Stat label={t("force")} value={`${fmt(result.force)} N`} />
              <Stat label={t("mass1")} value={`${fmt(result.mass1)} kg`} />
              <Stat label={t("mass2")} value={`${fmt(result.mass2)} kg`} />
              <Stat label={t("distance")} value={`${fmt(result.distance)} m`} />
            </dl>
          )}
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
