"use client";
import { useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";
import IndicatorStrip, { type IndicatorItem } from "./IndicatorStrip";
import { subscribeVisibleClock } from "@/components/tool-ui/motion/motion";

/**
 * The date & time section's indicators, all computed in the browser from the device clock, with no
 * request: ISO 8601 week, days left in the year, Unix time (ticking each second), the device's UTC
 * offset and time zone, and whether this year is a leap year (Gregorian rule) with the next one.
 * The server snapshot is null, so nothing renders stale or mismatches on hydration.
 */

const DAY = 86_400_000;

// tool-ui/motion: ticks each second while the page is visible, nothing while hidden
const subscribe = (cb: () => void) => subscribeVisibleClock(1000, cb);
const nowSeconds = () => Math.floor(Date.now() / 1000);

const isLeap = (y: number) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;

/** ISO 8601 week number: the week containing the year's first Thursday is week 1. */
function isoWeek(d: Date) {
  const t = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
  const day = new Date(t).getUTCDay() || 7;
  const thursday = new Date(t + (4 - day) * DAY);
  const yearStart = Date.UTC(thursday.getUTCFullYear(), 0, 1);
  return { week: Math.ceil(((thursday.getTime() - yearStart) / DAY + 1) / 7), year: thursday.getUTCFullYear() };
}

export default function DateTimePulse() {
  const t = useTranslations("categoryPulse.dateTime");
  const seconds = useSyncExternalStore(subscribe, nowSeconds, () => null);
  const ltr = (s: string) => <span dir="ltr">{s}</span>;

  const ids = ["week", "left", "unix", "offset", "leap"] as const;
  const hrefs = {
    week: "/tools/date-calculator",
    left: "/tools/countdown-to-event-calculator",
    unix: "/tools/time-calculator",
    offset: "/tools/world-time-converter",
    leap: "/tools/age-calculator",
  };

  if (seconds === null) {
    return <IndicatorStrip label={t("label")} items={ids.map((id) => ({ id, href: hrefs[id], label: " ", value: " " }))} />;
  }

  const now = new Date(seconds * 1000);
  const year = now.getFullYear();
  const { week, year: weekYear } = isoWeek(now);
  const today = Date.UTC(year, now.getMonth(), now.getDate());
  const daysLeft = (Date.UTC(year + 1, 0, 1) - today) / DAY - 1;
  const offsetMin = -now.getTimezoneOffset();
  const sign = offsetMin >= 0 ? "+" : "−";
  const offset = `UTC${sign}${String(Math.floor(Math.abs(offsetMin) / 60)).padStart(2, "0")}:${String(Math.abs(offsetMin) % 60).padStart(2, "0")}`;
  const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  let nextLeap = year + 1;
  while (!isLeap(nextLeap)) nextLeap++;

  const items: IndicatorItem[] = [
    { id: "week", href: hrefs.week, label: t("week", { year: weekYear }), value: ltr(`W${String(week).padStart(2, "0")}`), note: t("weekNote") },
    { id: "left", href: hrefs.left, label: t("left", { year }), value: t("leftValue", { days: daysLeft }), note: t("leftNote") },
    { id: "unix", href: hrefs.unix, label: t("unix"), value: ltr(String(seconds)), note: t("unixNote") },
    { id: "offset", href: hrefs.offset, label: t("offset"), value: ltr(offset), note: t("offsetNote", { zone }) },
    {
      id: "leap",
      href: hrefs.leap,
      label: t("leap", { year }),
      value: isLeap(year) ? t("leapYes") : t("leapNo", { next: nextLeap }),
      note: t("leapNote"),
    },
  ];
  return <IndicatorStrip label={t("label")} items={items} />;
}
