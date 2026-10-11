"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  nearestBenchmark,
  percentComparisons,
  percentCompoundSeries,
  percentForms,
  percentMentalSteps,
  percentSensitivity,
  percentToUndo,
  percentUpThenDown,
} from "@tooloralabs/tools";
import IndicatorCard, { PillGroup } from "@/components/tools/markets/IndicatorCard";
import { usePercentage } from "./PercentageLiveContext";

function useInd() {
  return useTranslations("tools.percentage-calculator.ind");
}
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/* §31 type 18 — formula diagram: the active mode's formula, symbol row over number row. */
export function PercentageFormulaDiagram() {
  const t = useInd();
  const { mode, a, b, frame, fmt } = usePercentage();
  const { f, n, sp } = fmt;
  const { base: B, percent: p, part: P } = frame;
  type Tok = { sym: string; val: string; op?: boolean; out?: boolean };
  const op = (s: string): Tok => ({ sym: s, val: s, op: true });
  const tokens: Record<typeof mode, Tok[]> = {
    "percent-of-number": [{ sym: "p", val: n(p) }, op("÷"), { sym: "100", val: "100" }, op("×"), { sym: "Y", val: n(B) }, op("="), { sym: t("formula.part"), val: n(P), out: true }],
    "what-percent": [{ sym: "X", val: n(P) }, op("÷"), { sym: "Y", val: n(B) }, op("×"), { sym: "100", val: "100" }, op("="), { sym: "%", val: `${n(p)}%`, out: true }],
    "percentage-change": [{ sym: t("formula.new"), val: n(b) }, op("−"), { sym: t("formula.old"), val: n(a) }, op("÷"), { sym: t("formula.old"), val: n(a) }, op("×"), { sym: "100", val: "100" }, op("="), { sym: "Δ%", val: `${n(p)}%`, out: true }],
    "reverse-percentage": [{ sym: t("formula.part"), val: n(P) }, op("÷"), { sym: "p", val: n(p) }, op("×"), { sym: "100", val: "100" }, op("="), { sym: t("formula.whole"), val: n(B), out: true }],
    "percentage-difference": [{ sym: "|a − b|", val: n(P) }, op("÷"), { sym: "(a + b) ÷ 2", val: n(B) }, op("×"), { sym: "100", val: "100" }, op("="), { sym: "%", val: `${n(p)}%`, out: true }],
  };
  const resultText = mode === "percent-of-number" ? f(P) : mode === "reverse-percentage" ? f(B) : mode === "percentage-change" ? sp(p, 4) : `${f(p, 4)}%`;
  return (
    <IndicatorCard
      id="formula"
      title={t("formula.title")}
      heading={t(`formula.heading.${mode}`)}
      intro={t("formula.intro")}
      worked={{
        title: t("worked"),
        rows: [
          { label: t("formula.rowBase"), value: f(B) },
          { label: t("formula.rowRate"), value: `${f(p, 4)}%` },
          { label: t("formula.rowDecimal"), value: f(p / 100, 6) },
          { label: t("formula.rowPart"), value: f(P) },
          { label: t("formula.rowCheck"), value: `${f(B)} × ${f(p / 100, 6)} = ${f((B * p) / 100)}` },
          { label: t("formula.rowResult"), value: resultText, emphasize: true },
        ],
      }}
    >
      <div dir="ltr" className="overflow-x-auto">
        <div className="mx-auto flex w-max items-stretch gap-1.5 py-2">
          {tokens[mode].map((tk, i) =>
            tk.op ? (
              <div key={i} className="flex w-5 items-center justify-center text-xl font-bold text-zinc-400">{tk.sym}</div>
            ) : (
              <div key={i} className={`flex min-w-[60px] flex-col items-center justify-center rounded-xl border-2 px-2 py-2 ${tk.out ? "border-emerald-400 bg-emerald-50 dark:border-emerald-500/50 dark:bg-emerald-500/10" : "border-blue-300 bg-blue-50 dark:border-blue-500/40 dark:bg-blue-500/10"}`}>
                <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">{tk.sym}</span>
                <span className={`font-mono text-sm font-bold ${tk.out ? "text-emerald-700 dark:text-emerald-300" : "text-blue-700 dark:text-blue-300"}`}>{tk.val}</span>
              </div>
            ),
          )}
        </div>
      </div>
    </IndicatorCard>
  );
}

