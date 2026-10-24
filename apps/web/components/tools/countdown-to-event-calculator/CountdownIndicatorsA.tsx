"use client";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { countdownDaysLeft, countdownBreakdown, weekendDays } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import IndicatorWithTable from "@/components/tool-ui/IndicatorWithTable";
import PhoneMini from "@/components/tool-ui/indicator-kit/PhoneMini";
import { fmtInZone, fmtShortWeekday, hms, num, pct, type CdState, type Derived } from "./model";

export type IndicatorProps = { state: CdState; setState: (s: CdState) => void; d: Derived };

export const axisText = "fill-zinc-500 dark:fill-zinc-400";
export const valueText = "fill-zinc-800 dark:fill-zinc-100";
export const BLUE = "#2563eb";
export const GREEN = "#10b981";
export const AMBER = "#f59e0b";
export const VIOLET = "#8b5cf6";
const DAY_MS = 86_400_000;

export function useIndT() {
  return useTranslations("tools.countdown-to-event-calculator.pro.ind");
}

/* 1 · Ticking multi-ring donut: seconds, minutes, hours and the elapsed share of the wait */
export function CdRingsCard({ d }: IndicatorProps) {
  const t = useIndT();
  const S = 220;
  const C = S / 2;
  const { b } = d;
  const rings = [
    { key: "seconds", r: 96, frac: b.seconds / 60, color: AMBER, value: `${b.seconds} / 60`, note: `${num(b.totalSeconds)} mod 60` },
    { key: "minutes", r: 78, frac: b.minutes / 60, color: GREEN, value: `${b.minutes} / 60`, note: `⌊${num(b.totalSeconds)} ÷ 60⌋ mod 60` },
    { key: "hours", r: 60, frac: b.hours / 24, color: VIOLET, value: `${b.hours} / 24`, note: `⌊${num(b.totalSeconds)} ÷ 3600⌋ mod 24` },
    { key: "wait", r: 42, frac: d.progress, color: BLUE, value: pct(d.progress), note: `${num((d.nowMs - d.startMs) / DAY_MS, 1)} ÷ ${num((d.target.utcMs - d.startMs) / DAY_MS, 1)}` },
  ] as const;
  return (
    <SectionCard phoneRole="visual" title={t("rings.title")}>
      <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-300">{t("rings.intro")}</p>
      <IndicatorWithTable
        workedExampleTitle={t("worked")}
        indicator={
          <PhoneMini slot={0} title={t("rings.title")}>
          <svg width={S} height={S} viewBox={`0 0 ${S} ${S}`} role="img" aria-label={t("rings.title")} style={{ direction: "ltr" }}>
            {rings.map((r) => {
              const circ = 2 * Math.PI * r.r;
              return (
                <g key={r.key} transform={`rotate(-90 ${C} ${C})`}>
                  <circle cx={C} cy={C} r={r.r} fill="none" stroke="currentColor" strokeOpacity={0.1} strokeWidth={13} />
                  <circle
                    cx={C}
                    cy={C}
                    r={r.r}
                    fill="none"
                    stroke={r.color}
                    strokeWidth={13}
                    strokeLinecap="round"
                    strokeDasharray={circ}
                    strokeDashoffset={circ * (1 - Math.min(1, Math.max(0.002, r.frac)))}
                    style={{ transition: r.key === "seconds" && b.seconds === 59 ? "none" : "stroke-dashoffset 900ms linear" }}
                  />
                </g>
              );
            })}
            <text x={C} y={C - 2} textAnchor="middle" fontSize={20} fontWeight={800} className={valueText}>{num(b.days)}</text>
            <text x={C} y={C + 15} textAnchor="middle" fontSize={11} fontWeight={700} fill={BLUE} style={{ fontFamily: "ui-monospace, monospace" }}>
              {hms(b.hours, b.minutes, b.seconds)}
            </text>
          </svg>
          </PhoneMini>
        }
        rows={[
          ...rings.map((r) => ({ label: `● ${t(`rings.${r.key}`)}`, value: r.value, note: r.note })),
          { label: t("rings.days"), value: num(b.days), note: `⌊${num(b.totalSeconds)} ÷ 86400⌋`, emphasize: true },
        ]}
      />
      <div className="mt-2 flex flex-wrap gap-3 text-xs text-zinc-600 dark:text-zinc-300">
        {rings.map((r) => (
          <span key={r.key} className="flex items-center gap-1">
            <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: r.color }} />
            {t(`rings.${r.key}`)}
          </span>
        ))}
      </div>
    </SectionCard>
  );
}

