"use client";
import { useTranslations } from "next-intl";
import { commonDivisors } from "@tooloralabs/tools";
import GcfLcmIndicatorCard from "./GcfLcmIndicatorCard";
import { useGcfLcmModel } from "./GcfLcmLiveContext";

const MAX_ROWS = 8;

/**
 * Type #5 (Ranked Horizontal Bar List): every divisor the numbers share, largest first. The top bar
 * is the GCF; every other common divisor divides it (so the list is exactly the GCF's divisors).
 */
export default function GcfLcmCommonDivisors() {
  const t = useTranslations("tools.gcf-lcm-calculator.education.lab.divisors");
  const { nums, result, f } = useGcfLcmModel();
  const all = commonDivisors(nums);
  const ranked = [...all].reverse();
  const shown = ranked.slice(0, MAX_ROWS);
  const g = result.gcf;

  const list = (
    <div className="w-full max-w-[340px] space-y-1.5 lg:w-[340px]">
      {shown.map((d, i) => (
        <div key={d} className="grid grid-cols-[3.25rem_1fr] items-center gap-2">
          <span dir="ltr" className={`text-end font-mono text-sm font-bold ${i === 0 ? "text-emerald-700 dark:text-emerald-300" : "text-zinc-700 dark:text-zinc-200"}`}>{f(d)}</span>
          <div className="h-5 rounded-md bg-zinc-100 dark:bg-zinc-800">
            <div
              className={`flex h-5 items-center rounded-md px-1.5 text-[10px] font-semibold whitespace-nowrap ${i === 0 ? "bg-emerald-500 text-white dark:bg-emerald-400 dark:text-zinc-900" : "bg-blue-400/80 text-white dark:bg-blue-500/80"}`}
              style={{ width: `${Math.max(14, (d / g) * 100)}%` }}
            >
              {i === 0 ? "GCF" : `${f(g)} ÷ ${f(g / d)}`}
            </div>
          </div>
        </div>
      ))}
      {ranked.length > MAX_ROWS && <p className="text-center text-xs text-zinc-400">{t("more", { n: ranked.length - MAX_ROWS })}</p>}
    </div>
  );

  return (
    <GcfLcmIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={list}
      rows={[
        { label: t("count"), value: f(all.length) },
        { label: t("largest"), value: `GCF = ${f(g)}`, emphasize: true },
        { label: t("smallest"), value: f(1) },
        { label: t("sum"), value: f(all.reduce((s, d) => s + d, 0)) },
        ...nums.slice(0, 3).map((n) => ({ label: `${f(n)} ÷ GCF`, value: f(n / g) })),
      ]}
    />
  );
}
