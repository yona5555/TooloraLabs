"use client";
import { useTranslations } from "next-intl";
import { Mafs, Coordinates, Polygon, useMovablePoint } from "mafs";
import "mafs/core.css";
import "@/components/tool-ui/mafsTheme.css";
import { angleFromPoint, constrainToCircle } from "@tooloralabs/tools";
import { useIsDarkMode } from "@/lib/use-dark-mode";
import { MafsHoverSegment, MafsHoverPoint } from "@/components/tool-ui/MafsHoverPrimitives";

type Vector2 = [number, number];

const RADIUS = 3;
const LIGHT = { blue: "#2563eb", red: "#dc2626", green: "#16a34a", fg: "#3f3f46" };
const DARK = { blue: "#60a5fa", red: "#f87171", green: "#4ade80", fg: "#d4d4d8" };

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * The hero indicator (§36): drag the point around the unit circle and its angle theta, plus
 * sin/cos/tan of that angle, recompute live — the exact geometric definition behind every
 * trig key (sin, cos, tan, and their inverses) on this calculator's keypad. Red = sin (the
 * point's height), green = cos (its horizontal position), matching how those two keys are
 * literally defined.
 */
export default function ScientificUnitCircleDiagram() {
  const t = useTranslations("tools.scientific-calculator.education.intro.diagram");
  const isDark = useIsDarkMode();
  const colors = isDark ? DARK : LIGHT;

  const point = useMovablePoint(
    [RADIUS * Math.cos((40 * Math.PI) / 180), RADIUS * Math.sin((40 * Math.PI) / 180)] as Vector2,
    {
      color: colors.blue,
      constrain: (p) => {
        const snapped = constrainToCircle({ x: p[0], y: p[1] }, RADIUS);
        return [snapped.x, snapped.y];
      },
    },
  );

  const angleDeg = angleFromPoint({ x: point.point[0], y: point.point[1] });
  const angleRad = (angleDeg * Math.PI) / 180;
  const sinVal = Math.sin(angleRad);
  const cosVal = Math.cos(angleRad);
  const tanVal = Math.abs(Math.abs(angleDeg % 180) - 90) < 0.05 ? null : Math.tan(angleRad);

  const originVec: Vector2 = [0, 0];
  const cosFoot: Vector2 = [point.point[0], 0];

  return (
    <div className="mt-2">
      <div className="mb-3 flex flex-wrap items-center gap-1.5" dir="ltr">
        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">{`θ = ${round2(angleDeg)}°`}</span>
        <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700 dark:bg-red-500/10 dark:text-red-300">{`sin θ = ${round2(sinVal)}`}</span>
        <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700 dark:bg-green-500/10 dark:text-green-300">{`cos θ = ${round2(cosVal)}`}</span>
        <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">{`tan θ = ${tanVal === null ? "∞" : round2(tanVal)}`}</span>
      </div>

      <div dir="ltr" aria-label={t("caption")} className="mafs-canvas w-full overflow-hidden rounded-xl">
        <Mafs viewBox={{ x: [-4.2, 4.2], y: [-4.2, 4.2] }} height={300} pan={false} zoom={false}>
          <Coordinates.Cartesian xAxis={{ lines: 1 }} yAxis={{ lines: 1 }} />
          <Polygon points={[originVec, [RADIUS, 0], [0, RADIUS]]} color={colors.fg} fillOpacity={0} strokeOpacity={0} />

          <MafsHoverSegment point1={[point.point[0], point.point[1]]} point2={cosFoot} color={colors.red} weight={2.75} tooltip={t("sinTooltip", { value: `${round2(sinVal)}` })} />
          <MafsHoverSegment point1={originVec} point2={cosFoot} color={colors.green} weight={2.75} tooltip={t("cosTooltip", { value: `${round2(cosVal)}` })} />
          <MafsHoverSegment point1={originVec} point2={[point.point[0], point.point[1]]} color={colors.blue} weight={1.5} dashed tooltip={t("radiusTooltip")} />

          <MafsHoverPoint point={originVec} tooltip={t("originTooltip")} radiusPx={10} />

          {point.element}
        </Mafs>
      </div>

      <p className="mt-2 text-center text-xs text-zinc-500 dark:text-zinc-400">{t("hint")}</p>
    </div>
  );
}
