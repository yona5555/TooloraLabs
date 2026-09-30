"use client";
import { useTranslations } from "next-intl";
import { Mafs, Coordinates, Polygon, Text, useMovablePoint } from "mafs";
import "mafs/core.css";
import "@/components/tool-ui/mafsTheme.css";
import { AreaCalculator } from "@tooloralabs/tools";
import { useIsDarkMode } from "@/lib/use-dark-mode";
import { MafsHoverSegment } from "@/components/tool-ui/MafsHoverPrimitives";

type Vector2 = [number, number];

const tool = new AreaCalculator();
const MIN_DIM = 0.5;
const MAX_DIM = 10;
const LIGHT = { blue: "#2563eb", green: "#16a34a" };
const DARK = { blue: "#60a5fa", green: "#4ade80" };

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * The hero indicator (§36): drag the corner point and the rectangle's width and height change
 * together — a genuinely 2D interaction, unlike every other tool in this rollout so far — with
 * the area recomputing live via the real AreaCalculator engine.
 */
export default function AreaRectangleDrag() {
  const t = useTranslations("tools.area-calculator.education.hero");
  const isDark = useIsDarkMode();
  const colors = isDark ? DARK : LIGHT;

  const corner = useMovablePoint([6, 4] as Vector2, {
    color: colors.blue,
    constrain: (p) => [Math.min(MAX_DIM, Math.max(MIN_DIM, p[0])), Math.min(MAX_DIM, Math.max(MIN_DIM, p[1]))],
  });

  const width = round2(corner.point[0]);
  const height = round2(corner.point[1]);
  const output = tool.execute({ shape: "rectangle", width, height }, { locale: "en-US" });
  const area = output.success ? output.data.area : 0;
  const perimeter = round2(2 * (width + height));

  const origin: Vector2 = [0, 0];
  const bottomRight: Vector2 = [corner.point[0], 0];
  const topLeft: Vector2 = [0, corner.point[1]];

  return (
    <div className="mt-2">
      <div dir="ltr" className="mb-3 flex flex-wrap items-center gap-1.5">
        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">{`${t("widthLabel")}: ${width}`}</span>
        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">{`${t("heightLabel")}: ${height}`}</span>
        <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700 dark:bg-green-500/10 dark:text-green-400">{`${t("areaLabel")}: ${round2(area)}`}</span>
        <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">{`${t("perimeterLabel")}: ${perimeter}`}</span>
      </div>

      <div dir="ltr" aria-label={t("ariaLabel")} className="mafs-canvas w-full overflow-hidden rounded-xl">
        <Mafs viewBox={{ x: [-1, MAX_DIM + 1], y: [-1, MAX_DIM + 1] }} height={260} pan={false} zoom={false}>
          <Coordinates.Cartesian xAxis={{ lines: 1 }} yAxis={{ lines: 1 }} />

          <Polygon points={[origin, bottomRight, corner.point, topLeft]} color={colors.green} fillOpacity={0.18} strokeOpacity={0} />

          <MafsHoverSegment point1={origin} point2={bottomRight} color={colors.blue} weight={2.75} tooltip={t("widthTooltip", { value: `${width}` })} />
          <MafsHoverSegment point1={origin} point2={topLeft} color={colors.blue} weight={2.75} tooltip={t("heightTooltip", { value: `${height}` })} />

          <Text x={corner.point[0] / 2} y={-0.5} size={12} color={colors.blue}>
            {`${width}`}
          </Text>
          <Text x={-0.5} y={corner.point[1] / 2} size={12} color={colors.blue}>
            {`${height}`}
          </Text>
          <Text x={corner.point[0] / 2} y={corner.point[1] / 2} size={13} color={colors.green}>
            {`${round2(area)}`}
          </Text>

          {corner.element}
        </Mafs>
      </div>

      <p className="mt-2 text-center text-xs text-zinc-500 dark:text-zinc-400">{t("hint")}</p>
    </div>
  );
}
