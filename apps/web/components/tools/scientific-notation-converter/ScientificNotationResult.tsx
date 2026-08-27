import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import CopyButton from "@/components/tool-ui/CopyButton";
import MagnitudeScaleDiagram from "./MagnitudeScaleDiagram";
import type { ScientificNotationOperation, ScientificNotationResult as Result } from "./types";

type Computed = {
  operation: ScientificNotationOperation;
  standardValue: number;
  coefficientA: number;
  exponentA: number;
  coefficientB: number;
  exponentB: number;
  digitStyle: DigitStyle;
};

type Props = {
  result: Result;
  computed: Computed;
};

export default function ScientificNotationResult({ result, computed }: Props) {
  const t = useTranslations("tools.scientific-notation-converter.result");
  const { operation, standardValue, coefficientA, exponentA, coefficientB, exponentB, digitStyle } = computed;

  const fmt = (value: number) => formatLocalizedNumber(value, digitStyle, { maximumFractionDigits: 10 });
  const fmtStandard = (value: number) => formatLocalizedNumber(value, digitStyle, { maximumFractionDigits: 20 });

  if (result.error === "divide-by-zero") {
    return (
      <div className="rounded-2xl border border-blue-200 bg-white shadow-sm dark:border-blue-500/30 dark:bg-zinc-900 dark:shadow-none">
        <div className="rounded-t-2xl bg-blue-600 px-4 py-2.5 lg:px-6 lg:py-3">
          <h2 className="font-bold text-white">{t("heading")}</h2>
        </div>
        <div className="p-4 lg:p-6">
          <p className="text-center text-sm leading-6 text-zinc-600 dark:text-zinc-300">{t("divideByZero")}</p>
        </div>
      </div>
    );
  }

  const { scientific, engineering, standard, numberName } = result;
  const logPosition = standard === 0 ? 0 : Math.log10(Math.abs(standard));

  const copyText = `${fmt(scientific.coefficient)} × 10^${fmt(scientific.exponent)}`;

  let stepSentence: string;
  if (operation === "toScientific") {
    stepSentence = t("stepToScientific", { standard: fmtStandard(standardValue), exponent: fmt(scientific.exponent) });
  } else if (operation === "toStandard") {
    stepSentence = t("stepToStandard", { coefficient: fmt(coefficientA), exponent: fmt(exponentA) });
  } else if (operation === "multiply") {
    stepSentence = t("stepMultiply", {
      coeffA: fmt(coefficientA),
      expA: fmt(exponentA),
      coeffB: fmt(coefficientB),
      expB: fmt(exponentB),
      rawCoeff: fmt(coefficientA * coefficientB),
      rawExp: fmt(exponentA + exponentB),
    });
  } else {
    stepSentence = t("stepDivide", {
      coeffA: fmt(coefficientA),
      expA: fmt(exponentA),
      coeffB: fmt(coefficientB),
      expB: fmt(exponentB),
      rawExp: fmt(exponentA - exponentB),
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl border border-blue-200 bg-white shadow-sm dark:border-blue-500/30 dark:bg-zinc-900 dark:shadow-none">
        <div className="flex w-full items-center justify-between gap-3 rounded-t-2xl bg-blue-600 px-4 py-2.5 lg:px-6 lg:py-3">
          <h2 className="font-bold text-white">{t("heading")}</h2>
          <CopyButton text={copyText} className="!text-white dark:!text-white" />
        </div>

        <div className="p-4 lg:p-6">
          <p dir="ltr" className="text-center font-mono text-3xl font-bold text-blue-700 dark:text-blue-400">
            {fmt(scientific.coefficient)} × 10<sup>{fmt(scientific.exponent)}</sup>
          </p>

          <p className="mt-3 text-center text-sm text-zinc-500 dark:text-zinc-400">
            {t("standardForm", { value: fmtStandard(standard) })}
          </p>

          <p dir="ltr" className="mt-1 text-center text-sm text-zinc-500 dark:text-zinc-400">
            {t("engineeringForm", { coefficient: fmt(engineering.coefficient), exponent: fmt(engineering.exponent) })}
          </p>

          {numberName && (
            <p className="mt-1 text-center text-sm font-semibold text-blue-600 dark:text-blue-400">
              {t("numberName", { coefficient: fmt(engineering.coefficient), name: t(`numberNames.${numberName}`) })}
            </p>
          )}

          <MagnitudeScaleDiagram
            logPosition={logPosition}
            caption={t("diagramCaption", { exponent: fmt(scientific.exponent) })}
          />

          <p className="mt-4 border-t border-zinc-200 pt-4 text-sm leading-6 text-zinc-600 dark:border-zinc-800 dark:text-zinc-300">
            {stepSentence}
          </p>
        </div>
      </div>
    </div>
  );
}
