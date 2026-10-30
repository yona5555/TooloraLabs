"use client";
import { useTranslations } from "next-intl";
import PaletteIndicatorCard, { PaletteIndicatorUnavailable } from "./PaletteIndicatorCard";
import { usePaletteModel } from "./PaletteLiveContext";
import { svgPx } from "@/components/tool-ui/svgPx";

const W = 340;
const H = 210;
const TOP = 24;
const BASE = H - 40;
const CH = [
  { key: "r", fill: "fill-red-500 dark:fill-red-400" },
  { key: "g", fill: "fill-green-500 dark:fill-green-400" },
  { key: "b", fill: "fill-blue-500 dark:fill-blue-400" },
] as const;

/**
 * Type #1 (Labeled Bar Chart): the red, green and blue channel (0–255) of every colour, grouped per
 * colour with its swatch underneath — how each hue is mixed on screen.
 */
export default function PaletteRgbChannels() {
  const t = useTranslations("tools.color-palette-generator.education.lab.rgb");
  const { a, f } = usePaletteModel();
  if (!a) return <PaletteIndicatorUnavailable title={t("title")} />;

  const group = W / a.colors.length;
  const bw = Math.min(18, (group - 14) / 3);

  const svg = (
    <svg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="mx-auto block max-w-full">
      <line x1={0} y1={BASE} x2={W} y2={BASE} className="stroke-zinc-300 dark:stroke-zinc-600" />
      <line x1={0} y1={TOP} x2={W} y2={TOP} strokeDasharray="3 4" className="stroke-zinc-200 dark:stroke-zinc-700" />
      <text style={{ fontSize: svgPx(12) }} x={W} y={TOP - 6} textAnchor="end" className="fill-zinc-400 dark:fill-zinc-500">
        255
      </text>
      {a.colors.map((c, i) => {
        const gx = i * group + (group - bw * 3 - 4) / 2;
        return (
          <g key={i}>
            {CH.map((ch, k) => {
              const v = c.rgb[ch.key];
              const h = Math.max(1, (v / 255) * (BASE - TOP));
              return (
                <g key={ch.key}>
                  <rect x={gx + k * (bw + 2)} y={BASE - h} width={bw} height={h} rx={3} className={ch.fill} />
                  {bw >= 14 && (
                    <text style={{ fontSize: svgPx(12) }} x={gx + k * (bw + 2) + bw / 2} y={BASE - h - 4} textAnchor="middle" fontFamily="var(--font-mono)" className="fill-zinc-600 dark:fill-zinc-300">
                      {v}
                    </text>
                  )}
                </g>
              );
            })}
            <circle cx={i * group + group / 2} cy={BASE + 20} r={10} fill={c.hex} strokeWidth={1.5} className="stroke-zinc-300 dark:stroke-zinc-600" />
          </g>
        );
      })}
    </svg>
  );

  const base = a.colors[a.baseIndex];
  const dominant = CH.reduce((m, ch) => (base.rgb[ch.key] > base.rgb[m.key] ? ch : m), CH[0]).key;
  return (
    <PaletteIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={svg}
      rows={[
        { label: t("base"), value: `${base.rgb.r}, ${base.rgb.g}, ${base.rgb.b}` },
        {
          label: t("hex"),
          value: `${base.hex.toUpperCase()} = ${base.rgb.r.toString(16).padStart(2, "0").toUpperCase()}|${base.rgb.g.toString(16).padStart(2, "0").toUpperCase()}|${base.rgb.b.toString(16).padStart(2, "0").toUpperCase()}`,
        },
        { label: t("dominant"), value: t(dominant) },
        { label: t("sum"), value: f(a.colors.reduce((s, c) => s + c.rgb.r + c.rgb.g + c.rgb.b, 0) / a.colors.length, 0) },
        { label: t("range"), value: `${Math.min(base.rgb.r, base.rgb.g, base.rgb.b)}–${Math.max(base.rgb.r, base.rgb.g, base.rgb.b)}`, emphasize: true },
      ]}
    />
  );
}
