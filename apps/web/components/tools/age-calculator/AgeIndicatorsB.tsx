"use client";
import { useTranslations } from "next-intl";
import { computeLifeExpectancyProgress, lifeStageDays, type Gender, type LifeStageKey } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import IndicatorWithTable from "@/components/tool-ui/IndicatorWithTable";
import PhoneMini from "@/components/tool-ui/indicator-kit/PhoneMini";
import { AGE_COLORS } from "./ageModel";
import { axisText, useDualT, useIndicatorT, valueText, type IndicatorProps } from "./AgeIndicatorsA";
import { svgPx } from "@/components/tool-ui/svgPx";
import { useFitWidth } from "@/components/tool-ui/useFitWidth";

import FitSvg from "@/components/tool-ui/FitSvg";
const STAGE_COLORS: Record<LifeStageKey, string> = {
  childhood: "#38bdf8",
  adolescence: "#22c55e",
  youth: "#2563eb",
  middleAge: "#f59e0b",
  oldAge: "#a855f7",
};

/* 5 · Days lived in each life stage (stacked segmented bar) */
export function AgeLifeStagesCard({ d, f }: IndicatorProps) {
  const t = useIndicatorT();
  const td = useDualT();
  const { report: r, life } = d;
  const stages = lifeStageDays(r.birth, r.reference, r.leapRule);
  const [fitRef, W] = useFitWidth(400);
  const H = 150;
  const L = 8;
  const R = 8;
  // Scale: the longer of the life expectancy and the age reached, in days.
  const horizon = Math.max(r.totalDays, Math.round(life.lifeExpectancyYears * 365.2425));
  const unit = (W - L - R) / horizon;
  const starts = stages.map((_, i) => L + stages.slice(0, i).reduce((sum, s) => sum + s.days, 0) * unit);
  const current = stages.find((s) => !s.complete && s.days > 0) ?? stages[stages.length - 1];
  const tStage = useTranslations("tools.age-calculator.dual.stages");

  return (
    <SectionCard title={t("stages.title")}>
      <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-300">{t("stages.intro")}</p>
      <IndicatorWithTable
        workedExampleTitle={t("worked")}
        indicator={
          <FitSvg ref={fitRef} width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ direction: "ltr" }} role="img" aria-label={t("stages.title")} className="max-w-full">
            <rect x={L} y={44} width={W - L - R} height={36} rx={6} fill="currentColor" fillOpacity={0.07} />
            {stages.map((s, i) => {
              const w = s.days * unit;
              const x0 = starts[i];
              if (w <= 0) return null;
              return (
                <g key={s.stage}>
                  <rect x={x0} y={44} width={w} height={36} fill={STAGE_COLORS[s.stage]} fillOpacity={s.complete ? 0.85 : 1} style={{ transition: "all 500ms ease" }} />
                  {w > 34 && (
                    <text style={{ fontSize: svgPx(12) }} x={x0 + w / 2} y={66} textAnchor="middle" fontWeight={800} fill="white">
                      {f.int(s.days)}
                    </text>
                  )}
                  <text style={{ fontSize: svgPx(12) }} x={x0 + w / 2} y={i % 2 ? 100 : 34} textAnchor="middle" fontWeight={700} fill={STAGE_COLORS[s.stage]}>
                    {tStage(s.stage)}
                  </text>
                </g>
              );
            })}
            <line x1={L + horizon * unit} x2={L + horizon * unit} y1={38} y2={86} stroke={AGE_COLORS.danger} strokeDasharray="3 2" />
            <text style={{ fontSize: svgPx(12) }} x={W - R} y={H - 22} textAnchor="end" fill={AGE_COLORS.danger}>
              {t("stages.horizon", { y: f.num(life.lifeExpectancyYears, 1) })}
            </text>
            <text style={{ fontSize: svgPx(12) }} x={L} y={H - 6} className={axisText}>{r.birth.year}</text>
            <text style={{ fontSize: svgPx(12) }} x={W - R} y={H - 6} textAnchor="end" className={axisText}>{td("result.days")}: {f.int(r.totalDays)}</text>
          </FitSvg>
        }
        rows={[
          ...stages
            .filter((s) => s.days > 0)
            .map((s) => ({
              label: `${tStage(s.stage)} (${s.toAge === null ? `${s.fromAge}+` : `${s.fromAge}–${s.toAge}`})`,
              value: f.int(s.days),
              note: `${f.pct(s.days / Math.max(1, r.totalDays))}${s.complete ? "" : ` · ${t("stages.ongoing")}`}`,
            })),
          { label: t("stages.current"), value: tStage(current.stage), emphasize: true },
        ]}
      />
    </SectionCard>
  );
}

