import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import CopyButton from "@/components/tool-ui/CopyButton";
import AgeYearProgressRing from "./AgeYearProgressRing";
import type { AgeExtendedResult } from "./types";

type AgeResultProps = {
  result: AgeExtendedResult;
  digitStyle: DigitStyle;
};

const INT: Intl.NumberFormatOptions = { maximumFractionDigits: 0 };

function StatTile({ label, value, title }: { label: string; value: string; title?: string }) {
  return (
    <div className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-800/60">
      <dt className="text-xs text-zinc-500 dark:text-zinc-400" title={title}>
        {label}
      </dt>
      <dd dir="ltr" className="mt-1 font-mono font-semibold text-zinc-900 dark:text-zinc-100">
        {value}
      </dd>
    </div>
  );
}

export default function AgeResult({ result, digitStyle }: AgeResultProps) {
  const t = useTranslations("tools.age-calculator");

  const fmt = (n: number, opts = INT) => formatLocalizedNumber(n, digitStyle, opts);

  const weekdayNames = t.raw("aboveFold.weekdayNames") as string[];
  const zodiacNames = t.raw("aboveFold.zodiacNames") as Record<string, string>;
  const chineseZodiacNames = t.raw("aboveFold.chineseZodiacNames") as Record<string, string>;
  const generationNames = t.raw("aboveFold.generationNames") as Record<string, string>;

  const ageText = t("aboveFold.calendarAgeText", {
    years: fmt(result.years),
    months: fmt(result.months),
    days: fmt(result.days),
  });

  const summaryText = `${t("title")}: ${ageText}`;

  return (
    <div className="overflow-hidden rounded-2xl border border-blue-200 bg-white shadow-sm dark:border-blue-500/30 dark:bg-zinc-900 dark:shadow-none">
      <div className="flex items-center justify-between bg-blue-600 px-6 py-3">
        <h2 className="font-bold text-white">{t("aboveFold.resultTitle")}</h2>
        <CopyButton text={summaryText} />
      </div>

      <div className="p-6">
        <div className="flex flex-wrap items-center gap-6">
          <AgeYearProgressRing
            percent={result.yearProgressPercent}
            years={result.years}
            label={t("aboveFold.yearProgressLabel")}
            yearsLabel={t("aboveFold.yearsUnit")}
          />
          <div className="min-w-0 flex-1">
            <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">{ageText}</p>
            <p className="mt-1 text-sm text-blue-600 dark:text-blue-400">
              {result.daysUntilBirthday === 0
                ? t("aboveFold.birthdayIsToday")
                : t("aboveFold.daysUntilBirthday", { count: fmt(result.daysUntilBirthday) })}
            </p>
            <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
              {t("aboveFold.bornOn", { weekday: weekdayNames[result.birthWeekday] })}
            </p>
          </div>
        </div>

        <dl className="mt-5 grid grid-cols-2 gap-3 border-t border-zinc-200 pt-4 text-sm dark:border-zinc-800">
          <StatTile label={t("aboveFold.totalDaysLabel")} value={fmt(result.totalDays)} />
          <StatTile label={t("aboveFold.totalWeeksLabel")} value={fmt(result.totalWeeks)} />
          <StatTile label={t("aboveFold.totalHoursLabel")} value={fmt(result.totalHours)} />
          <StatTile label={t("aboveFold.totalMinutesLabel")} value={fmt(result.totalMinutes)} />
          <StatTile
            label={t("aboveFold.totalSecondsLabel")}
            value={fmt(result.totalSeconds)}
            title={t("aboveFold.liveTickingNote")}
          />
          <StatTile
            label={t("aboveFold.decimalAgeLabel")}
            value={fmt(result.decimalAge, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            title={t("aboveFold.decimalAgeNote")}
          />
          <StatTile
            label={t("aboveFold.hijriAgeLabel")}
            value={t("aboveFold.hijriAgeValue", {
              years: fmt(result.hijri.years),
              months: fmt(result.hijri.months),
              days: fmt(result.hijri.days),
            })}
            title={t("aboveFold.hijriAgeNote")}
          />
          <StatTile label={t("aboveFold.zodiacLabel")} value={zodiacNames[result.zodiac]} />
          <StatTile
            label={t("aboveFold.chineseZodiacLabel")}
            value={chineseZodiacNames[result.chineseZodiac]}
            title={t("aboveFold.chineseZodiacNote")}
          />
          <StatTile label={t("aboveFold.generationLabel")} value={generationNames[result.generation]} />
        </dl>
      </div>
    </div>
  );
}
