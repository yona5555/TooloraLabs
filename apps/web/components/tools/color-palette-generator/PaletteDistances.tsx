"use client";
import { useTranslations } from "next-intl";
import PaletteIndicatorCard, { PaletteIndicatorUnavailable } from "./PaletteIndicatorCard";
import { px2, usePaletteModel } from "./PaletteLiveContext";
import { svgPx } from "@/components/tool-ui/svgPx";

const W = 340;
const LABEL = 62;
const BAR_X = LABEL + 8;
const BAR_W = 220;
const ROW = 28;
const TOP = 20;

/**
 * Type #5 (Ranked Horizontal Bar List): every pair of colours ranked by perceptual distance (CIE76
 * ΔE*ab), closest first. Pairs under ΔE 10 are easy to confuse at a glance.
 */
export default function PaletteDistances() {
  const t = useTranslations("tools.color-palette-generator.education.lab.distance");
  const { a, f } = usePaletteModel();
  if (!a) return <PaletteIndicatorUnavailable title={t("title")} />;

  const pairs = [...a.pairs].sort((x, y) => x.deltaE - y.deltaE).slice(0, 10);
  const peak = Math.max(...pairs.map((p) => p.deltaE), 1);
  const H = TOP + pairs.length * ROW;
  const xTen = px2(BAR_X + (10 / peak) * BAR_W);

  const svg = (
    <svg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="mx-auto block max-w-full">
      {xTen < BAR_X + BAR_W && (
        <g>
          <line x1={xTen} y1={TOP - 6} x2={xTen} y2={H} strokeDasharray="4 3" className="stroke-rose-500 dark:stroke-rose-400" />
          <text style={{ fontSize: svgPx(12) }} x={xTen + 4} y={TOP - 8} className="fill-rose-600 dark:fill-rose-300">
            ΔE 10
          </text>
        </g>
      )}
      {pairs.map((p, k) => {
        const y = TOP + k * ROW;
        const w = px2(Math.max(3, (p.deltaE / peak) * BAR_W));
        return (
          <g key={`${p.i}-${p.j}`}>
            <circle cx={14} cy={y + ROW / 2 - 2} r={9} fill={a.colors[p.i].hex} strokeWidth={1.5} className="stroke-zinc-300 dark:stroke-zinc-600" />
            <circle cx={36} cy={y + ROW / 2 - 2} r={9} fill={a.colors[p.j].hex} strokeWidth={1.5} className="stroke-zinc-300 dark:stroke-zinc-600" />
            <rect x={BAR_X} y={y + 5} width={w} height={ROW - 14} rx={3} className={p.deltaE < 10 ? "fill-rose-500 dark:fill-rose-400" : "fill-blue-500 dark:fill-blue-400"} />
            <text style={{ fontSize: svgPx(12) }} x={BAR_X + w + 5} y={y + ROW / 2 + 2} fontWeight={700} fontFamily="ui-monospace, monospace" className="fill-zinc-700 dark:fill-zinc-200">
              {f(p.deltaE, 1)}
            </text>
          </g>
        );
      })}
    </svg>
  );

  const close = pairs[0];
  const far = pairs[pairs.length - 1];
  const c1 = a.colors[close.i].lab;
  const c2 = a.colors[close.j].lab;
  return (
    <PaletteIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={svg}
      rows={[
        { label: t("closest"), value: `${close.i + 1} ↔ ${close.j + 1} · ΔE ${f(close.deltaE, 1)}` },
        { label: t("farthest"), value: `${far.i + 1} ↔ ${far.j + 1} · ΔE ${f(far.deltaE, 1)}` },
        { label: t("formula"), value: `√(${f(c1.L - c2.L, 1)}² + ${f(c1.a - c2.a, 1)}² + ${f(c1.b - c2.b, 1)}²)` },
        { label: t("confusable"), value: f(a.pairs.filter((p) => p.deltaE < 10).length) },
        { label: t("mean"), value: `ΔE ${f(a.pairs.reduce((s, p) => s + p.deltaE, 0) / Math.max(1, a.pairs.length), 1)}`, emphasize: true },
      ]}
    />
  );
}
