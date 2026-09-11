import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import type { BodyFatResult as Result, Gender } from "./types";
import BodyFatScale from "./BodyFatScale";
import BodyFatShareExportModal from "./BodyFatShareExportModal";

type Props = {
  result: Result;
  gender: Gender;
  heightCm: string;
  neckCm: string;
  waistCm: string;
  hipCm: string;
  digitStyle: DigitStyle;
};

export default function BodyFatResult({ result, gender, heightCm, neckCm, waistCm, hipCm, digitStyle }: Props) {
  const t = useTranslations("tools.body-fat-calculator.result");
  const tForm = useTranslations("tools.body-fat-calculator.form");
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

  const heroValue = `${fmt(result.bodyFatPercent)}%`;
  const inputRows = [
    { label: tForm("genderLabel"), value: gender === "male" ? tForm("genderMale") : tForm("genderFemale") },
    { label: tForm("height"), value: `${heightCm} cm` },
    { label: tForm("neck"), value: `${neckCm} cm` },
    { label: tForm("waist"), value: `${waistCm} cm` },
    ...(gender === "female" ? [{ label: tForm("hip"), value: `${hipCm} cm` }] : []),
  ];
  const resultRows = [{ label: t("heading"), value: `${heroValue} (${tCategories(result.category)})` }];

  return (
    <div className="rounded-2xl border border-blue-200 bg-white shadow-sm dark:border-blue-500/30 dark:bg-zinc-900 dark:shadow-none">
      <div className="flex w-full items-center justify-between gap-3 rounded-t-2xl bg-blue-600 px-4 py-2.5 lg:px-6 lg:py-3">
        <h2 className="font-bold text-white">{t("heading")}</h2>
        <BodyFatShareExportModal
          inputRows={inputRows}
          resultRows={resultRows}
          heroLabel={t("heading")}
          heroValue={heroValue}
          sentence={t("sentence", { percent: fmt(result.bodyFatPercent), category: tCategories(result.category) })}
          gauge={{
            zones: [
              { from: 0, to: 5, color: "#3b82f6" },
              { from: 5, to: 13, color: "#22c55e" },
              { from: 13, to: 17, color: "#14b8a6" },
              { from: 17, to: 24, color: "#f59e0b" },
              { from: 24, to: 40, color: "#ef4444" },
            ],
            domainMin: 0,
            domainMax: 40,
            value: result.bodyFatPercent,
            ticks: [0, 5, 13, 17, 24, 40],
            valueLabel: heroValue,
            caption: tCategories(result.category),
          }}
        />
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
