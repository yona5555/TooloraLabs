"use client";
import { useRef, useState, type PointerEvent } from "react";
import { useTranslations } from "next-intl";
import { RotateCcw } from "lucide-react";
import {
  AGE_YEAR_LENGTHS,
  birthdayWeekdayCounts,
  civilDayNumber,
  civilFromDayNumber,
  computeDualAge,
  formatIsoDate,
  gregorianBirthdayInYear,
  type AgeEventKey,
} from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import IndicatorWithTable from "@/components/tool-ui/IndicatorWithTable";
import { AGE_COLORS, type AgeState, type Derived, type Formatters } from "./ageModel";

export type IndicatorProps = { state: AgeState; setState: (s: AgeState) => void; d: Derived; f: Formatters };

export const axisText = "fill-zinc-500 dark:fill-zinc-400";
export const valueText = "fill-zinc-800 dark:fill-zinc-100";

export function useIndicatorT() {
  return useTranslations("tools.age-calculator.dual.ind");
}
export function useDualT() {
  return useTranslations("tools.age-calculator.dual");
}

const STATIONS = [18, 21, 30, 40, 50, 65, 80, 100];

/* 1 · Time-travel timeline (timeline with stations + drag) */
export function AgeTimeTravelCard({ state, setState, d, f }: IndicatorProps) {
  const t = useIndicatorT();
  const td = useDualT();
  const { report: r } = d;
  const birthN = civilDayNumber(r.birth);
  const spanDays = civilDayNumber(gregorianBirthdayInYear(r.birth, r.birth.year + 100, r.leapRule)) - birthN;
  const [pick, setPick] = useState<number | null>(null);
  const offset = Math.min(spanDays, Math.max(0, pick ?? r.totalDays));
  const at = civilFromDayNumber(birthN + offset);
  const a = computeDualAge(r.birth, at, r.leapRule);
  const W = 400;
  const H = 190;
  const L = 16;
  const R = 16;
  const axisY = 96;
  const x = (days: number) => L + (days / spanDays) * (W - L - R);
  const svgRef = useRef<SVGSVGElement>(null);
  const dragging = useRef(false);

  function fromPointer(e: PointerEvent<SVGSVGElement>) {
    const box = svgRef.current?.getBoundingClientRect();
    if (!box) return;
    const px = ((e.clientX - box.left) / box.width) * W;
    setPick(Math.round(((Math.min(W - R, Math.max(L, px)) - L) / (W - L - R)) * spanDays));
  }

  return (
    <SectionCard title={t("travel.title")}>
      <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-300">{t("travel.intro")}</p>
      <IndicatorWithTable
        workedExampleTitle={t("worked")}
        indicator={
          <div className="w-[400px] max-w-full">
            <svg
              ref={svgRef}
              width={W}
              height={H}
              viewBox={`0 0 ${W} ${H}`}
              style={{ direction: "ltr", touchAction: "none" }}
              role="slider"
              aria-label={t("travel.title")}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={a.gregorian.years}
              className="max-w-full cursor-ew-resize select-none"
              onPointerDown={(e) => {
                dragging.current = true;
                e.currentTarget.setPointerCapture(e.pointerId);
                fromPointer(e);
              }}
              onPointerMove={(e) => dragging.current && fromPointer(e)}
              onPointerUp={() => (dragging.current = false)}
            >
              <rect x={L} y={axisY - 5} width={W - L - R} height={10} rx={5} fill="currentColor" fillOpacity={0.1} />
              <rect x={L} y={axisY - 5} width={x(r.totalDays) - L} height={10} rx={5} fill={AGE_COLORS.gregorian} fillOpacity={0.35} />
              {STATIONS.map((age, i) => {
                const sx = x(civilDayNumber(gregorianBirthdayInYear(r.birth, r.birth.year + age, r.leapRule)) - birthN);
                const up = i % 2 === 0;
                const reached = a.gregorian.years >= age;
                return (
                  <g key={age}>
                    <line x1={sx} x2={sx} y1={up ? axisY - 26 : axisY + 6} y2={up ? axisY - 6 : axisY + 26} stroke="currentColor" strokeOpacity={0.35} />
                    <circle cx={sx} cy={axisY} r={5} fill={reached ? AGE_COLORS.accent : "white"} stroke={AGE_COLORS.accent} strokeWidth={2} />
                    <text x={sx} y={up ? axisY - 30 : axisY + 38} textAnchor="middle" fontSize={10} fontWeight={700} className={valueText}>
                      {f.int(age)}
                    </text>
                    <text x={sx} y={up ? axisY - 42 : axisY + 50} textAnchor="middle" fontSize={8} className={axisText}>
                      {r.birth.year + age}
                    </text>
                  </g>
                );
              })}
              <line x1={x(r.totalDays)} x2={x(r.totalDays)} y1={axisY - 12} y2={axisY + 12} stroke={AGE_COLORS.gregorian} strokeWidth={2} />
              <text x={x(r.totalDays)} y={axisY + 64} textAnchor="middle" fontSize={9} fontWeight={700} fill={AGE_COLORS.gregorian}>
                {d.isToday ? td("input.today") : td("result.reference")}
              </text>
              <g style={{ transition: pick === null ? "transform 300ms ease" : undefined }} transform={`translate(${x(offset)} 0)`}>
                <line x1={0} x2={0} y1={18} y2={axisY + 14} stroke={AGE_COLORS.hijri} strokeWidth={2} strokeDasharray="3 2" />
                <rect x={-46} y={2} width={92} height={18} rx={9} fill={AGE_COLORS.hijri} />
                <text x={0} y={15} textAnchor="middle" fontSize={10} fontWeight={800} fill="white">
                  {formatIsoDate(at)}
                </text>
                <circle cx={0} cy={axisY} r={9} fill="white" stroke={AGE_COLORS.hijri} strokeWidth={3} />
              </g>
              <text x={L} y={H - 6} fontSize={9} className={axisText}>{r.birth.year}</text>
              <text x={W - R} y={H - 6} textAnchor="end" fontSize={9} className={axisText}>{r.birth.year + 100}</text>
            </svg>
            <input
              type="range"
              min={0}
              max={spanDays}
              step={1}
              value={offset}
              onChange={(e) => setPick(Number(e.target.value))}
              aria-label={t("travel.slider")}
              className="mt-1 w-full accent-emerald-600"
            />
            <div className="mt-1 flex gap-2">
              <button
                type="button"
                onClick={() => setState({ ...state, useRef: true, ref: formatIsoDate(at) })}
                className="flex-1 rounded-lg bg-emerald-600 px-2 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700"
              >
                {t("travel.useDate")}
              </button>
              <button
                type="button"
                onClick={() => setPick(null)}
                aria-label={t("travel.reset")}
                title={t("travel.reset")}
                className="rounded-lg border border-zinc-300 px-2.5 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                <RotateCcw size={14} />
              </button>
            </div>
          </div>
        }
        rows={[
          { label: t("travel.date"), value: f.greg(at), note: f.hijri(at) },
          { label: td("cal.gregorian"), value: td("ymd", { y: f.int(a.gregorian.years), m: f.int(a.gregorian.months), d: f.int(a.gregorian.days) }) },
          ...(a.hijri ? [{ label: td("cal.hijri"), value: td("ymd", { y: f.int(a.hijri.years), m: f.int(a.hijri.months), d: f.int(a.hijri.days) }) }] : []),
          { label: td("result.days"), value: f.int(a.totalDays), note: `${f.iso(at)} − ${f.iso(r.birth)}` },
          { label: t("travel.fromRef"), value: t("travel.daysSigned", { n: f.int(offset - r.totalDays) }), emphasize: true },
        ]}
      />
    </SectionCard>
  );
}

