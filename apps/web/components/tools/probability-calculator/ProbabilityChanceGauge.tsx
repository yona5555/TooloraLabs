"use client";
import { useId } from "react";
import { useTranslations } from "next-intl";
import { binaryEntropyBits, oddsFromProbability, surprisalBits } from "@tooloralabs/tools";
import ProbabilityIndicatorCard from "./ProbabilityIndicatorCard";
import { useProbabilityModel } from "./ProbabilityLiveContext";

const W = 300;
const H = 190;
const CX = W / 2;
const CY = 160;
const R = 118;
const ZONES: Array<[number, string]> = [
  [0.05, "rare"],
  [0.35, "unlikely"],
  [0.65, "even"],
  [0.95, "likely"],
  [1.01, "certain"],
];

const polar = (frac: number, r = R): [number, number] => {
  const a = Math.PI * (1 - frac);
  return [CX + r * Math.cos(a), CY - r * Math.sin(a)];
};

/** Type #8 (Gradient Gauge): the calculated probability on the impossible → certain scale, with its likelihood zone. */
export default function ProbabilityChanceGauge() {
  const t = useTranslations("tools.probability-calculator.education.lab.gauge");
  const gid = useId().replace(/:/g, "");
  const { r, symbol, f, pct } = useProbabilityModel();
  const zone = ZONES.find(([lim]) => r < lim)?.[1] ?? "certain";
  const odds = oddsFromProbability(r);
  const [nx, ny] = polar(r, R - 22);
  const [ax, ay] = polar(0);
  const [bx, by] = polar(1);

  const gauge = (
    <svg style={{ direction: "ltr" }} width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("title")} className="mx-auto max-w-full">
      <defs>
        <linearGradient id={gid} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="#ef4444" />
          <stop offset="50%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#10b981" />
        </linearGradient>
      </defs>
      <path d={`M${ax},${ay} A${R},${R} 0 0 1 ${bx},${by}`} fill="none" stroke={`url(#${gid})`} strokeWidth={18} strokeLinecap="round" />
      {[0, 0.25, 0.5, 0.75, 1].map((p) => {
        const [tx, ty] = polar(p, R + 18);
        return (
          <text key={p} x={tx} y={ty} textAnchor="middle" className="fill-zinc-500 font-mono text-[10px] dark:fill-zinc-400">
            {pct(p, 0)}
          </text>
        );
      })}
      <line x1={CX} y1={CY} x2={nx} y2={ny} strokeWidth={4} strokeLinecap="round" className="stroke-zinc-800 dark:stroke-zinc-100" />
      <circle cx={CX} cy={CY} r={7} className="fill-zinc-800 dark:fill-zinc-100" />
      <text x={CX} y={CY - 38} textAnchor="middle" className="fill-zinc-800 font-mono text-[17px] font-bold dark:fill-zinc-100">{`${symbol} = ${pct(r)}`}</text>
      <text x={CX} y={CY - 18} textAnchor="middle" className="fill-zinc-500 text-[11px] font-semibold dark:fill-zinc-400">{t(`zones.${zone}`)}</text>
    </svg>
  );

  return (
    <ProbabilityIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={gauge}
      rows={[
        { label: symbol, value: pct(r) },
        { label: t("zone"), value: t(`zones.${zone}`), emphasize: true },
        { label: t("complement"), value: `1 − ${pct(r)} = ${pct(1 - r)}` },
        { label: t("oddsAgainst"), value: `${f(odds.oddsAgainst, 3)} : 1` },
        { label: t("surprise"), value: `−log₂(${f(r, 4)}) = ${f(surprisalBits(r), 3)}` },
        { label: t("entropy"), value: f(binaryEntropyBits(r), 3) },
      ]}
    />
  );
}