/* 2 · Timeline with stations + draggable preview date (interactive) */
export function CdTimelineCard({ state, d }: IndicatorProps) {
  const t = useIndT();
  const tm = useTranslations("tools.countdown-to-event-calculator.pro.milestones");
  const locale = useLocale();
  const [preview, setPreview] = useState<number | null>(null);
  const W = 420;
  const H = 150;
  const L = 18;
  const R = 18;
  const Y = 78;
  const start = d.startMs;
  const end = d.target.utcMs;
  const span = Math.max(1, end - start);
  const x = (ms: number) => L + Math.min(1, Math.max(0, (ms - start) / span)) * (W - L - R);
  const frac = preview ?? d.progress;
  const pMs = start + frac * span;
  const pb = countdownBreakdown(end, pMs);
  const pDays = countdownDaysLeft(pMs, d.target.date, state.zone, state.weekend);
  const stations = [
    ...d.milestones.filter((m) => m.utcMs > start && m.utcMs < end).map((m) => ({ key: m.key, ms: m.utcMs, label: tm(`${m.key}Short`), passed: m.passed })),
  ];
  return (
    <SectionCard title={t("timeline.title")}>
      <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-300">{t("timeline.intro")}</p>
      <IndicatorWithTable
        workedExampleTitle={t("worked")}
        indicator={
          <div className="w-[420px] max-w-full">
            <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("timeline.title")} className="max-w-full" style={{ direction: "ltr" }}>
              <line x1={L} x2={W - R} y1={Y} y2={Y} stroke="currentColor" strokeOpacity={0.2} strokeWidth={8} strokeLinecap="round" />
              <line x1={L} x2={x(d.nowMs)} y1={Y} y2={Y} stroke={BLUE} strokeWidth={8} strokeLinecap="round" style={{ transition: "all 600ms ease" }} />
              {stations.map((s, i) => (
                <g key={s.key}>
                  <circle cx={x(s.ms)} cy={Y} r={6} fill={s.passed ? AMBER : "white"} stroke={AMBER} strokeWidth={2} />
                  <text x={x(s.ms)} y={i % 2 ? Y + 24 : Y - 14} textAnchor="middle" fontSize={10} fontWeight={700} className={valueText}>{s.label}</text>
                </g>
              ))}
              <circle cx={L} cy={Y} r={7} fill={BLUE} />
              <text x={L} y={Y + 42} textAnchor="start" fontSize={9} className={axisText}>{fmtInZone(locale, start, state.zone, false)}</text>
              <circle cx={W - R} cy={Y} r={8} fill={GREEN} />
              <text x={W - R} y={Y + 42} textAnchor="end" fontSize={9} className={axisText}>{fmtInZone(locale, end, state.zone, false)}</text>
              <g style={{ transition: preview === null ? "transform 600ms ease" : "none" }} transform={`translate(${x(pMs)} 0)`}>
                <line x1={0} x2={0} y1={Y - 34} y2={Y + 12} stroke={VIOLET} strokeWidth={2} />
                <rect x={-30} y={Y - 52} width={60} height={18} rx={9} fill={VIOLET} />
                <text x={0} y={Y - 39} textAnchor="middle" fontSize={10} fontWeight={800} fill="white">{pct(frac, 0)}</text>
              </g>
            </svg>
            <input
              type="range"
              min={0}
              max={1000}
              step={1}
              value={Math.round(frac * 1000)}
              onChange={(e) => setPreview(Number(e.target.value) / 1000)}
              aria-label={t("timeline.slider")}
              className="mt-1 w-full accent-violet-600"
              dir="ltr"
            />
            <div className="mt-1 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
              <span>{t("timeline.slider")}</span>
              <button type="button" disabled={preview === null} onClick={() => setPreview(null)} className="rounded border border-zinc-300 px-2 py-0.5 font-semibold disabled:opacity-40 dark:border-zinc-600">
                {t("timeline.now")}
              </button>
            </div>
          </div>
        }
        rows={[
          { label: t("timeline.previewDate"), value: fmtInZone(locale, pMs, state.zone) },
          { label: t("timeline.remaining"), value: `${num(pb.days)} · ${hms(pb.hours, pb.minutes, pb.seconds)}`, note: `${t("timeline.event")} − ${t("timeline.previewDate")}` },
          { label: t("timeline.business"), value: num(pDays.businessDays), note: `${num(pDays.calendarDays)} − ${num(pDays.weekendDays)}` },
          { label: t("timeline.passedStations"), value: `${stations.filter((s) => s.ms <= pMs).length} / ${stations.length}` },
          { label: t("timeline.elapsed"), value: pct(frac), note: `(${t("timeline.previewDate")} − ${t("timeline.start")}) ÷ ${num(span / DAY_MS, 1)}`, emphasize: true },
        ]}
      />
    </SectionCard>
  );
}

