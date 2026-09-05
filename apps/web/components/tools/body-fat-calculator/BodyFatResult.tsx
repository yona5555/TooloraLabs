import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import type { BodyFatResult as Result, Gender } from "./types";
import CopyButton from "@/components/tool-ui/CopyButton";
import BodyFatScale from "./BodyFatScale";

type Props = {
  result: Result;
  gender: Gender;
  digitStyle: DigitStyle;
};

export default function BodyFatResult({ result, gender, digitStyle }: Props) {
  const t = useTranslations("tools.body-fat-calculator.result");
  const tCategories = useTranslations("tools.body-fat-calculator.categories");
  const fmt = (value: number) => formatLocalizedNumber(value, digitStyle, { maximumFractionDigits: 1 });

  if (result.error || result.category === null) {
    return (
      <div className="rounded-2xl border border-blue-200 bg-white shadow-sm dark:border-blue-500/30 dark:bg-zinc-900 dark:shadow-none">
        <div className="rounded-t-2xl bg-blue-600 px-4 py-2.5 lg:px-6 lg:py-3">
          <h2 className="font-bold text-white">{t("heading")}</h2>
        </div>
        <div className="p-4 lg:p-6">
          <p className="text-center text-sm leading-6 text-zinc-600 dark:text-zinc-300">{t("invalidMeasurements")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-blue-200 bg-white shadow-sm dark:border-blue-500/30 dark:bg-zinc-900 dark:shadow-none">
      <div className="flex w-full items-center justify-between gap-3 rounded-t-2xl bg-blue-600 px-4 py-2.5 lg:px-6 lg:py-3">
        <h2 className="font-bold text-white">{t("heading")}</h2>
        <CopyButton text={`${fmt(result.bodyFatPercent)}% (${tCategories(result.category)})`} className="!text-white dark:!text-white" />
      </div>
      <div className="p-4 lg:p-6">
        <div className="text-center">
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{fmt(result.bodyFatPercent)}%</p>
          <p className="mt-1 text-sm font-semibold text-zinc-600 dark:text-zinc-300">{tCategories(result.category)}</p>
        </div>

        <div className="mt-5">
          <BodyFatScale gender={gender} bodyFatPercent={result.bodyFatPercent} />
        </div>
      </div>
    </div>
  );
}
