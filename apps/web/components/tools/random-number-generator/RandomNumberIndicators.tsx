"use client";
import { useMemo, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import {
  ENTROPY_ZONES,
  appearanceProbability,
  chiSquareCritical,
  duplicateProbability,
  entropyZone,
  exactCombination,
  expectedDistinct,
  log10OutcomeSpace,
  log10OutcomesFor,
  moduloBias,
  rangeSize,
  runningMeans,
  sumDistribution,
  type ChiSquareResult,
  type HistogramBin,
  type SampleStats,
} from "@tooloralabs/tools";
import IndicatorCard from "@/components/tools/markets/IndicatorCard";
import SemiGauge from "@/components/tools/markets/SemiGauge";
import SensitivityBars from "@/components/tools/markets/SensitivityBars";
import { pc, type RngFormatters } from "./format";
import { PRESETS, type PresetKey } from "./types";

/** Everything the indicators read about the current draw, computed once by the page. */
export type Draw = {
  lo: number;
  hi: number;
  n: number;
  k: number;
  drawn: number[];
  sum: number;
  allowDuplicates: boolean;
  sorted: boolean;
  bins: HistogramBin[];
  chi: ChiSquareResult;
  stats: SampleStats;
  mu: number;
  sigma: number;
};

export type IndicatorProps = { d: Draw | null; f: RngFormatters };

function useInd() {
  return useTranslations("tools.random-number-generator.ind");
}

/** Shown in place of an indicator while the inputs are invalid. */
export function EmptyIndicator() {
  const t = useInd();
  return <p className="mt-4 rounded-xl border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">{t("empty")}</p>;
}

const fallbackOf = (d: Draw | null): ReactNode => (d ? undefined : <EmptyIndicator />);
const LOG2_10 = Math.log2(10);

/* 1 — §31 type 1: observed count per bin with the uniform expectation on every bar. */
export function FrequencyHistogram({ d, f }: IndicatorProps) {
  const t = useInd();
  if (!d) return <IndicatorCard id="histogram" title={t("hist.title")} heading={t("hist.title")} intro={t("hist.intro")} fallback={fallbackOf(d)} worked={null}>{null}</IndicatorCard>;
  const scale = Math.max(...d.bins.map((b) => Math.max(b.count, b.expected)), 1) * 1.12;
  const fullest = d.bins.reduce((a, b) => (b.count > a.count ? b : a));
  const emptiest = d.bins.reduce((a, b) => (b.count < a.count ? b : a));
  const span = (b: HistogramBin) => (b.from === b.to ? f.int(b.from) : `${f.int(b.from)}–${f.int(b.to)}`);
  return (
    <IndicatorCard
      id="histogram"
      title={t("hist.title")}
      heading={t("hist.heading", { count: f.int(d.k), bins: f.int(d.bins.length) })}
      intro={t("hist.intro")}
      worked={{
        title: t("worked"),
        rows: [
          { label: t("hist.rowRange"), value: `${f.int(d.hi)} − ${f.int(d.lo)} + 1 = ${f.int(d.n)}` },
          { label: t("hist.rowBins"), value: f.int(d.bins.length) },
          { label: t("hist.rowExpected"), value: `${f.int(d.k)} × ${f.int(d.bins[0].to - d.bins[0].from + 1)} ÷ ${f.int(d.n)} = ${f.num(d.bins[0].expected, 2)}` },
          { label: t("hist.rowEmptiest"), value: `${span(emptiest)} · ${f.int(emptiest.count)}` },
          { label: t("hist.rowFullest"), value: `${span(fullest)} · ${f.int(fullest.count)}`, emphasize: true },
        ],
      }}
    >
      <div dir="ltr" className="flex h-56 items-end gap-1.5" data-testid="ind-histogram">
        {d.bins.map((b) => (
          <div key={b.from} className="flex h-full min-w-0 flex-1 flex-col">
            <div className="relative flex flex-1 flex-col justify-end">
              <span className="mb-1 text-center font-mono text-xs font-bold text-zinc-800 dark:text-zinc-100">{f.int(b.count)}</span>
              <div className="rounded-t-md bg-gradient-to-t from-blue-700 to-blue-500 transition-all duration-500" style={{ height: pc((b.count / scale) * 100) }} />
              <div className="absolute inset-x-0 border-t-2 border-dashed border-amber-500" style={{ bottom: pc((b.expected / scale) * 100) }} />
            </div>
            <span className="mt-1 truncate text-center font-mono text-[10px] leading-tight text-zinc-500 dark:text-zinc-400">{f.int(b.from)}</span>
            {b.to !== b.from && <span className="truncate text-center font-mono text-[10px] leading-tight text-zinc-400">{f.int(b.to)}</span>}
          </div>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-4 text-xs text-zinc-500 dark:text-zinc-400">
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-sm bg-blue-600" />
          {t("hist.legendObserved")}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-4 border-t-2 border-dashed border-amber-500" />
          {t("hist.legendExpected")}
        </span>
      </div>
    </IndicatorCard>
  );
}

/* 2 — §31 type 7: running average converging on μ inside its ±2 standard-error funnel. */
export function RunningAverage({ d, f }: IndicatorProps) {
  const t = useInd();
  const pts = useMemo(() => (d ? runningMeans(d.drawn, 180) : []), [d]);
  if (!d) return <IndicatorCard id="running-average" title={t("mean.title")} heading={t("mean.title")} intro={t("mean.intro")} fallback={fallbackOf(d)} worked={null}>{null}</IndicatorCard>;
  const W = 480;
  const H = 230;
  const L = 48;
  const R = 12;
  const T = 14;
  const B = 28;
  const span = d.hi - d.lo || 1;
  const x = (i: number) => L + (d.k <= 1 ? 0.5 : (i - 1) / (d.k - 1)) * (W - L - R);
  const y = (v: number) => T + (1 - (v - d.lo) / span) * (H - T - B);
  const clampY = (v: number) => y(Math.min(d.hi, Math.max(d.lo, v)));
  const band = Array.from({ length: 60 }, (_, j) => 1 + ((d.k - 1) * j) / 59);
  const se = (i: number) => (2 * d.sigma) / Math.sqrt(i);
  const funnel = [...band.map((i) => `${x(i)},${clampY(d.mu + se(i))}`), ...band.reverse().map((i) => `${x(i)},${clampY(d.mu - se(i))}`)].join(" ");
  const last = pts[pts.length - 1];
  const finalSe = d.sigma / Math.sqrt(d.k);
  const dev = d.stats.mean - d.mu;
  return (
    <IndicatorCard
      id="running-average"
      title={t("mean.title")}
      heading={t("mean.heading", { mu: f.num(d.mu, 2) })}
      intro={t("mean.intro")}
      worked={{
        title: t("worked"),
        rows: [
          { label: t("mean.rowMu"), value: `(${f.int(d.lo)} + ${f.int(d.hi)}) ÷ 2 = ${f.num(d.mu, 2)}` },
          { label: t("mean.rowFinal"), value: `${f.num(d.sum)} ÷ ${f.int(d.k)} = ${f.num(d.stats.mean, 2)}` },
          { label: t("mean.rowDev"), value: f.num(dev, 2) },
          { label: t("mean.rowSe"), value: `${f.num(d.sigma, 2)} ÷ √${f.int(d.k)} = ${f.num(finalSe, 2)}` },
          { label: t("mean.rowZ"), value: finalSe > 0 ? f.num(dev / finalSe, 2) : "—", emphasize: true },
        ],
      }}
    >
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="h-auto max-w-full" role="img" aria-label={t("mean.title")} data-testid="ind-running-average">
        <polygon points={funnel} className="fill-amber-400/20" />
        {[d.lo, d.mu, d.hi].map((v) => (
          <g key={v}>
            <line x1={L} x2={W - R} y1={y(v)} y2={y(v)} className={v === d.mu ? "stroke-amber-500" : "stroke-zinc-200 dark:stroke-zinc-700"} strokeDasharray={v === d.mu ? "5 4" : undefined} strokeWidth={v === d.mu ? 2 : 1} />
            <text x={L - 6} y={y(v) + 3} textAnchor="end" className={`font-mono text-[13px] ${v === d.mu ? "fill-amber-600 dark:fill-amber-400" : "fill-zinc-400"}`}>
              {f.num(v, 1)}
            </text>
          </g>
        ))}
        <polyline points={pts.map((p) => `${x(p.index)},${clampY(p.mean)}`).join(" ")} fill="none" strokeWidth={2.5} className="stroke-blue-600 dark:stroke-blue-400" strokeLinejoin="round" />
        {last && (
          <g>
            <circle cx={x(last.index)} cy={clampY(last.mean)} r={6} className="fill-blue-600 stroke-white dark:fill-blue-400 dark:stroke-zinc-900" strokeWidth={2} />
            <text x={x(last.index) - 8} y={clampY(last.mean) - 10} textAnchor="end" className="fill-blue-700 font-mono text-[14px] font-bold dark:fill-blue-300">
              {f.num(last.mean, 2)}
            </text>
          </g>
        )}
        <text x={L} y={H - 8} className="fill-zinc-400 font-mono text-[13px]">1</text>
        <text x={W - R} y={H - 8} textAnchor="end" className="fill-zinc-400 font-mono text-[13px]">{f.int(d.k)}</text>
        <text x={(L + W - R) / 2} y={H - 8} textAnchor="middle" className="fill-zinc-400 text-[13px]">{t("mean.axisDraws")}</text>
      </svg>
      <div className="mt-2 flex flex-wrap gap-4 text-xs text-zinc-500 dark:text-zinc-400">
        <span className="flex items-center gap-1.5"><span className="w-4 border-t-2 border-blue-600" />{t("mean.legendMean")}</span>
        <span className="flex items-center gap-1.5"><span className="w-4 border-t-2 border-dashed border-amber-500" />{t("mean.legendMu")}</span>
        <span className="flex items-center gap-1.5"><span className="h-3 w-4 rounded-sm bg-amber-400/30" />{t("mean.legendBand")}</span>
      </div>
    </IndicatorCard>
  );
}

/* 3 — §31 type 8: the χ² statistic on a gauge whose zones are the 5% and 1% critical values. */
export function UniformityGauge({ d, f }: IndicatorProps) {
  const t = useInd();
  const tR = useTranslations("tools.random-number-generator.result");
  if (!d) return <IndicatorCard id="uniformity" title={t("chi.title")} heading={t("chi.title")} intro={t("chi.intro")} fallback={fallbackOf(d)} worked={null}>{null}</IndicatorCard>;
  const c95 = chiSquareCritical(d.chi.df, 0.05);
  const c99 = chiSquareCritical(d.chi.df, 0.01);
  const max = chiSquareCritical(d.chi.df, 0.0005);
  const verdict = d.chi.pValue < 0.01 ? "uneven" : d.chi.pValue < 0.05 ? "borderline" : "even";
  return (
    <IndicatorCard
      id="uniformity"
      title={t("chi.title")}
      heading={t("chi.heading", { stat: f.num(d.chi.stat, 2), crit: f.num(c95, 2) })}
      intro={t("chi.intro")}
      worked={{
        title: t("worked"),
        rows: [
          { label: t("chi.rowFormula"), value: "Σ (O − E)² ÷ E" },
          { label: t("chi.rowDf"), value: `${f.int(d.bins.length)} − 1 = ${f.int(d.chi.df)}` },
          { label: t("chi.rowStat"), value: f.num(d.chi.stat, 3) },
          { label: t("chi.rowCrit"), value: f.num(c95, 3) },
          { label: t("chi.rowP"), value: f.num(d.chi.pValue, 4) },
          { label: t("chi.rowVerdict"), value: tR(`verdict.${verdict}`), emphasize: true, note: d.chi.minExpected < 5 ? t("chi.lowExpected") : undefined },
        ],
      }}
    >
      <div className="flex flex-col items-center" data-testid="ind-uniformity">
        <SemiGauge
          value={Math.min(d.chi.stat, max)}
          max={max}
          zones={[
            { to: c95, className: "stroke-emerald-500" },
            { to: c99, className: "stroke-amber-500" },
            { to: max, className: "stroke-red-500" },
          ]}
          ticks={[
            { value: 0, label: "0" },
            { value: c95, label: f.num(c95, 1) },
            { value: max, label: f.num(max, 0) },
          ]}
          ariaLabel={t("chi.title")}
        />
        <p dir="ltr" className="font-mono text-2xl font-bold text-zinc-900 dark:text-zinc-100">χ² = {f.num(d.chi.stat, 2)}</p>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">p = {f.num(d.chi.pValue, 3)}</p>
        <div className="mt-3 flex flex-wrap justify-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />{tR("verdict.even")}</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-amber-500" />{tR("verdict.borderline")}</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-red-500" />{tR("verdict.uneven")}</span>
        </div>
      </div>
    </IndicatorCard>
  );
}

/* 4 — §31 type 20: every drawn value on the range line, with the median, mean, μ and ±1 SD band pinned. */
export function SpreadInRange({ d, f }: IndicatorProps) {
  const t = useInd();
  if (!d) return <IndicatorCard id="spread" title={t("spread.title")} heading={t("spread.title")} intro={t("spread.intro")} fallback={fallbackOf(d)} worked={null}>{null}</IndicatorCard>;
  const W = 480;
  const H = 180;
  const L = 20;
  const R = 20;
  const lineY = 100;
  const span = d.hi - d.lo || 1;
  const x = (v: number) => L + ((v - d.lo) / span) * (W - L - R);
  const sample = d.drawn.length > 400 ? d.drawn.filter((_, i) => i % Math.ceil(d.drawn.length / 400) === 0) : d.drawn;
  const stack = new Map<number, number>();
  const sdLo = x(Math.max(d.lo, d.stats.mean - d.stats.sd));
  const sdHi = x(Math.min(d.hi, d.stats.mean + d.stats.sd));
  const marks = [
    { v: d.mu, label: `μ ${f.num(d.mu, 1)}`, cls: "stroke-amber-500", tcls: "fill-amber-600 dark:fill-amber-400", y: 16 },
    { v: d.stats.mean, label: `${t("spread.labelMean")} ${f.num(d.stats.mean, 1)}`, cls: "stroke-blue-600 dark:stroke-blue-400", tcls: "fill-blue-700 dark:fill-blue-300", y: 34 },
    { v: d.stats.median, label: `${t("spread.labelMedian")} ${f.num(d.stats.median, 1)}`, cls: "stroke-violet-500", tcls: "fill-violet-600 dark:fill-violet-400", y: 52 },
  ];
  const anchor = (v: number) => (x(v) < W * 0.2 ? "start" : x(v) > W * 0.8 ? "end" : "middle");
  return (
    <IndicatorCard
      id="spread"
      title={t("spread.title")}
      heading={t("spread.heading", { median: f.num(d.stats.median, 1), sd: f.num(d.stats.sd, 2), sigma: f.num(d.sigma, 2) })}
      intro={t("spread.intro")}
      worked={{
        title: t("worked"),
        rows: [
          { label: t("spread.rowMinMax"), value: `${f.int(d.stats.min)} … ${f.int(d.stats.max)}` },
          { label: t("spread.rowMedian"), value: f.num(d.stats.median, 1) },
          { label: t("spread.rowSd"), value: f.num(d.stats.sd, 2) },
          { label: t("spread.rowSigma"), value: `√((${f.int(d.n)}² − 1) ÷ 12) = ${f.num(d.sigma, 2)}` },
          { label: t("spread.rowCoverage"), value: f.pct(d.n > 1 ? (d.stats.max - d.stats.min) / (d.n - 1) : 1), emphasize: true },
        ],
      }}
    >
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="h-auto max-w-full" role="img" aria-label={t("spread.title")} data-testid="ind-spread">
        <rect x={sdLo} y={lineY - 16} width={Math.max(2, sdHi - sdLo)} height={32} rx={6} className="fill-blue-500/10" />
        <line x1={L} x2={W - R} y1={lineY} y2={lineY} strokeWidth={2} className="stroke-zinc-300 dark:stroke-zinc-600" />
        {marks.map((m) => (
          <g key={m.label}>
            <line x1={x(m.v)} x2={x(m.v)} y1={m.y + 4} y2={lineY + 18} strokeWidth={1.5} strokeDasharray="4 3" className={m.cls} />
            <text x={x(m.v)} y={m.y} textAnchor={anchor(m.v)} className={`font-mono text-[14px] font-semibold ${m.tcls}`}>
              {m.label}
            </text>
          </g>
        ))}
        {sample.map((v, i) => {
          const level = stack.get(v) ?? 0;
          stack.set(v, level + 1);
          return <circle key={i} cx={x(v)} cy={lineY + 6 - Math.min(level, 6) * 6 - 6} r={4} className="fill-blue-600/80 dark:fill-blue-400/80" />;
        })}
        <text x={L} y={lineY + 36} className="fill-zinc-500 font-mono text-[14px]">{f.int(d.lo)}</text>
        <text x={W - R} y={lineY + 36} textAnchor="end" className="fill-zinc-500 font-mono text-[14px]">{f.int(d.hi)}</text>
        <text x={(sdLo + sdHi) / 2} y={lineY + 36} textAnchor="middle" className="fill-blue-600 text-[13px] dark:fill-blue-400">±1 SD</text>
      </svg>
    </IndicatorCard>
  );
}

/** One value box of the formula diagram. */
function Box({ v, label, tone }: { v: string; label: string; tone: string }) {
  return (
    <div className={`flex min-w-[5.5rem] flex-col items-center rounded-xl border px-3 py-2 ${tone}`}>
      <span dir="ltr" className="font-mono text-base font-bold text-zinc-900 dark:text-zinc-100">{v}</span>
      <span className="text-[11px] text-zinc-500 dark:text-zinc-400">{label}</span>
    </div>
  );
}
const op = (c: string) => <span className="font-mono text-xl font-bold text-zinc-400">{c}</span>;

/** One label/value line of a modulo-bias comparison card. */
function Row({ k, v, strong }: { k: string; v: string; strong?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-2 border-b border-dashed border-zinc-200 py-1.5 text-sm last:border-0 dark:border-zinc-700">
      <span className="text-zinc-500 dark:text-zinc-400">{k}</span>
      <span dir="ltr" className={`font-mono font-semibold ${strong ? "text-base text-zinc-900 dark:text-zinc-50" : "text-zinc-800 dark:text-zinc-100"}`}>{v}</span>
    </div>
  );
}

/* 5 — §31 type 18: E[S] = k·μ and SD[S] = σ·√k (× FPC), with the observed sum's z-score. */
export function SumFormula({ d, f }: IndicatorProps) {
  const t = useInd();
  if (!d) return <IndicatorCard id="sum-formula" title={t("sum.title")} heading={t("sum.title")} intro={t("sum.intro")} fallback={fallbackOf(d)} worked={null}>{null}</IndicatorCard>;
  const s = sumDistribution(d.lo, d.hi, d.k, d.allowDuplicates);
  const z = s.sd > 0 ? (d.sum - s.expected) / s.sd : 0;
  const blue = "border-blue-200 bg-blue-50 dark:border-blue-500/30 dark:bg-blue-500/10";
  const amber = "border-amber-200 bg-amber-50 dark:border-amber-500/30 dark:bg-amber-500/10";
  const green = "border-emerald-200 bg-emerald-50 dark:border-emerald-500/30 dark:bg-emerald-500/10";
  return (
    <IndicatorCard
      id="sum-formula"
      title={t("sum.title")}
      heading={t("sum.heading", { sum: f.num(d.sum), expected: f.num(s.expected, 1), sd: f.num(s.sd, 1) })}
      intro={t("sum.intro")}
      worked={{
        title: t("worked"),
        rows: [
          { label: t("sum.rowExpected"), value: `${f.int(d.k)} × ${f.num(d.mu, 2)} = ${f.num(s.expected, 2)}` },
          { label: t("sum.rowSd"), value: `${f.num(d.sigma, 2)} × √${f.int(d.k)} × ${f.num(s.fpc, 3)} = ${f.num(s.sd, 2)}` },
          { label: t("sum.rowObserved"), value: f.num(d.sum) },
          { label: t("sum.rowZ"), value: f.num(z, 2), emphasize: true },
        ],
      }}
    >
      <div className="flex flex-col gap-4" data-testid="ind-sum">
        <div className="flex flex-wrap items-center justify-center gap-2" dir="ltr">
          <Box v={f.int(d.k)} label={t("sum.boxCount")} tone={blue} />
          {op("×")}
          <Box v={f.num(d.mu, 2)} label={t("sum.boxMu")} tone={amber} />
          {op("=")}
          <Box v={f.num(s.expected, 1)} label={t("sum.boxExpected")} tone={green} />
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2" dir="ltr">
          <Box v={f.num(d.sigma, 2)} label={t("sum.boxSigma")} tone={amber} />
          {op("×")}
          <Box v={f.num(Math.sqrt(d.k), 2)} label="√k" tone={blue} />
          {op("×")}
          <Box v={f.num(s.fpc, 3)} label={t("sum.boxFpc")} tone={blue} />
          {op("=")}
          <Box v={f.num(s.sd, 1)} label={t("sum.boxSd")} tone={green} />
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2" dir="ltr">
          <Box v={`(${f.num(d.sum)} − ${f.num(s.expected, 1)})`} label={t("sum.boxDiff")} tone={blue} />
          {op("÷")}
          <Box v={f.num(s.sd, 1)} label={t("sum.boxSd")} tone={green} />
          {op("=")}
          <Box v={f.num(z, 2)} label={t("sum.boxZ")} tone={Math.abs(z) > 2 ? "border-red-300 bg-red-50 dark:border-red-500/40 dark:bg-red-500/10" : green} />
        </div>
      </div>
    </IndicatorCard>
  );
}

/* 6 — §31 type 15: distinct values vs repeats in this draw, against the expectation and range coverage. */
export function DistinctStacked({ d, f }: IndicatorProps) {
  const t = useInd();
  if (!d) return <IndicatorCard id="distinct" title={t("distinct.title")} heading={t("distinct.title")} intro={t("distinct.intro")} fallback={fallbackOf(d)} worked={null}>{null}</IndicatorCard>;
  const expected = d.allowDuplicates ? expectedDistinct(d.n, d.k) : d.k;
  const rows = [
    { label: t("distinct.barDraw"), total: d.k, segs: [{ v: d.stats.distinct, cls: "bg-blue-600", name: t("distinct.segDistinct") }, { v: d.k - d.stats.distinct, cls: "bg-rose-500", name: t("distinct.segRepeat") }] },
    { label: t("distinct.barExpected"), total: d.k, segs: [{ v: expected, cls: "bg-blue-400", name: t("distinct.segDistinct") }, { v: d.k - expected, cls: "bg-rose-300", name: t("distinct.segRepeat") }] },
    { label: t("distinct.barCoverage"), total: d.n, segs: [{ v: d.stats.distinct, cls: "bg-emerald-500", name: t("distinct.segSeen") }, { v: d.n - d.stats.distinct, cls: "bg-zinc-300 dark:bg-zinc-700", name: t("distinct.segUnseen") }] },
  ];
  return (
    <IndicatorCard
      id="distinct"
      title={t("distinct.title")}
      heading={t("distinct.heading", { distinct: f.int(d.stats.distinct), k: f.int(d.k) })}
      intro={t("distinct.intro")}
      worked={{
        title: t("worked"),
        rows: [
          { label: t("distinct.rowDistinct"), value: f.int(d.stats.distinct) },
          { label: t("distinct.rowRepeats"), value: `${f.int(d.k)} − ${f.int(d.stats.distinct)} = ${f.int(d.k - d.stats.distinct)}` },
          { label: t("distinct.rowExpected"), value: d.allowDuplicates ? `${f.int(d.n)} × (1 − (1 − 1/${f.int(d.n)})^${f.int(d.k)}) = ${f.num(expected, 2)}` : f.int(d.k) },
          { label: t("distinct.rowCoverage"), value: `${f.int(d.stats.distinct)} ÷ ${f.int(d.n)} = ${f.pct(d.stats.distinct / d.n, 2)}`, emphasize: true },
        ],
      }}
    >
      <div className="space-y-4" data-testid="ind-distinct">
        {rows.map((r) => (
          <div key={r.label}>
            <div className="mb-1 flex items-baseline justify-between text-xs">
              <span className="font-semibold text-zinc-700 dark:text-zinc-200">{r.label}</span>
              <span dir="ltr" className="font-mono text-zinc-500">{r.segs.map((s) => f.num(s.v, 1)).join(" + ")} = {f.int(r.total)}</span>
            </div>
            <div dir="ltr" className="flex h-7 overflow-hidden rounded-lg">
              {r.segs.map((s) => (
                <div key={s.name} className={`flex items-center justify-center overflow-hidden text-[11px] font-semibold text-white transition-all duration-500 ${s.cls}`} style={{ width: pc((Math.max(0, s.v) / r.total) * 100) }}>
                  {s.v / r.total > 0.12 ? s.name : ""}
                </div>
              ))}
            </div>
          </div>
        ))}
        <div className="flex flex-wrap gap-4 text-xs text-zinc-500 dark:text-zinc-400">
          <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm bg-blue-600" />{t("distinct.segDistinct")}</span>
          <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm bg-rose-500" />{t("distinct.segRepeat")}</span>
          <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm bg-emerald-500" />{t("distinct.segSeen")}</span>
          <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm bg-zinc-300 dark:bg-zinc-700" />{t("distinct.segUnseen")}</span>
        </div>
      </div>
    </IndicatorCard>
  );
}

/* 7 — §31 type 12: odds that one chosen number appears, at half / current / double the draws. */
export function AppearanceTrio({ d, f }: IndicatorProps) {
  const t = useInd();
  if (!d) return <IndicatorCard id="appearance" title={t("appear.title")} heading={t("appear.title")} intro={t("appear.intro")} fallback={fallbackOf(d)} worked={null}>{null}</IndicatorCard>;
  const cap = (k: number) => (d.allowDuplicates ? k : Math.min(k, d.n));
  const ks = [Math.max(1, Math.floor(d.k / 2)), d.k, cap(d.k * 2)];
  const ps = ks.map((k) => appearanceProbability(d.n, k, d.allowDuplicates));
  const formula = d.allowDuplicates ? `1 − (1 − 1/${f.int(d.n)})^${f.int(d.k)}` : `${f.int(d.k)} ÷ ${f.int(d.n)}`;
  const delta = (p: number) => `${p >= ps[1] ? "+" : "−"}${f.pct(Math.abs(p - ps[1]), 2)}`;
  return (
    <IndicatorCard
      id="appearance"
      title={t("appear.title")}
      heading={t("appear.heading", { p: f.pct(ps[1], 2) })}
      intro={t("appear.intro")}
      worked={{
        title: t("worked"),
        rows: [
          { label: t("appear.rowSingle"), value: `1 ÷ ${f.int(d.n)} = ${f.pct(1 / d.n, 3)}` },
          { label: t("appear.rowFormula"), value: formula },
          { label: t("appear.rowHalf"), value: f.pct(ps[0], 2) },
          { label: t("appear.rowDouble"), value: f.pct(ps[2], 2) },
          { label: t("appear.rowNow"), value: f.pct(ps[1], 2), emphasize: true },
        ],
      }}
    >
      <div data-testid="ind-appearance">
        <SensitivityBars
          points={[
            { label: t("appear.low"), sub: `k = ${f.int(ks[0])}`, value: ps[0], display: f.pct(ps[0], 2), delta: delta(ps[0]) },
            { label: t("appear.now"), sub: `k = ${f.int(ks[1])}`, value: ps[1], display: f.pct(ps[1], 2), delta: "±0" },
            { label: t("appear.high"), sub: `k = ${f.int(ks[2])}`, value: ps[2], display: f.pct(ps[2], 2), delta: delta(ps[2]) },
          ]}
        />
      </div>
    </IndicatorCard>
  );
}

/* 8 — §31 type 10: the four outcome-space sizes on a log scale, yours highlighted. */
export function OutcomeSpaceLog({ d, f }: IndicatorProps) {
  const t = useInd();
  if (!d) return <IndicatorCard id="outcome-space" title={t("space.title")} heading={t("space.title")} intro={t("space.intro")} fallback={fallbackOf(d)} worked={null}>{null}</IndicatorCard>;
  const s = log10OutcomeSpace(d.n, d.k);
  const rows = [
    { key: "orderedWith", v: s.orderedWith, formula: `${f.int(d.n)}^${f.int(d.k)}`, mine: d.allowDuplicates && !d.sorted },
    { key: "unorderedWith", v: s.unorderedWith, formula: `C(${f.int(d.n + d.k - 1)}, ${f.int(d.k)})`, mine: d.allowDuplicates && d.sorted },
    { key: "orderedWithout", v: s.orderedWithout, formula: `${f.int(d.n)}! ÷ ${f.int(Math.max(0, d.n - d.k))}!`, mine: !d.allowDuplicates && !d.sorted },
    { key: "unorderedWithout", v: s.unorderedWithout, formula: `C(${f.int(d.n)}, ${f.int(d.k)})`, mine: !d.allowDuplicates && d.sorted },
  ] as const;
  const top = Math.max(1, ...rows.map((r) => (Number.isFinite(r.v) ? r.v : 0)));
  const scaleMax = Math.ceil(top / 5) * 5 || 5;
  const mine = rows.find((r) => r.mine)!;
  const exact = !d.allowDuplicates && d.sorted ? exactCombination(d.n, d.k) : null;
  return (
    <IndicatorCard
      id="outcome-space"
      title={t("space.title")}
      heading={t("space.heading", { count: f.big(mine.v) })}
      intro={t("space.intro")}
      worked={{
        title: t("worked"),
        rows: [
          { label: t("space.rowKind"), value: t(`space.${mine.key}Short`) },
          { label: t("space.rowFormula"), value: mine.formula },
          { label: t("space.rowValue"), value: exact !== null ? f.int(exact) : f.big(mine.v) },
          { label: t("space.rowDigits"), value: Number.isFinite(mine.v) ? f.int(Math.floor(mine.v) + 1) : "—" },
          { label: t("space.rowOdds"), value: Number.isFinite(mine.v) ? `1 : ${f.big(mine.v)}` : "—", emphasize: true },
        ],
      }}
    >
      <div className="space-y-3" data-testid="ind-outcome-space">
        {rows.map((r) => (
          <div key={r.key}>
            <div className="mb-1 flex items-baseline justify-between gap-2 text-xs">
              <span className={`font-semibold ${r.mine ? "text-blue-700 dark:text-blue-300" : "text-zinc-600 dark:text-zinc-300"}`}>
                {t(`space.${r.key}`)}
                {r.mine && <span className="ms-1.5 rounded-full bg-blue-600 px-1.5 py-0.5 text-[10px] text-white">{t("space.current")}</span>}
              </span>
              <span dir="ltr" className="shrink-0 font-mono font-bold text-zinc-900 dark:text-zinc-100">{Number.isFinite(r.v) ? f.big(r.v) : t("space.impossible")}</span>
            </div>
            <div dir="ltr" className="relative h-4 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
              <div className={`h-full rounded-full transition-all duration-500 ${r.mine ? "bg-blue-600" : "bg-zinc-400 dark:bg-zinc-600"}`} style={{ width: pc(Number.isFinite(r.v) ? Math.max(1, (r.v / scaleMax) * 100) : 0) }} />
            </div>
          </div>
        ))}
        <div dir="ltr" className="flex justify-between font-mono text-[10px] text-zinc-400">
          {Array.from({ length: 6 }, (_, i) => (
            <span key={i}>10^{f.int((scaleMax * i) / 5)}</span>
          ))}
        </div>
      </div>
    </IndicatorCard>
  );
}

/* 9 — §31 type 16: naive `source % N` versus this tool's rejection sampling, side by side. */
export function ModuloBiasCards({ d, f }: IndicatorProps) {
  const t = useInd();
  if (!d) return <IndicatorCard id="modulo-bias" title={t("bias.title")} heading={t("bias.title")} intro={t("bias.intro")} fallback={fallbackOf(d)} worked={null}>{null}</IndicatorCard>;
  const b = moduloBias(d.n);
  const q = Math.floor(b.sourceSize / d.n);
  const fair = b.heavyValues === 0;
  return (
    <IndicatorCard
      id="modulo-bias"
      title={t("bias.title")}
      heading={fair ? t("bias.noBias", { size: f.int(b.sourceSize) }) : t("bias.heading", { bits: f.int(b.sourceBits), heavy: f.int(b.heavyValues), ratio: f.num(b.biasRatio, 3) })}
      intro={t("bias.intro")}
      worked={{
        title: t("worked"),
        rows: [
          { label: t("bias.rowSource"), value: `2^${f.int(b.sourceBits)} = ${f.int(b.sourceSize)}` },
          { label: t("bias.rowQ"), value: `⌊${f.int(b.sourceSize)} ÷ ${f.int(d.n)}⌋ = ${f.int(q)}` },
          { label: t("bias.rowR"), value: `${f.int(b.sourceSize)} mod ${f.int(d.n)} = ${f.int(b.heavyValues)}` },
          { label: t("bias.rowHeavy"), value: `${f.int(q + (fair ? 0 : 1))} ÷ ${f.int(b.sourceSize)} = ${f.pct(b.heavyProbability, 3)}` },
          { label: t("bias.rowLight"), value: `${f.int(q)} ÷ ${f.int(b.sourceSize)} = ${f.pct(b.lightProbability, 3)}` },
          { label: t("bias.rowRedraw"), value: f.pct(b.rejectionRate, 6), emphasize: true },
        ],
      }}
    >
      <div className="grid gap-3 sm:grid-cols-2" data-testid="ind-modulo-bias">
        <div className="rounded-xl border-2 border-rose-300 p-4 dark:border-rose-500/40">
          <p className="font-semibold text-rose-700 dark:text-rose-300">{t("bias.naiveTitle")}</p>
          <p className="mb-2 text-xs text-zinc-500 dark:text-zinc-400">{t("bias.naiveSub", { bits: f.int(b.sourceBits), size: f.int(b.sourceSize) })}</p>
          <Row k={t("bias.heavyP")} v={f.pct(b.heavyProbability, 3)} />
          <Row k={t("bias.lightP")} v={f.pct(b.lightProbability, 3)} />
          <Row k={t("bias.favoured")} v={f.int(b.heavyValues)} />
          <Row k={t("bias.ratio")} v={Number.isFinite(b.biasRatio) ? `${f.num(b.biasRatio, 3)}×` : "∞"} strong />
        </div>
        <div className="rounded-xl border-2 border-emerald-300 p-4 dark:border-emerald-500/40">
          <p className="font-semibold text-emerald-700 dark:text-emerald-300">{t("bias.toolTitle")}</p>
          <p className="mb-2 text-xs text-zinc-500 dark:text-zinc-400">{t("bias.toolSub")}</p>
          <Row k={t("bias.exact")} v={f.pct(1 / d.n, 3)} />
          <Row k={t("bias.redraw")} v={f.pct(b.rejectionRate, 6)} />
          <Row k={t("bias.favoured")} v={f.int(0)} />
          <Row k={t("bias.ratio")} v={`${f.num(1, 3)}×`} strong />
        </div>
      </div>
    </IndicatorCard>
  );
}

/* 10 — §31 type 19: bits of unpredictability on coloured zones, with the 32-bit seed's ceiling marked. */
export function EntropyZoneStrip({ d, f }: IndicatorProps) {
  const t = useInd();
  if (!d) return <IndicatorCard id="entropy" title={t("entropy.title")} heading={t("entropy.title")} intro={t("entropy.intro")} fallback={fallbackOf(d)} worked={null}>{null}</IndicatorCard>;
  const log10 = log10OutcomesFor(d.n, d.k, d.allowDuplicates, d.sorted);
  const bits = log10 * LOG2_10;
  const effective = Math.min(bits, 32);
  const MAX = 160;
  const pos = (b: number) => pc((Math.min(MAX, b) / MAX) * 100);
  const colors = ["bg-red-500", "bg-orange-400", "bg-amber-400", "bg-lime-500", "bg-emerald-600"];
  const zone = entropyZone(bits);
  return (
    <IndicatorCard
      id="entropy"
      title={t("entropy.title")}
      heading={t("entropy.heading", { bits: f.num(bits, 1), zone: t(`entropy.zones.${zone}`) })}
      intro={t("entropy.intro")}
      worked={{
        title: t("worked"),
        rows: [
          { label: t("entropy.rowPer"), value: `log₂ ${f.int(d.n)} = ${f.num(Math.log2(d.n), 2)}` },
          { label: t("entropy.rowLog"), value: f.num(log10, 3) },
          { label: t("entropy.rowBits"), value: `${f.num(log10, 3)} × ${f.num(LOG2_10, 4)} = ${f.num(bits, 1)}` },
          { label: t("entropy.rowCap"), value: f.int(32) },
          { label: t("entropy.rowEffective"), value: f.num(effective, 1), emphasize: true },
        ],
      }}
    >
      <div className="pt-10" data-testid="ind-entropy">
        <div dir="ltr" className="relative">
          <div className="flex h-6 overflow-hidden rounded-full">
            {ENTROPY_ZONES.map((z, i) => {
              const from = i === 0 ? 0 : ENTROPY_ZONES[i - 1].to;
              const to = Math.min(MAX, z.to);
              return <div key={z.zone} className={`${colors[i]} ${z.zone === zone ? "" : "opacity-60"}`} style={{ width: pc(((to - from) / MAX) * 100) }} />;
            })}
          </div>
          {[
            { b: bits, label: `${t("entropy.markerSettings")} ${f.num(bits, 1)}`, cls: "bg-blue-700 dark:bg-blue-300", tcls: "text-blue-700 dark:text-blue-300", top: true },
            { b: 32, label: `${t("entropy.markerCap")} 32`, cls: "bg-zinc-900 dark:bg-zinc-100", tcls: "text-zinc-700 dark:text-zinc-200", top: false },
          ].map((m) => (
            <div key={m.label} className="absolute top-0 h-6" style={{ left: pos(m.b) }}>
              <div className={`absolute -top-2 h-10 w-1 -translate-x-1/2 rounded ${m.cls}`} />
              <span
                className={`absolute whitespace-nowrap text-[11px] font-bold ${m.tcls} ${m.top ? "-top-8" : "top-9"}`}
                style={{ transform: `translateX(${Math.min(bits, MAX) / MAX > 0.75 && m.top ? "-100%" : m.b / MAX < 0.1 ? "0" : "-50%"})` }}
              >
                {m.label}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-12 grid grid-cols-5 gap-1 text-center text-[10px] sm:text-xs">
          {ENTROPY_ZONES.map((z, i) => (
            <div key={z.zone} className={`rounded-md px-1 py-1 ${z.zone === zone ? "bg-zinc-100 font-bold text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50" : "text-zinc-500 dark:text-zinc-400"}`}>
              <span className={`mx-auto mb-1 block h-1.5 w-6 rounded ${colors[i]}`} />
              {t(`entropy.zones.${z.zone}`)}
              <span dir="ltr" className="block font-mono text-[10px] opacity-70">{`${i === 0 ? 0 : ENTROPY_ZONES[i - 1].to}${Number.isFinite(z.to) ? `–${z.to}` : "+"}`}</span>
            </div>
          ))}
        </div>
      </div>
    </IndicatorCard>
  );
}

/* 11 — §31 type 17: real-world draws, their odds computed here, each tagged and applicable. */
export function PresetOddsTable({ d, f, active, onApply }: IndicatorProps & { active: PresetKey | null; onApply: (k: PresetKey) => void }) {
  const t = useInd();
  const tForm = useTranslations("tools.random-number-generator.form");
  const rows = PRESETS.map((p) => {
    const s = p.settings;
    const n = rangeSize(s.min, s.max);
    const log10 = log10OutcomesFor(n, s.count, s.allowDuplicates, s.sortOrder !== "none");
    return { ...p, n, log10, repeat: s.allowDuplicates ? duplicateProbability(n, s.count) : 0 };
  });
  const focus = rows.find((r) => r.key === active) ?? rows.find((r) => r.key === "lottery")!;
  const fs = focus.settings;
  const exact = !fs.allowDuplicates && fs.sortOrder !== "none" ? exactCombination(focus.n, fs.count) : null;
  return (
    <IndicatorCard
      id="common-draws"
      title={t("table.title")}
      heading={t("table.heading")}
      intro={t("table.intro")}
      worked={{
        title: t("worked"),
        rows: [
          { label: t("table.rowDraw"), value: tForm(`presets.${focus.key}`) },
          { label: t("table.rowSettings"), value: `${f.int(fs.min)}–${f.int(fs.max)} · k = ${f.int(fs.count)}` },
          { label: t("table.rowFormula"), value: fs.allowDuplicates ? `${f.int(focus.n)}^${f.int(fs.count)}` : fs.sortOrder !== "none" ? `C(${f.int(focus.n)}, ${f.int(fs.count)})` : `${f.int(focus.n)}! ÷ ${f.int(focus.n - fs.count)}!` },
          { label: t("table.rowRepeat"), value: fs.allowDuplicates ? f.pct(focus.repeat, 2) : "0%" },
          { label: t("table.rowOdds"), value: `1 : ${exact !== null ? f.int(exact) : f.big(focus.log10)}`, emphasize: true },
        ],
      }}
    >
      <div className="overflow-x-auto" data-testid="ind-table">
        <table className="w-full min-w-[480px] text-sm">
          <thead>
            <tr className="border-b border-zinc-200 text-start text-xs text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
              <th className="py-2 text-start font-semibold">{t("table.colDraw")}</th>
              <th className="py-2 text-start font-semibold">{t("table.colTag")}</th>
              <th className="py-2 text-end font-semibold">{t("table.colOdds")}</th>
              <th className="py-2 text-end font-semibold">{t("table.colRepeat")}</th>
              <th className="py-2" />
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.key} className={`border-b border-zinc-100 dark:border-zinc-800 ${r.key === focus.key ? "bg-blue-50/70 dark:bg-blue-500/10" : ""}`}>
                <td className="py-2">
                  <span className="block font-medium text-zinc-900 dark:text-zinc-100">{tForm(`presets.${r.key}`)}</span>
                  <span dir="ltr" className="block font-mono text-[10px] text-zinc-500">{`${r.settings.min}–${r.settings.max} · ×${r.settings.count}`}</span>
                </td>
                <td className="py-2">
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${r.settings.allowDuplicates ? "bg-sky-100 text-sky-800 dark:bg-sky-500/15 dark:text-sky-300" : "bg-violet-100 text-violet-800 dark:bg-violet-500/15 dark:text-violet-300"}`}>
                    {r.settings.allowDuplicates ? t("table.tagRepeats") : t("table.tagNoRepeats")}
                  </span>
                </td>
                <td dir="ltr" className="py-2 text-end font-mono text-xs font-semibold text-zinc-900 dark:text-zinc-100">{`1 : ${f.big(r.log10)}`}</td>
                <td dir="ltr" className="py-2 text-end font-mono text-xs text-zinc-700 dark:text-zinc-300">{r.settings.allowDuplicates ? f.pct(r.repeat, 1) : "—"}</td>
                <td className="py-2 text-end">
                  <button type="button" onClick={() => onApply(r.key)} className="rounded-lg border border-blue-500 px-2.5 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-50 dark:text-blue-300 dark:hover:bg-blue-500/10">
                    {t("table.apply")}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {d && <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">{t("table.yours", { odds: `1 : ${f.big(log10OutcomesFor(d.n, d.k, d.allowDuplicates, d.sorted))}` })}</p>}
      </div>
    </IndicatorCard>
  );
}
