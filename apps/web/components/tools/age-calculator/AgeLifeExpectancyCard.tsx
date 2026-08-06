import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import { computeLifeExpectancyProgress, type Gender } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import AgeLifeExpectancyGauge from "./AgeLifeExpectancyGauge";

type AgeLifeExpectancyCardProps = {
  decimalAge: number;
  gender: Gender;
  digitStyle: DigitStyle;
};

const YEARS_FMT: Intl.NumberFormatOptions = { maximumFractionDigits: 1 };
const INT_FMT: Intl.NumberFormatOptions = { maximumFractionDigits: 0 };

function RemainingTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-800/60">
      <dt className="text-xs text-zinc-500 dark:text-zinc-400">{label}</dt>
      <dd dir="ltr" className="mt-1 font-mono font-semibold text-zinc-900 dark:text-zinc-100">
        {value}
      </dd>
    </div>
  );
}

export default function AgeLifeExpectancyCard({ decimalAge, gender, digitStyle }: AgeLifeExpectancyCardProps) {
  const t = useTranslations("tools.age-calculator");
  const progress = computeLifeExpectancyProgress(decimalAge, gender);
  const fmt = (n: number, opts: Intl.NumberFormatOptions = INT_FMT) => formatLocalizedNumber(n, digitStyle, opts);

  const stageLabels = {
    childhood: t("aboveFold.lifeStages.childhood"),
    adolescence: t("aboveFold.lifeStages.adolescence"),
    youth: t("aboveFold.lifeStages.youth"),
    middleAge: t("aboveFold.lifeStages.middleAge"),
    oldAge: t("aboveFold.lifeStages.oldAge"),
    yourAge: t("aboveFold.lifeExpectancyTitle"),
  };

  return (
    <SectionCard title={t("aboveFold.lifeExpectancyTitle")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        {t("aboveFold.lifeExpectancyIntro", { years: fmt(progress.lifeExpectancyYears, YEARS_FMT) })}
      </p>

      <div className="mt-4">
        <AgeLifeExpectancyGauge
          decimalAge={decimalAge}
          lifeExpectancyYears={progress.lifeExpectancyYears}
          activeStage={progress.lifeStage}
          labels={stageLabels}
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-blue-50 px-4 py-3 dark:bg-blue-500/10">
        <p className="text-sm font-semibold text-blue-700 dark:text-blue-400">
          {t("aboveFold.currentStagePrefix")} {stageLabels[progress.lifeStage]}
        </p>
        <p dir="ltr" className="font-mono text-sm font-bold text-blue-700 dark:text-blue-400">
          {fmt(progress.percentElapsed, YEARS_FMT)}%
        </p>
      </div>

      {progress.isPastLifeExpectancy ? (
        <p className="mt-3 rounded-xl bg-zinc-50 px-4 py-3 text-sm text-zinc-600 dark:bg-zinc-800/60 dark:text-zinc-300">
          {t("aboveFold.lifeExpectancyPastNote")}
        </p>
      ) : (
        <dl className="mt-3 grid grid-cols-3 gap-2">
          <RemainingTile label={t("aboveFold.yearsRemainingLabel")} value={fmt(progress.yearsRemaining)} />
          <RemainingTile label={t("aboveFold.weeksRemainingLabel")} value={fmt(progress.weeksRemaining)} />
          <RemainingTile label={t("aboveFold.daysRemainingLabel")} value={fmt(progress.daysRemaining)} />
        </dl>
      )}

      <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">{t("aboveFold.lifeExpectancyDisclaimer")}</p>
    </SectionCard>
  );
}
