"use client";
import { useTranslations } from "next-intl";
import MmmIndicatorCard, { scaleX } from "./MmmIndicatorCard";
import { useMmmModel } from "./MmmLiveContext";
import { svgPx } from "@/components/tool-ui/svgPx";
import { labelW, laneRows } from "@/components/tool-ui/labelLayout";

const W = 360;
const Y = 70;

/**
 * Type #19 (Zone Strip): the range split into colored zones — lower tail, middle 50% (IQR) and
 * upper tail — with Tukey's 1.5 × IQR fences, so a single extreme value visibly inflates the range.
 */
export default function MmmRangeZoneStrip() {
  const t = useTranslations("tools.mean-median-mode-range-calculator.education.lab.rangeZone");
  const tr = useTranslations("tools.mean-median-mode-range-calculator.result");
  const tl = useTranslations("tools.mean-median-mode-range-calculator.live3d");
  const { a, f } = useMmmModel();
  if (!a) return null;

  const lo = Math.min(a.min, a.lowerFence);
  const hi = Math.max(a.max, a.upperFence);
  const sx = scaleX(lo, hi, 16, W - 16);
  const outSet = new Set(a.outliers);
  const seen = new Map<number, number>();
  const zones = [
    { from: a.min, to: a.q1, cls: "fill-amber-300/80 dark:fill-amber-500/50" },
    { from: a.q1, to: a.q3, cls: "fill-emerald-400/80 dark:fill-emerald-500/60" },
    { from: a.q3, to: a.max, cls: "fill-amber-300/80 dark:fill-amber-500/50" },
  ];
  const share = a.range > 0 ? (a.iqr / a.range) * 100 : 100;

  // min / Q1 / Q3 / max labels kept inside the strip, each on the first line where it clears the label
  // before it (close quartiles stack instead of printing over each other) (§39); widths allow for the
  // up-to-1.15× a phone draws them at
  const marks = [
    { v: a.min, l: tr("min") },
    { v: a.q1, l: "Q1" },
    { v: a.q3, l: "Q3" },
    { v: a.max, l: tr("max") },
  ].map((m) => {
    const text = `${m.l} ${f(m.v)}`;
    const w = labelW(text) * 1.15;
    return { text, w, x: Math.max(w / 2 + 2, Math.min(W - w / 2 - 2, sx(m.v))) };
  });
  const lane = laneRows(marks, 6);
  const H = Math.max(150, Y + 58 + Math.max(...lane) * 15 + 10);
  const strip = (
    <svg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="mx-auto block max-w-full">
      <rect x={16} y={Y} width={W - 32} height={16} rx={8} className="fill-zinc-100 dark:fill-zinc-800" />
      {zones.map((z, i) => (
        <rect key={i} x={sx(z.from)} y={Y} width={Math.max(0, sx(z.to) - sx(z.from))} height={16} className={z.cls} />
      ))}
      {[a.lowerFence, a.upperFence].map((v, i) => (
        <g key={i}>
          <line x1={sx(v)} x2={sx(v)} y1={Y - 10} y2={Y + 26} strokeDasharray="3 2" strokeWidth={1.5} className="stroke-rose-500 dark:stroke-rose-400" />
          <text style={{ fontSize: svgPx(12) }} x={sx(v)} y={Y + 40} textAnchor={i === 0 ? "start" : "end"} className="fill-rose-600 dark:fill-rose-400">
            {`${i === 0 ? tl("lowerFence") : tl("upperFence")} ${f(v)}`}
          </text>
        </g>
      ))}
      {a.sorted.map((v, i) => {
        const k = seen.get(v) ?? 0;
        seen.set(v, k + 1);
        return <circle key={i} cx={sx(v)} cy={Y - 8 - k * 9} r={4} className={outSet.has(v) ? "fill-rose-600 dark:fill-rose-400" : "fill-blue-600 dark:fill-blue-400"} />;
      })}
      {marks.map((m, i) => (
        <text style={{ fontSize: svgPx(12) }} key={i} x={m.x} y={Y + 58 + lane[i] * 15} textAnchor="middle" fontWeight={600} className="fill-zinc-600 dark:fill-zinc-300">
          {m.text}
        </text>
      ))}
      <text style={{ fontSize: svgPx(12) }} x={W / 2} y={14} textAnchor="middle" fontWeight={700} className="fill-emerald-700 dark:fill-emerald-300">
        {`IQR ${f(a.iqr)} · ${tr("range")} ${f(a.range)}`}
      </text>
    </svg>
  );

  return (
    <MmmIndicatorCard
      mini={1}
      title={t("title")}
      intro={t("intro")}
      indicator={strip}
      rows={[
        { label: tr("range"), value: `${f(a.max)} − ${f(a.min)} = ${f(a.range)}` },
        { label: "IQR", value: `${f(a.q3)} − ${f(a.q1)} = ${f(a.iqr)}` },
        { label: t("iqrShare"), value: `${f(share, 1)}%` },
        { label: t("fences"), value: `[${f(a.lowerFence)}, ${f(a.upperFence)}]` },
        { label: tl("outliers"), value: a.outliers.length ? a.outliers.map((v) => f(v)).join(", ") : tl("none"), emphasize: true },
      ]}
    />
  );
}