/* §31 type 13 — stepped diagram: p% of the base built from 10% and 1% blocks. */
export function PercentageMentalSteps() {
  const t = useInd();
  const { frame, fmt } = usePercentage();
  const { f, n } = fmt;
  const B = frame.base;
  const p = frame.percent;
  const m = percentMentalSteps(B, p);
  const steps = [
    { label: "10%", formula: `${n(B)} ÷ 10`, v: m.tenPercent },
    { label: "1%", formula: `${n(B)} ÷ 100`, v: m.onePercent },
    { label: `${m.tens} × 10%`, formula: `${m.tens} × ${n(m.tenPercent)}`, v: m.tensValue },
    { label: `${m.ones} × 1%`, formula: `${m.ones} × ${n(m.onePercent)}`, v: m.onesValue },
    { label: `${n(m.rest, 4)} × 1%`, formula: `${n(m.rest, 4)} × ${n(m.onePercent)}`, v: m.restValue },
    { label: `${n(Math.abs(p), 4)}%`, formula: `${n(m.tensValue)} + ${n(m.onesValue)} + ${n(m.restValue)}`, v: Math.abs(m.total) },
  ];
  const top = Math.max(...steps.map((s) => Math.abs(s.v)), 1e-12);
  const colors = ["bg-zinc-400", "bg-zinc-400", "bg-blue-500", "bg-violet-500", "bg-amber-500", "bg-emerald-500"];
  return (
    <IndicatorCard
      id="mental-steps"
      title={t("steps.title")}
      heading={t("steps.heading", { pct: n(Math.abs(p), 4), base: n(B) })}
      intro={t("steps.intro")}
      worked={{
        title: t("worked"),
        rows: [
          { label: t("steps.rowTen"), value: `${f(B)} ÷ 10 = ${f(m.tenPercent)}` },
          { label: t("steps.rowOne"), value: `${f(B)} ÷ 100 = ${f(m.onePercent)}` },
          { label: t("steps.rowTens", { k: m.tens }), value: f(m.tensValue) },
          { label: t("steps.rowOnes", { k: m.ones }), value: f(m.onesValue) },
          { label: t("steps.rowRest"), value: f(m.restValue) },
          { label: t("steps.rowTotal"), value: f(Math.abs(m.total)), emphasize: true },
        ],
      }}
    >
      <div dir="ltr" className="flex h-[200px] items-end gap-2">
        {steps.map((s, i) => (
          <div key={i} className="flex h-full min-w-0 flex-1 flex-col justify-end">
            <span className="truncate text-center font-mono text-[11px] font-bold text-zinc-800 dark:text-zinc-100">{f(s.v, 2)}</span>
            <div className={`mt-1 rounded-t-md ${colors[i]}`} style={{ height: `${Math.max(4, (Math.abs(s.v) / top) * 130)}px` }} />
            <span className="mt-1 truncate text-center text-[11px] font-semibold text-zinc-600 dark:text-zinc-300">{s.label}</span>
            <span className="truncate text-center font-mono text-[9px] text-zinc-400">{s.formula}</span>
          </div>
        ))}
      </div>
    </IndicatorCard>
  );
}

