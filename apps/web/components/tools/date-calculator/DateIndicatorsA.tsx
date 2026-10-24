"use client";
import { useRef, useState, type PointerEvent } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  addCivilDays,
  civilToUtcMs,
  civilWeekday,
  computeDateSpan,
  diffCivilDays,
  gregorianToHijri,
  hijriToGregorian,
  isLeapYear,
  parseCivilDate,
  type CivilDate,
  type WeekendPreset,
} from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import IndicatorWithTable from "@/components/tool-ui/IndicatorWithTable";
import PhoneMini from "@/components/tool-ui/indicator-kit/PhoneMini";
import { useYmd } from "./DateResultCard";
import { DATE_COLORS, isWeekendDay, withSpanEnd, type DateState, type Derived, type Formatters } from "./dateModel";

export type IndicatorProps = { state: DateState; setState: (s: DateState) => void; d: Derived; f: Formatters };

export const axisText = "fill-zinc-500 dark:fill-zinc-400";
export const valueText = "fill-zinc-800 dark:fill-zinc-100";

export function useIndT() {
  return useTranslations("tools.date-calculator.pro.ind");
}

export type MonthTicks = { count: number; ticks: CivilDate[]; dense: boolean };

/**
 * Month starts strictly inside (a, b] in the Gregorian or Umm al-Qura calendar: the exact count,
 * and the tick dates (month starts, or only year starts when there are more than `maxMonths`).
 */
export function monthTicks(a: CivilDate, b: CivilDate, cal: "gregorian" | "hijri", maxMonths = 30): MonthTicks {
  const ha = cal === "hijri" ? gregorianToHijri(a) : a;
  const hb = cal === "hijri" ? gregorianToHijri(b) : b;
  const count = Math.max(0, hb.year * 12 + hb.month - (ha.year * 12 + ha.month));
  const dense = count > maxMonths;
  const ticks: CivilDate[] = [];
  const toG = (year: number, month: number) => (cal === "hijri" ? hijriToGregorian({ year, month, day: 1 }) : { year, month, day: 1 });
  if (dense) {
    for (let y = ha.year + 1; y <= hb.year; y++) {
      const c = toG(y, 1);
      if (c) ticks.push(c);
    }
  } else {
    for (let i = 1; i <= count; i++) {
      const idx = ha.year * 12 + ha.month - 1 + i;
      const c = toG(Math.floor(idx / 12), (idx % 12) + 1);
      if (c) ticks.push(c);
    }
  }
  return { count, ticks, dense };
}