/* 3 · Stacked segmented bars: business vs weekend days under both weekend presets (click to switch) */
export function CdBusinessSplitCard({ state, setState, d }: IndicatorProps) {
  const t = useIndT();
  const tw = useTranslations("tools.countdown-to-event-calculator.pro.weekend");
  const W = 400;
  const BH = 34;
  const L = 8;
  const bars = [
    { wk: state.weekend, c: d.days },
    { wk: state.weekend === "fri-sat" ? ("sat-sun" as const) : ("fri-sat" as const), c: d.other },
  ];
  const total = Math.max(1, d.days.calendarDays);
  const scale = (W - 2 * L) / total;
  return (
    <SectionCard title={t("split.title")}>
      <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-300">{t("split.intro")}</p>
      <IndicatorWithTable
        workedExampleTitle={t("worked")}
        indicator={
          <div className="w-[400px] max-w-full space-y-3">
            {bars.map((bar, i) => {
              const bw = bar.c.businessDays * scale;
              const ww = bar.c.weekendDays * scale;
              const active = bar.wk === state.weekend;
              return (
                <button
                  key={bar.wk}
                  type="button"
                  onClick={() => setState({ ...state, weekend: bar.wk })}
                  aria-pressed={active}
                  className={`block w-full rounded-xl border-2 p-2 text-start transition ${active ? "border-blue-500" : "border-transparent opacity-70 hover:opacity-100"}`}
                >
                  <span className="mb-1 block text-xs font-bold text-zinc-700 dark:text-zinc-200">
                    {tw(bar.wk)} {i === 0 ? `· ${t("split.selected")}` : `· ${t("split.compare")}`}
                  </span>
                  <svg width={W - 20} height={BH} viewBox={`0 0 ${W} ${BH}`} className="max-w-full" style={{ direction: "ltr" }} aria-hidden>
                    <rect x={L} y={0} width={Math.max(0, bw)} height={BH} rx={6} fill={BLUE} style={{ transition: "width 500ms ease" }} />
                    <rect x={L + bw} y={0} width={Math.max(0, ww)} height={BH} rx={6} fill={AMBER} style={{ transition: "all 500ms ease" }} />
                    {bw > 36 && <text x={L + bw / 2} y={BH / 2 + 5} textAnchor="middle" fontSize={14} fontWeight={800} fill="white">{num(bar.c.businessDays)}</text>}
                    {ww > 30 && <text x={L + bw + ww / 2} y={BH / 2 + 5} textAnchor="middle" fontSize={14} fontWeight={800} fill="white">{num(bar.c.weekendDays)}</text>}
                  </svg>
                </button>
              );
            })}
            <div className="flex gap-4 text-xs text-zinc-600 dark:text-zinc-300">
              <span className="flex items-center gap-1"><span className="inline-block h-2.5 w-2.5 rounded" style={{ background: BLUE }} />{t("split.business")}</span>
              <span className="flex items-center gap-1"><span className="inline-block h-2.5 w-2.5 rounded" style={{ background: AMBER }} />{t("split.weekend")}</span>
            </div>
          </div>
        }
        rows={[
          { label: t("split.calendar"), value: num(d.days.calendarDays), note: t("split.calendarNote") },
          { label: `${t("split.business")} · ${tw(state.weekend)}`, value: num(d.days.businessDays), note: `${num(d.days.calendarDays)} − ${num(d.days.weekendDays)}` },
          { label: `${t("split.business")} · ${tw(bars[1].wk)}`, value: num(d.other.businessDays), note: `${num(d.other.calendarDays)} − ${num(d.other.weekendDays)}` },
          { label: t("split.share"), value: pct(d.days.businessDays / total), note: `${num(d.days.businessDays)} ÷ ${num(total)}` },
          { label: t("split.difference"), value: num(d.days.businessDays - d.other.businessDays), emphasize: true },
        ]}
      />
    </SectionCard>
  );
}