/* §31 type 11 — side-by-side equivalence: one rate written six ways, placed on a 0–1 line. */
export function PercentageEquivalentForms() {
  const t = useInd();
  const { frame, fmt } = usePercentage();
  const { f } = fmt;
  const p = frame.percent;
  const fm = percentForms(p);
  const bench = nearestBenchmark(Math.abs(p));
  const tiles = [
    { k: "percent", v: `${f(p, 4)}%` },
    { k: "decimal", v: f(fm.decimal, 6) },
    { k: "fraction", v: `${fm.fraction.num}/${fm.fraction.den}` },
    { k: "perMille", v: `${f(fm.perMille, 3)}‰` },
    { k: "basisPoints", v: `${f(fm.basisPoints, 2)} bp` },
    { k: "oneIn", v: Number.isFinite(fm.oneIn) ? `1 : ${f(fm.oneIn, 2)}` : "—" },
  ];
  const maxX = Math.max(1, Math.ceil(Math.abs(fm.decimal)));
  const X = (v: number) => 12 + (clamp(v, 0, maxX) / maxX) * 396;
  return (
    <IndicatorCard
      id="equivalent-forms"
      title={t("forms.title")}
      heading={t("forms.heading", { pct: f(p, 4) })}
      intro={t("forms.intro")}
      worked={{
        title: t("worked"),
        rows: [
          { label: t("forms.decimal"), value: `${f(p, 4)} ÷ 100 = ${f(fm.decimal, 6)}` },
          { label: t("forms.fraction"), value: `${f(p, 4)}/100 = ${fm.fraction.num}/${fm.fraction.den}` },
          { label: t("forms.perMille"), value: `× 10 = ${f(fm.perMille, 3)}‰` },
          { label: t("forms.basisPoints"), value: `× 100 = ${f(fm.basisPoints, 2)}` },
          { label: t("forms.benchmark"), value: `≈ ${bench.num}/${bench.den} (${f(bench.percent, 2)}%)` },
          { label: t("forms.gap"), value: `${f(bench.gap, 2)} pp`, emphasize: true },
        ],
      }}
    >
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {tiles.map((tile) => (
          <div key={tile.k} className="flex flex-col items-center rounded-xl border border-blue-200 bg-blue-50/60 px-2 py-2.5 dark:border-blue-500/30 dark:bg-blue-500/10">
            <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">{t(`forms.${tile.k}`)}</span>
            <span dir="ltr" className="max-w-full truncate font-mono text-base font-bold text-blue-700 dark:text-blue-300">{tile.v}</span>
          </div>
        ))}
      </div>
      <div dir="ltr" className="mt-3">
        <svg width={420} height={56} viewBox="0 0 420 56" className="mx-auto block h-auto max-w-full" role="img" aria-label={t("forms.heading", { pct: f(p, 4) })}>
          <line x1={12} x2={408} y1={28} y2={28} className="stroke-zinc-300 dark:stroke-zinc-600" strokeWidth={2} />
          {Array.from({ length: maxX * 4 + 1 }, (_, i) => i / 4).map((v) => (
            <g key={v}>
              <line x1={X(v)} x2={X(v)} y1={22} y2={34} className="stroke-zinc-400" />
              <text x={X(v)} y={50} textAnchor="middle" className="fill-zinc-400 font-mono text-[9px]">{v}</text>
            </g>
          ))}
          <line x1={X(bench.percent / 100)} x2={X(bench.percent / 100)} y1={16} y2={40} className="stroke-amber-500" strokeWidth={2} strokeDasharray="3 2" />
          <text x={X(bench.percent / 100)} y={12} textAnchor="middle" className="fill-amber-600 font-mono text-[10px] dark:fill-amber-400">{`${bench.num}/${bench.den}`}</text>
          <circle cx={X(Math.abs(fm.decimal))} cy={28} r={6} className="fill-blue-600 stroke-white dark:fill-blue-400 dark:stroke-zinc-900" strokeWidth={2} />
        </svg>
      </div>
    </IndicatorCard>
  );
}

/* §31 type 6 — multi-ring donut: the rate, the rate of the rate, and the rate applied three times. */
export function PercentageRingDonut() {
  const t = useInd();
  const { frame, fmt } = usePercentage();
  const { f, n } = fmt;
  const B = frame.base;
  const q = Math.abs(frame.percent) / 100;
  const rings = [
    { k: "once", share: q, r: 70, cls: "stroke-blue-600 dark:stroke-blue-400", dot: "bg-blue-600 dark:bg-blue-400" },
    { k: "twice", share: q * q, r: 54, cls: "stroke-violet-600 dark:stroke-violet-400", dot: "bg-violet-600 dark:bg-violet-400" },
    { k: "thrice", share: q * q * q, r: 38, cls: "stroke-amber-500", dot: "bg-amber-500" },
  ];
  return (
    <IndicatorCard
      id="ring-donut"
      title={t("rings.title")}
      heading={t("rings.heading")}
      intro={t("rings.intro")}
      worked={{
        title: t("worked"),
        rows: [
          ...rings.map((ring, i) => ({ label: t(`rings.${ring.k}`), value: `${f(ring.share * 100, 4)}% → ${f(B * ring.share)}`, emphasize: i === 2 })),
          { label: t("rings.rowFactor"), value: `× ${n(q, 6)}` },
        ],
      }}
    >
      <div className="flex flex-wrap items-center justify-center gap-6">
        <svg width={168} height={168} viewBox="0 0 168 168" role="img" aria-label={t("rings.heading")}>
          {rings.map((ring) => {
            const c = 2 * Math.PI * ring.r;
            const frac = clamp(ring.share, 0, 1);
            return (
              <g key={ring.k} transform="rotate(-90 84 84)">
                <circle cx={84} cy={84} r={ring.r} fill="none" className="stroke-zinc-200 dark:stroke-zinc-700" strokeWidth={12} />
                <circle cx={84} cy={84} r={ring.r} fill="none" className={ring.cls} strokeWidth={12} strokeDasharray={`${frac * c} ${c}`} strokeLinecap="butt" />
              </g>
            );
          })}
          <text x={84} y={88} textAnchor="middle" className="fill-zinc-800 font-mono text-[12px] font-bold dark:fill-zinc-100">{`${n(q * 100, 2)}%`}</text>
        </svg>
        <ul className="space-y-2 text-xs">
          {rings.map((ring) => (
            <li key={ring.k} className="flex items-center gap-2">
              <span className={`h-3 w-3 rounded-sm ${ring.dot}`} />
              <span className="text-zinc-600 dark:text-zinc-300">{t(`rings.${ring.k}`)}</span>
              <span dir="ltr" className="font-mono font-semibold text-zinc-900 dark:text-zinc-100">{`${f(ring.share * 100, 3)}%`}</span>
            </li>
          ))}
        </ul>
      </div>
    </IndicatorCard>
  );
}