/* 1 · Draggable timeline with stations (timeline with stations + drag) */
export function DateTimelineDragCard({ state, setState, d, f }: IndicatorProps) {
  const t = useIndT();
  const rtl = useLocale().startsWith("ar");
  const W = 420;
  const H = 200;
  const L = 22;
  const R = 22;
  const AXIS = 112;
  const svgRef = useRef<SVGSVGElement>(null);
  const [frozen, setFrozen] = useState<{ lo: number; hi: number } | null>(null);
  const span = Math.abs(diffCivilDays(d.start, d.target));
  const pad = Math.max(10, Math.round(span * 0.3));
  const minDay = Math.min(0, diffCivilDays(d.start, d.target));
  const maxDay = Math.max(0, diffCivilDays(d.start, d.target));
  const dom = frozen ?? { lo: minDay - pad, hi: maxDay + pad };
  const px = (day: number) => {
    const r = (day - dom.lo) / (dom.hi - dom.lo);
    return L + (rtl ? 1 - r : r) * (W - L - R);
  };
  const dayAt = (x: number) => {
    const r = (x - L) / (W - L - R);
    return Math.round(dom.lo + (rtl ? 1 - r : r) * (dom.hi - dom.lo));
  };
  const lo = addCivilDays(d.start, dom.lo);
  const hi = addCivilDays(d.start, dom.hi);
  const { ticks, dense: showYear } = monthTicks(lo, hi, "gregorian", 16);
  const s = d.span;
  const holidays = d.holidays.map(parseCivilDate).filter((c): c is CivilDate => !!c && civilToUtcMs(c) >= civilToUtcMs(s.earlier) && civilToUtcMs(c) < civilToUtcMs(s.endExclusive));
  const leap = Array.from({ length: hi.year - lo.year + 1 }, (_, i) => lo.year + i)
    .filter(isLeapYear)
    .map((y) => ({ year: y, month: 2, day: 29 }))
    .filter((c) => civilToUtcMs(c) >= civilToUtcMs(lo) && civilToUtcMs(c) <= civilToUtcMs(hi))
    .filter((_, i, all) => all.length <= 12);
  const x0 = px(0);
  const x1 = px(diffCivilDays(d.start, d.target));

  const move = (e: PointerEvent<SVGSVGElement>) => {
    if (!frozen || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * W;
    const day = Math.max(dom.lo, Math.min(dom.hi, dayAt(x)));
    setState(withSpanEnd(state, d.start, addCivilDays(d.start, day)));
  };

  return (
    <SectionCard phoneRole="visual" title={t("timeline.title")}>
      <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-300">{t("timeline.intro")}</p>
      <IndicatorWithTable
        workedExampleTitle={t("worked")}
        indicator={
          <div className="w-[420px] max-w-full">
            <svg
              ref={svgRef}
              width={W}
              height={H}
              viewBox={`0 0 ${W} ${H}`}
              style={{ direction: "ltr", touchAction: "none" }}
              role="img"
              aria-label={t("timeline.title")}
              className="max-w-full select-none"
              onPointerMove={move}
              onPointerUp={() => setFrozen(null)}
              onPointerLeave={() => setFrozen(null)}
            >
              <rect x={Math.min(x0, x1)} y={AXIS - 16} width={Math.max(2, Math.abs(x1 - x0))} height={32} rx={6} fill={DATE_COLORS.business} fillOpacity={0.14} style={{ transition: frozen ? "none" : "all 300ms" }} />
              <line x1={L} x2={W - R} y1={AXIS} y2={AXIS} stroke="currentColor" strokeOpacity={0.35} strokeWidth={2} />
              {ticks.map((c) => {
                const x = px(diffCivilDays(d.start, c));
                return (
                  <g key={f.iso(c)}>
                    <line x1={x} x2={x} y1={AXIS - 6} y2={AXIS + 6} stroke="currentColor" strokeOpacity={0.4} />
                    <text x={x} y={AXIS + 20} textAnchor="middle" fontSize={9} className={axisText}>
                      {showYear ? f.int(c.year) : f.monthShort(c.month)}
                    </text>
                  </g>
                );
              })}
              {holidays.map((c) => {
                const x = px(diffCivilDays(d.start, c));
                return <circle key={f.iso(c)} cx={x} cy={AXIS - 22} r={3.5} fill={DATE_COLORS.holiday} />;
              })}
              {leap.map((c) => {
                const x = px(diffCivilDays(d.start, c));
                return (
                  <g key={c.year}>
                    <line x1={x} x2={x} y1={AXIS - 30} y2={AXIS + 30} stroke={DATE_COLORS.leap} strokeDasharray="3 2" strokeWidth={1.5} />
                    <text x={x} y={AXIS + 42} textAnchor="middle" fontSize={9} fontWeight={700} fill={DATE_COLORS.leap}>29/2</text>
                  </g>
                );
              })}
              <g>
                <line x1={x0} x2={x0} y1={AXIS - 40} y2={AXIS} stroke={DATE_COLORS.hijri} strokeWidth={2} />
                <circle cx={x0} cy={AXIS} r={6} fill={DATE_COLORS.hijri} />
                <text x={x0} y={AXIS - 60} textAnchor="middle" fontSize={10} fontWeight={700} className={valueText}>{f.greg(d.start)}</text>
                <text x={x0} y={AXIS - 47} textAnchor="middle" fontSize={9} fill={DATE_COLORS.hijri}>{f.hijri(d.start)}</text>
              </g>
              <g
                style={{ cursor: "ew-resize" }}
                onPointerDown={(e) => {
                  (e.currentTarget.ownerSVGElement ?? svgRef.current)?.setPointerCapture?.(e.pointerId);
                  setFrozen(dom);
                }}
              >
                <line x1={x1} x2={x1} y1={AXIS} y2={AXIS + 52} stroke={DATE_COLORS.danger} strokeWidth={2} />
                <circle cx={x1} cy={AXIS} r={11} fill={DATE_COLORS.danger} stroke="white" strokeWidth={2.5} />
                <text x={x1} y={AXIS + 4} textAnchor="middle" fontSize={11} fontWeight={800} fill="white">⇔</text>
                <text x={x1} y={AXIS + 66} textAnchor="middle" fontSize={10} fontWeight={700} className={valueText}>{f.greg(d.target)}</text>
                <text x={x1} y={AXIS + 79} textAnchor="middle" fontSize={9} fill={DATE_COLORS.hijri}>{f.hijri(d.target)}</text>
              </g>
              <text x={(x0 + x1) / 2} y={AXIS - 22 - 8} textAnchor="middle" fontSize={12} fontWeight={800} fill={DATE_COLORS.business}>
                {f.int(s.totalDays)}
              </text>
            </svg>
            <p className="mt-1 text-center text-[11px] text-zinc-500 dark:text-zinc-400">{t("timeline.hint")}</p>
          </div>
        }
        rows={[
          { label: t("timeline.from"), value: f.greg(s.earlier) },
          { label: t("timeline.to"), value: f.greg(s.later), note: s.includeEnd ? t("timeline.included") : t("timeline.excluded") },
          { label: t("timeline.monthsCrossed"), value: f.int(monthTicks(s.earlier, s.later, "gregorian").count) },
          { label: t("timeline.holidays"), value: f.int(holidays.length) },
          { label: t("timeline.leap"), value: f.int(s.leapDays) },
          { label: t("timeline.total"), value: f.int(s.totalDays), emphasize: true },
        ]}
      />
    </SectionCard>
  );
}

/* 2 · Calendar days split into workdays / weekend / holidays for both weekends (stacked segmented bar) */
export function DateBusinessSplitCard({ state, setState, d, f }: IndicatorProps) {
  const t = useIndT();
  const tp = useTranslations("tools.date-calculator.pro");
  const W = 420;
  const L = 8;
  const R = 8;
  const presets: WeekendPreset[] = ["fri-sat", "sat-sun"];
  const s = d.span;
  const rows = presets.map((p) => ({
    p,
    c: p === d.weekend ? s.business : computeDateSpan({ start: s.earlier, end: s.later, includeEnd: s.includeEnd, weekend: p, holidays: d.holidays }).business,
  }));
  const total = Math.max(1, s.totalDays);
  const H = 190;
  const cur = rows.find((r) => r.p === d.weekend)!.c;
  const other = rows.find((r) => r.p !== d.weekend)!;

  return (
    <SectionCard title={t("split.title")}>
      <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-300">{t("split.intro")}</p>
      <IndicatorWithTable
        workedExampleTitle={t("worked")}
        indicator={
          <PhoneMini slot={0} title={t("split.title")}>
          <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ direction: "ltr" }} role="img" aria-label={t("split.title")} className="max-w-full">
            {rows.map((r, i) => {
              const y = 22 + i * 78;
              const segs = [
                { n: r.c.businessDays, color: DATE_COLORS.business },
                { n: r.c.weekendDays, color: DATE_COLORS.weekend },
                { n: r.c.holidays, color: DATE_COLORS.holiday },
              ];
              let x = L;
              const active = r.p === d.weekend;
              return (
                <g key={r.p} style={{ cursor: "pointer" }} onClick={() => setState({ ...state, weekend: r.p })}>
                  <text x={L} y={y - 6} fontSize={11} fontWeight={active ? 800 : 600} className={active ? valueText : axisText}>
                    {tp(`weekend.${r.p}`)} {active ? "●" : "○"}
                  </text>
                  {segs.map((sg, j) => {
                    const w = (sg.n / total) * (W - L - R);
                    const rx = x;
                    x += w;
                    return (
                      <g key={j}>
                        <rect x={rx} y={y} width={Math.max(0, w)} height={34} fill={sg.color} fillOpacity={active ? 0.9 : 0.45} style={{ transition: "all 400ms ease" }} />
                        {w > 26 && (
                          <text x={rx + w / 2} y={y + 22} textAnchor="middle" fontSize={12} fontWeight={800} fill="white">
                            {f.int(sg.n)}
                          </text>
                        )}
                      </g>
                    );
                  })}
                  <rect x={L} y={y} width={W - L - R} height={34} fill="none" stroke={active ? DATE_COLORS.business : "currentColor"} strokeOpacity={active ? 1 : 0.2} strokeWidth={active ? 2 : 1} />
                </g>
              );
            })}
          </svg>
          </PhoneMini>
        }
        rows={[
          { label: tp("result.businessDays"), value: `${f.int(cur.businessDays)} · ${f.pct(cur.businessDays / total)}` },
          { label: tp("result.weekendDays"), value: `${f.int(cur.weekendDays)} · ${f.pct(cur.weekendDays / total)}` },
          { label: tp("result.holidays"), value: `${f.int(cur.holidays)} · ${f.pct(cur.holidays / total)}`, note: t("split.onWeekend", { n: f.int(s.holidaysOnWeekend) }) },
          { label: t("split.other", { w: tp(`weekend.${other.p}`) }), value: f.int(other.c.businessDays), note: t("split.diff", { n: f.int(other.c.businessDays - cur.businessDays) }) },
          { label: tp("result.calendarDays"), value: f.int(s.totalDays), emphasize: true },
        ]}
      />
      <p className="mt-2 text-[11px] text-zinc-500 dark:text-zinc-400">{t("split.hint")}</p>
    </SectionCard>
  );
}

