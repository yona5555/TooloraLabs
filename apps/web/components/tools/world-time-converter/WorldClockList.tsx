"use client";
import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { DigitStyle } from "@tooloralabs/core";
import { getTimeZoneOffsetMinutes, formatUtcOffsetLabel } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import { WORLD_CITIES } from "@/lib/worldtime/cities";

const BOARD_CITY_IDS = [
  "America/New_York",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Paris",
  "Asia/Dubai",
  "Asia/Riyadh",
  "Africa/Cairo",
  "Europe/Moscow",
  "Asia/Kolkata",
  "Asia/Shanghai",
  "Asia/Tokyo",
  "Asia/Singapore",
  "Australia/Sydney",
  "Pacific/Auckland",
  "America/Sao_Paulo",
  "Africa/Johannesburg",
];

const BOARD_CITIES = BOARD_CITY_IDS.map((id) => WORLD_CITIES.find((city) => city.id === id)).filter((c) => c !== undefined);

type WorldClockListProps = {
  digitStyle: DigitStyle;
};

export default function WorldClockList({ digitStyle }: WorldClockListProps) {
  const t = useTranslations("tools.world-time-converter.worldClock");
  const locale = useLocale();
  const nameKey = locale === "ar" ? "ar" : "en";
  const intlLocale = locale === "ar" ? "ar" : "en-US";
  const numberingSystem = digitStyle === "eastern" ? "arab" : "latn";

  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    function tick() {
      setNow(new Date());
    }
    // Deferred via setTimeout(0) rather than called directly: the initial render must stay
    // in sync with the server's "--:--" placeholder to avoid a hydration mismatch (the real
    // "now" is only available client-side, a moment after mount).
    const timeout = setTimeout(tick, 0);
    const interval = setInterval(tick, 60_000);
    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, []);

  return (
    <SectionCard id="world-clock" title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {BOARD_CITIES.map((city) => {
          const time = now
            ? new Intl.DateTimeFormat(intlLocale, {
                timeZone: city.ianaZone,
                hour: "2-digit",
                minute: "2-digit",
                hour12: locale !== "ar",
                numberingSystem,
              }).format(now)
            : "--:--";
          const offset = now ? formatUtcOffsetLabel(getTimeZoneOffsetMinutes(now, city.ianaZone)) : "";

          return (
            <div key={city.id} className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-800/60">
              <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">{city.city[nameKey]}</p>
              <p dir="ltr" className="mt-1 font-mono text-lg font-bold text-zinc-900 dark:text-zinc-100">
                {time}
              </p>
              <p dir="ltr" className="mt-0.5 text-xs text-zinc-400 dark:text-zinc-500">
                {t("utcPrefix")} {offset}
              </p>
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}
