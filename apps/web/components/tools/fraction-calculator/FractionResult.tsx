import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import CopyButton from "@/components/tool-ui/CopyButton";
import FractionBarDiagram from "./FractionBarDiagram";
import type { FractionOperation, FractionResult as Result } from "./types";

type Computed = {
  operation: FractionOperation;
  numeratorA: number;
  denominatorA: number;
  numeratorB: number;
  denominatorB: number;
  digitStyle: DigitStyle;
};

type Props = {
  result: Result;
  computed: Computed;
};

const OPERATION_SYMBOL: Record<FractionOperation, string> = {
  add: "+",
  subtract: "−",
  multiply: "×",
  divide: "÷",
};

function FractionGlyph({ numerator, denominator }: { numerator: number; denominator: number }) {
  if (denominator === 1) {
    return <span>{numerator}</span>;
  }
  return (
    <span className="inline-flex flex-col items-center align-middle text-[0.6em] leading-none">
      <span className="border-b-2 border-current px-1 pb-0.5">{numerator}</span>
      <span className="px-1 pt-0.5">{denominator}</span>
    </span>
  );
}

export default function FractionResult({ result, computed }: Props) {
  const t = useTranslations("tools.fraction-calculator.result");
  const { operation, numeratorA, denominatorA, numeratorB, denominatorB, digitStyle } = computed;

  const num = (value: number) => formatLocalizedNumber(value, digitStyle);

  if (result.error === "zero-denominator") {
    return (
      <div className="rounded-2xl border border-blue-200 bg-white shadow-sm dark:border-blue-500/30 dark:bg-zinc-900 dark:shadow-none">
        <div className="rounded-t-2xl bg-blue-600 px-4 py-2.5 lg:px-6 lg:py-3">
          <h2 className="font-bold text-white">{t("heading")}</h2>
        </div>
        <div className="p-4 lg:p-6">
          <p className="text-center text-sm leading-6 text-zinc-600 dark:text-zinc-300">{t("zeroDenominator")}</p>
        </div>
      </div>
    );
  }

  if (result.error === "divide-by-zero") {
    return (
      <div className="rounded-2xl border border-blue-200 bg-white shadow-sm dark:border-blue-500/30 dark:bg-zinc-900 dark:shadow-none">
        <div className="rounded-t-2xl bg-blue-600 px-4 py-2.5 lg:px-6 lg:py-3">
          <h2 className="font-bold text-white">{t("heading")}</h2>
        </div>
        <div className="p-4 lg:p-6">
          <p className="text-center text-sm leading-6 text-zinc-600 dark:text-zinc-300">{t("divideByZeroFraction")}</p>
        </div>
      </div>
    );
  }

  const copyText = result.isWholeNumber
    ? num(result.result.numerator)
    : `${num(result.result.numerator)}/${num(result.result.denominator)}`;

  const stepSentence =
    operation === "add" || operation === "subtract"
      ? t("stepAddSubtract", {
          scaledA: num(result.scaledNumeratorA ?? 0),
          scaledB: num(result.scaledNumeratorB ?? 0),
          commonDenominator: num(result.commonDenominator ?? 1),
        })
      : operation === "multiply"
        ? t("stepMultiply", {
            numA: num(numeratorA),
            numB: num(numeratorB),
            denA: num(denominatorA),
            denB: num(denominatorB),
          })
        : t("stepDivide", {
            numA: num(numeratorA),
            denA: num(denominatorA),
            numB: num(denominatorB),
            denB: num(numeratorB),
          });

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl border border-blue-200 bg-white shadow-sm dark:border-blue-500/30 dark:bg-zinc-900 dark:shadow-none">
        <div className="flex w-full items-center justify-between gap-3 rounded-t-2xl bg-blue-600 px-4 py-2.5 lg:px-6 lg:py-3">
          <h2 className="font-bold text-white">{t("heading")}</h2>
          <CopyButton text={copyText} className="!text-white dark:!text-white" />
        </div>

        <div className="p-4 lg:p-6">
          <div dir="ltr" className="flex items-center justify-center gap-3 font-mono text-4xl font-bold text-blue-700 dark:text-blue-400">
            <FractionGlyph numerator={numeratorA} denominator={denominatorA} />
            <span className="text-2xl opacity-70">{OPERATION_SYMBOL[operation]}</span>
            <FractionGlyph numerator={numeratorB} denominator={denominatorB} />
            <span className="text-2xl opacity-70">=</span>
            <FractionGlyph numerator={result.result.numerator} denominator={result.result.denominator} />
          </div>

          {result.mixed && (
            <p className="mt-3 text-center text-sm text-zinc-500 dark:text-zinc-400">
              {t("mixedNumber", {
                whole: num(result.mixed.whole),
                numerator: num(result.mixed.numerator),
                denominator: num(result.mixed.denominator),
              })}
            </p>
          )}

          <p className="mt-1 text-center text-sm text-zinc-500 dark:text-zinc-400">
            {t("decimalEquivalent", { value: num(result.decimal) })}
          </p>

          <FractionBarDiagram
            numerator={result.result.numerator}
            denominator={result.result.denominator}
            caption={t("diagramCaption", {
              numerator: num(result.result.numerator),
              denominator: num(result.result.denominator),
            })}
          />

          <p className="mt-4 border-t border-zinc-200 pt-4 text-sm leading-6 text-zinc-600 dark:border-zinc-800 dark:text-zinc-300">
            {stepSentence}
          </p>
        </div>
      </div>
    </div>
  );
}