/* 3 · How many of each weekday the range contains (labeled bar chart) */
export function DateWeekdayBarsCard({ d, f }: IndicatorProps) {
  const t = useIndT();
  const rtl = useLocale().startsWith("ar");
  const counts = d.span.weekdayCounts;
  const max = Math.max(1, ...counts);
  const W = 420;
  const H = 210;
  const B = 30;
  const bw = (W - 20) / 7;
  const top = counts.indexOf(max);

  return (
    <SectionCard title={t("weekday.title")}>
      <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-300">{t("weekday.intro")}</p>
      <IndicatorWithTable
        workedExampleTitle={t("worked")}
        indicator={
          <PhoneMini slot={1} title={t("weekday.title")}>
          <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ direction: "ltr" }} role="img" aria-label={t("weekday.title")} className="max-w-full">
            {counts.map((n, i) => {
              const col = rtl ? 6 - i : i;
              const h = (n / max) * (H - B - 26);
              const cx = 10 + col * bw + bw / 2;
              const we = isWeekendDay(d.weekend, i);
              return (
                <g key={i}>
                  <rect x={cx - bw * 0.34} y={H - B - h} width={bw * 0.68} height={Math.max(h, 1)} rx={4} fill={we ? DATE_COLORS.weekend : DATE_COLORS.business} fillOpacity={0.88} style={{ transition: "all 400ms ease" }} />
                  <text x={cx} y={H - B - h - 5} textAnchor="middle" fontSize={11} fontWeight={800} className={valueText}>{f.int(n)}</text>
                  <text x={cx} y={H - B + 16} textAnchor="middle" fontSize={10.5} fontWeight={700} fill={we ? DATE_COLORS.danger : undefined} className={we ? "" : valueText}>
                    {f.weekdayShort(i)}
                  </text>
                </g>
              );
            })}
          </svg>
          </PhoneMini>
        }
        rows={[
          { label: t("weekday.fullWeeks"), value: f.int(d.span.weeks), note: `${f.int(d.span.totalDays)} ÷ 7` },
          { label: t("weekday.extra"), value: f.int(d.span.weekRemainderDays), note: t("weekday.extraNote", { day: f.weekday(civilWeekday(d.span.earlier)) }) },
          { label: t("weekday.most"), value: `${f.weekday(top)} · ${f.int(max)}` },
          { label: t("weekday.weekendTotal"), value: f.int(counts.filter((_, i) => isWeekendDay(d.weekend, i)).reduce((a, b) => a + b, 0)), emphasize: true },
        ]}
      />
    </SectionCard>
  );
}

