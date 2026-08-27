import { useTranslations } from "next-intl";
import CopyButton from "@/components/tool-ui/CopyButton";
import DigitSignificanceDisplay from "./DigitSignificanceDisplay";
import type { SignificantFiguresOperation, SignificantFiguresResult as Result } from "./types";

type Computed = {
  operation: SignificantFiguresOperation;
  valueA: string;
  valueB: string;
};

type Props = {
  result: Result;
  computed: Computed;
};

export default function SignificantFiguresResult({ result, computed }: Props) {
  const t = useTranslations("tools.significant-figures-calculator.result");
  const { operation, valueA } = computed;

  if (result.error === "invalid-number") {
    return (
      <ErrorCard heading={t("heading")} message={t("invalidNumber")} />
    );
  }
  if (result.error === "divide-by-zero") {
    return <ErrorCard heading={t("heading")} message={t("divideByZero")} />;
  }

  const isAddSubtract = operation === "add" || operation === "subtract";
  const rawPrecision = isAddSubtract
    ? result.roundedResult.toFixed(result.resultDecimalPlaces ?? 0)
    : result.roundedResult.toPrecision(result.resultSigFigs ?? 1);

  // toPrecision() switches to exponential ("1.23e+4") whenever the plain
  // decimal form would need trailing zeros to preserve the sig-fig count —
  // exactly the ambiguous case this tool exists to avoid. The exponent
  // digit in that string is not part of the mantissa, so it must never be
  // fed into the significant-digit highlighter, which only understands
  // plain decimal strings.
  const isScientific = rawPrecision.includes("e");
  const sigFigs = result.resultSigFigs ?? 1;
  const mantissaDisplay = isScientific
    ? result.resultScientific.coefficient.toFixed(Math.max(0, sigFigs - 1))
    : rawPrecision;
  const exponentDisplay = isScientific ? String(result.resultScientific.exponent) : null;
  const copyText = isScientific ? `${mantissaDisplay} × 10^${exponentDisplay}` : rawPrecision;

  const digitDisplayRaw = operation === "count" ? valueA : isAddSubtract ? null : mantissaDisplay;

  let stepSentence: string;
  if (operation === "count") {
    stepSentence = t("stepCount", { value: valueA, count: result.sigFigsA });
  } else if (operation === "round") {
    stepSentence = t("stepRound", { value: valueA, digits: result.resultSigFigs ?? 0, result: copyText });
  } else if (operation === "add" || operation === "subtract") {
    stepSentence = t("stepAddSubtract", {
      placesA: result.decimalPlacesA,
      placesB: result.decimalPlacesB ?? 0,
      places: result.resultDecimalPlaces ?? 0,
    });
  } else {
    stepSentence = t("stepMultiplyDivide", {
      sigFigsA: result.sigFigsA,
      sigFigsB: result.sigFigsB ?? 0,
      sigFigs: result.resultSigFigs ?? 0,
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
            {exponentDisplay !== null ? (
              <>
                {mantissaDisplay} × 10<sup>{exponentDisplay}</sup>
              </>
            ) : (
              mantissaDisplay
            )}
          </p>

          <p className="mt-3 text-center text-sm font-semibold text-zinc-600 dark:text-zinc-300">
            {isAddSubtract
              ? t("decimalPlacesBadge", { count: result.resultDecimalPlaces ?? 0 })
              : t("sigFigsBadge", { count: result.resultSigFigs ?? 0 })}
          </p>

          {digitDisplayRaw && (
            <DigitSignificanceDisplay raw={digitDisplayRaw} caption={t("diagramCaption")} />
          )}

          <p className="mt-4 border-t border-zinc-200 pt-4 text-sm leading-6 text-zinc-600 dark:border-zinc-800 dark:text-zinc-300">
            {stepSentence}
          </p>
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