/* §31 type 1 — labeled bar chart: part, remainder, base, increased and decreased values. */
export function PercentageBaseBars() {
  const t = useInd();
  const { frame, fmt } = usePercentage();
  const { f } = fmt;
  const { base: B, percent: p } = frame;
  const P = (B * p) / 100;
  const bars = [
    { k: "part", v: P, cls: "from-blue-600 to-blue-400" },
    { k: "remainder", v: B - P, cls: "from-zinc-500 to-zinc-300" },
    { k: "base", v: B, cls: "from-violet-600 to-violet-400" },
    { k: "increased", v: B + P, cls: "from-emerald-600 to-emerald-400" },
    { k: "decreased", v: B - P, cls: "from-red-600 to-red-400" },
  ];
  const top = Math.max(...bars.map((x) => Math.abs(x.v)), 1e-12);
  return (
    <IndicatorCard
      id="base-bars"
      title={t("bars.title")}
      heading={t("bars.heading", { pct: f(p, 4) })}
      intro={t("bars.intro")}
      worked={{
        title: t("worked"),
        rows: [
          { label: t("bars.base"), value: f(B) },
          { label: t("bars.part"), value: `${f(B)} × ${f(p, 4)}% = ${f(P)}` },
          { label: t("bars.remainder"), value: `${f(B)} − ${f(P)} = ${f(B - P)}` },
          { label: t("bars.increased"), value: `${f(B)} × ${f(1 + p / 100, 6)} = ${f(B + P)}` },
          { label: t("bars.decreased"), value: `${f(B)} × ${f(1 - p / 100, 6)} = ${f(B - P)}` },
          { label: t("bars.rowSpread"), value: f(2 * P), emphasize: true },
        ],
      }}
    >
      <div className="flex h-[220px] items-end gap-3">
        {bars.map((bar) => (
          <div key={bar.k} className="flex h-full min-w-0 flex-1 flex-col justify-end">
            <span dir="ltr" className="truncate text-center font-mono text-xs font-bold text-zinc-800 dark:text-zinc-100">{f(bar.v, 2)}</span>
            <div className={`mt-1 rounded-t-lg bg-gradient-to-t ${bar.cls}`} style={{ height: `${Math.max(3, (Math.max(bar.v, 0) / top) * 160)}px` }} />
            <span className="mt-1 truncate text-center text-[11px] font-semibold text-zinc-600 dark:text-zinc-300">{t(`bars.${bar.k}`)}</span>
          </div>
        ))}
      </div>
    </IndicatorCard>
  );
}

