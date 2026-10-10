"use client";
import { useTranslations } from "next-intl";
import GcfLcmIndicatorCard from "./GcfLcmIndicatorCard";
import { useGcfLcmModel } from "./GcfLcmLiveContext";

const W = 340;
const PAD = 18;

/**
 * Type #10 (Log-Scale Magnitude Bar): the GCF, every input number, the LCM and the product of all
 * numbers on one powers-of-ten axis — the GCF is never above the smallest number, the LCM never
 * below the largest, and never above the product.
 */
export default function GcfLcmLogScale() {
  const t = useTranslations("tools.gcf-lcm-calculator.education.lab.logScale");
  const { nums, result, f } = useGcfLcmModel();
  const product = nums.reduce((p, n) => p * n, 1);
  const top = Math.max(1, Math.ceil(Math.log10(Math.max(10, product))));
  const x = (v: number) => PAD + (Math.log10(Math.max(1, v)) / top) * (W - 2 * PAD);
  const marks = [
    { v: result.gcf, label: "GCF", cls: "fill-emerald-600 dark:fill-emerald-400", up: true },
    ...nums.map((n, i) => ({ v: n, label: f(n), cls: "fill-blue-600 dark:fill-blue-400", up: i % 2 === 1 })),
    { v: result.lcm, label: "LCM", cls: "fill-violet-600 dark:fill-violet-400", up: true },
    { v: product, label: "Π", cls: "fill-amber-600 dark:fill-amber-400", up: false },
  ];
  const step = Math.max(1, Math.ceil(top / 8));
  const H = 120;

  const bar = (
    <div className="w-full lg:w-[340px]">
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ direction: "ltr" }} className="mx-auto block max-w-full" role="img" aria-label={t("title")}>
        <rect x={PAD} y={52} width={W - 2 * PAD} height={12} rx={6} className="fill-zinc-200 dark:fill-zinc-700" />
        <rect x={x(result.gcf)} y={52} width={Math.max(2, x(result.lcm) - x(result.gcf))} height={12} className="fill-blue-200 dark:fill-blue-900" />
        {Array.from({ length: Math.floor(top / step) + 1 }, (_, i) => i * step).map((p) => (
          <g key={p}>
            <line x1={x(10 ** p)} x2={x(10 ** p)} y1={64} y2={70} className="stroke-zinc-400" />
            <text x={x(10 ** p)} y={80} textAnchor="middle" className="fill-zinc-400 font-mono text-[9px]">{`10^${p}`}</text>
          </g>
        ))}
        {marks.map((m, i) => (
          <g key={i}>
            <circle cx={x(m.v)} cy={58} r={5} className={m.cls} />
            <text x={x(m.v)} y={m.up ? 42 - (i % 2) * 12 : 98 + (i % 2) * 12} textAnchor="middle" className={`${m.cls} font-mono text-[10px] font-bold`}>
              {m.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );

  return (
    <GcfLcmIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={bar}
      rows={[
        { label: "log₁₀ GCF", value: f(Math.log10(result.gcf), 3) },
        ...nums.slice(0, 3).map((n) => ({ label: `log₁₀ ${f(n)}`, value: f(Math.log10(n), 3) })),
        { label: "log₁₀ LCM", value: f(Math.log10(result.lcm), 3), emphasize: true },
        { label: t("product"), value: `${f(product)} (${f(Math.log10(product), 3)})` },
        { label: t("lcmVsProduct"), value: `÷ ${f(product / result.lcm)}` },
      ]}
    />
  );
}
