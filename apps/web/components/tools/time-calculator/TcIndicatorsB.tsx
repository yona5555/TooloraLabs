"use client";
import { tcRoundDuration, tcToDecimalHours } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import IndicatorWithTable from "@/components/tool-ui/IndicatorWithTable";
import { px2 } from "@/components/tool-ui/indicator-kit/SvgBits";
import { WeekBars } from "./TcDrawings";
import { useIndT } from "./TcIndicatorsA";
import { useTcPhrases } from "./TcResult";
import { C, INCREMENTS, type CardProps } from "./state";
import PhoneMini from "@/components/tool-ui/indicator-kit/PhoneMini";
import { svgPx } from "@/components/tool-ui/svgPx";

const axisText = "fill-zinc-500 dark:fill-zinc-400";
const valueText = "fill-zinc-800 dark:fill-zinc-100";

/* 5 · Hours per day (labeled bar chart; click a day to switch it on or off) */
export function TcWeekBarsCard({ s, set, d, f }: CardProps) {
  const t = useIndT();
  const { t: tc } = useTcPhrases();
  const w = d.week;
  const toggle = (wd: number) => set({ week: { ...s.week, days: s.week.days.map((x, j) => (j === wd ? { ...x, on: !x.on } : x)) } });
  const longest = w.days.find((x) => x.weekday === w.longestWeekday);
  return (
    <SectionCard title={t("week.title")}>
      <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-300">{t("week.intro")}</p>
      <IndicatorWithTable
        workedExampleTitle={t("worked")}
        indicator={
          <div className="w-[420px] max-w-full">
            <WeekBars
              width={420}
              height={250}
              days={w.days.map((x) => ({ key: x.weekday, label: f.weekday(x.weekday), regular: x.regularSeconds, overtime: x.overtimeSeconds, on: x.on, overnight: x.overnight }))}
              dailyThreshold={s.week.basis === "daily" ? d.dailyThreshold : null}
              fmt={f.durHm}
              onToggle={toggle}
              ariaLabel={t("week.title")}
              offLabel={tc("result.off")}
            />
            <p className="mt-1 flex flex-wrap items-center justify-center gap-3 text-[11px] text-zinc-500 dark:text-zinc-400">
              <span className="flex items-center gap-1"><span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: C.main }} />{tc("result.regular")}</span>
              <span className="flex items-center gap-1"><span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: C.ot }} />{tc("result.overtime")}</span>
              <span>{t("week.hint")}</span>
            </p>
          </div>
        }
        rows={[
          ...w.days.filter((x) => x.on).map((x) => ({
            label: `${f.weekday(x.weekday)}${x.overnight ? " ☾" : ""}`,
            value: f.durHm(x.workedSeconds),
            note: x.overtimeSeconds ? `${tc("result.overtime")} +${f.durHm(x.overtimeSeconds)}` : undefined,
          })),
          ...(longest ? [{ label: t("week.longest"), value: f.weekday(longest.weekday), note: f.durHm(longest.workedSeconds) }] : []),
          { label: tc("result.weekTotal"), value: `${f.durHm(w.totalSeconds)} · ${f.hours(w.totalSeconds)} h`, emphasize: true },
        ]}
      />
    </SectionCard>
  );
}