/* §31 type 7 — trend line: the same percent applied 10 times, compound vs simple, step 2 marked. */
export function PercentageCompoundTrend() {
  const t = useInd();
  const { frame, fmt } = usePercentage();
  const { f, n } = fmt;
  const B = frame.base;
  const p = frame.percent;
  const series = percentCompoundSeries(B, p, 10);
  const W = 420;
  const H = 230;
  const L = 56;
  const Bm = 28;
  const T = 14;
  const R = 14;
  const vals = series.flatMap((s) => [s.compound, s.simple]);
  const lo = Math.min(0, ...vals);
  const hi = Math.max(...vals, lo + 1e-9);
  const X = (i: number) => L + (i / 10) * (W - L - R);
  const Y = (v: number) => H - Bm - ((v - lo) / (hi - lo)) * (H - Bm - T);
  const line = (key: "compound" | "simple") => series.map((s) => `${X(s.step).toFixed(1)},${Y(s[key]).toFixed(1)}`).join(" ");
  const two = series[2];
  return (
    <IndicatorCard
      id="compound-trend"
      title={t("trend.title")}
      heading={t("trend.heading", { pct: f(p, 4) })}
      intro={t("trend.intro")}
      worked={{
        title: t("worked"),
        rows: [
          { label: t("trend.rowMultiplier"), value: `1 + ${n(p / 100, 6)} = ${f(1 + p / 100, 6)}` },
          { label: t("trend.rowTwice"), value: `${f(B)} × ${n(1 + p / 100, 4)}² = ${f(two.compound)}` },
          { label: t("trend.rowSimple"), value: f(two.simple) },
          { label: t("trend.rowGap"), value: f(two.compound - two.simple) },
          { label: t("trend.rowTen"), value: f(series[10].compound) },
          { label: t("trend.rowTenSimple"), value: f(series[10].simple), emphasize: true },
        ],
      }}
    >
      <div dir="ltr">
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="mx-auto block h-auto max-w-full" role="img" aria-label={t("trend.heading", { pct: f(p, 4) })}>
          {[0, 0.5, 1].map((k) => (
            <g key={k}>
              <line x1={L} x2={W - R} y1={Y(lo + k * (hi - lo))} y2={Y(lo + k * (hi - lo))} className="stroke-zinc-200 dark:stroke-zinc-700" />
              <text x={L - 6} y={Y(lo + k * (hi - lo)) + 3} textAnchor="end" className="fill-zinc-400 font-mono text-[9px]">{n(lo + k * (hi - lo), 1)}</text>
            </g>
          ))}
          {series.map((s) => (
            <text key={s.step} x={X(s.step)} y={H - Bm + 14} textAnchor="middle" className="fill-zinc-400 font-mono text-[9px]">{s.step}</text>
          ))}
          <polyline points={line("simple")} fill="none" className="stroke-zinc-400" strokeWidth={2} strokeDasharray="5 4" />
          <polyline points={line("compound")} fill="none" className="stroke-blue-600 dark:stroke-blue-400" strokeWidth={2.5} />
          <line x1={X(2)} x2={X(2)} y1={T} y2={H - Bm} className="stroke-red-500" strokeDasharray="4 3" />
          <circle cx={X(2)} cy={Y(two.compound)} r={5} className="fill-blue-600 stroke-white dark:fill-blue-400 dark:stroke-zinc-900" strokeWidth={1.5} />
          <text x={X(2) + 8} y={Y(two.compound) - 6} className="fill-blue-700 font-mono text-[10px] font-semibold dark:fill-blue-300">{n(two.compound, 2)}</text>
        </svg>
      </div>
      <div className="mt-2 flex flex-wrap gap-4 text-xs text-zinc-500 dark:text-zinc-400">
        <span className="flex items-center gap-1.5"><span className="h-0.5 w-4 bg-blue-600 dark:bg-blue-400" />{t("trend.legendCompound")}</span>
        <span className="flex items-center gap-1.5"><span className="w-4 border-t-2 border-dashed border-zinc-400" />{t("trend.legendSimple")}</span>
        <span className="flex items-center gap-1.5"><span className="w-4 border-t border-dashed border-red-500" />{t("trend.legendTwice")}</span>
      </div>
    </IndicatorCard>
  );
}

/* §31 type 14 — balance: a +p% move and the smaller percent that undoes it. */
export function PercentageUndoBalance() {
  const t = useInd();
  const { frame, fmt } = usePercentage();
  const { f, sp } = fmt;
  const B = frame.base;
  const p = frame.percent;
  const undo = percentToUndo(p);
  const ud = percentUpThenDown(B, p);
  const finite = Number.isFinite(undo);
  const tilt = finite ? clamp((Math.abs(p) - Math.abs(undo)) / Math.max(Math.abs(p), Math.abs(undo), 1e-9), -1, 1) * 12 : 12;
  return (
    <IndicatorCard
      id="undo-balance"
      title={t("balance.title")}
      heading={t("balance.heading", { pct: sp(p, 3) })}
      intro={t("balance.intro")}
      worked={{
        title: t("worked"),
        rows: [
          { label: t("balance.rowStart"), value: f(B) },
          { label: t("balance.rowAfter", { pct: sp(p, 3) }), value: f(ud.up) },
          { label: t("balance.rowUndo"), value: finite ? `−p ÷ (100 + p) = ${sp(undo, 3)}` : "—" },
          { label: t("balance.rowBack"), value: finite ? `${f(ud.up)} × ${f(1 + undo / 100, 6)} = ${f(B)}` : "—" },
          { label: t("balance.rowSame", { pct: sp(-p, 3) }), value: f(ud.upDown) },
          { label: t("balance.rowNet"), value: sp(ud.netPercent, 4), emphasize: true },
        ],
      }}
    >
      <div dir="ltr">
        <svg width={360} height={190} viewBox="0 0 360 190" className="mx-auto block h-auto max-w-full" role="img" aria-label={t("balance.heading", { pct: sp(p, 3) })}>
          <polygon points="180,70 160,170 200,170" className="fill-zinc-300 dark:fill-zinc-600" />
          <rect x={120} y={170} width={120} height={8} rx={3} className="fill-zinc-400 dark:fill-zinc-500" />
          <g transform={`rotate(${tilt} 180 70)`}>
            <rect x={40} y={66} width={280} height={8} rx={4} className="fill-zinc-500 dark:fill-zinc-400" />
            <line x1={70} x2={70} y1={74} y2={110} className="stroke-zinc-400" />
            <line x1={290} x2={290} y1={74} y2={110} className="stroke-zinc-400" />
            <rect x={20} y={110} width={100} height={42} rx={8} className="fill-blue-100 stroke-blue-500 dark:fill-blue-500/20 dark:stroke-blue-400" />
            <rect x={240} y={110} width={100} height={42} rx={8} className="fill-amber-100 stroke-amber-500 dark:fill-amber-500/20 dark:stroke-amber-400" />
            <text x={70} y={128} textAnchor="middle" className="fill-zinc-500 text-[10px] dark:fill-zinc-400">{t("balance.move")}</text>
            <text x={70} y={145} textAnchor="middle" className="fill-blue-700 font-mono text-[13px] font-bold dark:fill-blue-300">{sp(p, 2)}</text>
            <text x={290} y={128} textAnchor="middle" className="fill-zinc-500 text-[10px] dark:fill-zinc-400">{t("balance.undo")}</text>
            <text x={290} y={145} textAnchor="middle" className="fill-amber-700 font-mono text-[13px] font-bold dark:fill-amber-300">{finite ? sp(undo, 2) : "—"}</text>
          </g>
          <circle cx={180} cy={70} r={6} className="fill-zinc-700 dark:fill-zinc-200" />
          <text x={180} y={30} textAnchor="middle" className="fill-zinc-600 font-mono text-[11px] dark:fill-zinc-300">{`${f(B, 2)} → ${f(ud.up, 2)} → ${f(B, 2)}`}</text>
        </svg>
      </div>
    </IndicatorCard>
  );
}

