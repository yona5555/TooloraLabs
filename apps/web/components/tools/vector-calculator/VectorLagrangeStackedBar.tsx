"use client";
import { useTranslations } from "next-intl";
import VectorIndicatorCard from "./VectorIndicatorCard";
import { useVectorAnalysis } from "./VectorLiveContext";

const W = 340;
const BAR_H = 44;

/** §31 #15 Stacked Segmented Bar: |A|²|B|² split exactly into (A·B)² and |A×B|² (Lagrange's identity). */
export default function VectorLagrangeStackedBar() {
  const t = useTranslations("tools.vector-calculator.indicators.lagrange");
  const { r, f, n } = useVectorAnalysis();
  const total = r.lagrangeTotal;
  const dotShare = total > 0 ? r.dotSquared / total : 0;
  const crossShare = total > 0 ? r.crossSquared / total : 0;
  const dotW = dotShare * W;
  const crossW = crossShare * W;
  const pct = (v: number) => `${n(v * 100, 1)}%`;

  return (
    <VectorIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={
        <div dir="ltr" className="max-w-full">
          <svg width={W} height={120} viewBox={`0 0 ${W} 120`} role="img" aria-label={t("title")} className="block h-auto max-w-full">
            <text x={0} y={14} className="fill-zinc-500 text-[11px] dark:fill-zinc-400">{t("total")} = {n(total)}</text>
            <rect x={0} y={24} width={W} height={BAR_H} rx={8} className="fill-zinc-200 dark:fill-zinc-700" />
            {dotW > 0 && <rect x={0} y={24} width={dotW} height={BAR_H} rx={8} className="fill-blue-500 dark:fill-blue-400" />}
            {crossW > 0 && <rect x={dotW} y={24} width={crossW} height={BAR_H} rx={8} className="fill-rose-500 dark:fill-rose-400" />}
            {dotShare > 0.16 && <text x={dotW / 2} y={24 + BAR_H / 2 + 4} textAnchor="middle" className="fill-white text-[12px] font-bold">{pct(dotShare)}</text>}
            {crossShare > 0.16 && <text x={dotW + crossW / 2} y={24 + BAR_H / 2 + 4} textAnchor="middle" className="fill-white text-[12px] font-bold">{pct(crossShare)}</text>}
            <rect x={0} y={84} width={10} height={10} rx={2} className="fill-blue-500 dark:fill-blue-400" />
            <text x={14} y={93} className="fill-zinc-700 text-[11px] dark:fill-zinc-200">{t("dotPart")} = {n(r.dotSquared)} · {pct(dotShare)}</text>
            <rect x={0} y={102} width={10} height={10} rx={2} className="fill-rose-500 dark:fill-rose-400" />
            <text x={14} y={111} className="fill-zinc-700 text-[11px] dark:fill-zinc-200">{t("crossPart")} = {n(r.crossSquared)} · {pct(crossShare)}</text>
          </svg>
        </div>
      }
      rows={[
        { label: "|A|²", value: f(r.magA * r.magA) },
        { label: "|B|²", value: f(r.magB * r.magB) },
        { label: t("total"), value: f(total) },
        { label: t("dotPart"), value: f(r.dotSquared) },
        { label: t("crossPart"), value: f(r.crossSquared) },
        { label: t("check"), value: f(dotShare + crossShare, 6), emphasize: true },
      ]}
    />
  );
}
