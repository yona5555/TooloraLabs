"use client";
import { useTranslations } from "next-intl";
import { Mafs, Coordinates, Polygon, Theme, useMovablePoint } from "mafs";
import "mafs/core.css";
import "./triangleMafsTheme.css";
import SectionCard from "@/components/tool-ui/SectionCard";
import TriangleWorkedExampleNote from "./TriangleWorkedExampleNote";
import { EXAMPLE } from "./triangleEducationMath";

const dist = (p: [number, number], q: [number, number]) => Math.hypot(p[0] - q[0], p[1] - q[1]);
const round = (n: number) => Math.round(n * 100) / 100;

/**
 * The hero interactive indicator: drag any of the three vertices and every downstream number
 * (side lengths, area computed two independent ways) recomputes live from the actual dragged
 * coordinates — a real client-side "island" (§18) rather than a fixed illustration, built with
 * Mafs specifically because genuine continuous drag interaction over a coordinate plane is what
 * this indicator needs, unlike the click-to-select chips used elsewhere on this page.
 */
export default function TriangleInteractivePlayground() {
  const t = useTranslations("tools.triangle-calculator.education.lab.playground");
  const tw = useTranslations("tools.triangle-calculator.education.lab.playground.worked");

  const A = useMovablePoint([EXAMPLE.vertices[0].x, EXAMPLE.vertices[0].y], { color: Theme.blue });
  const B = useMovablePoint([EXAMPLE.vertices[1].x, EXAMPLE.vertices[1].y], { color: Theme.green });
  const C = useMovablePoint([EXAMPLE.vertices[2].x, EXAMPLE.vertices[2].y], { color: Theme.orange });

  const sideA = dist(B.point, C.point); // opposite vertex A
  const sideB = dist(A.point, C.point); // opposite vertex B
  const sideC = dist(A.point, B.point); // opposite vertex C

  const s = (sideA + sideB + sideC) / 2;
  const heronProduct = s * (s - sideA) * (s - sideB) * (s - sideC);
  const areaHeron = heronProduct > 0 ? Math.sqrt(heronProduct) : 0;

  // Shoelace formula: an entirely independent way of computing the same area straight from
  // the three draggable coordinates, with no reference to side lengths at all.
  const areaShoelace = Math.abs(A.point[0] * (B.point[1] - C.point[1]) + B.point[0] * (C.point[1] - A.point[1]) + C.point[0] * (A.point[1] - B.point[1])) / 2;

  const degenerate = areaShoelace < 0.05;

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-center">
        <div
          dir="ltr"
          className="triangle-mafs w-full shrink-0 overflow-hidden rounded-xl lg:w-[320px]"
        >
          <Mafs viewBox={{ x: [-2, 9], y: [-2, 7] }} height={260} pan={false} zoom={false}>
            <Coordinates.Cartesian xAxis={{ lines: 2 }} yAxis={{ lines: 2 }} />
            <Polygon points={[A.point, B.point, C.point]} color={Theme.blue} fillOpacity={0.12} />
            {A.element}
            {B.element}
            {C.element}
          </Mafs>
        </div>
        <TriangleWorkedExampleNote
          title={tw("title")}
          rows={
            degenerate
              ? [{ label: tw("degenerate"), value: "—" }]
              : [
                  { label: tw("sideA"), value: `${round(sideA)}` },
                  { label: tw("sideB"), value: `${round(sideB)}` },
                  { label: tw("sideC"), value: `${round(sideC)}` },
                  { label: tw("areaHeron"), value: round(areaHeron).toString() },
                  { label: tw("areaShoelace"), value: round(areaShoelace).toString(), emphasize: true, note: tw("matchNote") },
                ]
          }
        />
      </div>
      <p className="mt-3 text-xs opacity-60">{t("hint")}</p>
    </SectionCard>
  );
}
