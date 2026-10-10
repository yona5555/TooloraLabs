"use client";
import { useTranslations } from "next-intl";
import ProbabilityIndicatorCard from "./ProbabilityIndicatorCard";
import { useProbabilityModel } from "./ProbabilityLiveContext";

const W = 320;
const H = 200;
const CX = W / 2;
const PIVOT = 70;
const ARM = 112;
const MAX_TILT = 18;

/**
 * Type #14 (Balance Indicator): the observed overlap P(A∩B) on one pan and the product P(A)·P(B)
 * that independence predicts on the other; the beam tilts by their difference, level = independent.
 */
export default function ProbabilityIndependenceBalance() {
  const t = useTranslations("tools.probability-calculator.education.lab.balance");
  const tl = useTranslations("tools.probability-calculator.live3d");
  const { b, f, pct } = useProbabilityModel();
  const diff = b.pAB - b.independentProduct;
  const scale = Math.max(b.pAB, b.independentProduct, 1e-9);
  const tilt = Math.max(-MAX_TILT, Math.min(MAX_TILT, (diff / scale) * MAX_TILT));
  const rad = (tilt * Math.PI) / 180;
  // Heavier observed overlap (left pan) pulls the left end down.
  const lx = CX - ARM * Math.cos(rad);
  const ly = PIVOT + ARM * Math.sin(rad);
  const rx = CX + ARM * Math.cos(rad);
  const ry = PIVOT - ARM * Math.sin(rad);
  const level = b.relation === "independent";

  const pan = (x: number, y: number, label: string, value: string, tone: string) => (
    <g>
      <line x1={x} y1={y} x2={x - 26} y2={y + 34} className="stroke-zinc-400" />
      <line x1={x} y1={y} x2={x + 26} y2={y + 34} className="stroke-zinc-400" />
      <path d={`M${x - 34},${y + 34} Q${x},${y + 56} ${x + 34},${y + 34} Z`} className={tone} />
      <text x={x} y={y + 74} textAnchor="middle" className="fill-zinc-800 font-mono text-[12px] font-bold dark:fill-zinc-100">{value}</text>
      <text x={x} y={y + 88} textAnchor="middle" className="fill-zinc-500 text-[10px] dark:fill-zinc-400">{label}</text>
    </g>
  );

  const balance = (
    <svg style={{ direction: "ltr" }} width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("title")} className="mx-auto max-w-full">
      <polygon points={`${CX},${PIVOT} ${CX - 16},${H - 10} ${CX + 16},${H - 10}`} className="fill-zinc-300 dark:fill-zinc-600" />
      <line x1={lx} y1={ly} x2={rx} y2={ry} strokeWidth={5} strokeLinecap="round" className={level ? "stroke-emerald-500" : "stroke-zinc-700 dark:stroke-zinc-200"} />
      <circle cx={CX} cy={PIVOT} r={6} className="fill-zinc-700 dark:fill-zinc-200" />
      {pan(lx, ly, "P(A∩B)", pct(b.pAB), "fill-violet-500/80 dark:fill-violet-400/80")}
      {pan(rx, ry, "P(A)·P(B)", pct(b.independentProduct), "fill-blue-500/80 dark:fill-blue-400/80")}
      <text x={CX} y={22} textAnchor="middle" className={`text-[12px] font-bold ${level ? "fill-emerald-600 dark:fill-emerald-400" : "fill-amber-600 dark:fill-amber-400"}`}>
        {tl(`relations.${b.relation}`)}
      </text>
    </svg>
  );

  return (
    <ProbabilityIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={balance}
      rows={[
        { label: "P(A∩B)", value: pct(b.pAB) },
        { label: "P(A)·P(B)", value: `${pct(b.pA)} × ${pct(b.pB)} = ${pct(b.independentProduct)}` },
        { label: t("difference"), value: `${f(b.covariance * 100, 3)} ${t("points")}` },
        { label: tl("lift"), value: Number.isFinite(b.lift) ? f(b.lift, 3) : tl("undefined") },
        { label: t("phi"), value: Number.isFinite(b.phi) ? f(b.phi, 3) : tl("undefined") },
        { label: tl("relation"), value: tl(`relations.${b.relation}`), emphasize: true },
      ]}
    />
  );
}
