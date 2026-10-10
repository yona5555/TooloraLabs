"use client";
import { useTranslations } from "next-intl";
import MmmIndicatorCard from "./MmmIndicatorCard";
import { useMmmModel } from "./MmmLiveContext";

/** Type #2 (Flow Arrow with Embedded Numbers): the live values pour into Σx, which is split n ways into the mean. */
export default function MmmSumFlow() {
  const t = useTranslations("tools.mean-median-mode-range-calculator.education.lab.sumFlow");
  const tr = useTranslations("tools.mean-median-mode-range-calculator.result");
  const { values, a, f } = useMmmModel();
  if (!a) return null;

  const stages = [
    { label: t("values"), value: `${a.n}`, cls: "border-sky-400 bg-sky-50 text-sky-700 dark:border-sky-500/50 dark:bg-sky-500/10 dark:text-sky-300" },
    { label: tr("sum"), value: f(a.sum), cls: "border-violet-400 bg-violet-50 text-violet-700 dark:border-violet-500/50 dark:bg-violet-500/10 dark:text-violet-300" },
    { label: tr("mean"), value: f(a.mean, 4), cls: "border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-400/60 dark:bg-blue-500/15 dark:text-blue-300" },
  ];
  const ops = [`Σ`, `÷ ${a.n}`];

  const flow = (
    <div className="w-full lg:w-[360px]">
      <div dir="ltr" className="mb-4 flex flex-wrap justify-center gap-1.5">
        {values.map((v, i) => (
          <span key={i} className="rounded-md bg-sky-100 px-2 py-1 font-mono text-xs font-semibold text-sky-800 dark:bg-sky-500/20 dark:text-sky-200">
            {f(v)}
          </span>
        ))}
      </div>
      <div dir="ltr" className="flex items-stretch justify-between gap-1">
        {stages.map((s, i) => (
          <div key={s.label} className="flex min-w-0 flex-1 items-center gap-1">
            <div className={`flex min-w-0 flex-1 flex-col items-center rounded-xl border-2 px-2 py-3 ${s.cls}`}>
              <span className="font-mono text-lg font-bold">{s.value}</span>
              <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">{s.label}</span>
            </div>
            {i < ops.length && (
              <div className="flex shrink-0 flex-col items-center text-zinc-500 dark:text-zinc-400">
                <span className="font-mono text-[11px] font-bold">{ops[i]}</span>
                <span className="text-lg leading-none">→</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <MmmIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={flow}
      rows={[
        { label: t("values"), value: `n = ${a.n}` },
        { label: tr("sum"), value: `Σx = ${f(a.sum)}` },
        { label: t("divide"), value: `${f(a.sum)} ÷ ${a.n}` },
        { label: t("check"), value: `${a.n} × ${f(a.mean, 4)} = ${f(a.n * a.mean)}` },
        { label: tr("mean"), value: f(a.mean, 4), emphasize: true },
      ]}
    />
  );
}
