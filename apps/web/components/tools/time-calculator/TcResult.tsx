"use client";
import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import LiveTable3DLayout, { LiveTableFill, type LiveTableGroup } from "@/components/tool-ui/three/LiveTable3DLayout";
import { HourPie, ShiftDial, Waterfall, WeekBars } from "./TcDrawings";
import type { Derived, Fmt, TcState } from "./state";

type Props = { s: TcState; set: (patch: Partial<TcState>) => void; d: Derived; f: Fmt };

/** Shared phrasing helpers (day offset, DST change, wall-time status). */
export function useTcPhrases() {
  const t = useTranslations("tools.time-calculator.tc");
  return {
    t,
    dayTag: (n: number) => (n === 0 ? t("day.same") : n > 0 ? t("day.after", { n }) : t("day.before", { n: -n })),
    dst: (delta: number, f: Fmt) => (delta > 0 ? t("dst.longer", { d: f.durHm(delta) }) : delta < 0 ? t("dst.shorter", { d: f.durHm(-delta) }) : t("dst.none")),
    status: (st: "ok" | "gap" | "overlap") => t(`status.${st}`),
    zoneName: (z: string | null) => (z ? z.replace(/_/g, " ") : t("input.floating")),
  };
}

export default function TcResult({ s, set, d, f }: Props) {
  const { t, dayTag, dst, status, zoneName } = useTcPhrases();
  const hourLabel = (h: number) => (s.h12 ? `${h % 12 === 0 ? 12 : h % 12}${h < 12 ? "a" : "p"}` : String(h).padStart(2, "0"));
  let stats: { k: string; v: string }[] = [];
  let groups: LiveTableGroup[] = [];
  let drawing: ReactNode = null;
  let caption = "";

  if (s.mode === "sum") {
    const sh = d.sheet;
    stats = [
      { k: t("result.total"), v: f.dur(sh.totalSeconds) },
      { k: t("result.decimal"), v: f.hours(sh.totalSeconds) },
      { k: t("result.entries"), v: f.num(sh.count, 0) },
    ];
    groups = [
      {
        title: t("result.groupEntries"),
        rows: s.rows.map((r, i) => ({
          label: r.label || t("input.entryN", { n: i + 1 }),
          formula: `${r.sign === 1 ? "+" : "−"}${f.dur(d.rowSeconds[i])}`,
          value: f.dur(sh.running[i]),
        })),
      },
      {
        title: t("result.groupTotals"),
        rows: [
          { label: t("result.added"), formula: s.rows.filter((r) => r.sign === 1).length + " ×", value: f.dur(sh.addedSeconds) },
          { label: t("result.subtracted"), formula: s.rows.filter((r) => r.sign === -1).length + " ×", value: `−${f.dur(sh.subtractedSeconds)}` },
          { label: t("result.total"), formula: `${f.dur(sh.addedSeconds)} − ${f.dur(sh.subtractedSeconds)}`, value: f.dur(sh.totalSeconds), emphasize: true },
          { label: t("result.decimal"), formula: `${f.num(Math.abs(sh.totalSeconds), 0)} ÷ 3600`, value: `${f.hours(sh.totalSeconds, 4)} h` },
          { label: t("result.minutes"), formula: `÷ 60`, value: f.num(sh.totalSeconds / 60, 1) },
          { label: t("result.seconds"), formula: "h×3600 + m×60 + s", value: f.num(sh.totalSeconds, 0) },
          ...(Math.abs(sh.totalSeconds) >= 86400
            ? [{ label: t("result.daysHours"), formula: "÷ 24", value: t("result.daysHoursValue", { d: Math.floor(Math.abs(sh.totalSeconds) / 86400), hm: f.durHm(Math.abs(sh.totalSeconds) % 86400) }) }]
            : []),
        ],
      },
    ];
    drawing = (
      <Waterfall
        fill
        items={s.rows.map((r, i) => ({ label: r.label || `#${i + 1}`, value: r.sign * d.rowSeconds[i] }))}
        running={sh.running}
        total={sh.totalSeconds}
        totalLabel="Σ"
        fmt={f.durHm}
        ariaLabel={t("result.waterfallAria")}
      />
    );
    caption = t("result.captionSum", { n: sh.count, total: f.dur(sh.totalSeconds) });
  } else if (s.mode === "span") {
    const sp = d.span;
    stats = [
      { k: t("result.net"), v: f.dur(sp.netSeconds) },
      { k: t("result.elapsed"), v: f.durHm(sp.elapsedSeconds) },
      { k: t("result.decimal"), v: f.hours(sp.netSeconds) },
    ];
    groups = [
      {
        title: t("result.groupClock"),
        rows: [
          { label: t("input.start"), formula: `${f.date(d.spanStartDate)} · UTC${f.offset(sp.startOffsetMinutes)}`, value: f.clock(d.spanStart) },
          { label: t("input.end"), formula: `${f.date(sp.endDate)} · UTC${f.offset(sp.endOffsetMinutes)}`, value: f.clock(d.spanEnd) },
          { label: t("result.dayOffset"), formula: s.span.endDate ? t("result.explicitEnd") : t("result.autoEnd"), value: dayTag(sp.dayOffset) },
        ],
      },
      {
        title: t("result.groupDuration"),
        rows: [
          { label: t("result.wall"), formula: `${f.clock(d.spanEnd)} − ${f.clock(d.spanStart)}${sp.dayOffset ? ` + ${sp.dayOffset}×24h` : ""}`, value: f.dur(sp.wallSeconds) },
          { label: t("result.dstChange"), formula: `UTC${f.offset(sp.startOffsetMinutes)} → UTC${f.offset(sp.endOffsetMinutes)}`, value: f.signedDur(sp.dstDeltaSeconds) },
          { label: t("result.elapsed"), formula: `${f.dur(sp.wallSeconds)} ${sp.dstDeltaSeconds < 0 ? "−" : "+"} ${f.dur(Math.abs(sp.dstDeltaSeconds))}`, value: f.dur(sp.elapsedSeconds), emphasize: true },
          { label: t("result.break"), formula: t("result.minutesN", { n: f.num(sp.breakSeconds / 60, 0) }), value: `−${f.dur(sp.breakSeconds)}` },
          { label: t("result.net"), formula: `${f.dur(sp.elapsedSeconds)} − ${f.dur(sp.breakSeconds)}`, value: f.dur(sp.netSeconds), emphasize: true },
          { label: t("result.decimal"), formula: `${f.num(sp.netSeconds / 60, 0)} ÷ 60`, value: `${f.hours(sp.netSeconds)} h` },
        ],
      },
      {
        title: t("result.groupZone"),
        rows: [
          { label: t("input.zone"), formula: sp.zoned ? t("result.intl") : t("result.floatingNote"), value: zoneName(d.zone) },
          { label: t("result.startStatus"), formula: f.clock(d.spanStart), value: status(sp.startStatus) },
          { label: t("result.endStatus"), formula: f.clock(d.spanEnd), value: status(sp.endStatus) },
          ...sp.transitions.map((tr) => ({
            label: t("result.transition"),
            formula: `UTC${f.offset(tr.offsetBefore)} → UTC${f.offset(tr.offsetAfter)}`,
            value: f.instant(tr.utcMs, d.zone),
          })),
        ],
      },
    ];
    drawing = (
      <ShiftDial
        fill
        start={d.spanStart}
        end={d.spanEnd}
        extraDays={Math.max(0, Math.floor((sp.wallSeconds - 1) / 86400))}
        dstDelta={sp.dstDeltaSeconds}
        hourLabel={hourLabel}
        center={[t("result.elapsed"), f.durHm(sp.elapsedSeconds), dst(sp.dstDeltaSeconds, f)]}
        startLabel="▶"
        endLabel="■"
        onDrag={(which, sec) => {
          const hh = `${String(Math.floor(sec / 3600)).padStart(2, "0")}:${String((sec % 3600) / 60).padStart(2, "0")}`;
          set({ span: { ...s.span, [which]: hh } });
        }}
        ariaLabel={t("result.dialAria")}
      />
    );
    caption = t("result.captionSpan", { start: f.clock(d.spanStart), end: f.clock(d.spanEnd), day: dayTag(sp.dayOffset), dst: dst(sp.dstDeltaSeconds, f) });
  } else if (s.mode === "add") {
    const a = d.add;
    stats = [
      { k: t("result.resultTime"), v: f.clock(a.resultClock) },
      { k: t("result.dayOffset"), v: dayTag(a.dayOffset) },
      { k: t("result.duration"), v: `${s.add.op === 1 ? "+" : "−"}${f.durHm(d.addDuration)}` },
    ];
    groups = [
      {
        title: t("result.groupInput"),
        rows: [
          { label: t("input.start"), formula: `${f.date(d.addDate)} · UTC${f.offset(a.startOffsetMinutes)}`, value: f.clock(d.addClock) },
          { label: t("result.duration"), formula: `${f.num(d.addDuration, 0)} s`, value: `${s.add.op === 1 ? "+" : "−"}${f.dur(d.addDuration)}` },
          { label: t("result.startStatus"), formula: zoneName(d.zone), value: status(a.startStatus) },
        ],
      },
      {
        title: t("result.groupResult"),
        rows: [
          { label: t("result.naive"), formula: `${f.clock(d.addClock)} ${s.add.op === 1 ? "+" : "−"} ${f.durHm(d.addDuration)}`, value: `${f.clock(a.naiveClock)} · ${f.shortDate(a.naiveDate)}` },
          { label: t("result.dstChange"), formula: `UTC${f.offset(a.startOffsetMinutes)} → UTC${f.offset(a.endOffsetMinutes)}`, value: f.signedDur(a.dstDeltaSeconds) },
          { label: t("result.resultTime"), formula: f.date(a.resultDate), value: f.clock(a.resultClock), emphasize: true },
          { label: t("result.dayOffset"), formula: `${f.shortDate(d.addDate)} → ${f.shortDate(a.resultDate)}`, value: dayTag(a.dayOffset), emphasize: true },
          { label: t("result.inHours"), formula: `${f.num(d.addDuration / 60, 0)} ÷ 60`, value: `${f.hours(d.addDuration)} h` },
          ...a.transitions.map((tr) => ({
            label: t("result.transition"),
            formula: `UTC${f.offset(tr.offsetBefore)} → UTC${f.offset(tr.offsetAfter)}`,
            value: f.instant(tr.utcMs, d.zone),
          })),
        ],
      },
    ];
    const from = s.add.op === 1 ? d.addClock : a.resultClock;
    const to = s.add.op === 1 ? a.resultClock : d.addClock;
    drawing = (
      <ShiftDial
        fill
        start={from}
        end={to}
        extraDays={Math.floor(d.addDuration / 86400)}
        dstDelta={a.dstDeltaSeconds}
        hourLabel={hourLabel}
        center={[t("result.resultTime"), f.clock(a.resultClock), dayTag(a.dayOffset)]}
        startLabel={s.add.op === 1 ? "▶" : "■"}
        endLabel={s.add.op === 1 ? "■" : "▶"}
        ariaLabel={t("result.dialAria")}
      />
    );
    caption = t("result.captionAdd", { start: f.clock(d.addClock), result: f.clock(a.resultClock), day: dayTag(a.dayOffset), dst: dst(-a.dstDeltaSeconds, f) });
  } else if (s.mode === "week") {
    const w = d.week;
    stats = [
      { k: t("result.weekTotal"), v: f.durHm(w.totalSeconds) },
      { k: t("result.overtime"), v: f.durHm(w.overtimeSeconds) },
      { k: t("result.paidEq"), v: f.hours(w.paidEquivalentSeconds) },
    ];
    groups = [
      {
        title: t("result.groupDays"),
        rows: w.days.map((day) => {
          const row = s.week.days[day.weekday];
          return {
            label: `${f.weekday(day.weekday)}${day.overnight ? " ☾" : ""}`,
            formula: day.on ? `${f.clock(toSec(row.start))}–${f.clock(toSec(row.end))} − ${row.brk || 0}′` : t("result.off"),
            value: day.on ? `${f.durHm(day.workedSeconds)}${day.overtimeSeconds ? ` (+${f.durHm(day.overtimeSeconds)})` : ""}` : "0:00",
          };
        }),
      },
      {
        title: t("result.groupWeek"),
        rows: [
          { label: t("result.weekTotal"), formula: t("result.daysN", { n: w.workDays }), value: f.dur(w.totalSeconds), emphasize: true },
          {
            label: t("result.threshold"),
            formula: s.week.basis === "weekly" ? t("input.basisWeekly") : t("input.basisDaily"),
            value: s.week.basis === "weekly" ? f.durHm(d.weeklyThreshold) : `${f.durHm(d.dailyThreshold)} / ${t("result.dayUnit")}`,
          },
          { label: t("result.regular"), formula: `${f.durHm(w.totalSeconds)} − ${f.durHm(w.overtimeSeconds)}`, value: f.dur(w.regularSeconds) },
          { label: t("result.overtime"), formula: s.week.basis === "weekly" ? `${f.durHm(w.totalSeconds)} − ${f.durHm(d.weeklyThreshold)}` : "Σ max(0, day − limit)", value: f.dur(w.overtimeSeconds), emphasize: true },
          { label: t("result.paidEq"), formula: `${f.hours(w.regularSeconds)} + ${f.hours(w.overtimeSeconds)} × ${f.num(d.multiplier)}`, value: `${f.hours(w.paidEquivalentSeconds)} h` },
          { label: t("result.average"), formula: `÷ ${w.workDays}`, value: f.durHm(w.averageSeconds) },
          { label: t("result.decimal"), formula: `${f.num(w.totalSeconds / 60, 0)} ÷ 60`, value: `${f.hours(w.totalSeconds)} h` },
        ],
      },
    ];
    drawing = (
      <WeekBars
        fill
        days={w.days.map((day) => ({ key: day.weekday, label: f.weekday(day.weekday), regular: day.regularSeconds, overtime: day.overtimeSeconds, on: day.on, overnight: day.overnight }))}
        dailyThreshold={s.week.basis === "daily" ? d.dailyThreshold : null}
        fmt={f.durHm}
        ariaLabel={t("result.weekAria")}
        offLabel={t("result.off")}
      />
    );
    caption = t("result.captionWeek", { total: f.durHm(w.totalSeconds), ot: f.durHm(w.overtimeSeconds) });
  } else {
    const dc = d.dec;
    stats = [
      { k: t("result.hms"), v: f.dur(dc.seconds) },
      { k: t("result.decimal"), v: f.num(dc.decimal2) },
      { k: t("result.rounded"), v: f.num(dc.rounded[s.dec.round] / 3600) },
    ];
    const whole = Math.floor(dc.seconds / 3600);
    const fracH = dc.decimal - whole;
    groups = [
      {
        title: t("result.groupConvert"),
        rows: [
          { label: t("result.wholeHours"), formula: `⌊${f.num(dc.decimal, 4)}⌋`, value: f.num(whole, 0) },
          { label: t("result.minutesPart"), formula: `${f.num(fracH, 4)} × 60`, value: f.num(Math.floor((dc.seconds % 3600) / 60), 0) },
          { label: t("result.secondsPart"), formula: "… × 60", value: f.num(dc.seconds % 60, 0) },
          { label: t("result.hms"), formula: `${f.num(dc.decimal, 4)} h`, value: f.dur(dc.seconds), emphasize: true },
          { label: t("result.decimal"), formula: `${whole} + ${f.num(Math.floor((dc.seconds % 3600) / 60), 0)} ÷ 60`, value: `${f.num(dc.decimal2)} h`, emphasize: true },
          { label: t("result.minutes"), formula: `${f.num(dc.decimal, 4)} × 60`, value: f.num(dc.minutes, 1) },
        ],
      },
      {
        title: t("result.groupRounding", { n: s.dec.inc }),
        rows: (["down", "nearest", "up"] as const).map((r) => ({
          label: t(`round.${r}`),
          formula: `${f.durHm(dc.rounded[r])} (${f.signedDur(dc.rounded[r] - dc.seconds)})`,
          value: `${f.num(dc.rounded[r] / 3600)} h`,
          emphasize: r === s.dec.round,
        })),
      },
      {
        title: t("result.groupCommon"),
        rows: [6, 15, 20, 30, 45].map((m) => ({ label: t("result.minutesN", { n: m }), formula: `${m} ÷ 60`, value: f.num(m / 60) })),
      },
    ];
    drawing = (
      <HourPie
        fill
        seconds={dc.seconds}
        rounded={dc.rounded[s.dec.round]}
        decimalLabel={`${f.num(dc.decimal2)} h`}
        hmsLabel={f.dur(dc.seconds)}
        ariaLabel={t("result.pieAria")}
      />
    );
    caption = t("result.captionDec", { dec: f.num(dc.decimal2), hms: f.dur(dc.seconds) });
  }

  return (
    <SectionCard title={t(`result.title.${s.mode}`)} className="lg:flex lg:flex-1 lg:flex-col" bodyClassName="p-3 lg:flex lg:flex-1 lg:flex-col">
      <div className="mb-3 grid grid-cols-3 gap-2 text-center" data-bp-inner>
        {stats.map((st) => (
          <div key={st.k} className="rounded-lg bg-blue-50 px-1 py-1.5 dark:bg-blue-500/10">
            <p className="text-[10px] leading-3 font-semibold text-zinc-500 dark:text-zinc-400">{st.k}</p>
            <p dir="auto" className="truncate font-mono text-lg font-bold text-blue-700 dark:text-blue-300">{st.v}</p>
          </div>
        ))}
      </div>
      {(s.mode === "span" || s.mode === "add") && (s.mode === "span" ? d.span.dstDeltaSeconds : d.add.dstDeltaSeconds) !== 0 && (
        <p className="mb-3 rounded-lg border border-violet-300 bg-violet-50 px-3 py-2 text-xs font-semibold text-violet-800 dark:border-violet-500/40 dark:bg-violet-500/10 dark:text-violet-200">
          {s.mode === "span" ? t("result.dstBannerSpan", { d: dst(d.span.dstDeltaSeconds, f), zone: zoneName(d.zone) }) : t("result.dstBannerAdd", { naive: f.clock(d.add.naiveClock), real: f.clock(d.add.resultClock), zone: zoneName(d.zone) })}
        </p>
      )}
      <LiveTableFill>
        <LiveTable3DLayout headings={[t("result.colItem"), t("result.colCalc"), t("result.colValue")]} groups={groups} drawing={drawing} caption={caption} hint={s.mode === "span" ? t("result.dragHint") : undefined} />
      </LiveTableFill>
    </SectionCard>
  );
}

function toSec(v: string) {
  const [h, m] = v.split(":").map(Number);
  return (h || 0) * 3600 + (m || 0) * 60;
}
