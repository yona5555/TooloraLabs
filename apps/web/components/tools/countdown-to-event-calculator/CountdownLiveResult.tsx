"use client";
import { useLocale, useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import LiveTable3DLayout, { LiveTableFill, type LiveTableGroup } from "@/components/tool-ui/three/LiveTable3DLayout";
import CountdownDial from "./CountdownDial";
import { fmtHijri, fmtInZone, fmtWeekday, formatOffset, hms, num, pct, zoneName, type CdState, type Derived } from "./model";

type Props = { state: CdState; d: Derived | null };

export default function CountdownLiveResult({ state, d }: Props) {
  const t = useTranslations("tools.countdown-to-event-calculator.pro");
  const locale = useLocale();
  const title = state.title || t("saved.untitled");

  if (!d) {
    return (
      <SectionCard title={t("result.title")} className="lg:flex lg:flex-1 lg:flex-col" bodyClassName="p-4">
        <p className="text-sm text-zinc-600 dark:text-zinc-300">{t("input.invalid")}</p>
      </SectionCard>
    );
  }

  const { b, target, days } = d;
  const zn = zoneName(locale, state.zone);
  const vz = zoneName(locale, d.viewerZone);
  const statusText =
    target.status === "gap"
      ? t("result.statusGap", { time: fmtInZone(locale, target.utcMs, state.zone) })
      : target.status === "overlap"
        ? t("result.statusOverlap")
        : t("result.statusOk");
  const wk = t(`weekend.${state.weekend}`);
  const otherWk = t(`weekend.${state.weekend === "fri-sat" ? "sat-sun" : "fri-sat"}`);

  const groups: LiveTableGroup[] = [
    {
      title: t("result.groupTarget"),
      rows: [
        { label: t("result.eventLocal", { zone: zn }), formula: state.zone, value: fmtInZone(locale, target.utcMs, state.zone), emphasize: true },
        { label: t("result.offset"), formula: target.dst ? t("result.dstOn") : t("result.dstOff"), value: formatOffset(target.offsetMinutes) },
        { label: t("result.status"), formula: `${state.time}`, value: statusText },
        { label: t("result.utc"), formula: `${state.time} − (${formatOffset(target.offsetMinutes)})`, value: fmtInZone("en-GB", target.utcMs, "UTC") },
        { label: t("result.yourLocal", { zone: vz }), formula: formatOffset(d.viewerOffset), value: fmtInZone(locale, target.utcMs, d.viewerZone) },
        { label: t("result.weekday"), formula: target.date.year + "-" + String(target.date.month).padStart(2, "0") + "-" + String(target.date.day).padStart(2, "0"), value: fmtWeekday(locale, target.date) },
        { label: t("result.hijri"), formula: `${d.hijri.day}/${d.hijri.month}/${d.hijri.year}`, value: fmtHijri(locale, target.date) },
        ...(d.rolled
          ? [{ label: t("result.rolled"), formula: d.adjusted ? t("result.adjusted") : t("result.rolledNote"), value: fmtInZone(locale, target.utcMs, state.zone, false) }]
          : []),
      ],
    },
    {
      title: b.isPast ? t("result.groupElapsed") : t("result.groupRemaining"),
      rows: [
        { label: t("result.breakdown"), formula: `${num(b.totalSeconds)} s`, value: `${num(b.days)} · ${hms(b.hours, b.minutes, b.seconds)}`, emphasize: true },
        { label: t("result.weeks"), formula: `${num(b.days)} ÷ 7`, value: `${num(b.weeks)} + ${num(b.weekDays)}` },
        { label: t("result.totalHours"), formula: `${num(b.totalSeconds)} ÷ 3600`, value: num(Math.floor(b.totalSeconds / 3600)) },
        { label: t("result.totalMinutes"), formula: `${num(b.totalSeconds)} ÷ 60`, value: num(Math.floor(b.totalSeconds / 60)) },
        { label: t("result.totalSeconds"), formula: `${num(b.days)} × 86400 + …`, value: num(b.totalSeconds) },
      ],
    },
    {
      title: t("result.groupDays"),
      rows: [
        { label: t("result.calendarDays"), formula: t("result.fromToday", { date: fmtInZone(locale, d.nowMs, state.zone, false) }), value: num(days.calendarDays) },
        { label: t("result.businessDays", { weekend: wk }), formula: `${num(days.calendarDays)} − ${num(days.weekendDays)}`, value: num(days.businessDays), emphasize: true },
        { label: t("result.weekendDays"), formula: wk, value: num(days.weekendDays) },
        { label: t("result.altBusiness", { weekend: otherWk }), formula: `${num(d.other.calendarDays)} − ${num(d.other.weekendDays)}`, value: num(d.other.businessDays) },
      ],
    },
    {
      title: t("result.groupProgress"),
      rows: [
        { label: t("result.start"), formula: state.zone, value: fmtInZone(locale, d.startMs, state.zone, false) },
        {
          label: t("result.elapsed"),
          formula: `${num((d.nowMs - d.startMs) / 86_400_000, 1)} ÷ ${num((target.utcMs - d.startMs) / 86_400_000, 1)}`,
          value: pct(d.progress),
          emphasize: true,
        },
        {
          label: t("result.dstChange"),
          formula: d.dstChange ? `${formatOffset(d.dstChange.offsetBefore)} → ${formatOffset(d.dstChange.offsetAfter)}` : state.zone,
          value: d.dstChange ? fmtInZone(locale, d.dstChange.utcMs, state.zone) : t("result.dstChangeNone"),
        },
      ],
    },
  ];

  const units: [number, string][] = [
    [b.days, t("result.days")],
    [b.hours, t("result.hours")],
    [b.minutes, t("result.minutes")],
    [b.seconds, t("result.seconds")],
  ];

  return (
    <SectionCard title={t("result.title")} className="lg:flex lg:flex-1 lg:flex-col" bodyClassName="p-3 lg:flex lg:flex-1 lg:flex-col">
      <p className="mb-2 text-center text-sm font-semibold text-zinc-700 dark:text-zinc-200">
        {b.isPast ? t("result.countingUp") : t("result.countingDown")} <span className="text-blue-700 dark:text-blue-300">{title}</span>
      </p>
      <div dir="ltr" className="mb-2 grid grid-cols-4 gap-2 text-center" data-bp-inner>
        {units.map(([v, l], i) => (
          <div key={i} className={`rounded-lg px-1 py-1.5 ${b.isPast ? "bg-emerald-50 dark:bg-emerald-500/10" : "bg-blue-50 dark:bg-blue-500/10"}`}>
            <p className={`font-mono text-2xl font-bold tabular-nums ${b.isPast ? "text-emerald-700 dark:text-emerald-300" : "text-blue-700 dark:text-blue-300"}`} data-testid={`unit-${i}`}>
              {i === 0 ? num(v) : String(v).padStart(2, "0")}
            </p>
            <p className="text-[10px] leading-3 font-semibold text-zinc-500 dark:text-zinc-400">{l}</p>
          </div>
        ))}
      </div>
      {target.status !== "ok" && (
        <p className="mb-2 rounded-lg bg-amber-50 px-2 py-1.5 text-xs text-amber-800 dark:bg-amber-500/10 dark:text-amber-200">
          {target.status === "gap" ? t("result.gapNotice") : t("result.overlapNotice")}
        </p>
      )}
      <LiveTableFill>
        <LiveTable3DLayout
          headings={[t("result.colItem"), t("result.colCalc"), t("result.colValue")]}
          groups={groups}
          drawing={<CountdownDial d={d} />}
          caption={t("result.dialCaption", { start: fmtInZone(locale, d.startMs, state.zone, false) })}
        />
      </LiveTableFill>
    </SectionCard>
  );
}