/* 6 · Weekly hours gauge with an overtime-threshold slider (gradient gauge) */
export function TcOvertimeGaugeCard({ s, set, d, f }: CardProps) {
  const t = useIndT();
  const { t: tc } = useTcPhrases();
  const w = d.week;
  const total = w.totalSeconds / 3600;
  const th = d.weeklyThreshold / 3600;
  const LIMIT = 48; // EU Working Time Directive: 48 h average per week including overtime.
  const max = Math.max(60, Math.ceil((total * 1.15) / 10) * 10);
  const W = 320;
  const H = 200;
  const cx = 160;
  const cy = 165;
  const r = 120;
  const pt = (v: number, rr: number) => {
    const a = Math.PI * (1 - Math.min(max, Math.max(0, v)) / max);
    return { x: px2(cx + rr * Math.cos(a)), y: px2(cy - rr * Math.sin(a)) };
  };
  const arc = (a: number, b: number) => {
    const p = pt(a, r);
    const q = pt(b, r);
    return `M ${p.x} ${p.y} A ${r} ${r} 0 0 1 ${q.x} ${q.y}`;
  };
  const zones = [
    { from: 0, to: Math.min(th, max), color: C.add },
    { from: Math.min(th, max), to: Math.max(Math.min(th, max), Math.min(LIMIT, max)), color: C.ot },
    { from: Math.max(th, LIMIT), to: max, color: C.sub },
  ].filter((z) => z.to > z.from);
  const needle = pt(total, r - 22);
  const status = total <= th ? t("gauge.regular") : total <= LIMIT ? t("gauge.overtime") : t("gauge.excess");
  return (
    <SectionCard title={t("gauge.title")}>
      <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-300">{t("gauge.intro")}</p>
      <IndicatorWithTable
        workedExampleTitle={t("worked")}
        indicator={
          <PhoneMini slot={1} title={t("gauge.title")}>
            <div className="w-[320px] max-w-full">
              <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ direction: "ltr" }} role="img" aria-label={t("gauge.title")} className="max-w-full">
                {zones.map((z, i) => (
                  <path key={i} d={arc(z.from, z.to)} fill="none" stroke={z.color} strokeWidth={22} />
                ))}
                {[0, th, LIMIT, max].filter((v, i, a) => a.indexOf(v) === i && v <= max).map((v) => {
                  const p = pt(v, r + 18);
                  return (
                    <text style={{ fontSize: svgPx(12) }} key={v} x={p.x} y={p.y + 3} textAnchor="middle" fontWeight={v === th ? 800 : 500} className={axisText}>{`${f.num(v, 1)}h`}</text>
                  );
                })}
                <line x1={cx} y1={cy} x2={needle.x} y2={needle.y} stroke="currentColor" strokeWidth={3} strokeLinecap="round" style={{ transition: "all 400ms ease" }} />
                <circle cx={cx} cy={cy} r={6} fill="currentColor" />
                <text style={{ fontSize: svgPx(20) }} x={cx} y={cy - 40} textAnchor="middle" fontWeight={800} className={valueText}>{f.durHm(w.totalSeconds)}</text>
                <text style={{ fontSize: svgPx(12) }} x={cx} y={cy - 24} textAnchor="middle" fontWeight={700} fill={total <= th ? C.add : total <= LIMIT ? C.ot : C.sub}>{status}</text>
              </svg>
              <label className="mt-1 block text-xs font-semibold text-zinc-600 dark:text-zinc-300">
                {tc("input.weeklyH")}: <span dir="ltr" className="font-mono text-blue-700 dark:text-blue-300">{f.num(th, 1)} h</span>
                <input
                  type="range"
                  min={30}
                  max={60}
                  step={0.5}
                  value={Math.min(60, Math.max(30, th))}
                  onChange={(e) => set({ week: { ...s.week, weeklyH: e.target.value, basis: "weekly" } })}
                  className="mt-1 w-full accent-blue-600"
                />
              </label>
            </div>
          </PhoneMini>
        }
        rows={[
          { label: tc("result.weekTotal"), value: f.dur(w.totalSeconds) },
          { label: tc("result.threshold"), value: `${f.num(th, 1)} h`, note: s.week.basis === "daily" ? t("gauge.dailyNote") : undefined },
          { label: tc("result.overtime"), value: f.dur(w.overtimeSeconds), note: `× ${f.num(d.multiplier)}` },
          { label: t("gauge.limit"), value: `${LIMIT} h`, note: total > LIMIT ? `+${f.num(total - LIMIT, 2)} h` : `−${f.num(LIMIT - total, 2)} h` },
          { label: tc("result.paidEq"), value: `${f.hours(w.paidEquivalentSeconds)} h`, emphasize: true },
        ]}
      />
    </SectionCard>
  );
}

