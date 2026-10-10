"use client";
import { useTranslations } from "next-intl";
import GcfLcmIndicatorCard from "./GcfLcmIndicatorCard";
import { useGcfLcmModel } from "./GcfLcmLiveContext";

const W = 340;
const PAD_X = 16;
const ROW_H = 30;
const MAX_DOTS = 40;
const DOT_COLORS = ["fill-blue-500 dark:fill-blue-400", "fill-amber-500 dark:fill-amber-400", "fill-cyan-500 dark:fill-cyan-400", "fill-pink-500 dark:fill-pink-400", "fill-lime-500 dark:fill-lime-400"];

/**
 * Type #9 (Timeline with Stations): one track per number with a station at each of its multiples,
 * from 0 up to the LCM — the first point where every track has a station.
 */
export default function GcfLcmMultiplesTimeline() {
  const t = useTranslations("tools.gcf-lcm-calculator.education.lab.timeline");
  const { nums, result, f } = useGcfLcmModel();
  const { lcm } = result;
  const H = nums.length * ROW_H + 40;
  const x = (v: number) => PAD_X + (v / lcm) * (W - 2 * PAD_X);
  const xL = x(lcm);

  const chart = (
    <div className="w-full lg:w-[340px]">
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ direction: "ltr" }} className="mx-auto block max-w-full" role="img" aria-label={t("title")}>
        <line x1={xL} x2={xL} y1={6} y2={H - 22} strokeWidth={2} strokeDasharray="4 3" className="stroke-violet-500 dark:stroke-violet-400" />
        {nums.map((n, i) => {
          const y = 16 + i * ROW_H;
          const count = lcm / n;
          const dense = count > MAX_DOTS;
          return (
            <g key={i}>
              <text x={PAD_X - 2} y={y - 6} className="fill-zinc-600 font-mono text-[10px] font-semibold dark:fill-zinc-300">{`×${f(n)} · ${f(count)}`}</text>
              <line x1={PAD_X} x2={W - PAD_X} y1={y} y2={y} className="stroke-zinc-300 dark:stroke-zinc-600" strokeWidth={dense ? 4 : 1.5} />
              {!dense &&
                Array.from({ length: count }, (_, k) => (
                  <circle key={k} cx={x(n * (k + 1))} cy={y} r={k === count - 1 ? 6 : 3.5} className={k === count - 1 ? "fill-violet-600 dark:fill-violet-400" : DOT_COLORS[i % DOT_COLORS.length]} />
                ))}
              {dense && <circle cx={xL} cy={y} r={6} className="fill-violet-600 dark:fill-violet-400" />}
            </g>
          );
        })}
        <text x={PAD_X} y={H - 8} className="fill-zinc-400 font-mono text-[10px]">0</text>
        <text x={xL} y={H - 8} textAnchor="end" className="fill-violet-700 font-mono text-[11px] font-bold dark:fill-violet-300">{`LCM = ${f(lcm)}`}</text>
      </svg>
    </div>
  );

  return (
    <GcfLcmIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={chart}
      rows={[
        ...nums.map((n) => ({ label: t("stations", { n: f(n) }), value: `${f(lcm)} ÷ ${f(n)} = ${f(lcm / n)}` })),
        { label: t("firstShared"), value: f(lcm), emphasize: true },
        { label: t("nextShared"), value: `${f(2 * lcm)}, ${f(3 * lcm)}` },
      ]}
    />
  );
}
