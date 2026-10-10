"use client";
import { useTranslations } from "next-intl";
import { primeExponentTable } from "@tooloralabs/tools";
import { useIsDarkMode } from "@/lib/use-dark-mode";
import GcfLcmIndicatorCard from "./GcfLcmIndicatorCard";
import { sup, useGcfLcmModel } from "./GcfLcmLiveContext";

const S = 168;
const C = S / 2;
const LIGHT = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#06b6d4"];
const DARK = ["#60a5fa", "#a78bfa", "#34d399", "#fbbf24", "#f87171", "#22d3ee"];

function arc(r: number, a0: number, a1: number): string {
  const p = (a: number) => [C + r * Math.sin(a), C - r * Math.cos(a)];
  const [x0, y0] = p(a0);
  const [x1, y1] = p(Math.min(a1, a0 + Math.PI * 2 - 1e-4));
  return `M${x0},${y0} A${r},${r} 0 ${a1 - a0 > Math.PI ? 1 : 0} 1 ${x1},${y1}`;
}

/**
 * Type #6 (Multi-Ring Donut): the outer ring splits the LCM into its prime powers p^max, the inner
 * ring the GCF into p^min — each arc sized by its share of the digits (log), so the rings show
 * which primes make the multiple big and which ones the numbers actually share.
 */
export default function GcfLcmPrimeDonut() {
  const t = useTranslations("tools.gcf-lcm-calculator.education.lab.donut");
  const isDark = useIsDarkMode();
  const pal = isDark ? DARK : LIGHT;
  const { nums, result, f } = useGcfLcmModel();
  const table = primeExponentTable(nums);
  const lnL = Math.log(result.lcm) || 1;
  const lnG = Math.log(result.gcf);

  const ring = (pick: "min" | "max", r: number, total: number) => {
    let a = 0;
    return table.map((row, i) => {
      const e = row[pick];
      if (e === 0 || total <= 0) return null;
      const span = ((e * Math.log(row.prime)) / total) * Math.PI * 2;
      const d = arc(r, a + 0.02, a + span - 0.02);
      a += span;
      return <path key={`${pick}${row.prime}`} d={d} fill="none" stroke={pal[i % pal.length]} strokeWidth={pick === "max" ? 18 : 14} />;
    });
  };

  const donut = (
    <div className="flex w-full flex-col items-center gap-3 sm:flex-row lg:w-[340px]">
      <svg width={S} height={S} viewBox={`0 0 ${S} ${S}`} style={{ direction: "ltr" }} role="img" aria-label={t("title")} className="shrink-0">
        <circle cx={C} cy={C} r={72} fill="none" strokeWidth={18} className="stroke-zinc-100 dark:stroke-zinc-800" />
        <circle cx={C} cy={C} r={48} fill="none" strokeWidth={14} className="stroke-zinc-100 dark:stroke-zinc-800" />
        {ring("max", 72, lnL)}
        {lnG > 0 && ring("min", 48, lnG)}
        <text x={C} y={C - 4} textAnchor="middle" className="fill-violet-700 font-mono text-[13px] font-bold dark:fill-violet-300">{f(result.lcm)}</text>
        <text x={C} y={C + 12} textAnchor="middle" className="fill-emerald-700 font-mono text-[11px] font-semibold dark:fill-emerald-300">{f(result.gcf)}</text>
      </svg>
      <ul className="w-full space-y-1 text-xs">
        <li className="text-zinc-500 dark:text-zinc-400">{t("outer")} · {t("inner")}</li>
        {table.slice(0, 6).map((row, i) => (
          <li key={row.prime} className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: pal[i % pal.length] }} />
              <span dir="ltr" className="font-mono font-semibold text-zinc-700 dark:text-zinc-200">{f(row.prime)}</span>
            </span>
            <span dir="ltr" className="font-mono text-zinc-500 dark:text-zinc-400">{`${f(row.prime)}${sup(row.max)} · ${f(row.prime)}${sup(row.min)}`}</span>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <GcfLcmIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={donut}
      rows={[
        ...table.slice(0, 5).map((row) => ({
          label: `${f(row.prime)}${sup(row.max)}`,
          value: `${f(row.prime ** row.max)} · ${f(Math.round(((row.max * Math.log(row.prime)) / lnL) * 100))}%`,
        })),
        { label: t("outerTotal"), value: f(result.lcm), emphasize: true },
        { label: t("innerTotal"), value: f(result.gcf) },
      ]}
    />
  );
}