/* §31 type 8 — gradient gauge: where the rate sits from 0% to 200%. */
export function PercentageRangeGauge() {
  const t = useInd();
  const { frame, fmt } = usePercentage();
  const { f } = fmt;
  const p = frame.percent;
  const v = clamp(Math.abs(p), 0, 200);
  const zones = [
    { k: "small", from: 0, to: 10, cls: "stroke-emerald-500" },
    { k: "moderate", from: 10, to: 50, cls: "stroke-blue-500" },
    { k: "large", from: 50, to: 100, cls: "stroke-amber-500" },
    { k: "beyond", from: 100, to: 200, cls: "stroke-red-500" },
  ];
  const zone = zones.find((z) => v <= z.to) ?? zones[3];
  const cx = 150;
  const cy = 140;
  const r = 110;
  const ang = (x: number) => Math.PI - (x / 200) * Math.PI;
  const pt = (x: number, rr = r) => [cx + rr * Math.cos(ang(x)), cy - rr * Math.sin(ang(x))];
  const arc = (a0: number, a1: number) => {
    const [x0, y0] = pt(a0);
    const [x1, y1] = pt(a1);
    return `M ${x0} ${y0} A ${r} ${r} 0 0 1 ${x1} ${y1}`;
  };
  const [nx, ny] = pt(v, r - 18);
  return (
    <IndicatorCard
      id="range-gauge"
      title={t("gauge.title")}
      heading={t("gauge.heading", { zone: t(`gauge.zones.${zone.k}`) })}
      intro={t("gauge.intro")}
      worked={{
        title: t("worked"),
        rows: [
          { label: t("gauge.rowRate"), value: `${f(Math.abs(p), 4)}%` },
          ...zones.map((z) => ({ label: t(`gauge.zones.${z.k}`), value: `${z.from}–${z.to}%`, emphasize: z.k === zone.k })),
          { label: t("gauge.rowOfWhole"), value: `${f(v / 100, 4)} ×` },
        ],
      }}
    >
      <div dir="ltr">
        <svg width={300} height={182} viewBox="0 0 300 182" className="mx-auto block h-auto max-w-full" role="img" aria-label={t("gauge.title")}>
          {zones.map((z) => (
            <path key={z.k} d={arc(z.from, z.to)} fill="none" className={z.cls} strokeWidth={16} />
          ))}
          {[0, 50, 100, 150, 200].map((x) => {
            const [tx, ty] = pt(x, r + 16);
            return <text key={x} x={tx} y={ty + 3} textAnchor="middle" className="fill-zinc-400 font-mono text-[9px]">{`${x}%`}</text>;
          })}
          <line x1={cx} y1={cy} x2={nx} y2={ny} className="stroke-zinc-800 dark:stroke-zinc-100" strokeWidth={3} strokeLinecap="round" />
          <circle cx={cx} cy={cy} r={7} className="fill-zinc-800 dark:fill-zinc-100" />
          {/* Readout below the pivot, so the needle never crosses it at any value. */}
          <text x={cx} y={cy + 34} textAnchor="middle" className="fill-zinc-900 font-mono text-[18px] font-bold dark:fill-zinc-50">{`${f(Math.abs(p), 2)}%`}</text>
        </svg>
      </div>
    </IndicatorCard>
  );
}

