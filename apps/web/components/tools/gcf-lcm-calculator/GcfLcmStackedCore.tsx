"use client";
import { useTranslations } from "next-intl";
import GcfLcmIndicatorCard from "./GcfLcmIndicatorCard";
import { useGcfLcmModel } from "./GcfLcmLiveContext";

/**
 * Type #15 (Stacked Segmented Bar): every number split multiplicatively into the shared GCF core
 * and its own cofactor, drawn on a log scale (so lengths add where factors multiply). The LCM bar
 * on top is the same core times every number's extra factors.
 */
export default function GcfLcmStackedCore() {
  const t = useTranslations("tools.gcf-lcm-calculator.education.lab.stacked");
  const { nums, result, f } = useGcfLcmModel();
  const { gcf, lcm } = result;
  const L = Math.log(Math.max(2, lcm));
  const pct = (v: number) => `${(Math.log(Math.max(1, v)) / L) * 100}%`;
  const coreShare = (n: number) => (n > 1 ? Math.round((Math.log(gcf) / Math.log(n)) * 100) : 100);

  const bars = [{ label: "LCM", value: lcm, lcmBar: true }, ...nums.map((n) => ({ label: f(n), value: n, lcmBar: false }))];

  const chart = (
    <div className="w-full max-w-[340px] space-y-2.5 lg:w-[340px]">
      {bars.map((b, i) => (
        <div key={i}>
          <div className="mb-0.5 flex items-baseline justify-between text-xs">
            <span className={`font-mono font-bold ${b.lcmBar ? "text-violet-700 dark:text-violet-300" : "text-zinc-700 dark:text-zinc-200"}`} dir="ltr">
              {b.lcmBar ? `LCM ${f(lcm)}` : b.label}
            </span>
            <span dir="ltr" className="font-mono text-zinc-500 dark:text-zinc-400">{`${f(gcf)} × ${f(b.value / gcf)}`}</span>
          </div>
          <div dir="ltr" className="flex h-6 w-full overflow-hidden rounded-md bg-zinc-100 dark:bg-zinc-800">
            <div className="flex items-center justify-center bg-emerald-500 text-[10px] font-bold text-white dark:bg-emerald-400 dark:text-zinc-900" style={{ width: pct(gcf) }}>
              {gcf > 1 ? f(gcf) : ""}
            </div>
            <div
              className={`flex items-center justify-center text-[10px] font-bold ${b.lcmBar ? "bg-violet-500 text-white dark:bg-violet-400 dark:text-zinc-900" : "bg-blue-400 text-white dark:bg-blue-500"}`}
              style={{ width: `calc(${pct(b.value)} - ${pct(gcf)})` }}
            >
              {b.value / gcf > 1 ? f(b.value / gcf) : ""}
            </div>
          </div>
        </div>
      ))}
      <div className="flex flex-wrap gap-3 pt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
        <span className="inline-flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" />{t("core")}</span>
        <span className="inline-flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm bg-blue-400" />{t("own")}</span>
        <span className="inline-flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm bg-violet-500" />{t("extra")}</span>
      </div>
    </div>
  );

  return (
    <GcfLcmIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={chart}
      rows={[
        ...nums.map((n) => ({ label: f(n), value: `${f(gcf)} × ${f(n / gcf)}`, note: t("coreShare", { pct: f(coreShare(n)) }) })),
        { label: "LCM", value: `${f(gcf)} × ${f(lcm / gcf)} = ${f(lcm)}`, emphasize: true },
      ]}
    />
  );
}
