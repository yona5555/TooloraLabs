"use client";
import { useTranslations } from "next-intl";
import SdIndicatorCard, { scaleX } from "./SdIndicatorCard";
import { useSdModel } from "./SdLiveContext";

const W = 310;
const H = 190;
const L = 40;
const R = 12;
const TOP = 22;
const BASE = 160;

/** Type #7 (Trend Line with Highlighted Reference Point): σ and s recomputed after each value in input order (Welford's method), the final σ highlighted. */
export default function SdRunningTrend() {
  const t = useTranslations("tools.standard-deviation-calculator.education.lab.running");
  const tr = useTranslations("tools.standard-deviation-calculator.result");
  const { a, f } = useSdModel();
  if (!a) return null;

  const run = a.running;
  const maxY = Math.max(...run.map((r) => Math.max(r.populationStdDev, r.sampleStdDev)), 1e-9);
  const sx = scaleX(1, Math.max(2, run.length), L, W - R);
  const sy = (v: number) => BASE - (v / maxY) * (BASE - TOP);
  const pop = run.map((r) => `${sx(r.n).toFixed(1)},${sy(r.populationStdDev).toFixed(1)}`).join(" ");
  const smp = run.filter((r) => r.n > 1).map((r) => `${sx(r.n).toFixed(1)},${sy(r.sampleStdDev).toFixed(1)}`).join(" ");
  const last = run[run.length - 1];
  const peak = run.reduce((best, r) => (r.populationStdDev > best.populationStdDev ? r : best), run[0]);
  const ticks = run.length <= 10 ? run.map((r) => r.n) : [1, Math.round(run.length / 2), run.length];

  const svg = (
    <div className="w-full max-w-[310px]">
      <svg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="mx-auto block max-w-full">
        {[0, 0.5, 1].map((q) => (
          <g key={q}>
            <line x1={L} y1={sy(q * maxY)} x2={W - R} y2={sy(q * maxY)} strokeDasharray={q ? "3 3" : undefined} className="stroke-zinc-200 dark:stroke-zinc-700" />
            <text x={L - 5} y={sy(q * maxY) + 3} textAnchor="end" fontSize={9} fontFamily="ui-monospace, monospace" className="fill-zinc-500 dark:fill-zinc-400">
              {f(q * maxY, 2)}
            </text>
          </g>
        ))}
        {ticks.map((n) => (
          <text key={n} x={sx(n)} y={BASE + 14} textAnchor="middle" fontSize={9} className="fill-zinc-500 dark:fill-zinc-400">
            {n}
          </text>
        ))}
        <text x={(L + W - R) / 2} y={BASE + 27} textAnchor="middle" fontSize={10} className="fill-zinc-500 dark:fill-zinc-400">
          n
        </text>
        {smp && <polyline points={smp} fill="none" strokeWidth={2} strokeDasharray="5 3" className="stroke-violet-500 dark:stroke-violet-400" />}
        <polyline points={pop} fill="none" strokeWidth={2.5} className="stroke-blue-600 dark:stroke-blue-400" />
        {run.map((r) => (
          <circle key={r.n} cx={sx(r.n)} cy={sy(r.populationStdDev)} r={2.5} className="fill-blue-600 dark:fill-blue-400" />
        ))}
        <circle cx={sx(last.n)} cy={sy(last.populationStdDev)} r={6} strokeWidth={2} className="fill-white stroke-rose-600 dark:fill-zinc-900 dark:stroke-rose-400" />
        <text x={Math.min(sx(last.n), W - R - 40)} y={Math.max(12, sy(last.populationStdDev) - 10)} textAnchor="middle" fontSize={11} fontWeight={700} className="fill-rose-700 dark:fill-rose-300">
          {`σ = ${f(last.populationStdDev)}`}
        </text>
        <g fontSize={10}>
          <line x1={L} y1={8} x2={L + 16} y2={8} strokeWidth={2.5} className="stroke-blue-600 dark:stroke-blue-400" />
          <text x={L + 20} y={11} className="fill-zinc-600 dark:fill-zinc-300">σ</text>
          <line x1={L + 40} y1={8} x2={L + 56} y2={8} strokeWidth={2} strokeDasharray="5 3" className="stroke-violet-500 dark:stroke-violet-400" />
          <text x={L + 60} y={11} className="fill-zinc-600 dark:fill-zinc-300">s</text>
        </g>
      </svg>
    </div>
  );

  return (
    <SdIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={svg}
      rows={[
        { label: t("first"), value: `n = 1 → σ = 0` },
        { label: t("peak"), value: `n = ${peak.n} → ${f(peak.populationStdDev)}` },
        { label: tr("populationStdDev"), value: `n = ${last.n} → ${f(last.populationStdDev, 4)}`, emphasize: true },
        { label: tr("sampleStdDev"), value: f(last.sampleStdDev, 4) },
        { label: t("method"), value: "M₂ += δ·(x − x̄ₙ)" },
      ]}
    />
  );
}
