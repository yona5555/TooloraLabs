"use client";
import { useTranslations } from "next-intl";
import { lcmList, ladderSteps } from "@tooloralabs/tools";
import GcfLcmIndicatorCard from "./GcfLcmIndicatorCard";
import { useGcfLcmModel } from "./GcfLcmLiveContext";

const MAX_STEPS = 6;

/**
 * Type #3 (Hierarchical Flow): the ladder ("cake") method on the live numbers — each rung divides
 * every number by a prime they all share; the side primes multiply to the GCF and, times the LCM
 * of the bottom row, give the LCM.
 */
export default function GcfLcmLadderFlow() {
  const t = useTranslations("tools.gcf-lcm-calculator.education.lab.ladder");
  const { nums, result, f } = useGcfLcmModel();
  const { steps, bottom } = ladderSteps(nums);
  const shown = steps.slice(0, MAX_STEPS);
  const side = steps.map((s) => s.prime);
  const bottomLcm = lcmList(bottom);

  const cell = "min-w-[2.75rem] rounded-md px-2 py-1 text-center font-mono text-sm font-semibold";
  const flow = (
    <div dir="ltr" className="w-full max-w-[340px] lg:w-[340px]">
      <div className="space-y-1.5">
        {shown.map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className={`${cell} bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-200`}>÷{f(s.prime)}</span>
            <span className="text-zinc-400">│</span>
            <div className="flex flex-wrap gap-1.5">
              {s.before.map((n, j) => (
                <span key={j} className={`${cell} border border-zinc-200 bg-white text-zinc-800 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100`}>{f(n)}</span>
              ))}
            </div>
          </div>
        ))}
        {steps.length > MAX_STEPS && <p className="ps-14 text-xs text-zinc-400">⋮ {t("more", { n: steps.length - MAX_STEPS })}</p>}
        <div className="flex items-center gap-2">
          <span className={`${cell} invisible`}>÷0</span>
          <span className="text-zinc-400">└</span>
          <div className="flex flex-wrap gap-1.5">
            {bottom.map((n, j) => (
              <span key={j} className={`${cell} bg-violet-100 text-violet-800 dark:bg-violet-500/20 dark:text-violet-200`}>{f(n)}</span>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 text-center text-xs">
        <div className="rounded-lg bg-emerald-50 px-2 py-1.5 dark:bg-emerald-500/10">
          <p className="font-semibold text-emerald-700 dark:text-emerald-300">{t("sideProduct")}</p>
          <p className="font-mono text-base font-bold text-emerald-800 dark:text-emerald-200">{side.length ? side.map((p) => f(p)).join("×") : f(1)} = {f(result.gcf)}</p>
        </div>
        <div className="rounded-lg bg-violet-50 px-2 py-1.5 dark:bg-violet-500/10">
          <p className="font-semibold text-violet-700 dark:text-violet-300">{t("lShape")}</p>
          <p className="font-mono text-base font-bold text-violet-800 dark:text-violet-200">{f(result.gcf)}×{f(bottomLcm)} = {f(result.lcm)}</p>
        </div>
      </div>
    </div>
  );

  return (
    <GcfLcmIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={flow}
      rows={[
        { label: t("rungs"), value: f(steps.length) },
        ...shown.slice(0, 4).map((s, i) => ({ label: t("rung", { n: i + 1 }), value: `${s.before.map((n) => f(n)).join(", ")} ÷ ${f(s.prime)}` })),
        { label: t("bottomRow"), value: bottom.map((n) => f(n)).join(", ") },
        { label: "GCF", value: `${side.length ? side.map((p) => f(p)).join(" × ") : f(1)} = ${f(result.gcf)}`, emphasize: true },
        { label: "LCM", value: `${f(result.gcf)} × ${f(bottomLcm)} = ${f(result.lcm)}`, emphasize: true },
      ]}
    />
  );
}
