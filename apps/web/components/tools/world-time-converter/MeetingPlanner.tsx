"use client";
import { useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { DigitStyle } from "@tooloralabs/core";
import { findOverlappingBusinessHours, getTimeZoneOffsetMinutes } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import type { WorldCity } from "@/lib/worldtime/cities";

type MeetingPlannerProps = {
  fromCity: WorldCity;
  toCity: WorldCity;
  referenceDate: Date;
  digitStyle: DigitStyle;
};

const BUSINESS_START = 9;
const BUSINESS_END = 17;

export default function MeetingPlanner({ fromCity, toCity, referenceDate, digitStyle }: MeetingPlannerProps) {
  const t = useTranslations("tools.world-time-converter.meetingPlanner");
  const locale = useLocale();
  const nameKey = locale === "ar" ? "ar" : "en";
  const numberingSystem = digitStyle === "eastern" ? "arab" : "latn";

  const overlap = useMemo(
    () => findOverlappingBusinessHours(fromCity.ianaZone, toCity.ianaZone, referenceDate, BUSINESS_START, BUSINESS_END),
    [fromCity, toCity, referenceDate]
  );

  const fromOffset = useMemo(() => getTimeZoneOffsetMinutes(referenceDate, fromCity.ianaZone), [fromCity, referenceDate]);

  function formatFromHour(utcHour: number) {
    const localHour = Math.round((((utcHour + fromOffset / 60) % 24) + 24) % 24);
    return new Intl.NumberFormat(locale === "ar" ? "ar" : "en-US", { numberingSystem }).format(localHour);
  }

  return (
    <SectionCard id="meeting-planner" title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        {t("intro", { from: fromCity.city[nameKey], to: toCity.city[nameKey] })}
      </p>

      {overlap.length > 0 ? (
        <div className="mt-4">
          <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t("overlapFoundLabel")}</p>
          <div dir="ltr" className="mt-3 flex flex-wrap gap-2">
            {overlap.map((utcHour) => (
              <span
                key={utcHour}
                className="rounded-lg border border-blue-400 bg-blue-50 px-3 py-1.5 font-mono text-sm font-semibold text-blue-700 dark:border-blue-500 dark:bg-blue-500/10 dark:text-blue-400"
              >
                {formatFromHour(utcHour)}:00
              </span>
            ))}
          </div>
          <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
            {t("overlapNote", { from: fromCity.city[nameKey], start: BUSINESS_START, end: BUSINESS_END })}
          </p>
        </div>
      ) : (
        <p className="mt-4 rounded-xl bg-zinc-50 px-4 py-3 text-sm text-zinc-600 dark:bg-zinc-800/60 dark:text-zinc-300">
          {t("noOverlap", { start: BUSINESS_START, end: BUSINESS_END })}
        </p>
      )}
    </SectionCard>
  );
}