/* 7 · Minutes ⇄ decimal hours (side-by-side equivalence rulers with a minutes slider) */
export function TcDecimalCard({ s, set, d, f }: CardProps) {
  const t = useIndT();
  const { t: tc } = useTcPhrases();
  const sec = d.dec.seconds;
  const whole = Math.floor(sec / 3600);
  const mins = (sec % 3600) / 60;
  const W = 420;
  const H = 170;
  const L = 16;
  const x = (m: number) => L + (m / 60) * (W - 2 * L);
  const decStr = (sec2: number) => f.num(tcToDecimalHours(sec2, 2));
  // The classic payroll mistake: reading "h.mm" as if it were h:mm.
  const misread = whole * 3600 + Math.round((tcToDecimalHours(sec, 2) - whole) * 100) * 60;
  return (
    <SectionCard title={t("decimal.title")}>
      <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-300">{t("decimal.intro")}</p>
      <IndicatorWithTable
        workedExampleTitle={t("worked")}
        indicator={
          <div className="w-[420px] max-w-full">
            <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ direction: "ltr" }} role="img" aria-label={t("decimal.title")} className="max-w-full">
              <text style={{ fontSize: svgPx(12) }} x={L} y={16} fontWeight={700} fill={C.main}>{t("decimal.minutesRuler")}</text>
              <text style={{ fontSize: svgPx(12) }} x={L} y={154} fontWeight={700} fill={C.ot}>{t("decimal.decimalRuler")}</text>
              <rect x={L} y={26} width={x(mins) - L} height={22} fill={C.main} fillOpacity={0.75} style={{ transition: "all 300ms ease" }} />
              <rect x={L} y={26} width={W - 2 * L} height={22} fill="none" stroke="currentColor" strokeOpacity={0.3} />
              <rect x={L} y={112} width={x(mins) - L} height={22} fill={C.ot} fillOpacity={0.75} style={{ transition: "all 300ms ease" }} />
              <rect x={L} y={112} width={W - 2 * L} height={22} fill="none" stroke="currentColor" strokeOpacity={0.3} />
              {Array.from({ length: 13 }, (_, i) => i * 5).map((m) => (
                <g key={m}>
                  <line x1={x(m)} x2={x(m)} y1={48} y2={112} stroke="currentColor" strokeOpacity={m % 15 === 0 ? 0.35 : 0.12} strokeDasharray={m % 15 === 0 ? undefined : "2 3"} />
                  <text style={{ fontSize: svgPx(12) }} x={x(m)} y={62} textAnchor="middle" className={axisText}>{`${m}′`}</text>
                  <text style={{ fontSize: svgPx(12) }} x={x(m)} y={104} textAnchor="middle" className={axisText}>{f.num(m / 60, 2).replace(/^0/, "")}</text>
                </g>
              ))}
              <line x1={x(mins)} x2={x(mins)} y1={20} y2={140} stroke="currentColor" strokeWidth={2} />
              <rect x={Math.min(W - 92, Math.max(4, x(mins) - 44))} y={72} width={88} height={20} rx={10} className="fill-white dark:fill-zinc-900" stroke="currentColor" strokeOpacity={0.4} />
              <text style={{ fontSize: svgPx(12) }} x={Math.min(W - 48, Math.max(48, x(mins)))} y={86} textAnchor="middle" fontWeight={800} className={valueText}>{`${f.num(mins, 1)}′ = ${f.num((mins / 60), 3).replace(/^0/, "")}`}</text>
            </svg>
            <label className="mt-1 block text-xs font-semibold text-zinc-600 dark:text-zinc-300">
              {t("decimal.slider")}: <span dir="ltr" className="font-mono text-blue-700 dark:text-blue-300">{f.dur(sec)}</span>
              <input
                type="range"
                min={0}
                max={59}
                step={1}
                value={Math.floor(mins)}
                onChange={(e) => {
                  const m = Number(e.target.value);
                  set({ dec: { ...s.dec, dir: "toHms", decimal: String(Math.round((whole + m / 60) * 10000) / 10000) } });
                }}
                className="mt-1 w-full accent-blue-600"
              />
            </label>
          </div>
        }
        rows={[
          { label: tc("result.hms"), value: f.dur(sec) },
          { label: tc("result.decimal"), value: `${decStr(sec)} h`, note: `${whole} + ${f.num(mins, 2)} ÷ 60` },
          { label: tc("result.minutes"), value: f.num(sec / 60, 1), note: `${f.num(tcToDecimalHours(sec, 4), 4)} × 60` },
          { label: t("decimal.misread", { v: decStr(sec) }), value: f.durHm(misread), note: t("decimal.misreadNote", { d: f.signedDur(misread - sec) }) },
          { label: t("decimal.quarter"), value: "0:15 = 0.25 · 0:45 = 0.75", emphasize: true },
        ]}
      />
    </SectionCard>
  );
}

