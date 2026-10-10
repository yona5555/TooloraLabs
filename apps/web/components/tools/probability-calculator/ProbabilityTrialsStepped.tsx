"use client";
import { useTranslations } from "next-intl";
import { atLeastOnce, trialsForConfidence } from "@tooloralabs/tools";
import ProbabilityIndicatorCard from "./ProbabilityIndicatorCard";
import { useProbabilityModel } from "./ProbabilityLiveContext";

const LEVELS = [0.5, 0.75, 0.9, 0.95, 0.99];
const W = 320;
const H = 200;
const L = 10;
const T = 26;
const B = 30;

/**
 * Type #13 (Stepped Diagram): how many independent tries it takes before the calculated event has
 * happened at least once with 50 → 99% confidence; each step solves 1 − (1 − p)ⁿ ≥ c for n.
 */
export default function ProbabilityTrialsStepped() {
  const t = useTranslations("tools.probability-calculator.education.lab.trials");
  const { r, symbol, f, pct } = useProbabilityModel();
  const needs = LEVELS.map((c) => trialsForConfidence(r, c));
  const finite = needs.filter(Number.isFinite);
  const top = Math.max(1, ...finite);
  const slot = (W - 2 * L) / LEVELS.length;

  const steps = (
    <svg style={{ direction: "ltr" }} width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("title")} className="mx-auto max-w-full">
      <line x1={L} x2={W - L} y1={H - B} y2={H - B} className="stroke-zinc-300 dark:stroke-zinc-600" />
      {needs.map((n, i) => {
        const h = Number.isFinite(n) ? Math.max(6, ((H - T - B) * n) / top) : H - T - B;
        const x = L + i * slot + 4;
        return (
          <g key={i}>
            <rect x={x} y={H - B - h} width={slot - 8} height={h} rx={4} className={i === LEVELS.length - 1 ? "fill-blue-600 dark:fill-blue-400" : "fill-blue-400/80 dark:fill-blue-500/70"} />
            <text x={x + (slot - 8) / 2} y={H - B - h - 6} textAnchor="middle" className="fill-zinc-800 font-mono text-[11px] font-bold dark:fill-zinc-100">
              {Number.isFinite(n) ? `n=${f(n, 0)}` : "∞"}
            </text>
            <text x={x + (slot - 8) / 2} y={H - B + 14} textAnchor="middle" className="fill-zinc-600 font-mono text-[10px] dark:fill-zinc-300">{pct(LEVELS[i], 0)}</text>
          </g>
        );
      })}
      <text x={W / 2} y={H - 3} textAnchor="middle" className="fill-zinc-500 text-[10px] dark:fill-zinc-400">{t("axis")}</text>
    </svg>
  );

  const n95 = needs[3];
  return (
    <ProbabilityIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={steps}
      rows={[
        { label: symbol, value: pct(r) },
        { label: t("rule"), value: "n = ⌈ln(1 − c) / ln(1 − p)⌉" },
        ...LEVELS.slice(0, 3).map((c, i) => ({ label: `c = ${pct(c, 0)}`, value: Number.isFinite(needs[i]) ? f(needs[i], 0) : "∞" })),
        {
          label: `c = ${pct(0.95, 0)}`,
          value: Number.isFinite(n95) ? `${f(n95, 0)} → ${pct(atLeastOnce(r, n95))}` : "∞",
          emphasize: true,
        },
      ]}
    />
  );
}
