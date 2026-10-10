"use client";
import { ArrowDown } from "lucide-react";
import { useTranslations } from "next-intl";
import VectorIndicatorCard from "./VectorIndicatorCard";
import { useVectorAnalysis } from "./VectorLiveContext";

/** §31 #2 Flow Arrow with Embedded Numbers: A·B → ÷|B| → scalar projection → ×B̂ → vector projection. */
export default function VectorProjectionFlow() {
  const t = useTranslations("tools.vector-calculator.indicators.projectionFlow");
  const tr = useTranslations("tools.vector-calculator.live3d.rows");
  const { r, f, n, vf, opt, na } = useVectorAnalysis();

  const node = (label: string, value: string, tone: string) => (
    <div className={`w-full rounded-xl border px-3 py-2 text-center ${tone}`}>
      <p className="text-xs font-semibold">{label}</p>
      <p dir="ltr" className="font-mono text-base font-bold">{value}</p>
    </div>
  );
  const arrow = (text: string) => (
    <div className="flex items-center justify-center gap-2 py-1 text-zinc-500 dark:text-zinc-400">
      <ArrowDown size={18} />
      <span dir="ltr" className="rounded-md bg-zinc-100 px-2 py-0.5 font-mono text-xs font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">{text}</span>
    </div>
  );

  return (
    <VectorIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={
        <div className="flex w-[280px] flex-col items-center sm:w-[340px]">
          {node(tr("dot"), f(r.dot), "border-blue-300 bg-blue-50 text-blue-800 dark:border-blue-500/40 dark:bg-blue-500/10 dark:text-blue-200")}
          {arrow(`${t("divide")} = ÷ ${n(r.magB)}`)}
          {node(tr("compAonB"), opt(r.compAonB, 4), "border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200")}
          {arrow(`${t("alongB")} = ${r.unitB ? `× (${r.unitB.map((c) => n(c, 3)).join(", ")})` : na}`)}
          {node(tr("projAonB"), r.projAonB ? vf(r.projAonB) : na, "border-orange-300 bg-orange-50 text-orange-800 dark:border-orange-500/40 dark:bg-orange-500/10 dark:text-orange-200")}
          {arrow("A − projᴮA")}
          {node(t("leftover"), r.rejAfromB ? vf(r.rejAfromB) : na, "border-zinc-300 bg-zinc-50 text-zinc-800 dark:border-zinc-600 dark:bg-zinc-800/60 dark:text-zinc-100")}
        </div>
      }
      rows={[
        { label: tr("dot"), value: f(r.dot) },
        { label: tr("magB"), value: f(r.magB, 4) },
        { label: t("shadowLength"), value: opt(r.compAonB, 4), emphasize: true },
        { label: tr("projAonB"), value: r.projAonB ? vf(r.projAonB) : na },
        { label: tr("rejMag"), value: opt(r.rejMag, 4) },
      ]}
    />
  );
}
