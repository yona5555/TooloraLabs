"use client";
import { useLocale, useTranslations } from "next-intl";
import { addMonthsClamped, daysInMonth, diffCivilDays, gregorianToHijri, hijriMonthLength, hijriToGregorian, isLeapYear } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import IndicatorWithTable from "@/components/tool-ui/IndicatorWithTable";
import { axisText, useIndT, valueText, type IndicatorProps } from "./DateIndicatorsA";
import { DATE_COLORS } from "./dateModel";
import { svgPx } from "@/components/tool-ui/svgPx";
import { useFitWidth } from "@/components/tool-ui/useFitWidth";

/* 5 · Start → + years → + months → + days (stepped diagram, month-end clamping shown on the step) */
export function DateStepLadderCard({ d, f }: IndicatorProps) {
  const t = useIndT();
  const rtl = useLocale().startsWith("ar");
  const s = d.span;
  const { years, months, days } = s.ymd;
  const afterY = addMonthsClamped(s.earlier, years * 12);
  const afterM = addMonthsClamped(s.earlier, years * 12 + months);
  const steps = [
    { date: s.earlier, label: "", clamped: false },
    { date: afterY.date, label: `+${f.int(years)} ${t("steps.y")}`, clamped: afterY.clamped },
    { date: afterM.date, label: `+${f.int(months)} ${t("steps.m")}`, clamped: afterM.clamped },
    { date: s.endExclusive, label: `+${f.int(days)} ${t("steps.d")}`, clamped: false },
  ];
  const [fitRef, W] = useFitWidth(420);
  const H = 230;
  const sw = (W - 20) / 4;
  const stepH = 44;
  const xAt = (i: number) => (rtl ? W - 10 - (i + 1) * sw : 10 + i * sw);

  return (
    <SectionCard title={t("steps.title")}>
      <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-300">{t("steps.intro")}</p>
      <IndicatorWithTable
        workedExampleTitle={t("worked")}
        indicator={
          <svg ref={fitRef} width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ direction: "ltr" }} role="img" aria-label={t("steps.title")} className="max-w-full">
            {steps.map((st, i) => {
              const x = xAt(i);
              const y = H - 30 - i * stepH;
              const color = st.clamped ? DATE_COLORS.leap : i === 3 ? DATE_COLORS.danger : i === 0 ? DATE_COLORS.hijri : DATE_COLORS.business;
              return (
                <g key={i} style={{ transition: "all 400ms ease" }}>
                  <rect x={x + 2} y={y} width={sw - 4} height={H - 10 - y} rx={6} fill={color} fillOpacity={0.16} />
                  <line x1={x + 2} x2={x + sw - 2} y1={y} y2={y} stroke={color} strokeWidth={3} strokeLinecap="round" />
                  <text style={{ fontSize: svgPx(12) }} x={x + sw / 2} y={y - 22} textAnchor="middle" fontWeight={800} className={valueText}>{f.greg(st.date)}</text>
                  <text style={{ fontSize: svgPx(12) }} x={x + sw / 2} y={y - 9} textAnchor="middle" fill={DATE_COLORS.hijri}>{f.hijri(st.date)}</text>
                  {st.label && (
                    <text style={{ fontSize: svgPx(12) }} x={x + sw / 2} y={y + 18} textAnchor="middle" fontWeight={800} fill={color}>{st.label}</text>
                  )}
                  {st.clamped && (
                    <text style={{ fontSize: svgPx(12) }} x={x + sw / 2} y={y + 32} textAnchor="middle" fontWeight={700} fill={DATE_COLORS.leap}>
                      {f.int(s.earlier.day)} → {f.int(st.date.day)}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        }
        rows={[
          { label: t("steps.start"), value: f.iso(s.earlier) },
          { label: `+${f.int(years)} ${t("steps.y")}`, value: f.iso(afterY.date), note: afterY.clamped ? t("steps.clamped", { day: f.int(s.earlier.day), len: f.int(afterY.monthLength) }) : undefined },
          { label: `+${f.int(months)} ${t("steps.m")}`, value: f.iso(afterM.date), note: afterM.clamped ? t("steps.clamped", { day: f.int(s.earlier.day), len: f.int(afterM.monthLength) }) : undefined },
          { label: `+${f.int(days)} ${t("steps.d")}`, value: f.iso(s.endExclusive), note: s.includeEnd ? t("steps.inclusive", { date: f.iso(s.later) }) : undefined },
          { label: t("steps.result"), value: t("steps.ymd", { y: f.int(years), m: f.int(months), d: f.int(days) }), emphasize: true },
        ]}
      />
    </SectionCard>
  );
}

/* 6 · Business days and weeks as live formulas (formula diagram) */
export function DateBusinessFormulaCard({ d, f }: IndicatorProps) {
  const t = useIndT();
  const tp = useTranslations("tools.date-calculator.pro");
  const s = d.span;
  const b = s.business;
  const W = 420;
  const H = 196;
  const box = (x: number, y: number, w: number, v: string, sub: string, color: string) => (
    <g>
      <rect x={x} y={y} width={w} height={54} rx={9} fill={color} fillOpacity={0.14} stroke={color} strokeWidth={1.5} />
      <text x={x + w / 2} y={y + 26} textAnchor="middle" fontSize={17} fontWeight={800} fill={color}>{v}</text>
      <text x={x + w / 2} y={y + 44} textAnchor="middle" fontSize={8.5} fontWeight={600} className={axisText}>{sub}</text>
    </g>
  );
  const op = (x: number, y: number, c: string) => (
    <text x={x} y={y + 33} textAnchor="middle" fontSize={18} fontWeight={800} className={valueText}>{c}</text>
  );
  const bw = 78;
  const gap = 24;

  return (
    <SectionCard title={t("formula.title")}>
      <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-300">{t("formula.intro")}</p>
      <IndicatorWithTable
        workedExampleTitle={t("worked")}
        indicator={
          <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ direction: "ltr" }} role="img" aria-label={t("formula.title")} data-annotation="" className="max-w-full">
            {box(4, 14, bw, f.int(b.calendarDays), t("formula.cal"), DATE_COLORS.hijri)}
            {op(4 + bw + gap / 2, 14, "−")}
            {box(4 + (bw + gap), 14, bw, f.int(b.weekendDays), t("formula.we"), DATE_COLORS.weekend)}
            {op(4 + 2 * bw + 1.5 * gap, 14, "−")}
            {box(4 + 2 * (bw + gap), 14, bw, f.int(b.holidays), t("formula.hol"), DATE_COLORS.holiday)}
            {op(4 + 3 * bw + 2.5 * gap, 14, "=")}
            {box(4 + 3 * (bw + gap), 14, bw, f.int(b.businessDays), t("formula.biz"), DATE_COLORS.business)}
            {box(4, 112, bw, f.int(s.totalDays), t("formula.cal"), DATE_COLORS.hijri)}
            {op(4 + bw + gap / 2, 112, "=")}
            {box(4 + (bw + gap), 112, bw, f.int(s.weeks), t("formula.weeks"), DATE_COLORS.business)}
            {op(4 + 2 * bw + 1.5 * gap, 112, "×7+")}
            {box(4 + 2 * (bw + gap), 112, bw, f.int(s.weekRemainderDays), t("formula.rem"), DATE_COLORS.holiday)}
            {op(4 + 3 * bw + 2.5 * gap, 112, "≈")}
            {box(4 + 3 * (bw + gap), 112, bw, f.num(s.totalDays / 7, 1), t("formula.weeks"), DATE_COLORS.danger)}
          </svg>
        }
        rows={[
          { label: tp("result.calendarDays"), value: f.int(b.calendarDays), note: s.includeEnd ? tp("input.includeEnd") : tp("result.endExcluded") },
          { label: tp("result.weekendDays"), value: `− ${f.int(b.weekendDays)}`, note: tp(`weekend.${d.weekend}`) },
          { label: tp("result.holidays"), value: `− ${f.int(b.holidays)}`, note: t("formula.holNote", { n: f.int(d.holidays.length), w: f.int(s.holidaysOnWeekend) }) },
          { label: tp("result.businessDays"), value: f.int(b.businessDays), emphasize: true },
          { label: tp("result.weeks"), value: tp("result.weeksDays", { w: f.int(s.weeks), d: f.int(s.weekRemainderDays) }), note: `${f.int(s.weeks)} × 7 + ${f.int(s.weekRemainderDays)} = ${f.int(s.totalDays)}` },
        ]}
      />
    </SectionCard>
  );
}

/* 7 · Month lengths of the Gregorian and Hijri year around the end date (zone strip) */
export function DateYearZoneCard({ d, f }: IndicatorProps) {
  const t = useIndT();
  const tp = useTranslations("tools.date-calculator.pro");
  const rtl = useLocale().startsWith("ar");
  const c = d.target;
  const y = c.year;
  const leap = isLeapYear(y);
  const gLens = Array.from({ length: 12 }, (_, i) => daysInMonth(y, i + 1));
  const gTotal = leap ? 366 : 365;
  const h = gregorianToHijri(c);
  const hLens = Array.from({ length: 12 }, (_, i) => hijriMonthLength(h.year, i + 1));
  const hTotal = hLens.reduce((a, b) => a + b, 0);
  const [fitRef, W] = useFitWidth(420);
  const L = 8;
  const full = W - 2 * L;
  const dayOfYear = diffCivilDays({ year: y, month: 1, day: 1 }, c) + 1;
  const hStart = hijriToGregorian({ year: h.year, month: 1, day: 1 });
  const hDayOfYear = hStart ? diffCivilDays(hStart, c) + 1 : h.day;
  const colorG = (n: number) => (n === 31 ? DATE_COLORS.business : n === 30 ? "#0ea5e9" : n === 29 ? DATE_COLORS.leap : DATE_COLORS.weekend);
  const colorH = (n: number) => (n === 30 ? DATE_COLORS.hijri : "#6ee7b7");
  const strip = (yy: number, lens: number[], total: number, scale: number, color: (n: number) => string, marker: number, names: (i: number) => string) => {
    const width = full * scale;
    let x = 0;
    const pos = (v: number) => (rtl ? L + full - v : L + v);
    return (
      <g>
        {lens.map((n, i) => {
          const w = (n / total) * width;
          const x0 = x;
          x += w;
          return (
            <g key={i}>
              <rect x={rtl ? pos(x0 + w) : pos(x0)} y={yy} width={Math.max(0, w - 1)} height={30} fill={color(n)} fillOpacity={0.85} />
              <text style={{ fontSize: svgPx(12) }} x={rtl ? pos(x0 + w / 2) : pos(x0 + w / 2)} y={yy + 19} textAnchor="middle" fontWeight={800} fill="white">{f.int(n)}</text>
              <text style={{ fontSize: svgPx(12) }} x={pos(x0 + w / 2)} y={yy + 43} textAnchor="middle" className={axisText}>{names(i)}</text>
            </g>
          );
        })}
        <g style={{ transition: "all 400ms ease" }}>
          <line x1={pos((marker / total) * width)} x2={pos((marker / total) * width)} y1={yy - 8} y2={yy + 34} stroke={DATE_COLORS.danger} strokeWidth={2.5} />
          <circle cx={pos((marker / total) * width)} cy={yy - 8} r={4} fill={DATE_COLORS.danger} />
        </g>
      </g>
    );
  };

  return (
    <SectionCard title={t("zone.title")}>
      <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-300">{t("zone.intro")}</p>
      <IndicatorWithTable
        workedExampleTitle={t("worked")}
        indicator={
          <svg ref={fitRef} width={W} height={200} viewBox={`0 0 ${W} 200`} style={{ direction: "ltr" }} role="img" aria-label={t("zone.title")} className="max-w-full">
            <text style={{ fontSize: svgPx(12) }} x={rtl ? W - L : L} y={18} textAnchor={rtl ? "end" : "start"} fontWeight={800} fill={DATE_COLORS.business}>
              {tp("cal.gregorian")} {f.int(y)} · {f.int(gTotal)}
            </text>
            {strip(34, gLens, gTotal, 1, colorG, dayOfYear - 0.5, (i) => f.monthShort(i + 1))}
            <text style={{ fontSize: svgPx(12) }} x={rtl ? W - L : L} y={112} textAnchor={rtl ? "end" : "start"} fontWeight={800} fill={DATE_COLORS.hijri}>
              {tp("cal.hijri")} {f.int(h.year)} · {f.int(hTotal)}
            </text>
            {strip(128, hLens, hTotal, hTotal / gTotal, colorH, hDayOfYear - 0.5, (i) => f.int(i + 1))}
          </svg>
        }
        rows={[
          { label: t("zone.leapTest", { y: f.int(y) }), value: leap ? tp("result.yes") : tp("result.no"), note: `${f.int(y)} ÷ 4 = ${f.num(y / 4)} · ÷ 100 = ${f.num(y / 100)} · ÷ 400 = ${f.num(y / 400)}` },
          { label: t("zone.feb"), value: f.int(gLens[1]) },
          { label: t("zone.dayOfYear"), value: `${f.int(dayOfYear)} / ${f.int(gTotal)}`, note: t("zone.left", { n: f.int(gTotal - dayOfYear) }) },
          { label: t("zone.hijriYear", { y: f.int(h.year) }), value: `${f.int(hDayOfYear)} / ${f.int(hTotal)}`, note: t("zone.hijriMonths", { n30: f.int(hLens.filter((n) => n === 30).length), n29: f.int(hLens.filter((n) => n === 29).length) }) },
          { label: t("zone.gap"), value: f.int(gTotal - hTotal), emphasize: true },
        ]}
      />
    </SectionCard>
  );
}

/* 8 · The span in every unit on one logarithmic scale (log-scale magnitude bar) */
export function DateUnitsLogCard({ d, f }: IndicatorProps) {
  const t = useIndT();
  const days = d.span.totalDays;
  const units = [
    { k: "seconds", v: days * 86_400, formula: `${f.int(days)} × 86,400` },
    { k: "minutes", v: days * 1_440, formula: `${f.int(days)} × 1,440` },
    { k: "hours", v: days * 24, formula: `${f.int(days)} × 24` },
    { k: "days", v: days, formula: "" },
    { k: "weeks", v: days / 7, formula: `${f.int(days)} ÷ 7` },
    { k: "months", v: days / 30.436875, formula: `${f.int(days)} ÷ 30.44` },
    { k: "years", v: days / 365.2425, formula: `${f.int(days)} ÷ 365.2425` },
  ];
  const [fitRef, W] = useFitWidth(420);
  const L = 64;
  const R = 70;
  const RH = 26;
  const H = units.length * RH + 30;
  const maxExp = 9;
  const minExp = -1;
  const x = (v: number) => L + ((Math.log10(Math.max(v, 10 ** minExp)) - minExp) / (maxExp - minExp)) * (W - L - R);
  const fmt = (v: number) => (v >= 100 ? f.int(v) : f.num(v, v >= 10 ? 1 : 2));

  return (
    <SectionCard title={t("log.title")}>
      <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-300">{t("log.intro")}</p>
      <IndicatorWithTable
        workedExampleTitle={t("worked")}
        indicator={
          <svg ref={fitRef} width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ direction: "ltr" }} role="img" aria-label={t("log.title")} className="max-w-full">
            {Array.from({ length: maxExp - minExp + 1 }, (_, i) => minExp + i).map((e) => (
              <g key={e}>
                <line x1={x(10 ** e)} x2={x(10 ** e)} y1={4} y2={H - 22} stroke="currentColor" strokeOpacity={0.1} />
                <text style={{ fontSize: svgPx(12) }} x={x(10 ** e)} y={H - 8} textAnchor="middle" className={axisText}>{`10${e < 0 ? "⁻¹" : ["⁰", "¹", "²", "³", "⁴", "⁵", "⁶", "⁷", "⁸", "⁹"][e]}`}</text>
              </g>
            ))}
            {units.map((u, i) => {
              const yy = 6 + i * RH;
              const w = x(u.v) - L;
              return (
                <g key={u.k}>
                  <text style={{ fontSize: svgPx(12) }} x={L - 6} y={yy + 14} textAnchor="end" fontWeight={600} className={valueText}>{t(`log.${u.k}`)}</text>
                  <rect x={L} y={yy + 2} width={Math.max(2, w)} height={RH - 9} rx={4} fill={u.k === "days" ? DATE_COLORS.danger : DATE_COLORS.business} fillOpacity={0.25 + (i / units.length) * 0.6} style={{ transition: "all 400ms ease" }} />
                  <text style={{ fontSize: svgPx(12) }} x={L + Math.max(2, w) + 4} y={yy + 14} fontWeight={800} className={valueText}>{fmt(u.v)}</text>
                </g>
              );
            })}
          </svg>
        }
        rows={[
          ...units
            .filter((u) => u.k !== "days")
            .map((u) => ({ label: t(`log.${u.k}`), value: fmt(u.v), note: u.formula })),
          { label: t("log.days"), value: f.int(days), emphasize: true },
        ]}
      />
    </SectionCard>
  );
}