/* 8 · Payroll rounding trio (round down / nearest / up of the week total) */
export function TcRoundingTrioCard({ s, set, d, f }: CardProps) {
  const t = useIndT();
  const { t: tc } = useTcPhrases();
  const base = d.week.totalSeconds;
  const modes = ["down", "nearest", "up"] as const;
  const vals = modes.map((m) => ({ m, v: tcRoundDuration(base, s.dec.inc, m) }));
  const maxDiff = Math.max(60, ...vals.map((v) => Math.abs(v.v - base)));
  const colors = { down: C.sub, nearest: C.main, up: C.add };
  return (
    <SectionCard title={t("trio.title")}>
      <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-300">{t("trio.intro")}</p>
      <IndicatorWithTable
        workedExampleTitle={t("worked")}
        indicator={
          <div className="w-[420px] max-w-full">
            <div className="mb-2 flex flex-wrap gap-1.5">
              {INCREMENTS.map((i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => set({ dec: { ...s.dec, inc: i } })}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition ${s.dec.inc === i ? "bg-blue-600 text-white" : "border border-zinc-300 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"}`}
                >
                  {tc("input.minutesN", { n: i })}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-2">
              {vals.map(({ m, v }) => {
                const diff = v - base;
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => set({ dec: { ...s.dec, round: m } })}
                    className={`rounded-xl border-2 p-2 text-center transition ${s.dec.round === m ? "border-blue-600 bg-blue-50 dark:bg-blue-500/10" : "border-zinc-200 dark:border-zinc-700"}`}
                  >
                    <p className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">{tc(`round.${m}`)}</p>
                    <p dir="ltr" className="font-mono text-lg font-bold text-zinc-900 dark:text-zinc-100">{f.durHm(v)}</p>
                    <p dir="ltr" className="font-mono text-xs text-zinc-500 dark:text-zinc-400">{f.num(v / 3600)} h</p>
                    <svg width="100%" height="36" viewBox="0 0 100 36" className="mt-1" style={{ direction: "ltr" }}>
                      <line x1={50} x2={50} y1={2} y2={34} stroke="currentColor" strokeOpacity={0.35} />
                      <rect x={diff < 0 ? 50 - (Math.abs(diff) / maxDiff) * 46 : 50} y={10} width={Math.max(1, (Math.abs(diff) / maxDiff) * 46)} height={16} rx={3} fill={colors[m]} style={{ transition: "all 300ms ease" }} />
                    </svg>
                    <p dir="ltr" className="text-xs font-bold" style={{ color: colors[m] }}>{f.signedDur(diff).replace(/:00$/, "")}</p>
                  </button>
                );
              })}
            </div>
          </div>
        }
        rows={[
          { label: tc("result.weekTotal"), value: f.dur(base), note: `${f.hours(base, 4)} h` },
          ...vals.map(({ m, v }) => ({ label: tc(`round.${m}`), value: f.durHm(v), note: t("trio.perYear", { d: f.signedDur((v - base) * 52).replace(/:\d\d$/, "") }) })),
          { label: t("trio.chosen"), value: `${f.num(vals.find((x) => x.m === s.dec.round)!.v / 3600)} h`, emphasize: true },
        ]}
      />
    </SectionCard>
  );
}