/* §31 type 12 — sensitivity trio: the rate a few percentage points lower / as is / higher. */
export function PercentageSensitivityTrio() {
  const t = useInd();
  const { frame, fmt } = usePercentage();
  const { f, sp } = fmt;
  const [d, setD] = useState(1);
  const B = frame.base;
  const p = frame.percent;
  const trio = percentSensitivity(B, p, d);
  const labels = [t("trio.low"), t("trio.current"), t("trio.high")];
  const top = Math.max(...trio.map((x) => Math.abs(x.percent)), 1e-9);
  const rel = p === 0 ? null : (d / Math.abs(p)) * 100;
  return (
    <IndicatorCard
      id="sensitivity"
      title={t("trio.title")}
      heading={t("trio.heading", { d })}
      intro={t("trio.intro")}
      controls={<PillGroup label={t("trio.change")} options={[1, 5, 10]} value={d} onChange={setD} format={(v) => `±${v} pp`} />}
      worked={{
        title: t("worked"),
        rows: [
          { label: t("trio.rowStep"), value: `${f(B)} × ${d}% = ${f((B * d) / 100)}` },
          ...trio.map((x, i) => ({ label: `${labels[i]} (${f(x.percent, 3)}%)`, value: f(x.part) })),
          { label: t("trio.rowRelative"), value: rel === null ? "—" : `${d} ÷ ${f(Math.abs(p), 3)} = ${sp(rel, 2)}`, emphasize: true },
        ],
      }}
    >
      <div className="grid grid-cols-3 gap-3">
        {trio.map((x, i) => (
          <div key={i} className={`flex flex-col items-center rounded-xl border p-3 ${i === 1 ? "border-blue-400 bg-blue-50 dark:border-blue-500/50 dark:bg-blue-500/10" : "border-zinc-200 dark:border-zinc-700"}`}>
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">{labels[i]}</span>
            <div className="my-2 flex h-24 w-8 items-end overflow-hidden rounded-md bg-zinc-100 dark:bg-zinc-800">
              <div className={`w-full ${i === 1 ? "bg-blue-600 dark:bg-blue-400" : i === 0 ? "bg-amber-500" : "bg-emerald-500"}`} style={{ height: `${(Math.abs(x.percent) / top) * 100}%` }} />
            </div>
            <span dir="ltr" className="font-mono text-xs text-zinc-600 dark:text-zinc-300">{`${f(x.percent, 3)}%`}</span>
            <span dir="ltr" className="font-mono text-sm font-bold text-zinc-900 dark:text-zinc-100">{f(x.part, 2)}</span>
          </div>
        ))}
      </div>
    </IndicatorCard>
  );
}

