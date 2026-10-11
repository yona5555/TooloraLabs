"use client";
import { useTranslations } from "next-intl";
import { inverseSquareCurve } from "@tooloralabs/tools";
import ForceIndicatorCard, { ForceIndicatorUnavailable } from "./ForceIndicatorCard";
import { useForceModel } from "./ForceLiveContext";

const W = 340;
const H = 220;
const L = 40;
const R = 330;
const T = 16;
const B = 186;

/**
 * Type #7 (Trend Line with Highlighted Reference Point): F(r) = Gm₁m₂/r² from r/2 to 4r, with the
 * current distance as the highlighted point and r/2, 2r, 3r marked — doubling r quarters F.
 */
export default function ForceInverseSquareTrend() {
  const t = useTranslations("tools.force-calculator.education.lab.inverse");
  const tr = useTranslations("tools.force-calculator.result");
  const { gr, f } = useForceModel();
  if (!gr || gr.force === 0) return <ForceIndicatorUnavailable title={t("title")} />;

  const F = gr.force;
  const curve = inverseSquareCurve(F, gr.distance, 64);
  // Axes in units of r and F, so the shape is the same for any masses.
  const sx = (k: number) => L + ((k - 0.5) / 3.5) * (R - L);
  const sy = (q: number) => B - (q / 4) * (B - T);
  const path = curve.map((p, i) => `${i ? "L" : "M"} ${sx(p.distance / gr.distance).toFixed(2)} ${sy(p.force / F).toFixed(2)}`).join(" ");
  const marks = [
    { k: 0.5, label: "4F", main: false },
    { k: 1, label: "F", main: true },
    { k: 2, label: "F/4", main: false },
    { k: 3, label: "F/9", main: false },
  ];

  const svg = (
    <svg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="mx-auto block max-w-full">
      <line x1={L} y1={B} x2={R} y2={B} className="stroke-zinc-300 dark:stroke-zinc-600" />
      <line x1={L} y1={T} x2={L} y2={B} className="stroke-zinc-300 dark:stroke-zinc-600" />
      {[0.5, 1, 2, 3, 4].map((k) => (
        <text key={k} x={sx(k)} y={B + 14} textAnchor="middle" fontSize={10} fontFamily="ui-monospace, monospace" className="fill-zinc-500 dark:fill-zinc-400">
          {k === 0.5 ? "r/2" : k === 1 ? "r" : `${k}r`}
        </text>
      ))}
      {[1, 2, 3, 4].map((q) => (
        <text key={q} x={L - 6} y={sy(q) + 3} textAnchor="end" fontSize={10} fontFamily="ui-monospace, monospace" className="fill-zinc-500 dark:fill-zinc-400">
          {q === 1 ? "F" : `${q}F`}
        </text>
      ))}
      <text x={R} y={B + 30} textAnchor="end" fontSize={10} className="fill-zinc-500 dark:fill-zinc-400">
        {tr("inverseSquareXLabel")}
      </text>
      <text x={R} y={T + 2} textAnchor="end" fontSize={10} className="fill-zinc-500 dark:fill-zinc-400">
        {tr("inverseSquareYLabel")}
      </text>
      <path d={path} fill="none" strokeWidth={2.5} className="stroke-blue-600 dark:stroke-blue-400" />
      {marks.map((m) => {
        const x = sx(m.k);
        const y = sy(1 / (m.k * m.k));
        return (
          <g key={m.k}>
            <line x1={x} y1={y} x2={x} y2={B} strokeDasharray="3 3" className="stroke-zinc-300 dark:stroke-zinc-600" />
            <circle cx={x} cy={y} r={m.main ? 7 : 4} className={m.main ? "fill-red-600 dark:fill-red-400" : "fill-zinc-500 dark:fill-zinc-400"} />
            <text x={x + 9} y={y - 7} fontSize={m.main ? 12 : 10} fontWeight={700} fontFamily="ui-monospace, monospace" className={m.main ? "fill-red-600 dark:fill-red-400" : "fill-zinc-600 dark:fill-zinc-300"}>
              {m.label}
            </text>
          </g>
        );
      })}
    </svg>
  );

  return (
    <ForceIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={svg}
      rows={[
        { label: `F (r = ${f(gr.distance)} m)`, value: `${f(F)} N`, emphasize: true },
        ...gr.atMultiples
          .filter((m) => m.k !== 1)
          .map((m) => ({ label: `F (${m.k === 0.5 ? "r/2" : `${m.k}r`})`, value: `${f(F)} / ${f(m.k * m.k)} = ${f(m.force)} N` })),
      ]}
    />
  );
}
