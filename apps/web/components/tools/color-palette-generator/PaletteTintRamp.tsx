"use client";
import { useTranslations } from "next-intl";
import { hexToRgb, rgbToHsl } from "@tooloralabs/tools";
import PaletteIndicatorCard, { PaletteIndicatorUnavailable } from "./PaletteIndicatorCard";
import { usePaletteModel } from "./PaletteLiveContext";

const W = 342;
const H = 120;
const Y = 30;
const CELL_H = 46;

/**
 * Type #19 (Zone Strip): the base hue from 5 % to 95 % lightness. Each step is labelled with the text
 * colour that reads on it; the marker shows where white text stops meeting WCAG AA (4.5:1).
 */
export default function PaletteTintRamp() {
  const t = useTranslations("tools.color-palette-generator.education.lab.ramp");
  const { draft, a, f } = usePaletteModel();
  if (!a) return <PaletteIndicatorUnavailable title={t("title")} />;

  const cw = W / a.ramp.length;
  const baseL = rgbToHsl(hexToRgb(draft.baseHex)!).l;
  const lastWhite = [...a.ramp].reverse().find((r) => r.contrastWhite >= 4.5);
  const firstBlack = a.ramp.find((r) => r.contrastBlack >= 4.5);
  const xOf = (l: number) => ((l - 2.5) / 95) * W;

  const svg = (
    <svg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="mx-auto block max-w-full">
      {a.ramp.map((r, k) => {
        const whiteText = r.contrastWhite >= r.contrastBlack;
        return (
          <g key={r.l}>
            <rect x={k * cw} y={Y} width={cw + 0.3} height={CELL_H} fill={r.hex} />
            {k % 2 === 0 && (
              <text x={k * cw + cw / 2} y={Y + CELL_H / 2 + 4} textAnchor="middle" fontSize={11} fontWeight={700} fill={whiteText ? "#fff" : "#000"}>
                {r.l}
              </text>
            )}
          </g>
        );
      })}
      <rect x={0} y={Y} width={W} height={CELL_H} rx={6} fill="none" className="stroke-zinc-300 dark:stroke-zinc-600" />
      <path d={`M ${xOf(baseL)} ${Y - 4} l -6 -10 h 12 z`} className="fill-blue-600 dark:fill-blue-400" />
      <text x={Math.min(Math.max(xOf(baseL), 30), W - 30)} y={12} textAnchor="middle" fontSize={12} fontWeight={700} className="fill-blue-700 dark:fill-blue-300">
        {t("base", { l: f(baseL, 0) })}
      </text>
      {lastWhite && (
        <g>
          <line x1={xOf(lastWhite.l) + cw / 2} y1={Y + CELL_H} x2={xOf(lastWhite.l) + cw / 2} y2={Y + CELL_H + 14} strokeWidth={2} className="stroke-emerald-600 dark:stroke-emerald-400" />
          <text
            x={Math.min(xOf(lastWhite.l) + cw / 2, W - 4)}
            y={Y + CELL_H + 28}
            textAnchor={xOf(lastWhite.l) > W - 90 ? "end" : "middle"}
            fontSize={12}
            className="fill-emerald-700 dark:fill-emerald-300"
          >
            {t("whiteEnds", { l: lastWhite.l })}
          </text>
        </g>
      )}
    </svg>
  );

  return (
    <PaletteIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={svg}
      rows={[
        { label: t("baseL"), value: `${f(baseL, 1)}%` },
        { label: t("whiteRange"), value: lastWhite ? `5–${lastWhite.l}%` : "—" },
        { label: t("blackRange"), value: firstBlack ? `${firstBlack.l}–95%` : "—" },
        { label: t("steps"), value: `${a.ramp.length} × 5%` },
        { label: t("both"), value: lastWhite && firstBlack && firstBlack.l <= lastWhite.l ? `${firstBlack.l}–${lastWhite.l}%` : t("none"), emphasize: true },
      ]}
    />
  );
}
