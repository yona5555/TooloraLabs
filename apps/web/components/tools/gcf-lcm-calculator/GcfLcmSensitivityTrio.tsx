"use client";
import { useTranslations } from "next-intl";
import { gcdList, lcmList } from "@tooloralabs/tools";
import GcfLcmIndicatorCard from "./GcfLcmIndicatorCard";
import { useGcfLcmModel } from "./GcfLcmLiveContext";

/**
 * Type #12 (Sensitivity Trio): nudge the first number by −1 / 0 / +1 and recompute — the GCF and
 * LCM jump wildly for a one-unit change, because they depend on shared primes, not on size.
 */
export default function GcfLcmSensitivityTrio() {
  const t = useTranslations("tools.gcf-lcm-calculator.education.lab.trio");
  const { nums, f } = useGcfLcmModel();
  const a = nums[0];
  const rest = nums.slice(1);
  const cases = [
    { key: "low", a: Math.max(1, a - 1) },
    { key: "current", a },
    { key: "high", a: a + 1 },
  ].map((c) => {
    const set = [c.a, ...rest];
    return { ...c, gcf: gcdList(set), lcm: lcmList(set) };
  });
  const maxL = Math.max(...cases.map((c) => c.lcm));

  const trio = (
    <div className="grid w-full grid-cols-3 gap-2 lg:w-[340px]">
      {cases.map((c) => {
        const cur = c.key === "current";
        return (
          <div key={c.key} className={`flex flex-col items-center rounded-xl border p-2 text-center ${cur ? "border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-500/10" : "border-zinc-200 dark:border-zinc-700"}`}>
            <span className="text-[10px] font-semibold text-zinc-500 uppercase dark:text-zinc-400">{t(c.key)}</span>
            <span dir="ltr" className="font-mono text-xs text-zinc-600 dark:text-zinc-300">{[c.a, ...rest].map((n) => f(n)).join(", ")}</span>
            <div className="mt-2 flex h-24 items-end gap-1.5" dir="ltr">
              <div className="w-5 rounded-t bg-emerald-500 dark:bg-emerald-400" style={{ height: `${Math.max(6, (Math.log(c.gcf + 1) / Math.log(maxL + 1)) * 96)}px` }} />
              <div className="w-5 rounded-t bg-violet-500 dark:bg-violet-400" style={{ height: `${Math.max(6, (Math.log(c.lcm + 1) / Math.log(maxL + 1)) * 96)}px` }} />
            </div>
            <span dir="ltr" className="mt-1 font-mono text-xs font-bold text-emerald-700 dark:text-emerald-300">{f(c.gcf)}</span>
            <span dir="ltr" className="font-mono text-xs font-bold break-all text-violet-700 dark:text-violet-300">{f(c.lcm)}</span>
          </div>
        );
      })}
    </div>
  );

  return (
    <GcfLcmIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={trio}
      rows={cases.flatMap((c) => [
        { label: `${t(c.key)} · GCF`, value: f(c.gcf), emphasize: c.key === "current" },
        { label: `${t(c.key)} · LCM`, value: f(c.lcm) },
      ])}
    />
  );
}
