"use client";
import { useTranslations } from "next-intl";
import PaletteIndicatorCard, { PaletteIndicatorUnavailable } from "./PaletteIndicatorCard";
import { px2, usePaletteModel } from "./PaletteLiveContext";
import { svgPx } from "@/components/tool-ui/svgPx";

const W = 340;
const H = 210;
const BASE = H - 30;
const TOP = 24;

/**
 * Type #13 (Stepped Diagram): the palette re-ordered from darkest to lightest by WCAG relative
 * luminance — the quantity contrast is built from — rising as a staircase from 0 (black) to 1 (white).
 */
export default function PaletteLuminanceSteps() {
  const t = useTranslations("tools.color-palette-generator.education.lab.luminance");
  const { a, f } = usePaletteModel();
  if (!a) return <PaletteIndicatorUnavailable title={t("title")} />;

  const order = a.colors.map((c, i) => ({ c, i })).sort((x, y) => x.c.luminance - y.c.luminance);
  const step = W / order.length;
  const y = (lum: number) => px2(BASE - lum * (BASE - TOP));
  const path = order.map(({ c }, k) => `${k ? "L" : "M"} ${k * step} ${y(c.luminance)} H ${(k + 1) * step}`).join(" ");

  const svg = (
    <svg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="mx-auto block max-w-full">
      {[0, 0.5, 1].map((v) => (
        <g key={v}>
          <line x1={0} y1={y(v)} x2={W} y2={y(v)} className="stroke-zinc-200 dark:stroke-zinc-700" />
          <text style={{ fontSize: svgPx(12) }} x={2} y={y(v) - 4} className="fill-zinc-400 dark:fill-zinc-500">
            {v}
          </text>
        </g>
      ))}
      {order.map(({ c, i }, k) => (
        <g key={i}>
          <rect x={k * step + 4} y={y(c.luminance)} width={step - 8} height={BASE - y(c.luminance) + 0.01} rx={4} fill={c.hex} className="stroke-zinc-300 dark:stroke-zinc-600" />
          <text style={{ fontSize: svgPx(12) }} x={k * step + step / 2} y={y(c.luminance) - 6} textAnchor="middle" fontWeight={700} fontFamily="var(--font-mono)" className="fill-zinc-800 dark:fill-zinc-100">
            {f(c.luminance, 3)}
          </text>
          <text style={{ fontSize: svgPx(12) }} x={k * step + step / 2} y={BASE + 18} textAnchor="middle" className="fill-zinc-500 dark:fill-zinc-400">
            {t("color", { n: i + 1 })}
          </text>
        </g>
      ))}
      <path d={path} fill="none" strokeWidth={2} className="stroke-blue-600 dark:stroke-blue-400" />
    </svg>
  );

  const dark = order[0];
  const light = order[order.length - 1];
  return (
    <PaletteIndicatorCard
      title={t("title")}
      intro={t("intro")}
      mini={1}
      indicator={svg}
      rows={[
        { label: t("darkest"), value: `${dark.c.hex.toUpperCase()} · ${f(dark.c.luminance, 3)}` },
        { label: t("lightest"), value: `${light.c.hex.toUpperCase()} · ${f(light.c.luminance, 3)}` },
        { label: t("spread"), value: f(light.c.luminance - dark.c.luminance, 3) },
        { label: t("formula"), value: "0.2126 R + 0.7152 G + 0.0722 B" },
        { label: t("maxContrast"), value: `${f((light.c.luminance + 0.05) / (dark.c.luminance + 0.05), 2)}:1`, emphasize: true },
      ]}
    />
  );
}