/* 4 · Labeled bars: how many of each weekday are left before the event */
export function CdWeekdayBarsCard({ state, d }: IndicatorProps) {
  const t = useIndT();
  const locale = useLocale();
  const W = 400;
  const H = 210;
  const B = 34;
  const off = new Set(weekendDays(state.weekend));
  const max = Math.max(1, ...d.weekdayCounts);
  const bw = (W - 20) / 7;
  const order = locale.startsWith("ar") ? [6, 0, 1, 2, 3, 4, 5] : [0, 1, 2, 3, 4, 5, 6];
  const eventDow = d.weekday;
  return (
    <SectionCard title={t("weekdays.title")}>
      <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-300">{t("weekdays.intro")}</p>
      <IndicatorWithTable
        workedExampleTitle={t("worked")}
        indicator={
          <PhoneMini slot={1} title={t("weekdays.title")}>
          <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("weekdays.title")} className="max-w-full" style={{ direction: "ltr" }}>
            {order.map((dow, i) => {
              const v = d.weekdayCounts[dow];
              const h = (v / max) * (H - B - 30);
              const cx = 10 + i * bw + bw / 2;
              return (
                <g key={dow}>
                  <rect x={cx - bw * 0.34} y={H - B - h} width={bw * 0.68} height={Math.max(2, h)} rx={4} fill={off.has(dow) ? AMBER : BLUE} fillOpacity={0.9} style={{ transition: "all 500ms ease" }} />
                  <text x={cx} y={H - B - h - 5} textAnchor="middle" fontSize={12} fontWeight={800} className={valueText}>{num(v)}</text>
                  <text x={cx} y={H - B + 15} textAnchor="middle" fontSize={11} fontWeight={700} className={valueText}>{fmtShortWeekday(locale, dow)}</text>
                  {dow === eventDow && <circle cx={cx} cy={H - B + 26} r={4} fill={GREEN} />}
                </g>
              );
            })}
          </svg>
          </PhoneMini>
        }
        rows={[
          ...order.map((dow) => ({ label: fmtShortWeekday(locale, dow), value: num(d.weekdayCounts[dow]), note: off.has(dow) ? t("weekdays.weekend") : undefined })),
          { label: t("weekdays.eventDay"), value: fmtShortWeekday(locale, eventDow), note: t("weekdays.eventDot") },
          { label: t("weekdays.total"), value: num(d.days.calendarDays), emphasize: true },
        ]}
      />
    </SectionCard>
  );
}