/* 6 · Share of average life expectancy (gradient gauge, sex toggle) */
export function AgeLifeGaugeCard({ state, setState, d, f }: IndicatorProps) {
  const t = useIndicatorT();
  const td = useDualT();
  const { report: r } = d;
  const life = computeLifeExpectancyProgress(r.gregorian.decimalYears, state.sex);
  const W = 320;
  const H = 200;
  const cx = W / 2;
  const cy = 160;
  const R = 120;
  const p = life.percentElapsed / 100;
  const ang = Math.PI * (1 - p);
  const nx = cx + Math.cos(ang) * (R - 18);
  const ny = cy - Math.sin(ang) * (R - 18);
  const arc = (a0: number, a1: number) =>
    `M ${cx + Math.cos(a0) * R} ${cy - Math.sin(a0) * R} A ${R} ${R} 0 0 1 ${cx + Math.cos(a1) * R} ${cy - Math.sin(a1) * R}`;
  const stops = ["#22c55e", "#84cc16", "#f59e0b", "#f97316", "#ef4444"];

  return (
    <SectionCard title={t("life.title")}>
      <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-300">{t("life.intro")}</p>
      <IndicatorWithTable
        workedExampleTitle={t("worked")}
        indicator={
          <div className="w-[320px] max-w-full">
            <PhoneMini slot={1} title={t("life.title")}>
            <FitSvg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ direction: "ltr" }} role="img" aria-label={t("life.title")} className="max-w-full">
              {stops.map((c, i) => (
                <path key={c} d={arc(Math.PI * (1 - i / 5), Math.PI * (1 - (i + 1) / 5))} stroke={c} strokeWidth={22} fill="none" />
              ))}
              {[0, 25, 50, 75, 100].map((v) => {
                const a = Math.PI * (1 - v / 100);
                return (
                  <text style={{ fontSize: svgPx(12) }} key={v} x={cx + Math.cos(a) * (R + 18)} y={cy - Math.sin(a) * (R + 18) + 3} textAnchor="middle" className={axisText}>
                    {f.int(v)}%
                  </text>
                );
              })}
              <line x1={cx} y1={cy} x2={nx} y2={ny} stroke="currentColor" strokeWidth={3} strokeLinecap="round" style={{ transition: "all 600ms ease" }} />
              <circle cx={cx} cy={cy} r={7} fill="currentColor" />
              <text style={{ fontSize: svgPx(24) }} x={cx} y={cy - 40} textAnchor="middle" fontWeight={800} className={valueText}>
                {f.pct(p)}
              </text>
              <text style={{ fontSize: svgPx(12) }} x={cx} y={cy + 28} textAnchor="middle" className={axisText}>
                {t("life.of", { y: f.num(life.lifeExpectancyYears, 1) })}
              </text>
            </FitSvg>
            </PhoneMini>
            <div role="radiogroup" className="mx-auto mt-1 grid w-48 grid-cols-2 gap-1 rounded-lg bg-zinc-100 p-1 dark:bg-zinc-800" data-bp-inner>
              {(["male", "female"] as Gender[]).map((g) => (
                <button
                  key={g}
                  type="button"
                  role="radio"
                  aria-checked={state.sex === g}
                  onClick={() => setState({ ...state, sex: g })}
                  className={`rounded-md px-2 py-1 text-xs font-semibold transition ${state.sex === g ? "bg-blue-600 text-white" : "text-zinc-600 hover:bg-white dark:text-zinc-300 dark:hover:bg-zinc-700"}`}
                >
                  {td(`input.${g}`)}
                </button>
              ))}
            </div>
          </div>
        }
        rows={[
          { label: td("result.decimal"), value: f.num(r.gregorian.decimalYears) },
          { label: t("life.expectancy"), value: f.num(life.lifeExpectancyYears, 1), note: t("life.source") },
          { label: t("life.elapsed"), value: f.pct(p), note: `${f.num(r.gregorian.decimalYears)} ÷ ${f.num(life.lifeExpectancyYears, 1)}` },
          { label: t("life.remaining"), value: f.num(life.yearsRemaining, 1), note: t("life.remainingDays", { n: f.int(life.daysRemaining) }), emphasize: true },
        ]}
      />
    </SectionCard>
  );
}

