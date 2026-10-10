"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Play, Shuffle } from "lucide-react";
import { sampleRegions, standardError } from "@tooloralabs/tools";
import ProbabilityIndicatorCard from "./ProbabilityIndicatorCard";
import { useProbabilityModel } from "./ProbabilityLiveContext";

const TRIALS = 2000;
const W = 320;
const H = 210;
const L = 38;
const R = 10;
const T = 12;
const B = 28;
const DURATION_MS = 4000;

/**
 * Type #7 (Trend Line with Highlighted Reference Point), animated: a seeded Monte-Carlo run draws
 * outcomes of the very joint model on the page and plots the running frequency of the calculated
 * event, which settles onto the exact probability (dashed) inside its ±2 standard-error funnel.
 */
export default function ProbabilityMonteCarlo() {
  const t = useTranslations("tools.probability-calculator.education.lab.monteCarlo");
  const { mode, b, r, symbol, target, f, pct } = useProbabilityModel();
  const [seed, setSeed] = useState(1);
  const [shown, setShown] = useState(TRIALS);
  const [run, setRun] = useState(0);
  const raf = useRef<number | null>(null);

  // Running estimate: hits / trials (conditional mode: A∩B hits among the trials where B happened).
  const series = useMemo(() => {
    const regions = sampleRegions(b, TRIALS, seed);
    const out: Array<number | null> = [];
    let hits = 0;
    let base = 0;
    for (const reg of regions) {
      if (mode === "conditional") {
        if (reg === 0 || reg === 2) base += 1;
        if (reg === 0) hits += 1;
      } else {
        base += 1;
        if (target[reg]) hits += 1;
      }
      out.push(base > 0 ? hits / base : null);
    }
    return { out, base, hits };
  }, [b, seed, mode, target]);

  useEffect(() => {
    const reduce = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    // Reduced motion: keep the full run on screen (the initial state), no animation.
    if (reduce) return;
    const start = performance.now();
    const tick = (now: number) => {
      const k = Math.min(1, (now - start) / DURATION_MS);
      setShown(Math.max(1, Math.round(TRIALS * k * k)));
      if (k < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [series, run]);

  const x = (i: number) => L + ((W - L - R) * i) / (TRIALS - 1);
  const y = (v: number) => T + (H - T - B) * (1 - v);
  let path = "";
  for (let i = 0; i < shown; i += 4) {
    const v = series.out[i];
    if (v == null) continue;
    path += `${path ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`;
  }
  const est = series.out[shown - 1] ?? r;
  // Expected number of trials feeding the estimate after `shown` draws (conditional: only B trials count).
  const effective = mode === "conditional" ? Math.max(1, shown * b.pB) : shown;
  const se = standardError(r, effective);
  const funnelTop: string[] = [];
  const funnelBot: string[] = [];
  for (let i = 9; i < TRIALS; i += 20) {
    const n = mode === "conditional" ? Math.max(1, (i + 1) * b.pB) : i + 1;
    const e = 2 * standardError(r, n);
    funnelTop.push(`${x(i).toFixed(1)},${y(Math.min(1, r + e)).toFixed(1)}`);
    funnelBot.unshift(`${x(i).toFixed(1)},${y(Math.max(0, r - e)).toFixed(1)}`);
  }

  const chart = (
    <div className="w-full lg:w-[320px]">
      <svg style={{ direction: "ltr" }} width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("title")} className="mx-auto max-w-full">
        {[0, 0.25, 0.5, 0.75, 1].map((v) => (
          <g key={v}>
            <line x1={L} x2={W - R} y1={y(v)} y2={y(v)} className="stroke-zinc-200 dark:stroke-zinc-700" />
            <text x={L - 4} y={y(v) + 3} textAnchor="end" className="fill-zinc-500 font-mono text-[9px] dark:fill-zinc-400">{pct(v, 0)}</text>
          </g>
        ))}
        {[0, 500, 1000, 1500, 2000].map((n) => (
          <text key={n} x={x(Math.max(0, n - 1))} y={H - 12} textAnchor="middle" className="fill-zinc-500 font-mono text-[9px] dark:fill-zinc-400">{f(n, 0)}</text>
        ))}
        <polygon points={[...funnelTop, ...funnelBot].join(" ")} className="fill-blue-500/15 dark:fill-blue-400/15" />
        <line x1={L} x2={W - R} y1={y(r)} y2={y(r)} strokeDasharray="5 4" strokeWidth={1.5} className="stroke-violet-600 dark:stroke-violet-400" />
        <path d={path} fill="none" strokeWidth={1.8} className="stroke-blue-600 dark:stroke-blue-400" />
        <circle cx={x(shown - 1)} cy={y(est)} r={4.5} className="fill-blue-600 stroke-white dark:fill-blue-400 dark:stroke-zinc-900" strokeWidth={1.5} />
        <text x={W - R - 2} y={Math.max(T + 10, y(r) - 6)} textAnchor="end" className="fill-violet-700 font-mono text-[10px] font-bold dark:fill-violet-300">{`${symbol} = ${pct(r)}`}</text>
        <text x={L + 4} y={H - 2} className="fill-zinc-500 text-[9px] dark:fill-zinc-400">{t("axis")}</text>
      </svg>
      <div className="mt-2 flex justify-center gap-2">
        <button
          type="button"
          onClick={() => setRun((n) => n + 1)}
          className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 px-2.5 py-1 text-xs font-semibold text-blue-700 transition hover:bg-blue-50 dark:border-zinc-700 dark:text-blue-300 dark:hover:bg-zinc-800"
        >
          <Play size={12} aria-hidden />
          {t("replay")}
        </button>
        <button
          type="button"
          onClick={() => setSeed((s) => s + 1)}
          className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 px-2.5 py-1 text-xs font-semibold text-blue-700 transition hover:bg-blue-50 dark:border-zinc-700 dark:text-blue-300 dark:hover:bg-zinc-800"
        >
          <Shuffle size={12} aria-hidden />
          {t("newRun")}
        </button>
      </div>
    </div>
  );

  return (
    <ProbabilityIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={chart}
      rows={[
        { label: t("trials"), value: f(shown, 0) },
        { label: t("seed"), value: f(seed, 0) },
        { label: t("estimate"), value: pct(est) },
        { label: t("exact"), value: pct(r) },
        { label: t("error"), value: `|${pct(est)} − ${pct(r)}| = ${pct(Math.abs(est - r))}` },
        { label: t("band"), value: `± 2 × ${pct(se)} = ± ${pct(2 * se)}`, emphasize: true },
      ]}
    />
  );
}
