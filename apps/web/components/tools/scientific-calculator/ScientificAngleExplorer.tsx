"use client";
import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { Mafs, Coordinates, Circle, Line, Text, useMovablePoint } from "mafs";
import "mafs/core.css";
import "@/components/tool-ui/mafsTheme.css";
import { angleFromPoint, pointOnCircle, constrainToCircle } from "@tooloralabs/tools";
import { useIsDarkMode } from "@/lib/use-dark-mode";
import { MafsHoverSegment } from "@/components/tool-ui/MafsHoverPrimitives";
import { useScientificAngle } from "./ScientificAngleContext";

type Vector2 = [number, number];

const RADIUS = 3;
const LIGHT = { blue: "#2563eb", rose: "#e11d48", emerald: "#059669" };
const DARK = { blue: "#60a5fa", rose: "#fb7185", emerald: "#34d399" };

function round3(n: number): number {
  return Math.round(n * 1000) / 1000;
}

function toVec2(p: Vector2) {
  return { x: p[0], y: p[1] };
}

function toVector2(v: { x: number; y: number }): Vector2 {
  return [v.x, v.y];
}

/**
 * The hero indicator (§36): a genuinely draggable point on the unit circle — mouse, touch, and
 * keyboard (Mafs's movable point ships keyboard support built in) — sharing its live angle via
 * ScientificAngleContext with six of the fifteen supporting indicators whose own math is
 * genuinely angle-based. The other nine cover unrelated math domains (factorials, logs,
 * combinatorics, memory, sign, percent, precedence) and are intentionally not wired here.
 */
export default function ScientificAngleExplorer() {
  const t = useTranslations("tools.scientific-calculator.education.hero");
  const isDark = useIsDarkMode();
  const colors = isDark ? DARK : LIGHT;
  const { dims, setDim } = useScientificAngle();

  const point = useMovablePoint(toVector2(pointOnCircle(dims.angleDeg, RADIUS)), {
    color: colors.blue,
    constrain: (p) => toVector2(constrainToCircle(toVec2(p), RADIUS)),
  });

  const lastAngle = useRef(dims.angleDeg);

  useEffect(() => {
    if (Math.abs(dims.angleDeg - lastAngle.current) > 0.05) {
      point.setPoint(toVector2(pointOnCircle(dims.angleDeg, RADIUS)));
      lastAngle.current = dims.angleDeg;
    }
  }, [dims.angleDeg, point]);

  useEffect(() => {
    const angle = angleFromPoint(toVec2(point.point));
    if (Math.abs(angle - lastAngle.current) > 0.05) {
      lastAngle.current = angle;
      setDim("angleDeg", angle);
    }
  }, [point, setDim]);

  const angleRad = (dims.angleDeg * Math.PI) / 180;
  const sin = round3(Math.sin(angleRad));
  const cos = round3(Math.cos(angleRad));
  const tan = round3(Math.tan(angleRad));

  const origin: Vector2 = [0, 0];
  const projX: Vector2 = [point.point[0], 0];

  return (
    <div className="mt-2">
      <div dir="ltr" className="mb-3 flex flex-wrap items-center gap-1.5">
        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">{`${t("angleLabel")}: ${round3(dims.angleDeg)}°`}</span>
        <span className="rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">{`sin: ${sin}`}</span>
        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">{`cos: ${cos}`}</span>
        <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">{`tan: ${Number.isFinite(tan) ? tan : "∞"}`}</span>
      </div>

      <div dir="ltr" aria-label={t("ariaLabel")} className="mafs-canvas mx-auto w-full max-w-[320px] overflow-hidden rounded-xl">
        <Mafs viewBox={{ x: [-4, 4], y: [-4, 4] }} height={280} pan={false} zoom={false}>
          <Coordinates.Cartesian xAxis={{ lines: 1 }} yAxis={{ lines: 1 }} />
          <Circle center={[0, 0]} radius={RADIUS} color={colors.blue} fillOpacity={0} strokeOpacity={0.4} />

          <MafsHoverSegment point1={origin} point2={projX} color={colors.rose} weight={2.5} tooltip={t("cosTooltip", { value: `${cos}` })} />
          <MafsHoverSegment point1={projX} point2={point.point} color={colors.emerald} weight={2.5} tooltip={t("sinTooltip", { value: `${sin}` })} />
          <Line.Segment point1={origin} point2={point.point} color={colors.blue} />

          <Text x={point.point[0] / 2} y={-0.35} size={12} color={colors.rose}>
            {`${cos}`}
          </Text>
          <Text x={point.point[0] + 0.35} y={point.point[1] / 2} size={12} color={colors.emerald}>
            {`${sin}`}
          </Text>

          {point.element}
        </Mafs>
      </div>

      <p className="mt-2 text-center text-xs text-zinc-500 dark:text-zinc-400">{t("hint")}</p>
    </div>
  );
}