/* 2 · Gregorian vs Hijri years over the same days (side-by-side equivalence) */
export function AgeEquivalenceCard({ d, f }: IndicatorProps) {
  const t = useIndicatorT();
  const td = useDualT();
  const { report: r } = d;
  const g = r.gregorian;
  const h = r.hijri;
  const W = 400;
  const H = 170;
  const L = 8;
  const R = 8;
  const total = Math.max(1, r.totalDays);
  const unit = (W - L - R) / total;
  const gYears = r.totalDays / AGE_YEAR_LENGTHS.gregorian;
  const hYears = r.totalDays / AGE_YEAR_LENGTHS.hijri;
  const rows = [
    { key: "g", label: td("cal.gregorian"), years: g.years, len: AGE_YEAR_LENGTHS.gregorian, color: AGE_COLORS.gregorian, y: 30, text: td("ymd", { y: f.int(g.years), m: f.int(g.months), d: f.int(g.days) }) },
    ...(h
      ? [{ key: "h", label: td("cal.hijri"), years: h.years, len: AGE_YEAR_LENGTHS.hijri, color: AGE_COLORS.hijri, y: 104, text: td("ymd", { y: f.int(h.years), m: f.int(h.months), d: f.int(h.days) }) }]
      : []),
  ];

  return (
    <SectionCard title={t("equiv.title")}>
      <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-300">{t("equiv.intro")}</p>
      <IndicatorWithTable
        workedExampleTitle={t("worked")}
        indicator={
          <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ direction: "ltr" }} role="img" aria-label={t("equiv.title")} className="max-w-full">
            {rows.map((row) => {
              const blockW = row.len * unit;
              const n = Math.floor(total / row.len);
              return (
                <g key={row.key}>
                  <text x={L} y={row.y - 8} fontSize={11} fontWeight={800} fill={row.color}>{row.label}</text>
                  <text x={W - R} y={row.y - 8} textAnchor="end" fontSize={11} fontWeight={700} className={valueText}>{row.text}</text>
                  {Array.from({ length: n }, (_, i) => (
                    <rect key={i} x={L + i * blockW + 0.5} y={row.y} width={Math.max(0.5, blockW - 1)} height={26} fill={row.color} fillOpacity={i % 2 ? 0.55 : 0.8} style={{ transition: "all 400ms ease" }} />
                  ))}
                  <rect x={L + n * blockW} y={row.y} width={Math.max(0, W - R - (L + n * blockW))} height={26} fill={row.color} fillOpacity={0.2} />
                  <text x={L} y={row.y + 40} fontSize={9} className={axisText}>
                    {t("equiv.blocks", { n: f.int(n), len: f.num(row.len, 2) })}
                  </text>
                </g>
              );
            })}
            <line x1={W - R} x2={W - R} y1={22} y2={H - 30} stroke="currentColor" strokeOpacity={0.4} strokeDasharray="3 2" />
            <text x={W / 2} y={H - 4} textAnchor="middle" fontSize={10} fontWeight={700} className={valueText}>
              {t("equiv.sameDays", { n: f.int(r.totalDays) })}
            </text>
          </svg>
        }
        rows={[
          { label: td("result.days"), value: f.int(r.totalDays) },
          { label: td("cal.gregorian"), value: f.num(gYears), note: `${f.int(r.totalDays)} ÷ ${f.num(AGE_YEAR_LENGTHS.gregorian, 4)}` },
          { label: td("cal.hijri"), value: f.num(hYears), note: `${f.int(r.totalDays)} ÷ ${f.num(AGE_YEAR_LENGTHS.hijri, 3)}` },
          { label: t("equiv.ratio"), value: f.num(AGE_YEAR_LENGTHS.gregorian / AGE_YEAR_LENGTHS.hijri, 4), note: `${f.num(AGE_YEAR_LENGTHS.gregorian, 4)} ÷ ${f.num(AGE_YEAR_LENGTHS.hijri, 3)}` },
          { label: td("result.hijriAhead"), value: f.num(hYears - gYears), emphasize: true },
        ]}
      />
    </SectionCard>
  );
}

