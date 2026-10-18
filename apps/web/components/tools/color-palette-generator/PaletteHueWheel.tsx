"use client";
import { useRef } from "react";
import { useTranslations } from "next-intl";
import { hexToRgb, hslToRgb, rgbToHex, rgbToHsl } from "@tooloralabs/tools";
import PaletteIndicatorCard, { PaletteIndicatorUnavailable } from "./PaletteIndicatorCard";
import { usePaletteLive, usePaletteModel } from "./PaletteLiveContext";

const SIZE = 260;
const C = SIZE / 2;
const R_OUT = 118;
const R_IN = 84;
const R_DOT = 101;

const pt = (deg: number, r: number) => {
  const a = ((deg - 90) * Math.PI) / 180;
  // Rounded so server and browser trig render identical attributes (no hydration mismatch).
  return { x: Math.round((C + r * Math.cos(a)) * 100) / 100, y: Math.round((C + r * Math.sin(a)) * 100) / 100 };
};

/**
 * Interactive piece: the HSL hue wheel at the base colour's saturation and lightness. Drag the base
 * handle round the ring and the whole harmony rotates with it — every card on the page follows.
 */
export default function PaletteHueWheel() {
  const t = useTranslations("tools.color-palette-generator.education.lab.wheel");
  const { setDim } = usePaletteLive();
  const { draft, a, f } = usePaletteModel();
  const svgRef = useRef<SVGSVGElement>(null);
  if (!a) return <PaletteIndicatorUnavailable title={t("title")} />;

  const base = rgbToHsl(hexToRgb(draft.baseHex)!);
  const sectors = Array.from({ length: 72 }, (_, k) => k * 5);

  function setHueFromPointer(e: React.PointerEvent<SVGSVGElement>) {
    const box = svgRef.current?.getBoundingClientRect();
    if (!box) return;
    const x = ((e.clientX - box.left) / box.width) * SIZE - C;
    const y = ((e.clientY - box.top) / box.height) * SIZE - C;
    const hue = ((Math.atan2(y, x) * 180) / Math.PI + 90 + 360) % 360;
    setDim("baseHex", rgbToHex(hslToRgb({ h: hue, s: base.s, l: base.l })).toUpperCase());
  }

  const svg = (
    <svg
      ref={svgRef}
      direction="ltr"
      width={SIZE}
      height={SIZE}
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      role="slider"
      aria-label={t("aria")}
      aria-valuemin={0}
      aria-valuemax={359}
      aria-valuenow={Math.round(base.h)}
      tabIndex={0}
      onKeyDown={(e) => {
        const step = e.key === "ArrowRight" || e.key === "ArrowUp" ? 5 : e.key === "ArrowLeft" || e.key === "ArrowDown" ? -5 : 0;
        if (step) setDim("baseHex", rgbToHex(hslToRgb({ h: base.h + step, s: base.s, l: base.l })).toUpperCase());
      }}
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        setHueFromPointer(e);
      }}
      onPointerMove={(e) => e.buttons === 1 && setHueFromPointer(e)}
      className="mx-auto block max-w-full cursor-grab touch-none active:cursor-grabbing"
    >
      {sectors.map((h) => {
        const p0o = pt(h, R_OUT);
        const p1o = pt(h + 5.4, R_OUT);
        const p1i = pt(h + 5.4, R_IN);
        const p0i = pt(h, R_IN);
        return (
          <path
            key={h}
            d={`M ${p0o.x} ${p0o.y} A ${R_OUT} ${R_OUT} 0 0 1 ${p1o.x} ${p1o.y} L ${p1i.x} ${p1i.y} A ${R_IN} ${R_IN} 0 0 0 ${p0i.x} ${p0i.y} Z`}
            fill={rgbToHex(hslToRgb({ h: h + 2.5, s: base.s, l: base.l }))}
          />
        );
      })}
      <polygon
        points={a.colors.map((c) => `${pt(c.hsl.h, R_IN - 6).x},${pt(c.hsl.h, R_IN - 6).y}`).join(" ")}
        fill="none"
        strokeWidth={1.5}
        strokeDasharray="4 3"
        className="stroke-zinc-500 dark:stroke-zinc-400"
      />
      {a.colors.map((c, i) => {
        const p = pt(c.hsl.h, R_DOT);
        return <circle key={i} cx={p.x} cy={p.y} r={i === a.baseIndex ? 13 : 9} fill={c.hex} strokeWidth={i === a.baseIndex ? 4 : 2.5} className="stroke-white dark:stroke-zinc-900" />;
      })}
      <text x={C} y={C - 4} textAnchor="middle" fontSize={22} fontWeight={700} className="fill-zinc-800 dark:fill-zinc-100">
        {f(base.h, 0)}°
      </text>
      <text x={C} y={C + 16} textAnchor="middle" fontSize={12} className="fill-zinc-500 dark:fill-zinc-400">
        {t("drag")}
      </text>
    </svg>
  );

  const offsets = a.colors.map((c) => Math.round((((c.hsl.h - base.h) % 360) + 360) % 360));
  return (
    <PaletteIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={svg}
      rows={[
        { label: t("baseHue"), value: `${f(base.h, 1)}°` },
        { label: t("saturation"), value: `${f(base.s, 1)}%` },
        { label: t("lightness"), value: `${f(base.l, 1)}%` },
        { label: t("offsets"), value: offsets.map((o) => `${o}°`).join(", ") },
        { label: t("hexes"), value: a.colors.map((c) => c.hex.toUpperCase()).join(" "), emphasize: true },
      ]}
    />
  );
}