/* 4 · The same span on the Gregorian and the Hijri ruler (side-by-side equivalence) */
export function DateDualCalendarCard({ d, f }: IndicatorProps) {
  const t = useIndT();
  const tp = useTranslations("tools.date-calculator.pro");
  const ymd = useYmd(f);
  const rtl = useLocale().startsWith("ar");
  const s = d.span;
  const W = 420;
  const H = 200;
  const L = 16;
  const R = 16;
  const total = Math.max(1, s.totalDays);
  const px = (c: CivilDate) => {
    const r = diffCivilDays(s.earlier, c) / total;
    return L + (rtl ? 1 - r : r) * (W - L - R);
  };
  const lastDay = addCivilDays(s.endExclusive, -1);
  const g = monthTicks(s.earlier, lastDay, "gregorian");
  const hm = monthTicks(s.earlier, lastDay, "hijri");
  const dense = g.dense || hm.dense;
  const gTicks = dense && !g.dense ? g.ticks.filter((c) => c.month === 1) : g.ticks;
  const hTicks = dense && !hm.dense ? hm.ticks.filter((c) => gregorianToHijri(c).month === 1) : hm.ticks;
  const ruler = (y: number, color: string, ticks: CivilDate[], name: string, value: string) => (
    <g>
      <text x={rtl ? W - L : L} y={y - 30} textAnchor={rtl ? "end" : "start"} fontSize={11} fontWeight={800} fill={color}>{name}</text>
      <text x={rtl ? L : W - R} y={y - 30} textAnchor={rtl ? "start" : "end"} fontSize={11} fontWeight={800} className={valueText}>{value}</text>
      <rect x={L} y={y - 14} width={W - L - R} height={22} rx={6} fill={color} fillOpacity={0.15} />
      {ticks.map((c) => (
        <line key={f.iso(c)} x1={px(c)} x2={px(c)} y1={y - 14} y2={y + 8} stroke={color} strokeWidth={1.5} />
      ))}
      <text x={W / 2} y={y + 24} textAnchor="middle" fontSize={9} className={axisText}>{f.int(ticks.length)}</text>
    </g>
  );

  return (
    <SectionCard title={t("dual.title")}>
      <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-300">{t("dual.intro")}</p>
      <IndicatorWithTable
        workedExampleTitle={t("worked")}
        indicator={
          <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ direction: "ltr" }} role="img" aria-label={t("dual.title")} className="max-w-full">
            {ruler(60, DATE_COLORS.business, gTicks, tp("cal.gregorian"), ymd(s.ymd))}
            {ruler(150, DATE_COLORS.hijri, hTicks, tp("cal.hijri"), ymd(s.hijri))}
            <text x={W / 2} y={106} textAnchor="middle" fontSize={13} fontWeight={800} className={valueText}>
              = {f.int(s.totalDays)}
            </text>
          </svg>
        }
        rows={[
          { label: tp("cal.gregorian"), value: `${f.greg(s.earlier)} → ${f.greg(s.later)}` },
          { label: tp("cal.hijri"), value: `${f.hijri(s.earlier)} → ${f.hijri(s.later)}` },
          { label: t("dual.gMonths"), value: f.int(g.count), note: dense ? t("dual.yearTicks") : t("dual.monthTicks") },
          { label: t("dual.hMonths"), value: f.int(hm.count) },
          { label: t("dual.yearLength"), value: `${f.num(total / 365.2425)} / ${f.num(total / 354.367)}`, note: t("dual.yearLengthNote") },
          { label: tp("result.totalDays"), value: f.int(s.totalDays), emphasize: true },
        ]}
      />
    </SectionCard>
  );
}