const EVENT_COLORS: Record<AgeEventKey, string> = {
  gregorianBirthday: AGE_COLORS.gregorian,
  hijriBirthday: AGE_COLORS.hijri,
  thousandDays: "#8b5cf6",
  thousandWeeks: "#ec4899",
  milestone: AGE_COLORS.accent,
  leapBirthday: "#0891b2",
};

/* 3 · Countdown to the next events (ranked horizontal bar list) */
export function AgeCountdownCard({ d, f }: IndicatorProps) {
  const t = useIndicatorT();
  const { events } = d;
  const W = 400;
  const RH = 34;
  const H = events.length * RH + 8;
  const L = 8;
  const R = 70;
  const max = Math.max(1, ...events.map((e) => e.daysUntil));
  // Square-root scale keeps a 7-day and a 7-year countdown both readable.
  const len = (n: number) => Math.max(4, Math.sqrt(n / max) * (W - L - R));
  const label = (key: AgeEventKey, value: number) => t(`countdown.${key}`, { n: f.int(value) });

  return (
    <SectionCard title={t("countdown.title")}>
      <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-300">{t("countdown.intro")}</p>
      <IndicatorWithTable
        workedExampleTitle={t("worked")}
        indicator={
          <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ direction: "ltr" }} role="img" aria-label={t("countdown.title")} className="max-w-full">
            {events.map((e, i) => {
              const y = i * RH + 4;
              return (
                <g key={e.key}>
                  <text x={L} y={y + 9} fontSize={10} fontWeight={700} className={valueText}>
                    {label(e.key, e.value)}
                  </text>
                  <rect x={L} y={y + 14} width={W - L - R} height={12} rx={6} fill="currentColor" fillOpacity={0.07} />
                  <rect x={L} y={y + 14} width={len(e.daysUntil)} height={12} rx={6} fill={EVENT_COLORS[e.key]} style={{ transition: "width 500ms ease" }} />
                  <text x={W - 4} y={y + 24} textAnchor="end" fontSize={11} fontWeight={800} fill={EVENT_COLORS[e.key]}>
                    {e.daysUntil === 0 ? t("countdown.now") : t("countdown.days", { n: f.int(e.daysUntil) })}
                  </text>
                </g>
              );
            })}
          </svg>
        }
        rows={[
          ...events.map((e, i) => ({
            label: label(e.key, e.value),
            value: f.greg(e.date),
            note: e.key === "hijriBirthday" ? f.hijri(e.date) : f.weekday((d.report.referenceWeekday + e.daysUntil) % 7),
            emphasize: i === 0,
          })),
        ]}
      />
    </SectionCard>
  );
}

