"use client";
import { useTranslations } from "next-intl";
import PmIndicatorCard from "./PmIndicatorCard";
import { usePmModel } from "./PmLiveContext";

type Seg = { label: string; value: number; text: string; cls: string; dot: string };

function StackedBar({ title, total, segs, pct }: { title: string; total: string; segs: Seg[]; pct: (s: number) => string }) {
  const sum = segs.reduce((s, x) => s + x.value, 0);
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2 text-xs font-semibold text-zinc-600 dark:text-zinc-300">
        <span>{title}</span>
        <span dir="ltr" className="font-mono text-zinc-800 dark:text-zinc-100">{total}</span>
      </div>
      <div dir="ltr" className="mt-1.5 flex h-6 w-full overflow-hidden rounded-md bg-zinc-100 dark:bg-zinc-800">
        {segs.map((s, i) => (
          <div key={i} className={`h-full ${s.cls} ${i > 0 ? "border-s-2 border-white dark:border-zinc-900" : ""}`} style={{ width: `${sum > 0 ? (s.value / sum) * 100 : 100 / segs.length}%` }} />
        ))}
      </div>
      <div className="mt-1.5 space-y-0.5 text-xs">
        {segs.map((s, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <span className={`h-2.5 w-2.5 shrink-0 rounded-sm ${s.dot}`} />
            <span className="text-zinc-500 dark:text-zinc-400">{s.label}</span>
            <span dir="ltr" className="ms-auto font-mono font-semibold text-zinc-800 dark:text-zinc-100">{`${s.text} · ${pct(sum > 0 ? s.value / sum : 0)}`}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Type #15 (Stacked Segmented Bar): the flight split at the apex — time (rise vs fall), horizontal
 * distance (before vs after the apex) and peak height (launch height vs rise). From level ground
 * every pair is 50/50; any launch height tips the fall side.
 */
export default function PmFlightSplit() {
  const t = useTranslations("tools.projectile-motion-calculator.education.lab.split");
  const { a, f, pct } = usePmModel();
  if (!a) return null;

  const afterX = a.range - a.apexX;
  const indicator = (
    <div className="w-[380px] max-w-full space-y-5">
      <StackedBar
        title={t("time")}
        total={`t = ${f(a.timeOfFlight)} s`}
        pct={pct}
        segs={[
          { label: t("rise"), value: a.timeUp, text: `${f(a.timeUp)} s`, cls: "bg-amber-500 dark:bg-amber-400", dot: "bg-amber-500 dark:bg-amber-400" },
          { label: t("fall"), value: a.timeDown, text: `${f(a.timeDown)} s`, cls: "bg-violet-500 dark:bg-violet-400", dot: "bg-violet-500 dark:bg-violet-400" },
        ]}
      />
      <StackedBar
        title={t("distance")}
        total={`R = ${f(a.range)} m`}
        pct={pct}
        segs={[
          { label: t("before"), value: a.apexX, text: `${f(a.apexX)} m`, cls: "bg-sky-500 dark:bg-sky-400", dot: "bg-sky-500 dark:bg-sky-400" },
          { label: t("after"), value: afterX, text: `${f(afterX)} m`, cls: "bg-blue-700 dark:bg-blue-500", dot: "bg-blue-700 dark:bg-blue-500" },
        ]}
      />
      <StackedBar
        title={t("height")}
        total={`h_max = ${f(a.maxHeight)} m`}
        pct={pct}
        segs={[
          { label: t("launch"), value: a.height, text: `${f(a.height)} m`, cls: "bg-zinc-500 dark:bg-zinc-400", dot: "bg-zinc-500 dark:bg-zinc-400" },
          { label: t("riseH"), value: a.rise, text: `${f(a.rise)} m`, cls: "bg-emerald-500 dark:bg-emerald-400", dot: "bg-emerald-500 dark:bg-emerald-400" },
        ]}
      />
    </div>
  );

  return (
    <PmIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={indicator}
      rows={[
        { label: t("rise"), value: `${f(a.vy)} / ${f(a.gravity)} = ${f(a.timeUp, 3)} s` },
        { label: t("fall"), value: `${f(a.timeOfFlight)} − ${f(a.timeUp)} = ${f(a.timeDown, 3)} s` },
        { label: t("ratio"), value: a.timeUp > 0 ? `t↓ / t↑ = ${f(a.timeDown / a.timeUp, 3)}` : "t↑ = 0" },
        { label: t("before"), value: `${f(a.vx)} × ${f(a.timeUp)} = ${f(a.apexX)} m` },
        { label: t("after"), value: `${f(a.vx)} × ${f(a.timeDown)} = ${f(afterX)} m`, emphasize: true },
      ]}
    />
  );
}
