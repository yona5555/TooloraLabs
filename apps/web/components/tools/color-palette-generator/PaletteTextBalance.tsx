"use client";
import { useTranslations } from "next-intl";
import PaletteIndicatorCard, { PaletteIndicatorUnavailable } from "./PaletteIndicatorCard";
import { px2, usePaletteModel } from "./PaletteLiveContext";

const W = 340;
const MID = W / 2;
const HALF = 140;
const ROW = 34;
const TOP = 30;
const MAX = 21;

/**
 * Type #14 (Balance Indicator): for each colour, contrast with white text grows to the left and with
 * black text to the right; the dashed lines mark WCAG's 4.5:1 (AA) on both sides.
 */
export default function PaletteTextBalance() {
  const t = useTranslations("tools.color-palette-generator.education.lab.balance");
  const { a, f } = usePaletteModel();
  if (!a) return <PaletteIndicatorUnavailable title={t("title")} />;

  const len = (r: number) => px2((Math.log(r) / Math.log(MAX)) * HALF);
  const H = TOP + a.colors.length * ROW + 6;
  const aa = len(4.5);

  const svg = (
    <svg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="mx-auto block max-w-full">
      <text x={MID - 8} y={14} textAnchor="end" fontSize={12} fontWeight={600} className="fill-zinc-500 dark:fill-zinc-400">
        ← {t("white")}
      </text>
      <text x={MID + 8} y={14} fontSize={12} fontWeight={600} className="fill-zinc-500 dark:fill-zinc-400">
        {t("black")} →
      </text>
      {[MID - aa, MID + aa].map((x) => (
        <line key={x} x1={x} y1={TOP - 6} x2={x} y2={H - 4} strokeDasharray="4 3" className="stroke-emerald-500 dark:stroke-emerald-400" />
      ))}
      <text x={MID + aa + 3} y={TOP - 8} fontSize={11} className="fill-emerald-700 dark:fill-emerald-300">
        4.5
      </text>
      {a.colors.map((c, i) => {
        const y = TOP + i * ROW;
        const lw = len(c.contrastWhite);
        const lb = len(c.contrastBlack);
        return (
          <g key={i}>
            <rect x={MID - lw} y={y + 4} width={lw} height={ROW - 12} rx={4} fill={c.hex} className="stroke-zinc-300 dark:stroke-zinc-600" />
            <rect x={MID} y={y + 4} width={lb} height={ROW - 12} rx={4} fill={c.hex} className="stroke-zinc-300 dark:stroke-zinc-600" />
            <text x={MID - lw + 6} y={y + ROW / 2 + 3} fontSize={12} fontWeight={700} fill="#fff">
              {f(c.contrastWhite, 1)}
            </text>
            <text x={MID + lb - 6} y={y + ROW / 2 + 3} textAnchor="end" fontSize={12} fontWeight={700} fill="#000">
              {f(c.contrastBlack, 1)}
            </text>
          </g>
        );
      })}
      <line x1={MID} y1={TOP - 2} x2={MID} y2={H - 2} strokeWidth={1.5} className="stroke-zinc-400 dark:stroke-zinc-500" />
    </svg>
  );

  const whiteOk = a.colors.filter((c) => c.contrastWhite >= 4.5).length;
  const blackOk = a.colors.filter((c) => c.contrastBlack >= 4.5).length;
  const flip = a.ramp.find((r) => r.contrastBlack > r.contrastWhite);
  return (
    <PaletteIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={svg}
      rows={[
        { label: t("whiteOk"), value: `${f(whiteOk)} / ${f(a.colors.length)}` },
        { label: t("blackOk"), value: `${f(blackOk)} / ${f(a.colors.length)}` },
        { label: t("flip"), value: flip ? `L ≥ ${flip.l}%` : "—" },
        {
          label: t("product"),
          value: `${f(a.colors[a.baseIndex].contrastWhite, 2)} × ${f(a.colors[a.baseIndex].contrastBlack, 2)} = ${f(a.colors[a.baseIndex].contrastWhite * a.colors[a.baseIndex].contrastBlack, 1)}`,
        },
        { label: t("baseBest"), value: `${f(a.colors[a.baseIndex].bestContrast, 2)}:1 (${a.colors[a.baseIndex].bestText === "white" ? t("white") : t("black")})`, emphasize: true },
      ]}
    />
  );
}
