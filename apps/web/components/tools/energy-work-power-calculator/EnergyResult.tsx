import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import CopyButton from "@/components/tool-ui/CopyButton";
import WorkVectorDiagram from "./WorkVectorDiagram";
import EnergyMagnitudeDiagram from "./EnergyMagnitudeDiagram";
import type { EnergyWorkPowerMode, EnergyResult as Result } from "./types";

type Props = {
  result: Result;
  mode: EnergyWorkPowerMode;
  angleDegrees: number;
  digitStyle: DigitStyle;
};

export default function EnergyResult({ result, mode, angleDegrees, digitStyle }: Props) {
  const t = useTranslations("tools.energy-work-power-calculator.result");
  const fmt = (value: number) => formatLocalizedNumber(value, digitStyle, { maximumFractionDigits: 4 });

  if (result.error === "zero-time") {
    return <ErrorCard heading={t("heading")} message={t("zeroTime")} />;
  }

  const headline = mode === "work" ? result.work : mode === "kineticEnergy" ? result.kineticEnergy : mode === "potentialEnergy" ? result.potentialEnergy : result.power;
  const unit = mode === "power" ? "W" : "J";
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
          <p className="mt-2 text-center text-sm text-zinc-500 dark:text-zinc-400">{t(`caption.${mode}`)}</p>

          {mode === "work" ? (
            <WorkVectorDiagram angleDegrees={angleDegrees} caption={t("diagramCaptionWork", { angle: fmt(angleDegrees) })} />
          ) : (
            <EnergyMagnitudeDiagram value={headline} unit={unit} caption={t("diagramCaptionMagnitude", { value: fmt(headline), unit })} />
          )}
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