/* 4 · Weekday of every birthday so far (labeled bar chart) */
export function AgeWeekdayCard({ d, f }: IndicatorProps) {
  const t = useIndicatorT();
  const td = useDualT();
  const { report: r } = d;
  const counts = birthdayWeekdayCounts(r.birth, r.reference, r.leapRule);
  const nextWd = (r.referenceWeekday + r.gregorian.daysUntilNext) % 7;
  const max = Math.max(1, ...counts);
  const W = 400;
  const H = 200;
  const B = 36;
  const bw = (W - 16) / 7;
  const top = counts.indexOf(max);

  return (
    <SectionCard title={t("weekday.title")}>
      <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-300">{t("weekday.intro")}</p>
      <IndicatorWithTable
        workedExampleTitle={t("worked")}
        indicator={
          <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ direction: "ltr" }} role="img" aria-label={t("weekday.title")} className="max-w-full">
            {counts.map((c, i) => {
              const h = (c / max) * (H - B - 30);
              const cx = 8 + i * bw + bw / 2;
              const born = i === r.birthWeekday;
              return (
                <g key={i}>
                  <rect x={cx - bw * 0.34} y={H - B - h} width={bw * 0.68} height={Math.max(1, h)} rx={3} fill={born ? AGE_COLORS.accent : AGE_COLORS.gregorian} fillOpacity={born ? 0.95 : 0.65} style={{ transition: "all 400ms ease" }} />
                  <text x={cx} y={H - B - h - 5} textAnchor="middle" fontSize={11} fontWeight={800} className={valueText}>{f.int(c)}</text>
                  <text x={cx} y={H - B + 14} textAnchor="middle" fontSize={10} fontWeight={born ? 800 : 600} className={valueText}>{f.weekdayShort(i)}</text>
                  {i === nextWd && (
                    <text x={cx} y={H - B + 28} textAnchor="middle" fontSize={9} fontWeight={700} fill={AGE_COLORS.hijri}>
                      {t("weekday.next")}
                    </text>
                  )}
                  {born && (
                    <text x={cx} y={14} textAnchor="middle" fontSize={9} fontWeight={700} fill={AGE_COLORS.accent}>
                      {t("weekday.born")}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        }
        rows={[
          { label: td("result.bornOn"), value: f.weekday(r.birthWeekday), note: f.greg(r.birth) },
          { label: t("weekday.total"), value: f.int(counts.reduce((s, c) => s + c, 0)), note: t("weekday.totalNote", { n: f.int(r.gregorian.years) }) },
          { label: t("weekday.most"), value: `${f.weekday(top)} · ${f.int(max)}` },
          { label: t("weekday.nextOn"), value: f.weekday(nextWd), note: f.greg(r.gregorian.nextBirthdayGregorian), emphasize: true },
        ]}
      />
    </SectionCard>
  );
}