/* 7 · Age in every unit on one log ladder (log-scale magnitude bar) */
export function AgeUnitsLadderCard({ d, f }: IndicatorProps) {
  const t = useIndicatorT();
  const { report: r } = d;
  const units = [
    { key: "years", v: r.gregorian.years, color: AGE_COLORS.gregorian },
    { key: "months", v: r.gregorian.totalMonths, color: "#0891b2" },
    { key: "weeks", v: r.totalWeeks, color: AGE_COLORS.hijri },
    { key: "days", v: r.totalDays, color: "#84cc16" },
    { key: "hours", v: r.totalHours, color: AGE_COLORS.accent },
    { key: "minutes", v: r.totalMinutes, color: "#f97316" },
    { key: "seconds", v: r.totalSeconds, color: "#ef4444" },
  ];
  const [fitRef, W] = useFitWidth(400);
  const H = 240;
  const L = 30;
  const R = 10;
  const maxExp = 10;
  const x = (v: number) => L + (Math.log10(Math.max(1, v)) / maxExp) * (W - L - R);
  const RH = 27;

  return (
    <SectionCard title={t("units.title")}>
      <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-300">{t("units.intro")}</p>
      <IndicatorWithTable
        workedExampleTitle={t("worked")}
        indicator={
          <FitSvg ref={fitRef} width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ direction: "ltr" }} role="img" aria-label={t("units.title")} className="max-w-full">
            {Array.from({ length: maxExp + 1 }, (_, e) => (
              <g key={e}>
                <line x1={x(10 ** e)} x2={x(10 ** e)} y1={4} y2={H - 18} stroke="currentColor" strokeOpacity={e % 3 === 0 ? 0.25 : 0.1} />
                <text style={{ fontSize: svgPx(12) }} x={x(10 ** e)} y={H - 4} textAnchor={e === maxExp ? "end" : "middle"} className={axisText}>{`10${["⁰", "¹", "²", "³", "⁴", "⁵", "⁶", "⁷", "⁸", "⁹", "¹⁰"][e]}`}</text>
              </g>
            ))}
            {units.map((u, i) => {
              const y = 6 + i * RH;
              const xe = x(u.v);
              return (
                <g key={u.key}>
                  <rect x={L} y={y} width={Math.max(2, xe - L)} height={RH - 9} rx={4} fill={u.color} fillOpacity={0.85} style={{ transition: "width 500ms ease" }} />
                  <text style={{ fontSize: svgPx(12) }} x={L + 4} y={y + 13} fontWeight={800} fill="white">{t(`units.${u.key}`)}</text>
                  <text style={{ fontSize: svgPx(12) }} x={Math.min(xe + 4, W - R)} y={y + 13} textAnchor={xe > W - 90 ? "end" : "start"} fontWeight={800} className={xe > W - 90 ? "fill-white" : valueText} dx={xe > W - 90 ? -8 : 0}>
                    {f.int(u.v)}
                  </text>
                </g>
              );
            })}
          </FitSvg>
        }
        rows={[
          { label: t("units.days"), value: f.int(r.totalDays), note: `${f.iso(r.reference)} − ${f.iso(r.birth)}` },
          { label: t("units.weeks"), value: f.int(r.totalWeeks), note: `⌊${f.int(r.totalDays)} ÷ 7⌋` },
          { label: t("units.hours"), value: f.int(r.totalHours), note: `${f.int(r.totalDays)} × 24` },
          { label: t("units.minutes"), value: f.int(r.totalMinutes), note: `${f.int(r.totalHours)} × 60` },
          { label: t("units.seconds"), value: f.int(r.totalSeconds), note: `${f.int(r.totalMinutes)} × 60`, emphasize: true },
        ]}
      />
    </SectionCard>
  );
}