/* §31 type 16 — side-by-side comparison cards: four ways to compare the same two numbers. */
export function PercentageComparisonCards() {
  const t = useInd();
  const { mode, a, b, frame, fmt } = usePercentage();
  const { f, sp } = fmt;
  const twoValues = mode === "percentage-change" || mode === "percentage-difference";
  const [x, y] = twoValues ? [a, b] : [frame.base, frame.base + frame.part];
  const c = percentComparisons(x, y);
  const cards = [
    { k: "changeAB", v: c.changeAB === null ? "—" : sp(c.changeAB, 3), base: f(x), cls: "border-blue-300 bg-blue-50 dark:border-blue-500/40 dark:bg-blue-500/10" },
    { k: "changeBA", v: c.changeBA === null ? "—" : sp(c.changeBA, 3), base: f(y), cls: "border-violet-300 bg-violet-50 dark:border-violet-500/40 dark:bg-violet-500/10" },
    { k: "difference", v: c.difference === null ? "—" : `${f(c.difference, 3)}%`, base: f((x + y) / 2), cls: "border-emerald-300 bg-emerald-50 dark:border-emerald-500/40 dark:bg-emerald-500/10" },
    { k: "ratio", v: c.ratio === null ? "—" : `× ${f(c.ratio, 4)}`, base: f(x), cls: "border-amber-300 bg-amber-50 dark:border-amber-500/40 dark:bg-amber-500/10" },
  ];
  const top = Math.max(Math.abs(x), Math.abs(y), 1e-9);
  return (
    <IndicatorCard
      id="comparison"
      title={t("compare.title")}
      heading={t("compare.heading", { x: f(x), y: f(y) })}
      intro={t("compare.intro")}
      worked={{
        title: t("worked"),
        rows: [
          { label: "x → y", value: `${f(x)} → ${f(y)}` },
          { label: t("compare.changeAB"), value: c.changeAB === null ? "—" : `(${f(y)} − ${f(x)}) ÷ ${f(x)} = ${sp(c.changeAB, 3)}` },
          { label: t("compare.changeBA"), value: c.changeBA === null ? "—" : `(${f(x)} − ${f(y)}) ÷ ${f(y)} = ${sp(c.changeBA, 3)}` },
          { label: t("compare.difference"), value: c.difference === null ? "—" : `${f(Math.abs(y - x))} ÷ ${f((x + y) / 2)} = ${f(c.difference, 3)}%` },
          { label: t("compare.points"), value: `${f(c.points)}`, emphasize: true },
        ],
      }}
    >
      <div dir="ltr" className="mb-3 space-y-1.5">
        {[
          { v: x, l: "x", cls: "bg-zinc-400" },
          { v: y, l: "y", cls: "bg-blue-600 dark:bg-blue-400" },
        ].map((row) => (
          <div key={row.l} className="flex items-center gap-2">
            <span className="w-4 font-mono text-xs text-zinc-500">{row.l}</span>
            <div className="h-3 flex-1 rounded bg-zinc-100 dark:bg-zinc-800">
              <div className={`h-3 rounded ${row.cls}`} style={{ width: `${(Math.abs(row.v) / top) * 100}%` }} />
            </div>
            <span className="w-24 truncate text-end font-mono text-xs font-semibold text-zinc-700 dark:text-zinc-200">{f(row.v, 2)}</span>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {cards.map((card) => (
          <div key={card.k} className={`flex flex-col rounded-xl border-2 p-2.5 ${card.cls}`}>
            <span className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-300">{t(`compare.${card.k}`)}</span>
            <span dir="ltr" className="truncate font-mono text-lg font-bold text-zinc-900 dark:text-zinc-50">{card.v}</span>
            <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
              {t("compare.baseUsed")} <span dir="ltr" className="font-mono">{card.base}</span>
            </span>
          </div>
        ))}
      </div>
    </IndicatorCard>
  );
}

/* §31 type 5 — ranked horizontal bars: everyday percentages of the same base, yours highlighted. */
export function PercentageRankedList() {
  const t = useInd();
  const { frame, fmt } = usePercentage();
  const { f } = fmt;
  const B = frame.base;
  const p = frame.percent;
  const common = [1, 5, 10, 12.5, 15, 20, 25, 100 / 3, 50, 75, 100];
  const rows = [...common.filter((c) => Math.abs(c - p) > 1e-9).map((c) => ({ pct: c, mine: false })), { pct: p, mine: true }]
    .map((r) => ({ ...r, part: (B * r.pct) / 100 }))
    .sort((u, v) => v.part - u.part);
  const top = Math.max(...rows.map((r) => Math.abs(r.part)), 1e-12);
  const rank = rows.findIndex((r) => r.mine) + 1;
  return (
    <IndicatorCard
      id="ranked"
      title={t("ranked.title")}
      heading={t("ranked.heading", { base: f(B) })}
      intro={t("ranked.intro")}
      worked={{
        title: t("worked"),
        rows: [
          { label: t("ranked.rowBase"), value: f(B) },
          { label: "10%", value: f(B / 10) },
          { label: "25%", value: f(B / 4) },
          { label: "50%", value: f(B / 2) },
          { label: t("ranked.rowYours", { pct: f(p, 3) }), value: f((B * p) / 100) },
          { label: t("ranked.rowRank"), value: `${rank} / ${rows.length}`, emphasize: true },
        ],
      }}
    >
      <ul className="space-y-1">
        {rows.map((r, i) => (
          <li key={i} className="flex items-center gap-2">
            <span dir="ltr" className={`w-14 shrink-0 text-end font-mono text-xs ${r.mine ? "font-bold text-blue-700 dark:text-blue-300" : "text-zinc-500 dark:text-zinc-400"}`}>{`${f(r.pct, 2)}%`}</span>
            <div className="h-3.5 flex-1 rounded bg-zinc-100 dark:bg-zinc-800">
              <div className={`h-3.5 rounded ${r.mine ? "bg-blue-600 dark:bg-blue-400" : "bg-zinc-400 dark:bg-zinc-500"}`} style={{ width: `${(Math.abs(r.part) / top) * 100}%` }} />
            </div>
            <span dir="ltr" className={`w-20 shrink-0 truncate text-end font-mono text-xs ${r.mine ? "font-bold text-blue-700 dark:text-blue-300" : "text-zinc-700 dark:text-zinc-200"}`}>{f(r.part, 2)}</span>
          </li>
        ))}
      </ul>
    </IndicatorCard>
  );
}
