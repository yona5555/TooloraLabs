"use client";
import { useLocale, useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import { formatUtcOffsetLabel, type TimeConversionResult } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import CopyButton from "@/components/tool-ui/CopyButton";
import WorldClockGauge from "./WorldClockGauge";
import type { WorldCity } from "@/lib/worldtime/cities";

type WorldTimeResultProps = {
  fromCity: WorldCity;
  toCity: WorldCity;
  result: TimeConversionResult;
  digitStyle: DigitStyle;
};

function hourOf(instantMs: number, zone: string): number {
  const dtf = new Intl.DateTimeFormat("en-US", { timeZone: zone, hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
  const parts = dtf.formatToParts(new Date(instantMs));
  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? 0);
  const minute = Number(parts.find((p) => p.type === "minute")?.value ?? 0);
  return hour + minute / 60;
}

export default function WorldTimeResult({ fromCity, toCity, result, digitStyle }: WorldTimeResultProps) {
  const t = useTranslations("tools.world-time-converter.aboveFold");
  const locale = useLocale();
  const nameKey = locale === "ar" ? "ar" : "en";
  const intlLocale = locale === "ar" ? "ar" : "en-US";
  const numberingSystem = digitStyle === "eastern" ? "arab" : "latn";

  const instant = new Date(result.utcInstant);

  const formattedTime = new Intl.DateTimeFormat(intlLocale, {
    timeZone: toCity.ianaZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: locale !== "ar",
    numberingSystem,
  }).format(instant);

  const formattedDate = new Intl.DateTimeFormat(intlLocale, {
    timeZone: toCity.ianaZone,
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    numberingSystem,
  }).format(instant);

  const diff = Math.abs(result.differenceMinutes);
  const diffHours = Math.floor(diff / 60);
  const diffMinutes = diff % 60;
  const diffLabel =
    diffMinutes === 0
      ? t("differenceHoursOnly", { hours: formatLocalizedNumber(diffHours, digitStyle, { maximumFractionDigits: 0 }) })
      : t("differenceHoursMinutes", {
          hours: formatLocalizedNumber(diffHours, digitStyle, { maximumFractionDigits: 0 }),
          minutes: formatLocalizedNumber(diffMinutes, digitStyle, { maximumFractionDigits: 0 }),
        });

  const dayNote = result.dayDifference === 0 ? t("sameDay") : result.dayDifference > 0 ? t("nextDay") : t("previousDay");

  const summaryText = `${toCity.city[nameKey]}: ${formattedTime} — ${formattedDate}`;

  return (
    <SectionCard title={t("resultTitle")} action={<CopyButton text={summaryText} />}>
      <div className="text-center">
        <p dir="ltr" suppressHydrationWarning className="font-mono text-4xl font-bold text-zinc-900 dark:text-zinc-50">
          {formattedTime}
        </p>
        <p suppressHydrationWarning className="mt-1 text-sm font-medium text-zinc-600 dark:text-zinc-300">
          {formattedDate}
        </p>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{toCity.city[nameKey]}</p>
      </div>

      <div className="mt-4">
        <WorldClockGauge
          fromHour={hourOf(result.utcInstant, fromCity.ianaZone)}
          toHour={hourOf(result.utcInstant, toCity.ianaZone)}
          fromLabel={fromCity.city[nameKey]}
          toLabel={toCity.city[nameKey]}
          dayLabel={t("dayLabel")}
          nightLabel={t("nightLabel")}
        />
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-800/60">
          <dt className="text-xs text-zinc-500 dark:text-zinc-400">{t("differenceLabel")}</dt>
          <dd dir="ltr" className="mt-1 font-mono font-semibold text-zinc-900 dark:text-zinc-100">
            {result.differenceMinutes === 0 ? t("sameTime") : `${result.differenceMinutes > 0 ? "+" : "−"}${diffLabel}`}
          </dd>
        </div>
        <div className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-800/60">
          <dt className="text-xs text-zinc-500 dark:text-zinc-400">{t("dayNoteLabel")}</dt>
          <dd className="mt-1 font-semibold text-zinc-900 dark:text-zinc-100">{dayNote}</dd>
        </div>
        <div className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-800/60">
          <dt className="text-xs text-zinc-500 dark:text-zinc-400">
            {t("utcOffsetLabel", { city: fromCity.city[nameKey] })}
          </dt>
          <dd dir="ltr" className="mt-1 font-mono font-semibold text-zinc-900 dark:text-zinc-100">
            {t("utcPrefix")} {formatUtcOffsetLabel(result.fromOffsetMinutes)}
          </dd>
        </div>
        <div className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-800/60">
          <dt className="text-xs text-zinc-500 dark:text-zinc-400">
            {t("utcOffsetLabel", { city: toCity.city[nameKey] })}
          </dt>
          <dd dir="ltr" className="mt-1 font-mono font-semibold text-zinc-900 dark:text-zinc-100">
            {t("utcPrefix")} {formatUtcOffsetLabel(result.toOffsetMinutes)}
          </dd>
        </div>
      </dl>
    </SectionCard>
  );
}
