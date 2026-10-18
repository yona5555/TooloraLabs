"use client";
import { useTranslations } from "next-intl";
import { CVD_TYPES } from "@tooloralabs/tools";
import PaletteIndicatorCard, { PaletteIndicatorUnavailable } from "./PaletteIndicatorCard";
import { usePaletteModel } from "./PaletteLiveContext";

const W = 340;
const ROW = 46;
const LABEL = 96;
const SAFE = 10;

/**
 * Type #4 (Icon Comparison Rows): the palette as seen with typical vision and with full protanopia,
 * deuteranopia and tritanopia (Machado 2009 simulation), with the smallest colour distance left in each row.
 */
export default function PaletteColorBlind() {
  const t = useTranslations("tools.color-palette-generator.education.lab.cvd");
  const { a, f } = usePaletteModel();
  if (!a) return <PaletteIndicatorUnavailable title={t("title")} />;

  const rows = [{ key: "normal", hexes: a.colors.map((c) => c.hex), min: a.minDeltaE }, ...CVD_TYPES.map((k) => ({ key: k, hexes: a.cvd[k].hexes, min: a.cvd[k].minDeltaE }))];
  const n = a.colors.length;
  const slot = (W - LABEL - 52) / n;
  const r = Math.min(16, slot / 2 - 3);
  const H = rows.length * ROW + 4;

  const svg = (
    <svg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="mx-auto block max-w-full">
      {rows.map((row, k) => {
        const y = k * ROW + ROW / 2 + 2;
        const ok = row.min >= SAFE;
        return (
          <g key={row.key}>
            <text x={LABEL - 8} y={y + 4} textAnchor="end" fontSize={12} fontWeight={600} className="fill-zinc-700 dark:fill-zinc-200">
              {t(row.key)}
            </text>
            {row.hexes.map((hex, i) => (
              <circle key={i} cx={LABEL + slot * i + slot / 2} cy={y} r={r} fill={hex} strokeWidth={1.5} className="stroke-zinc-300 dark:stroke-zinc-600" />
            ))}
            <text
              x={W - 2}
              y={y + 4}
              textAnchor="end"
              fontSize={12}
              fontWeight={700}
              fontFamily="ui-monospace, monospace"
              className={ok ? "fill-emerald-700 dark:fill-emerald-300" : "fill-rose-600 dark:fill-rose-300"}
            >
              {f(row.min, 0)}
            </text>
          </g>
        );
      })}
    </svg>
  );

  const worst = CVD_TYPES.reduce((w, k) => (a.cvd[k].minDeltaE < a.cvd[w].minDeltaE ? k : w), CVD_TYPES[0]);
  return (
    <PaletteIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={svg}
      rows={[
        { label: t("normalMin"), value: `ΔE ${f(a.minDeltaE, 1)}` },
        ...CVD_TYPES.map((k) => ({ label: t(k), value: `ΔE ${f(a.cvd[k].minDeltaE, 1)}` })),
        { label: t("worst"), value: `${t(worst)} · ${a.cvd[worst].minDeltaE >= SAFE ? t("distinct") : t("confusable")}`, emphasize: true },
      ]}
    />
  );
}
