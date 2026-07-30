import { useTranslations } from "next-intl";
import type { PercentageMode, PercentageResult as Result } from "./types";

type Computed = {
  mode: PercentageMode;
  first: number;
  second: number;
};

type Props = {
  result: Result | null;
  computed: Computed | null;
};

export default function PercentageResult({ result, computed }: Props) {
  const t = useTranslations("tools.percentage-calculator.result");

  if (!result || !computed) return null;

  const { mode, first, second } = computed;

  let text: string;
  if (mode === "what-percent" && second === 0) {
    text = t("divisionByZero");
  } else if (mode === "percentage-change" && first === 0) {
    text = t("originalZero");
  } else if (mode === "percent-of-number") {
    text = t("percentOf", { first, second, value: result.value });
  } else if (mode === "what-percent") {
    text = t("whatPercent", { first, second, value: result.value });
  } else {
    text = t("percentageChange", { value: result.value });
  }

  return (
    <div className="mt-8 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-zinc-900">
        {t("heading")}
      </h3>

      <div className="mt-4 text-4xl font-bold text-blue-600">
        {result.value}
      </div>

      <p className="mt-3 text-zinc-600">
        {text}
      </p>
    </div>
  );
}