/* 8 · How the age is computed, step by step (formula diagram) */
export function AgeFormulaCard({ d, f }: IndicatorProps) {
  const t = useIndicatorT();
  const td = useDualT();
  const { report: r } = d;
  const g = r.gregorian;
  const h = r.hijri;
  const W = 400;
  const H = h ? 230 : 120;
  const box = (x: number, y: number, w: number, top: string, bottom: string, color: string) => (
    <g>
      <rect x={x} y={y} width={w} height={44} rx={8} fill={color} fillOpacity={0.12} stroke={color} strokeWidth={1.5} />
      <text x={x + w / 2} y={y + 18} textAnchor="middle" style={{ fontSize: svgPx(11) }} fontWeight={800} fill={color}>{top}</text>
      <text x={x + w / 2} y={y + 34} textAnchor="middle" style={{ fontSize: svgPx(9) }} className={valueText}>{bottom}</text>
    </g>
  );
  const arrow = (x1: number, x2: number, y: number, text: string, color: string) => (
    <g>
      <line x1={x1} x2={x2 - 4} y1={y} y2={y} stroke={color} strokeWidth={1.5} />
      <path d={`M ${x2 - 6} ${y - 4} L ${x2} ${y} L ${x2 - 6} ${y + 4} Z`} fill={color} />
      <text x={(x1 + x2) / 2} y={y - 6} textAnchor="middle" style={{ fontSize: svgPx(10) }} fontWeight={800} fill={color}>{text}</text>
    </g>
  );
  const chain = (y: number, color: string, a: typeof g, fmt: (c: typeof r.birth) => string, anchor: string) => (
    <g>
      {box(0, y, 82, td("result.birth"), fmt(r.birth), color)}
      {arrow(82, 106, y + 22, `+${f.int(a.years)}`, color)}
      {box(106, y, 82, td("result.lastBirthday"), fmt(a.lastBirthdayGregorian), color)}
      {arrow(188, 212, y + 22, `+${f.int(a.months)}`, color)}
      {box(212, y, 82, t("formula.anchor"), anchor, color)}
      {arrow(294, 318, y + 22, `+${f.int(a.days)}`, color)}
      {box(318, y, 82, td("result.reference"), fmt(r.reference), color)}
    </g>
  );
  const anchorOf = (a: typeof g) => {
    // Anchor = last birthday + whole months, i.e. reference − remaining days.
    const n = Date.UTC(r.reference.year, r.reference.month - 1, r.reference.day) - a.days * 86_400_000;
    const dt = new Date(n);
    return { year: dt.getUTCFullYear(), month: dt.getUTCMonth() + 1, day: dt.getUTCDate() };
  };

  return (
    <SectionCard title={t("formula.title")}>
      <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-300">{t("formula.intro")}</p>
      <IndicatorWithTable
        workedExampleTitle={t("worked")}
        indicator={
          <FitSvg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ direction: "ltr" }} role="img" aria-label={t("formula.title")} data-annotation="" className="max-w-full">
            <text x={0} y={14} style={{ fontSize: svgPx(11) }} fontWeight={800} fill={AGE_COLORS.gregorian}>
              {td("cal.gregorian")} = {td("ymd", { y: f.int(g.years), m: f.int(g.months), d: f.int(g.days) })}
            </text>
            {chain(24, AGE_COLORS.gregorian, g, f.iso, f.iso(anchorOf(g)))}
            <text x={0} y={92} style={{ fontSize: svgPx(9) }} className={axisText}>
              {t("formula.legend")}
            </text>
            {h && (
              <>
                <text x={0} y={128} style={{ fontSize: svgPx(11) }} fontWeight={800} fill={AGE_COLORS.hijri}>
                  {td("cal.hijri")} = {td("ymd", { y: f.int(h.years), m: f.int(h.months), d: f.int(h.days) })}
                </text>
                {chain(138, AGE_COLORS.hijri, h, f.hijri, f.hijri(anchorOf(h)))}
                <text x={0} y={206} style={{ fontSize: svgPx(9) }} className={axisText}>
                  {t("formula.hijriLegend")}
                </text>
              </>
            )}
          </FitSvg>
        }
        rows={[
          { label: t("formula.wholeYears"), value: f.int(g.years), note: `${f.iso(r.birth)} → ${f.iso(g.lastBirthdayGregorian)}` },
          { label: t("formula.wholeMonths"), value: f.int(g.months), note: `${f.iso(g.lastBirthdayGregorian)} → ${f.iso(anchorOf(g))}` },
          { label: t("formula.remainingDays"), value: f.int(g.days), note: `${f.iso(anchorOf(g))} → ${f.iso(r.reference)}` },
          { label: td("input.leapRule"), value: r.leapRule === "feb28" ? td("input.leapFeb28") : td("input.leapMar1"), note: t("formula.ruleNote") },
          ...(h ? [{ label: td("cal.hijri"), value: td("ymd", { y: f.int(h.years), m: f.int(h.months), d: f.int(h.days) }), emphasize: true }] : []),
        ]}
      />
    </SectionCard>
  );
}
