"use client";
import { useTranslations } from "next-intl";
import MmmIndicatorCard from "./MmmIndicatorCard";
import { useMmmModel } from "./MmmLiveContext";

const W = 360;
const H = 200;
const TOP = 26;
const BASE = 168;

/** Type #13 (Stepped Diagram): the sorted data as an ascending staircase; the middle step(s) are the median. */
export default function MmmMedianSteps() {
  const t = useTranslations("tools.mean-median-mode-range-calculator.education.lab.medianSteps");
  const tr = useTranslations("tools.mean-median-mode-range-calculator.result");
  const { a, f } = useMmmModel();
  if (!a) return null;

  const lo = Math.min(0, a.min);
  const hi = Math.max(a.max, lo + 1e-9);
  const sy = (v: number) => BASE - ((v - lo) / (hi - lo || 1)) * (BASE - TOP);
  const bw = (W - 20) / a.n;
  const mids = new Set(a.medianPositions);
  const my = sy(a.median);

  const steps = (
    <svg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="mx-auto block max-w-full">
      {a.sorted.map((v, i) => {
        const x = 10 + i * bw;
        const mid = mids.has(i + 1);
        return (
          <g key={i}>
            <rect
              x={x + 1}
              y={Math.min(sy(v), sy(lo))}
              width={bw - 2}
              height={Math.max(2, Math.abs(sy(lo) - sy(v)))}
              rx={2}
              className={mid ? "fill-emerald-500 dark:fill-emerald-400" : "fill-blue-200 dark:fill-blue-500/40"}
            />
            {bw >= 18 && (
              <text x={x + bw / 2} y={sy(v) - 4} textAnchor="middle" fontSize={10} fontWeight={700} className="fill-zinc-700 dark:fill-zinc-200">
                {f(v)}
              </text>
            )}
            <text x={x + bw / 2} y={BASE + 14} textAnchor="middle" fontSize={9} className={mid ? "fill-emerald-700 font-bold dark:fill-emerald-300" : "fill-zinc-400"}>
              {`x${i + 1}`}
            </text>
          </g>
        );
      })}
      <line x1={8} x2={W - 8} y1={my} y2={my} strokeDasharray="4 3" strokeWidth={1.5} className="stroke-emerald-600 dark:stroke-emerald-400" />
      <text x={W - 10} y={my - 5} textAnchor="end" fontSize={11} fontWeight={700} className="fill-emerald-700 dark:fill-emerald-300">
        {`${tr("median")} ${f(a.median)}`}
      </text>
      <text x={10} y={14} fontSize={11} className="fill-zinc-500 dark:fill-zinc-400">
        {`${t("halfBelow")} ${Math.floor(a.n / 2)} · ${t("halfAbove")} ${Math.floor(a.n / 2)}`}
      </text>
    </svg>
  );

  const middle = a.medianPositions.map((p) => f(a.sorted[p - 1])).join(" , ");
  return (
    <MmmIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={steps}
      rows={[
        { label: tr("count"), value: `n = ${a.n}` },
        { label: t("parity"), value: a.n % 2 === 0 ? t("even") : t("odd") },
        { label: t("position"), value: `(${a.n} + 1) / 2 = ${f(a.medianRank)}` },
        { label: t("middle"), value: middle },
        { label: tr("median"), value: f(a.median, 4), emphasize: true },
      ]}
    />
  );
}
