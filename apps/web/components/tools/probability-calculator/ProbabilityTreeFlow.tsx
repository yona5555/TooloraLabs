"use client";
import { useTranslations } from "next-intl";
import ProbabilityIndicatorCard, { REGION_FILL } from "./ProbabilityIndicatorCard";
import { useProbabilityModel } from "./ProbabilityLiveContext";

const W = 320;
const H = 220;

/**
 * Type #3 (Hierarchical Flow): a two-level probability tree, B first then A given B, with each
 * branch carrying its live probability and each leaf the joint product; the calculated event's
 * leaves are filled.
 */
export default function ProbabilityTreeFlow() {
  const t = useTranslations("tools.probability-calculator.education.lab.tree");
  const { b, r, symbol, target, pct } = useProbabilityModel();
  const aGivenNotB = b.notB > 0 ? b.aOnly / b.notB : 0;
  const aGivenB = Number.isFinite(b.aGivenB) ? b.aGivenB : 0;

  const root: [number, number] = [26, H / 2];
  const mid: Array<[number, number]> = [[132, 58], [132, 162]];
  const leaves: Array<{ y: number; from: number; label: string; branch: number; joint: number; region: number }> = [
    { y: 22, from: 0, label: "A", branch: aGivenB, joint: b.pAB, region: 0 },
    { y: 86, from: 0, label: "A′", branch: 1 - aGivenB, joint: b.bOnly, region: 2 },
    { y: 134, from: 1, label: "A", branch: aGivenNotB, joint: b.aOnly, region: 1 },
    { y: 198, from: 1, label: "A′", branch: 1 - aGivenNotB, joint: b.neither, region: 3 },
  ];
  const LX = 236;

  const tree = (
    <svg style={{ direction: "ltr" }} width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("title")} className="mx-auto max-w-full">
      {mid.map(([x, y], i) => (
        <g key={i}>
          <line x1={root[0]} y1={root[1]} x2={x} y2={y} strokeWidth={2} className={i === 0 ? "stroke-emerald-500" : "stroke-zinc-400"} />
          <text x={(root[0] + x) / 2 - 4} y={(root[1] + y) / 2 + (i === 0 ? -6 : 14)} textAnchor="middle" className="fill-zinc-700 font-mono text-[10px] font-bold dark:fill-zinc-200">
            {pct(i === 0 ? b.pB : b.notB, 1)}
          </text>
          <circle cx={x} cy={y} r={13} className={i === 0 ? "fill-emerald-500" : "fill-zinc-400 dark:fill-zinc-500"} />
          <text x={x} y={y + 4} textAnchor="middle" className="fill-white text-[11px] font-bold">{i === 0 ? "B" : "B′"}</text>
        </g>
      ))}
      {leaves.map((l, i) => {
        const [mx, my] = mid[l.from];
        const hit = target[l.region];
        return (
          <g key={i}>
            <line x1={mx + 13} y1={my} x2={LX - 12} y2={l.y} strokeWidth={hit ? 2.5 : 1.5} className={hit ? "stroke-violet-500" : "stroke-zinc-300 dark:stroke-zinc-600"} />
            <text x={(mx + LX) / 2 + 2} y={(my + l.y) / 2 - 3} textAnchor="middle" className="fill-zinc-600 font-mono text-[9px] dark:fill-zinc-300">{pct(l.branch, 1)}</text>
            <circle cx={LX} cy={l.y} r={11} className={REGION_FILL[l.region]} fillOpacity={hit ? 1 : 0.55} />
            <text x={LX} y={l.y + 4} textAnchor="middle" className="fill-white text-[10px] font-bold">{l.label}</text>
            <text x={LX + 16} y={l.y + 4} className={`font-mono text-[10px] font-bold ${hit ? "fill-violet-700 dark:fill-violet-300" : "fill-zinc-700 dark:fill-zinc-200"}`}>{pct(l.joint, 2)}</text>
          </g>
        );
      })}
      <circle cx={root[0]} cy={root[1]} r={6} className="fill-zinc-700 dark:fill-zinc-200" />
    </svg>
  );

  return (
    <ProbabilityIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={tree}
      rows={[
        { label: "P(B) × P(A|B)", value: `${pct(b.pB)} × ${pct(aGivenB)} = ${pct(b.pAB)}` },
        { label: "P(B) × P(A′|B)", value: `${pct(b.pB)} × ${pct(1 - aGivenB)} = ${pct(b.bOnly)}` },
        { label: "P(B′) × P(A|B′)", value: `${pct(b.notB)} × ${pct(aGivenNotB)} = ${pct(b.aOnly)}` },
        { label: "P(B′) × P(A′|B′)", value: `${pct(b.notB)} × ${pct(1 - aGivenNotB)} = ${pct(b.neither)}` },
        { label: t("leafSum"), value: "100%" },
        { label: symbol, value: pct(r), emphasize: true },
      ]}
    />
  );
}
