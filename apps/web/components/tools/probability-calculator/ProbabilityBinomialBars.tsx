"use client";
import { useTranslations } from "next-intl";
import { atLeastOnce, binomialDistribution } from "@tooloralabs/tools";
import ProbabilityIndicatorCard from "./ProbabilityIndicatorCard";
import { useProbabilityModel } from "./ProbabilityLiveContext";

const N = 10;
const W = 320;
const H = 210;
const L = 8;
const T = 22;
const B = 34;

/**
 * Type #1 (Labeled Bar Chart): how many times the calculated event happens in 10 independent
 * repeats, X ~ Binomial(10, p), each bar labelled with its probability and the most likely count highlighted.
 */
export default function ProbabilityBinomialBars() {
  const t = useTranslations("tools.probability-calculator.education.lab.binomial");
  const { r, symbol, f, pct } = useProbabilityModel();
  const dist = binomialDistribution(N, r);
  const max = Math.max(...dist, 1e-9);
  const mode = dist.indexOf(Math.max(...dist));
  const mean = N * r;
  const sd = Math.sqrt(N * r * (1 - r));
  const slot = (W - 2 * L) / (N + 1);
  const bw = slot * 0.72;

  const chart = (
    <svg style={{ direction: "ltr" }} width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("title")} className="mx-auto max-w-full">
      <line x1={L} x2={W - L} y1={H - B} y2={H - B} className="stroke-zinc-300 dark:stroke-zinc-600" />
      {dist.map((p, k) => {
        const h = ((H - T - B) * p) / max;
        const x = L + k * slot + (slot - bw) / 2;
        const top = k === mode;
        return (
          <g key={k}>
            <rect x={x} y={H - B - h} width={bw} height={Math.max(h, 0.5)} rx={3} className={top ? "fill-blue-600 dark:fill-blue-400" : "fill-blue-300 dark:fill-blue-500/60"} />
            {p >= 0.005 && (
              <text x={x + bw / 2} y={H - B - h - 4} textAnchor="middle" className={`font-mono text-[8.5px] font-bold ${top ? "fill-blue-700 dark:fill-blue-300" : "fill-zinc-600 dark:fill-zinc-300"}`}>
                {f(p * 100, p >= 0.1 ? 0 : 1)}
              </text>
            )}
            <text x={x + bw / 2} y={H - B + 13} textAnchor="middle" className="fill-zinc-600 font-mono text-[10px] dark:fill-zinc-300">{f(k, 0)}</text>
          </g>
        );
      })}
      <text x={W / 2} y={H - 4} textAnchor="middle" className="fill-zinc-500 text-[10px] dark:fill-zinc-400">{t("axis")}</text>
      <text x={W - L} y={12} textAnchor="end" className="fill-zinc-500 font-mono text-[10px] dark:fill-zinc-400">%</text>
    </svg>
  );

  return (
    <ProbabilityIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={chart}
      rows={[
        { label: `n · ${symbol}`, value: `${f(N, 0)} · ${pct(r)}` },
        { label: t("mean"), value: `${f(N, 0)} × ${f(r, 4)} = ${f(mean, 3)}` },
        { label: t("sd"), value: `√(${f(N, 0)}·${f(r, 3)}·${f(1 - r, 3)}) = ${f(sd, 3)}` },
        { label: "P(X = 0)", value: pct(dist[0]) },
        { label: "P(X ≥ 1)", value: `1 − ${pct(dist[0])} = ${pct(atLeastOnce(r, N))}` },
        { label: t("mostLikely"), value: `X = ${f(mode, 0)} (${pct(dist[mode])})`, emphasize: true },
      ]}
    />
  );
}
