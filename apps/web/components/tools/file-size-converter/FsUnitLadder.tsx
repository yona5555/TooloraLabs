"use client";
import { useTranslations } from "next-intl";
import FsIndicatorCard, { FsIndicatorUnavailable } from "./FsIndicatorCard";
import { useFsModel } from "./FsLiveContext";
import { svgPx } from "@/components/tool-ui/svgPx";

const W = 340;
const H = 210;
const BASE = H - 30;
const TOP = 20;

/**
 * Type #13 (Stepped Diagram): the decimal value at each unit from bytes to petabytes as a descending
 * staircase on a log scale — every step divides by 1000; the step that lands between 1 and 1000 is the
 * natural unit to show.
 */
export default function FsUnitLadder() {
  const t = useTranslations("tools.file-size-converter.education.lab.ladder");
  const { out, a, f } = useFsModel();
  if (!out || !a || a.bytes === 0) return <FsIndicatorUnavailable title={t("title")} />;

  const logs = out.decimal.map((d) => Math.log10(Math.max(d.value, 1e-18)));
  const hi = Math.max(...logs, 3);
  const lo = Math.min(...logs, -3);
  const y = (l: number) => Math.round((BASE - ((l - lo) / (hi - lo)) * (BASE - TOP)) * 100) / 100;
  const step = W / 6;

  const svg = (
    <svg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="mx-auto block max-w-full">
      <rect x={0} y={y(3)} width={W} height={y(0) - y(3)} className="fill-emerald-100 dark:fill-emerald-500/10" />
      <text style={{ fontSize: svgPx(12) }} x={W - 2} y={y(3) + 12} textAnchor="end" className="fill-emerald-700 dark:fill-emerald-300">
        {t("band")}
      </text>
      <path d={logs.map((l, i) => `${i ? "L" : "M"} ${i * step} ${y(l)} H ${(i + 1) * step}`).join(" ")} fill="none" strokeWidth={2.5} className="stroke-blue-600 dark:stroke-blue-400" />
      {out.decimal.map((d, i) => (
        <g key={d.unit}>
          <circle cx={i * step + step / 2} cy={y(logs[i])} r={i === a.decimalLevel ? 7 : 4} className={i === a.decimalLevel ? "fill-amber-500" : "fill-blue-600 dark:fill-blue-400"} />
          <text style={{ fontSize: svgPx(12) }} x={i * step + step / 2} y={y(logs[i]) - 10} textAnchor="middle" fontWeight={700} fontFamily="var(--font-mono)" className="fill-zinc-700 dark:fill-zinc-200">
            {d.value >= 0.01 && d.value < 1e6 ? f(d.value, d.value < 10 ? 2 : 0) : `1e${Math.round(logs[i])}`}
          </text>
          <text style={{ fontSize: svgPx(12) }} x={i * step + step / 2} y={BASE + 18} textAnchor="middle" fontWeight={600} className="fill-zinc-600 dark:fill-zinc-300">
            {d.unit}
          </text>
        </g>
      ))}
    </svg>
  );

  const best = out.decimal[a.decimalLevel];
  return (
    <FsIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={svg}
      rows={[
        { label: t("bytes"), value: f(a.bytes, 0) },
        { label: t("rule"), value: t("ruleValue") },
        { label: t("best"), value: `${f(best.value, 3)} ${best.unit}` },
        { label: t("next"), value: a.decimalLevel < 5 ? `${f(out.decimal[a.decimalLevel + 1].value, 4)} ${out.decimal[a.decimalLevel + 1].unit}` : "—" },
        { label: t("steps"), value: f(a.decimalLevel, 0), emphasize: true },
      ]}
    />
  );
}
