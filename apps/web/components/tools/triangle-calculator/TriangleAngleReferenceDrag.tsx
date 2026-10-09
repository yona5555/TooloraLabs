"use client";
import { useTranslations } from "next-intl";
import { Mafs, Line, Point, Theme, useMovablePoint, type vec } from "mafs";
import "mafs/core.css";
import "./triangleMafsTheme.css";
import SectionCard from "@/components/tool-ui/SectionCard";
import TriangleWorkedExampleNote from "./TriangleWorkedExampleNote";
import TriangleSinCosLiveCurve from "./TriangleSinCosLiveCurve";
import { REFERENCE_TRIANGLES, classifyByAngle } from "./triangleEducationMath";

const round = (n: number) => Math.round(n * 10) / 10;

/**
 * A draggable point along a fixed 0-180deg reference line, with every named triangle from
 * `REFERENCE_TRIANGLES` plotted at its own largest-interior-angle position — the Annotated
 * Reference Point chart type (#20 in the site's approved diagram library), made genuinely
 * interactive: the nearest reference and the acute/right/obtuse classification recompute on
 * every drag frame instead of being fixed to one static example.
 */
export default function TriangleAngleReferenceDrag() {
  const t = useTranslations("tools.triangle-calculator.education.lab.angleReference");
  const tw = useTranslations("tools.triangle-calculator.education.lab.angleReference.worked");
  const tRef = useTranslations("tools.triangle-calculator.education.lab.angleReference.names");

  const drag = useMovablePoint([REFERENCE_TRIANGLES[3].largestAngle, 0], {
    color: Theme.pink,
    constrain: (attempted) => [Math.min(Math.max(attempted[0], 0), 180), 0] as vec.Vector2,
  });

  const currentAngle = drag.point[0];
  const nearest = REFERENCE_TRIANGLES.reduce((best, ref) => (Math.abs(ref.largestAngle - currentAngle) < Math.abs(best.largestAngle - currentAngle) ? ref : best), REFERENCE_TRIANGLES[0]);
  const classification = classifyByAngle(currentAngle);

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-center">
        <div
          dir="ltr"
          className="triangle-mafs w-full shrink-0 overflow-hidden rounded-xl lg:w-[340px]"
        >
          <Mafs viewBox={{ x: [-15, 195], y: [-2, 2] }} height={140} pan={false} zoom={false}>
            <Line.Segment point1={[0, 0]} point2={[180, 0]} color={Theme.foreground} />
            {REFERENCE_TRIANGLES.map((ref) => (
              <Point key={ref.key} x={ref.largestAngle} y={0} color={Theme.indigo} />
            ))}
            {drag.element}
          </Mafs>
        </div>
        <TriangleWorkedExampleNote
          title={tw("title")}
          rows={[
            { label: tw("angle"), value: `${round(currentAngle)}°` },
            { label: tw("classification"), value: t(`classes.${classification}`) },
            { label: tw("nearest"), value: tRef(nearest.key), emphasize: true, note: tw("nearestNote", { angle: Math.round(nearest.largestAngle) }) },
          ]}
        />
      </div>
      <TriangleSinCosLiveCurve angles={[{ label: "θ", deg: currentAngle }]} />
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {REFERENCE_TRIANGLES.map((ref) => (
          <span
            key={ref.key}
            className="inline-flex items-center gap-1.5 rounded-lg border border-current/15 px-2.5 py-1 text-xs text-current/70"
          >
            <span className="h-2 w-2 shrink-0 rounded-full bg-indigo-500 dark:bg-indigo-400" />
            {tRef(ref.key)}
            <span dir="ltr" className="font-mono opacity-70">
              {round(ref.largestAngle)}°
            </span>
          </span>
        ))}
      </div>
      <p className="mt-3 text-xs opacity-60">{t("hint")}</p>
    </SectionCard>
  );
}
