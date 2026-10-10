"use client";
import { useTranslations } from "next-intl";
import { binomialCoefficient, surprisalBits } from "@tooloralabs/tools";
import ProbabilityIndicatorCard from "./ProbabilityIndicatorCard";
import { useProbabilityModel } from "./ProbabilityLiveContext";

const W = 320;
const H = 230;
const X = 70;
const T = 14;
const B = 14;
const MAX_LOG = 8;

/** Exact "1 in N" odds of classic games of chance, computed from their own combinatorics. */
const REFS: Array<{ key: string; n: number }> = [
  { key: "coin", n: 2 },
  { key: "die", n: 6 },
  { key: "card", n: 52 },
  { key: "tripleSix", n: 216 },
  { key: "fourKind", n: binomialCoefficient(52, 5) / 624 },
  { key: "royalFlush", n: binomialCoefficient(52, 5) / 4 },
  { key: "lottery", n: binomialCoefficient(49, 6) },
];

/**
 * Type #10 (Log-Scale Magnitude Bar): the calculated probability as "1 in N" on a logarithmic
 * ladder from 1 to 100 million, set against exact reference odds from cards, dice and lotteries.
 */
export default function ProbabilityRarityLogScale() {
  const t = useTranslations("tools.probability-calculator.education.lab.rarity");
  const { r, symbol, f, pct } = useProbabilityModel();
  const n = r > 0 ? 1 / r : Infinity;
  const logN = Number.isFinite(n) ? Math.log10(n) : MAX_LOG;
  const y = (lg: number) => T + (H - T - B) * (1 - Math.min(MAX_LOG, Math.max(0, lg)) / MAX_LOG);
  const nearest = REFS.reduce((best, ref) => (Math.abs(Math.log10(ref.n) - logN) < Math.abs(Math.log10(best.n) - logN) ? ref : best), REFS[0]);

  const scale = (
    <svg style={{ direction: "ltr" }} width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("title")} className="mx-auto max-w-full">
      <rect x={X - 6} y={T} width={12} height={H - T - B} rx={6} className="fill-zinc-200 dark:fill-zinc-700" />
      <rect x={X - 6} y={y(logN)} width={12} height={H - B - y(logN)} rx={6} className="fill-blue-500 dark:fill-blue-400" />
      {Array.from({ length: MAX_LOG + 1 }, (_, p) => (
        <g key={p}>
          <line x1={X - 10} x2={X - 6} y1={y(p)} y2={y(p)} className="stroke-zinc-400" />
          <text x={X - 13} y={y(p) + 3} textAnchor="end" className="fill-zinc-500 font-mono text-[9px] dark:fill-zinc-400">
            {p === 0 ? "1" : `10${"⁰¹²³⁴⁵⁶⁷⁸"[p]}`}
          </text>
        </g>
      ))}
      {REFS.map((ref) => (
        <g key={ref.key}>
          <line x1={X + 6} x2={X + 18} y1={y(Math.log10(ref.n))} y2={y(Math.log10(ref.n))} className="stroke-zinc-400 dark:stroke-zinc-500" />
          <text x={X + 22} y={y(Math.log10(ref.n)) + 3} className="fill-zinc-600 text-[9.5px] dark:fill-zinc-300">
            {`${t(`refs.${ref.key}`)} · 1/${f(ref.n, 0)}`}
          </text>
        </g>
      ))}
      <polygon points={`${X - 22},${y(logN)} ${X - 34},${y(logN) - 6} ${X - 34},${y(logN) + 6}`} className="fill-violet-600 dark:fill-violet-400" />
      <text x={4} y={y(logN) - 9} className="fill-violet-700 font-mono text-[10px] font-bold dark:fill-violet-300">{Number.isFinite(n) ? `1/${f(n, n < 10 ? 2 : 0)}` : "0"}</text>
    </svg>
  );

  return (
    <ProbabilityIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={scale}
      rows={[
        { label: symbol, value: pct(r, 4) },
        { label: t("oneIn"), value: Number.isFinite(n) ? `1 / ${f(r, 6)} = ${f(n, 2)}` : "∞" },
        { label: "log₁₀ N", value: Number.isFinite(n) ? f(logN, 3) : "∞" },
        { label: t("bits"), value: f(surprisalBits(r), 3) },
        { label: t("nearest"), value: `${t(`refs.${nearest.key}`)} (1/${f(nearest.n, 0)})`, emphasize: true },
      ]}
    />
  );
}
