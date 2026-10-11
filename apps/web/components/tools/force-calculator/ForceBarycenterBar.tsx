"use client";
import { useTranslations } from "next-intl";
import ForceIndicatorCard, { ForceIndicatorUnavailable } from "./ForceIndicatorCard";
import { useForceModel } from "./ForceLiveContext";

const W = 340;
const H = 170;
const X0 = 14;
const X1 = W - 14;
const Y = 70;
const BAR_H = 26;

/**
 * Type #15 (Stacked Segmented Bar): the distance r split at the barycentre — the point both masses
 * orbit — into r·m₂/(m₁+m₂) from m₁ and r·m₁/(m₁+m₂) from m₂. Labels are anchored to the two ends,
 * so they never collide however lopsided the split is.
 */
export default function ForceBarycenterBar() {
  const t = useTranslations("tools.force-calculator.education.lab.bary");
  const { gr, f } = useForceModel();
  if (!gr || gr.distance <= 0) return <ForceIndicatorUnavailable title={t("title")} />;

  const share1 = gr.barycenterFrom1 / gr.distance;
  const span = X1 - X0;
  const w1 = Math.min(span - 3, Math.max(3, share1 * span));
  const bx = X0 + w1;
  const pct = (v: number) => `${f(v * 100, 2)}%`;

  const svg = (
    <svg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="mx-auto block max-w-full">
      <text x={X0} y={Y - 30} fontSize={11} fontWeight={700} className="fill-blue-700 dark:fill-blue-300">
        {`m₁ → ⊙ ${pct(share1)}`}
      </text>
      <text x={X1} y={Y - 30} textAnchor="end" fontSize={11} fontWeight={700} className="fill-amber-600 dark:fill-amber-400">
        {`${pct(1 - share1)} ⊙ → m₂`}
      </text>
      <rect x={X0} y={Y - BAR_H / 2} width={w1} height={BAR_H} rx={4} className="fill-blue-600 dark:fill-blue-400" />
      <rect x={bx} y={Y - BAR_H / 2} width={X1 - bx} height={BAR_H} rx={4} className="fill-amber-500 dark:fill-amber-400" />
      <path d={`M ${bx} ${Y - BAR_H / 2 - 4} L ${bx - 6} ${Y - BAR_H / 2 - 14} L ${bx + 6} ${Y - BAR_H / 2 - 14} z`} className="fill-violet-600 dark:fill-violet-400" />
      <line x1={bx} y1={Y - BAR_H / 2 - 4} x2={bx} y2={Y + BAR_H / 2 + 4} strokeWidth={2} className="stroke-violet-600 dark:stroke-violet-400" />
      <text x={X0} y={Y + 32} fontSize={10.5} fontFamily="ui-monospace, monospace" className="fill-zinc-600 dark:fill-zinc-300">
        {`${f(gr.barycenterFrom1)} m`}
      </text>
      <text x={X1} y={Y + 32} textAnchor="end" fontSize={10.5} fontFamily="ui-monospace, monospace" className="fill-zinc-600 dark:fill-zinc-300">
        {`${f(gr.barycenterFrom2)} m`}
      </text>
      <text x={W / 2} y={Y + 60} textAnchor="middle" fontSize={10.5} fontFamily="ui-monospace, monospace" className="fill-zinc-500 dark:fill-zinc-400">
        {`r = ${f(gr.distance)} m`}
      </text>
    </svg>
  );

  return (
    <ForceIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={svg}
      rows={[
        { label: "m₁ + m₂", value: `${f(gr.mass1 + gr.mass2)} kg` },
        { label: t("from1"), value: `r m₂ / (m₁ + m₂) = ${f(gr.barycenterFrom1)} m`, emphasize: true },
        { label: t("from2"), value: `r m₁ / (m₁ + m₂) = ${f(gr.barycenterFrom2)} m` },
        { label: t("check"), value: `${f(gr.barycenterFrom1 + gr.barycenterFrom2)} m = r` },
      ]}
    />
  );
}
