"use client";
import { useTranslations } from "next-intl";
import { Mafs, Coordinates, Line, Point, Text, Theme, useMovablePoint, type vec } from "mafs";
import "mafs/core.css";
import "./triangleMafsTheme.css";
import SectionCard from "@/components/tool-ui/SectionCard";
import TriangleWorkedExampleNote from "./TriangleWorkedExampleNote";
import TriangleSinCosLiveCurve from "./TriangleSinCosLiveCurve";
import { EXAMPLE, angleSensitivity } from "./triangleEducationMath";

const round = (n: number) => Math.round(n * 100) / 100;
const toRad = (deg: number) => (deg * Math.PI) / 180;
const CX = 0;
const CY = 0;
const B: vec.Vector2 = [EXAMPLE.a, 0];
const RADIUS = EXAMPLE.b;

/** Angle (deg, 0-180) of a point on the upper half-circle around C, measured from the positive x-axis (toward B). */
function angleOf(point: vec.Vector2): number {
  const deg = (Math.atan2(point[1] - CY, point[0] - CX) * 180) / Math.PI;
  return Math.min(Math.max(deg, 1), 179);
}

function pointOnCircle(deg: number): vec.Vector2 {
  const rad = toRad(deg);
  return [CX + RADIUS * Math.cos(rad), CY + RADIUS * Math.sin(rad)];
}

/**
 * Drag the point around the arc and angle C (between fixed sides a and b, a real Sensitivity
 * Trio per the site's chart-type library) recomputes live via the Law of Cosines — with the
 * originally-requested -10deg/+10deg reference angles drawn as fixed comparison points on the
 * same arc so the live value can be read against them directly, not just as a number.
 */
export default function TriangleAngleDragSensitivity() {
  const t = useTranslations("tools.triangle-calculator.education.lab.angleSensitivity");
  const tw = useTranslations("tools.triangle-calculator.education.lab.angleSensitivity.worked");

  const drag = useMovablePoint(pointOnCircle(EXAMPLE.angleC), {
    color: Theme.blue,
    constrain: (attempted) => pointOnCircle(angleOf(attempted)),
  });

  const currentAngle = angleOf(drag.point);
  const measuredC = Math.hypot(drag.point[0] - B[0], drag.point[1] - B[1]);
  const formulaC = Math.sqrt(EXAMPLE.a ** 2 + EXAMPLE.b ** 2 - 2 * EXAMPLE.a * EXAMPLE.b * Math.cos(toRad(currentAngle)));

  const lowerPoint = pointOnCircle(angleSensitivity.lower.angleC);
  const higherPoint = pointOnCircle(angleSensitivity.higher.angleC);

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-center">
        <div
          dir="ltr"
          className="triangle-mafs w-full shrink-0 overflow-hidden rounded-xl lg:w-[320px]"
        >
          <Mafs viewBox={{ x: [-2, 8], y: [-1, 7] }} height={260} pan={false} zoom={false}>
            <Coordinates.Cartesian xAxis={{ lines: 2 }} yAxis={{ lines: 2 }} />
            <Line.Segment point1={[CX, CY]} point2={B} color={Theme.foreground} />
            <Line.Segment point1={[CX, CY]} point2={drag.point} color={Theme.blue} />
            <Line.Segment point1={B} point2={drag.point} color={Theme.green} />
            <Point x={lowerPoint[0]} y={lowerPoint[1]} color={Theme.indigo} />
            <Text x={lowerPoint[0]} y={lowerPoint[1] + 0.5} size={11} color={Theme.indigo}>
              {`${Math.round(angleSensitivity.lower.angleC)}°`}
            </Text>
            <Point x={higherPoint[0]} y={higherPoint[1]} color={Theme.pink} />
            <Text x={higherPoint[0]} y={higherPoint[1] + 0.5} size={11} color={Theme.pink}>
              {`${Math.round(angleSensitivity.higher.angleC)}°`}
            </Text>
            {drag.element}
          </Mafs>
        </div>
        <TriangleWorkedExampleNote
          title={tw("title")}
          rows={[
            { label: tw("angle"), value: `${round(currentAngle)}°` },
            { label: tw("sideAFixed"), value: `${EXAMPLE.a}` },
            { label: tw("sideBFixed"), value: `${EXAMPLE.b}` },
            { label: tw("lowerC"), value: `${round(angleSensitivity.lower.c)} (${Math.round(angleSensitivity.lower.angleC)}°)` },
            { label: tw("higherC"), value: `${round(angleSensitivity.higher.c)} (${Math.round(angleSensitivity.higher.angleC)}°)` },
            { label: tw("measuredC"), value: round(measuredC).toString(), emphasize: true, note: tw("formulaNote", { formula: round(formulaC) }) },
          ]}
        />
      </div>
      <TriangleSinCosLiveCurve angles={[{ label: "C", deg: currentAngle }]} />
      <p className="mt-3 text-xs opacity-60">{t("hint")}</p>
    </SectionCard>
  );
}
