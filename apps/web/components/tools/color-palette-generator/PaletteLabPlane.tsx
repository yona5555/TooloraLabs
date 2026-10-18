"use client";
import { useTranslations } from "next-intl";
import PaletteIndicatorCard, { PaletteIndicatorUnavailable } from "./PaletteIndicatorCard";
import { px2, usePaletteModel } from "./PaletteLiveContext";

const SIZE = 240;
const C = SIZE / 2;
const RANGE = 110;

/**
 * Type #20 (Annotated Reference Point): every colour placed on the CIELAB a*–b* plane (green↔red,
 * blue↔yellow). Distance from the centre is chroma; the base colour is the large ringed point.
 */
export default function PaletteLabPlane() {
  const t = useTranslations("tools.color-palette-generator.education.lab.labPlane");
  const { a, f } = usePaletteModel();
  if (!a) return <PaletteIndicatorUnavailable title={t("title")} />;

  const s = (C - 14) / RANGE;
  const px = (v: number) => px2(C + Math.max(-RANGE, Math.min(RANGE, v)) * s);
  const py = (v: number) => px2(C - Math.max(-RANGE, Math.min(RANGE, v)) * s);

  const svg = (
    <svg direction="ltr" width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-label={t("aria")} className="mx-auto block max-w-full">
      {[40, 80].map((r) => (
        <circle key={r} cx={C} cy={C} r={r * s} fill="none" strokeDasharray="3 4" className="stroke-zinc-300 dark:stroke-zinc-600" />
      ))}
      <line x1={8} y1={C} x2={SIZE - 8} y2={C} className="stroke-zinc-300 dark:stroke-zinc-600" />
      <line x1={C} y1={8} x2={C} y2={SIZE - 8} className="stroke-zinc-300 dark:stroke-zinc-600" />
      <text x={SIZE - 6} y={C - 6} textAnchor="end" fontSize={12} className="fill-rose-600 dark:fill-rose-400">
        +a*
      </text>
      <text x={6} y={C - 6} fontSize={12} className="fill-emerald-600 dark:fill-emerald-400">
        −a*
      </text>
      <text x={C + 6} y={16} fontSize={12} className="fill-amber-600 dark:fill-amber-400">
        +b*
      </text>
      <text x={C + 6} y={SIZE - 8} fontSize={12} className="fill-blue-600 dark:fill-blue-400">
        −b*
      </text>
      <text x={C + 40 * s + 2} y={C + 12} fontSize={11} className="fill-zinc-400 dark:fill-zinc-500">
        C 40
      </text>
      {a.colors.map((c, i) => (
        <g key={i}>
          <line x1={C} y1={C} x2={px(c.lab.a)} y2={py(c.lab.b)} strokeDasharray="2 3" className="stroke-zinc-400 dark:stroke-zinc-500" />
          <circle cx={px(c.lab.a)} cy={py(c.lab.b)} r={i === a.baseIndex ? 11 : 8} fill={c.hex} strokeWidth={i === a.baseIndex ? 3 : 2} className="stroke-white dark:stroke-zinc-900" />
          <text x={px(c.lab.a) + 12} y={py(c.lab.b) + 4} fontSize={12} fontWeight={700} className="fill-zinc-700 dark:fill-zinc-200">
            {i + 1}
          </text>
        </g>
      ))}
    </svg>
  );

  const base = a.colors[a.baseIndex];
  const vivid = [...a.colors].sort((x, y) => y.chroma - x.chroma)[0];
  return (
    <PaletteIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={svg}
      rows={[
        { label: t("base"), value: `L* ${f(base.lab.L, 1)} · a* ${f(base.lab.a, 1)} · b* ${f(base.lab.b, 1)}` },
        { label: t("chroma"), value: `√(a*² + b*²) = ${f(base.chroma, 1)}` },
        { label: t("hue"), value: `${f(base.hueLab, 1)}°` },
        { label: t("vivid"), value: `${vivid.hex.toUpperCase()} · C ${f(vivid.chroma, 1)}` },
        { label: t("meanChroma"), value: f(a.colors.reduce((s2, c) => s2 + c.chroma, 0) / a.colors.length, 1), emphasize: true },
      ]}
    />
  );
}
