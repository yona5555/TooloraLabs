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

function EstimateRangeBar({
  devine,
  robinson,
  miller,
  hamwi,
  average,
  fmt,
  spreadLabel,
}: {
  devine: number;
  robinson: number;
  miller: number;
  hamwi: number;
  average: number;
  fmt: (v: number) => string;
  spreadLabel: string;
}) {
  const values = [devine, robinson, miller, hamwi];
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const pct = (v: number) => ((v - min) / span) * 100;

  return (
    <div dir="ltr" className="mt-5 border-t border-zinc-200 pt-5 dark:border-zinc-800">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">{spreadLabel}</p>
      <div className="relative h-2 rounded-full bg-zinc-100 dark:bg-zinc-800">
        {values.map((v, i) => (
          <div
            key={i}
            className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-blue-400/70 shadow dark:border-zinc-900 dark:bg-blue-500/60"
            style={{ left: `${pct(v)}%` }}
          />
        ))}
        <div
          className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-blue-600 shadow dark:border-zinc-900 dark:bg-blue-400"
          style={{ left: `${pct(average)}%` }}
        />
      </div>
      <div className="mt-2 flex justify-between text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
        <span>{fmt(min)}</span>
        <span>{fmt(max)}</span>
      </div>
    </div>
  );
}

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

          <EstimateRangeBar
            devine={result.devine}
            robinson={result.robinson}
            miller={result.miller}
            hamwi={result.hamwi}
            average={result.average}
            fmt={kg}
            spreadLabel={t("aboveFold.spreadLabel")}
          />
        </>
      ) : (
        <p className="rounded-xl border border-dashed border-zinc-300 px-4 py-8 text-center text-sm text-zinc-400 dark:border-zinc-700 dark:text-zinc-500">
          {t("aboveFold.placeholder")}
        </p>
      )}
    </SectionCard>
  );
}
