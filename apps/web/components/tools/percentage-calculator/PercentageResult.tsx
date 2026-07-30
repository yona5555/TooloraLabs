import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import type { PercentageMode, PercentageResult as Result } from "./types";

type Computed = {
  mode: PercentageMode;
  first: number;
  second: number;
  digitStyle: DigitStyle;
};

type Props = {
  result: Result | null;
  computed: Computed | null;
};

export default function PercentageResult({ result, computed }: Props) {
  const t = useTranslations("tools.percentage-calculator.result");

  if (!result || !computed) return null;

  const { mode, first, second, digitStyle } = computed;

  const formattedValue = formatLocalizedNumber(result.value, digitStyle);
  const formattedFirst = formatLocalizedNumber(first, digitStyle);
  const formattedSecond = formatLocalizedNumber(second, digitStyle);

  let text: string;
  if (mode === "what-percent" && second === 0) {
    text = t("divisionByZero");
  } else if (mode === "percentage-change" && first === 0) {
    text = t("originalZero");
  } else if (mode === "percent-of-number") {
    text = t("percentOf", {
      first: formattedFirst,
      second: formattedSecond,
      value: formattedValue,
    });
  } else if (mode === "what-percent") {
    text = t("whatPercent", {
      first: formattedFirst,
      second: formattedSecond,
      value: formattedValue,
    });
  } else {
    text = t("percentageChange", { value: formattedValue });
  }

  return (
    <div className="mt-8 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-none">
      <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
        {t("heading")}
      </h3>

      <div className="mt-4 text-4xl font-bold text-blue-600 dark:text-blue-400">
        {formattedValue}
      </div>

      <p className="mt-3 text-zinc-600 dark:text-zinc-300">
        {text}
      </p>
    </div>
  );
}
