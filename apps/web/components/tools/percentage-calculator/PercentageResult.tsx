import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import CopyButton from "@/components/tool-ui/CopyButton";
import PercentageComparisonChart from "./PercentageComparisonChart";
import type { PercentageMode, PercentageResult as Result } from "./types";

type Computed = {
  mode: PercentageMode;
  first: number;
  second: number;
  digitStyle: DigitStyle;
};

type Props = {
  result: Result;
  computed: Computed;
};

export default function PercentageResult({ result, computed }: Props) {
  const t = useTranslations("tools.percentage-calculator.result");
  const { mode, first, second, digitStyle } = computed;

  const num = (value: number) => formatLocalizedNumber(value, digitStyle);
  const formattedValue = num(result.value);
  const formattedFirst = num(first);
  const formattedSecond = num(second);

  const isError =
    (mode === "what-percent" && second === 0) ||
    (mode === "percentage-change" && first === 0) ||
    (mode === "reverse-percentage" && first === 0) ||
    (mode === "percentage-difference" && first + second === 0);

  let sentence: string;
  if (mode === "what-percent" && second === 0) {
    sentence = t("divisionByZero");
  } else if (mode === "percentage-change" && first === 0) {
    sentence = t("originalZero");
  } else if (mode === "reverse-percentage" && first === 0) {
    sentence = t("percentZero");
  } else if (mode === "percentage-difference" && first + second === 0) {
    sentence = t("bothZero");
  } else if (mode === "percent-of-number") {
    sentence = t("percentOf", { first: formattedFirst, second: formattedSecond, value: formattedValue });
  } else if (mode === "what-percent") {
    sentence = t("whatPercent", { first: formattedFirst, second: formattedSecond, value: formattedValue });
  } else if (mode === "percentage-change") {
    sentence = t("percentageChange", { first: formattedFirst, second: formattedSecond, value: formattedValue });
  } else if (mode === "reverse-percentage") {
    sentence = t("reversePercentage", { first: formattedFirst, second: formattedSecond, value: formattedValue });
  } else {
    sentence = t("percentageDifference", { first: formattedFirst, second: formattedSecond, value: formattedValue });
  }

  const chart = (() => {
    if (isError) return null;
    if (mode === "percent-of-number") {
      return {
        leftLabel: t("chart.baseLabel"),
        leftValue: second,
        rightLabel: t("chart.resultLabel"),
        rightValue: result.value,
      };
    }
    if (mode === "what-percent") {
      return {
        leftLabel: t("chart.wholeLabel"),
        leftValue: second,
        rightLabel: t("chart.partLabel"),
        rightValue: first,
      };
    }
    if (mode === "percentage-change") {
      return {
        leftLabel: t("chart.beforeLabel"),
        leftValue: first,
        rightLabel: t("chart.afterLabel"),
        rightValue: second,
      };
    }
    if (mode === "reverse-percentage") {
      return {
        leftLabel: t("chart.baseLabel"),
        leftValue: result.value,
        rightLabel: t("chart.partLabel"),
        rightValue: second,
      };
    }
    return {
      leftLabel: t("chart.valueALabel"),
      leftValue: first,
      rightLabel: t("chart.valueBLabel"),
      rightValue: second,
    };
  })();

  const isPercentageOutput = mode === "what-percent" || mode === "percentage-change" || mode === "percentage-difference";

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl border border-blue-200 bg-white shadow-sm dark:border-blue-500/30 dark:bg-zinc-900 dark:shadow-none">
        <div className="flex w-full items-center justify-between gap-3 rounded-t-2xl bg-blue-600 px-4 py-2.5 lg:px-6 lg:py-3">
          <h2 className="font-bold text-white">{t("heading")}</h2>
          <CopyButton text={sentence} className="!text-white dark:!text-white" />
        </div>

        <div className="p-4 lg:p-6">
          <p dir="ltr" className="text-center font-mono text-4xl font-bold text-blue-700 dark:text-blue-400">
            {isError ? "—" : isPercentageOutput ? `${formattedValue}%` : formattedValue}
          </p>

          {chart && (
            <div className="mt-5">
              <PercentageComparisonChart
                leftLabel={chart.leftLabel}
                leftValue={chart.leftValue}
                leftFormatted={num(chart.leftValue)}
                rightLabel={chart.rightLabel}
                rightValue={chart.rightValue}
                rightFormatted={num(chart.rightValue)}
                percentageLabel={sentence}
              />
            </div>
          )}

          <p className="mt-4 border-t border-zinc-200 pt-4 text-sm leading-6 text-zinc-600 dark:border-zinc-800 dark:text-zinc-300">
            {sentence}
          </p>
        </div>
      </div>
    </div>
  );
}
