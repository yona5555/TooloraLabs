import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import CopyButton from "@/components/tool-ui/CopyButton";
import GasCylinderDiagram from "./GasCylinderDiagram";
import type { GasLawSolveFor, GasLawResult as Result } from "./types";

type Props = {
  result: Result;
  solveFor: GasLawSolveFor;
  digitStyle: DigitStyle;
};

const UNIT_BY_FIELD: Record<GasLawSolveFor, string> = {
  pressure: "atm",
  volume: "L",
  moles: "mol",
  temperature: "K",
};

export default function GasLawResult({ result, solveFor, digitStyle }: Props) {
  const t = useTranslations("tools.ideal-gas-law-calculator.result");
  const fmt = (value: number) => formatLocalizedNumber(value, digitStyle, { maximumFractionDigits: 4 });

  if (result.error === "zero-volume") {
    return <ErrorCard heading={t("heading")} message={t("zeroVolume")} />;
  }
  if (result.error === "zero-pressure") {
    return <ErrorCard heading={t("heading")} message={t("zeroPressure")} />;
  }
  if (result.error === "zero-temperature") {
    return <ErrorCard heading={t("heading")} message={t("zeroTemperature")} />;
  }
  if (result.error === "zero-moles") {
    return <ErrorCard heading={t("heading")} message={t("zeroMoles")} />;
  }

  const valueByField: Record<GasLawSolveFor, number> = {
    pressure: result.pressureAtm,
    volume: result.volumeLiters,
    moles: result.moles,
    temperature: result.temperatureKelvin,
  };
  const headline = valueByField[solveFor];
  const unit = UNIT_BY_FIELD[solveFor];
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

          <div className="flex justify-center">
            <GasCylinderDiagram
              volumeLiters={result.volumeLiters}
              moles={result.moles}
              temperatureKelvin={result.temperatureKelvin}
              caption={t("diagramCaption")}
            />
          </div>

          <dl dir="ltr" className="mt-2 grid grid-cols-2 gap-3 border-t border-zinc-200 pt-4 text-sm sm:grid-cols-4 dark:border-zinc-800">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{t("pressure")}</dt>
              <dd className="font-mono font-semibold text-zinc-800 dark:text-zinc-100">{fmt(result.pressureAtm)} atm</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{t("volume")}</dt>
              <dd className="font-mono font-semibold text-zinc-800 dark:text-zinc-100">{fmt(result.volumeLiters)} L</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{t("moles")}</dt>
              <dd className="font-mono font-semibold text-zinc-800 dark:text-zinc-100">{fmt(result.moles)} mol</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{t("temperature")}</dt>
              <dd className="font-mono font-semibold text-zinc-800 dark:text-zinc-100">{fmt(result.temperatureKelvin)} K</dd>
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
