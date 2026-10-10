"use client";
import { useTranslations } from "next-intl";
import MmmIndicatorCard from "./MmmIndicatorCard";
import { useMmmModel } from "./MmmLiveContext";

const COLORS = ["bg-sky-400 dark:bg-sky-500", "bg-blue-600 dark:bg-blue-400", "bg-violet-600 dark:bg-violet-400", "bg-fuchsia-400 dark:bg-fuchsia-500"];

/**
 * Type #15 (Stacked Segmented Bar): the range cut at Q1, the median and Q3 into four quarters
 * that each hold about a quarter of the data — the longer a segment, the more spread out that
 * quarter is.
 */
export default function MmmQuartileStacked() {
  const t = useTranslations("tools.mean-median-mode-range-calculator.education.lab.quartiles");
  const tr = useTranslations("tools.mean-median-mode-range-calculator.result");
  const { a, f } = useMmmModel();
  if (!a) return null;

  const cuts = [a.min, a.q1, a.median, a.q3, a.max];
  const segs = cuts.slice(1).map((c, i) => ({ len: c - cuts[i], from: cuts[i], to: c }));
  const total = a.range || 1;

  const bar = (
    <div className="w-full lg:w-[360px]">
      <div dir="ltr" className="flex h-12 w-full overflow-hidden rounded-xl">
        {segs.map((s, i) => (
          <div
            key={i}
            className={`flex min-w-[28px] items-center justify-center font-mono text-xs font-bold text-white ${COLORS[i]}`}
            style={{ flexGrow: Math.max(s.len, total * 0.02), flexBasis: 0 }}
          >
            {f(s.len)}
          </div>
        ))}
      </div>
      <div dir="ltr" className="mt-2 flex justify-between font-mono text-[11px] text-zinc-600 dark:text-zinc-300">
        {cuts.map((c, i) => (
          <span key={i} className="flex flex-col items-center">
            <span className="font-semibold">{["min", "Q1", "Q2", "Q3", "max"][i]}</span>
            <span>{f(c)}</span>
          </span>
        ))}
      </div>
      <div className="mt-3 grid grid-cols-4 gap-1 text-center text-[11px] text-zinc-500 dark:text-zinc-400">
        {segs.map((s, i) => (
          <span key={i}>{`${t("quarter")} ${i + 1} · ${f((s.len / total) * 100, 0)}%`}</span>
        ))}
      </div>
    </div>
  );

  const widest = segs.reduce((best, s, i) => (s.len > segs[best].len ? i : best), 0);
  return (
    <MmmIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={bar}
      rows={[
        ...segs.map((s, i) => ({ label: `${t("quarter")} ${i + 1}`, value: `${f(s.to)} − ${f(s.from)} = ${f(s.len)}` })),
        { label: tr("range"), value: `${segs.map((s) => f(s.len)).join(" + ")} = ${f(a.range)}`, emphasize: true },
        { label: t("widest"), value: `${t("quarter")} ${widest + 1}` },
      ]}
    />
  );
}
