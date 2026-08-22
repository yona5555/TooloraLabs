"use client";
import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import SectionCard from "@/components/tool-ui/SectionCard";
import PdfDownloadButton from "@/components/tool-ui/PdfDownloadButton";
import type { Gender, IdealWeightResult as IdealWeightResultData } from "@tooloralabs/tools";

type IdealWeightResultProps = {
  result: IdealWeightResultData | null;
  gender: Gender;
  heightCm: number;
  digitStyle: DigitStyle;
};

function Stat({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-xl bg-zinc-50 px-3 py-2.5 text-center dark:bg-zinc-800/60">
      <dt className="text-xs text-zinc-500 dark:text-zinc-400">{title}</dt>
      <dd dir="ltr" className="mt-0.5 font-mono text-sm font-semibold text-zinc-900 dark:text-zinc-100">
        {value}
      </dd>
    </div>
  );
}

export default function IdealWeightResult({ result, gender, heightCm, digitStyle }: IdealWeightResultProps) {
  const t = useTranslations("tools.ideal-weight-calculator");

  const kg = (value: number) => `${formatLocalizedNumber(value, digitStyle, { maximumFractionDigits: 1 })} kg`;

  const hasResult = result !== null && result.average > 0;

  return (
    <SectionCard
      title={t("aboveFold.resultTitle")}
      action={
        hasResult ? (
          <PdfDownloadButton
            toolName={t("title")}
            inputs={[
              { label: t("form.genderLabel"), value: gender === "male" ? t("form.genderMale") : t("form.genderFemale") },
              { label: t("form.heightLabel"), value: `${formatLocalizedNumber(heightCm, digitStyle)} cm` },
            ]}
            results={[
              { label: t("aboveFold.averageLabel"), value: kg(result.average) },
              { label: t("aboveFold.devineLabel"), value: kg(result.devine) },
              { label: t("aboveFold.robinsonLabel"), value: kg(result.robinson) },
              { label: t("aboveFold.millerLabel"), value: kg(result.miller) },
              { label: t("aboveFold.hamwiLabel"), value: kg(result.hamwi) },
            ]}
            filename="ideal-weight-calculator-result.pdf"
          />
        ) : undefined
      }
    >
      {hasResult ? (
        <>
          <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">{t("aboveFold.averageLabel")}</p>
          <p dir="ltr" className="text-center font-mono text-4xl font-bold text-blue-700 dark:text-blue-400">
            {kg(result.average)}
          </p>

          <div className="mt-5 grid grid-cols-2 gap-2">
            <Stat title={t("aboveFold.devineLabel")} value={kg(result.devine)} />
            <Stat title={t("aboveFold.robinsonLabel")} value={kg(result.robinson)} />
            <Stat title={t("aboveFold.millerLabel")} value={kg(result.miller)} />
            <Stat title={t("aboveFold.hamwiLabel")} value={kg(result.hamwi)} />
          </div>
        </>
      ) : (
        <p className="rounded-xl border border-dashed border-zinc-300 px-4 py-8 text-center text-sm text-zinc-400 dark:border-zinc-700 dark:text-zinc-500">
          {t("aboveFold.placeholder")}
        </p>
      )}
    </SectionCard>
  );
}
