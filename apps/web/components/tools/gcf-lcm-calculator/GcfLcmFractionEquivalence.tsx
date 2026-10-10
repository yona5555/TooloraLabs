"use client";
import { useTranslations } from "next-intl";
import { gcd2, lcm2 } from "@tooloralabs/tools";
import GcfLcmIndicatorCard from "./GcfLcmIndicatorCard";
import { useGcfLcmModel } from "./GcfLcmLiveContext";

const BAR_W = 300;
const MAX_TICKS = 48;

/**
 * Type #11 (Side-by-Side Equivalence): the fraction a/b of the first two live numbers next to
 * the same fraction divided top and bottom by their GCF — two bars of exactly the same shaded
 * length, one cut into b pieces, the other into b/GCF.
 */
export default function GcfLcmFractionEquivalence() {
  const t = useTranslations("tools.gcf-lcm-calculator.education.lab.fraction");
  const { a, b, f } = useGcfLcmModel();
  const lo = Math.min(a, b);
  const hi = Math.max(a, b);
  const g = gcd2(lo, hi);
  const l = lcm2(lo, hi);
  const share = lo / hi;

  const bar = (num: number, den: number, tone: string) => (
    <svg width={BAR_W} height={30} viewBox={`0 0 ${BAR_W} 30`} className="block max-w-full" style={{ direction: "ltr" }}>
      <rect x={0} y={4} width={BAR_W} height={22} rx={4} className="fill-zinc-100 stroke-zinc-300 dark:fill-zinc-800 dark:stroke-zinc-600" />
      <rect x={0} y={4} width={BAR_W * (num / den)} height={22} rx={4} className={tone} />
      {den <= MAX_TICKS &&
        Array.from({ length: den - 1 }, (_, i) => (
          <line key={i} x1={(BAR_W * (i + 1)) / den} x2={(BAR_W * (i + 1)) / den} y1={4} y2={26} strokeWidth={1} className="stroke-white dark:stroke-zinc-900" />
        ))}
    </svg>
  );

  const frac = (n: string, d: string, tone: string) => (
    <span className={`inline-flex flex-col items-center font-mono text-lg leading-tight font-bold ${tone}`}>
      <span>{n}</span>
      <span className="w-full border-t-2 border-current" />
      <span>{d}</span>
    </span>
  );

  const view = (
    <div className="w-full lg:w-[340px]">
      <div dir="ltr" className="flex items-center justify-center gap-4">
        {frac(f(lo), f(hi), "text-blue-700 dark:text-blue-300")}
        <span className="text-center font-mono text-xs text-zinc-500 dark:text-zinc-400">
          ÷ {f(g)}
          <br />⟶
        </span>
        {frac(f(lo / g), f(hi / g), "text-emerald-700 dark:text-emerald-300")}
      </div>
      <div className="mt-3 space-y-1.5">
        {bar(lo, hi, "fill-blue-500/80 dark:fill-blue-400/80")}
        {bar(lo / g, hi / g, "fill-emerald-500/80 dark:fill-emerald-400/80")}
      </div>
      <p dir="ltr" className="mt-1 text-center font-mono text-xs text-zinc-500 dark:text-zinc-400">{`= ${f(share, 4)}`}</p>
    </div>
  );

  return (
    <GcfLcmIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={view}
      rows={[
        { label: t("original"), value: `${f(lo)}/${f(hi)}` },
        { label: t("divideBy"), value: `GCF = ${f(g)}` },
        { label: t("simplest"), value: `${f(lo / g)}/${f(hi / g)}`, emphasize: true },
        { label: t("decimal"), value: f(share, 4) },
        { label: t("commonDen"), value: `LCM = ${f(l)}` },
        { label: `1/${f(lo)} + 1/${f(hi)}`, value: `${f(l / lo)}/${f(l)} + ${f(l / hi)}/${f(l)} = ${f(l / lo + l / hi)}/${f(l)}` },
      ]}
    />
  );
}
