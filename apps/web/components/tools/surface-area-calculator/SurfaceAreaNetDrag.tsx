"use client";
import { useTranslations } from "next-intl";
import { Mafs, Polygon, Text, useMovablePoint } from "mafs";
import "mafs/core.css";
import "@/components/tool-ui/mafsTheme.css";
import { SurfaceAreaCalculator } from "@tooloralabs/tools";
import { useIsDarkMode } from "@/lib/use-dark-mode";
import { MafsHoverSegment } from "@/components/tool-ui/MafsHoverPrimitives";

type Vector2 = [number, number];
type Rect = { x: number; y: number; w: number; h: number };

const tool = new SurfaceAreaCalculator();
const WIDTH = 3;
const MIN_DIM = 1;
const MAX_DIM = 8;
const LIGHT = { blue: "#2563eb", green: "#16a34a" };
const DARK = { blue: "#60a5fa", green: "#4ade80" };

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function rectPoints(r: Rect): Vector2[] {
  return [
    [r.x, r.y],
    [r.x + r.w, r.y],
    [r.x + r.w, r.y + r.h],
    [r.x, r.y + r.h],
  ];
}

/**
 * The hero indicator (§36): drag a point to set a rectangular prism's length and height (width
 * fixed) and watch its real six-face NET — the unfolded 2D pattern every face-sum surface-area
 * formula is built from — resize live, with each face's own area and the total recomputed via
 * the real SurfaceAreaCalculator engine.
 */
export default function SurfaceAreaNetDrag() {
  const t = useTranslations("tools.surface-area-calculator.education.hero");
  const isDark = useIsDarkMode();
  const colors = isDark ? DARK : LIGHT;

  // The draggable point sits exactly on the front face's own bottom-right corner (in the net's
  // own layout coordinates, offset by WIDTH for the top/left faces around it) — not on some
  // separate (length, height) axis — so dragging it visually resizes the face it touches.
  const corner = useMovablePoint([WIDTH + 5, WIDTH + 3] as Vector2, {
    color: colors.blue,
    constrain: (p) => [Math.min(WIDTH + MAX_DIM, Math.max(WIDTH + MIN_DIM, p[0])), Math.min(WIDTH + MAX_DIM, Math.max(WIDTH + MIN_DIM, p[1]))],
  });

  const length = round2(corner.point[0] - WIDTH);
  const height = round2(corner.point[1] - WIDTH);
  const output = tool.execute({ shape: "rectangular-prism", length, width: WIDTH, height }, { locale: "en-US" });
  const total = output.success ? output.data.surfaceArea : 0;

  const front: Rect = { x: WIDTH, y: WIDTH, w: length, h: height };
  const top: Rect = { x: WIDTH, y: 0, w: length, h: WIDTH };
  const bottom: Rect = { x: WIDTH, y: WIDTH + height, w: length, h: WIDTH };
  const left: Rect = { x: 0, y: WIDTH, w: WIDTH, h: height };
  const right: Rect = { x: WIDTH + length, y: WIDTH, w: WIDTH, h: height };
  const back: Rect = { x: WIDTH + length + WIDTH, y: WIDTH, w: length, h: height };

  const faces = [
    { rect: front, area: length * height, labelKey: "front" },
    { rect: back, area: length * height, labelKey: "back" },
    { rect: top, area: length * WIDTH, labelKey: "top" },
    { rect: bottom, area: length * WIDTH, labelKey: "bottom" },
    { rect: left, area: WIDTH * height, labelKey: "left" },
    { rect: right, area: WIDTH * height, labelKey: "right" },
  ];

  return (
    <div className="mt-2">
      <div dir="ltr" className="mb-3 flex flex-wrap items-center gap-1.5">
        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">{`${t("lengthLabel")}: ${length}`}</span>
        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">{`${t("heightLabel")}: ${height}`}</span>
        <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">{`${t("widthLabel")}: ${WIDTH}`}</span>
        <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700 dark:bg-green-500/10 dark:text-green-400">{`${t("totalLabel")}: ${round2(total)}`}</span>
      </div>

      <div dir="ltr" aria-label={t("ariaLabel")} className="mafs-canvas w-full overflow-hidden rounded-xl">
        <Mafs viewBox={{ x: [-1, WIDTH * 2 + MAX_DIM * 2 + 1], y: [-1, WIDTH * 2 + MAX_DIM + 1] }} height={230} pan={false} zoom={false} preserveAspectRatio={false}>
          {faces.map((f) => (
            <g key={f.labelKey}>
              <Polygon points={rectPoints(f.rect)} color={colors.blue} fillOpacity={0.14} strokeOpacity={0} />
              <MafsHoverSegment point1={[f.rect.x, f.rect.y]} point2={[f.rect.x + f.rect.w, f.rect.y]} color={colors.blue} weight={2} tooltip={t("faceTooltip", { face: t(`faces.${f.labelKey}`), value: `${round2(f.area)}` })} />
              <MafsHoverSegment point1={[f.rect.x, f.rect.y]} point2={[f.rect.x, f.rect.y + f.rect.h]} color={colors.blue} weight={2} tooltip={t("faceTooltip", { face: t(`faces.${f.labelKey}`), value: `${round2(f.area)}` })} />
              <MafsHoverSegment point1={[f.rect.x + f.rect.w, f.rect.y]} point2={[f.rect.x + f.rect.w, f.rect.y + f.rect.h]} color={colors.blue} weight={2} tooltip={t("faceTooltip", { face: t(`faces.${f.labelKey}`), value: `${round2(f.area)}` })} />
              <MafsHoverSegment point1={[f.rect.x, f.rect.y + f.rect.h]} point2={[f.rect.x + f.rect.w, f.rect.y + f.rect.h]} color={colors.blue} weight={2} tooltip={t("faceTooltip", { face: t(`faces.${f.labelKey}`), value: `${round2(f.area)}` })} />
              <Text x={f.rect.x + f.rect.w / 2} y={f.rect.y + f.rect.h / 2} size={10} color={colors.green}>
                {`${round2(f.area)}`}
              </Text>
            </g>
          ))}

          {corner.element}
        </Mafs>
      </div>

      <p className="mt-2 text-center text-xs text-zinc-500 dark:text-zinc-400">{t("hint")}</p>
    </div>
  );
}
