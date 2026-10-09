"use client";
import { useTranslations } from "next-intl";
import { Mafs, Coordinates, Polygon, Theme, useMovablePoint } from "mafs";
import "mafs/core.css";
import "./triangleMafsTheme.css";
import SectionCard from "@/components/tool-ui/SectionCard";
import TriangleWorkedExampleNote from "./TriangleWorkedExampleNote";
import TriangleSinCosLiveCurve from "./TriangleSinCosLiveCurve";
import { EXAMPLE, classifyByAngle, classifyBySides } from "./triangleEducationMath";

const dist = (p: [number, number], q: [number, number]) => Math.hypot(p[0] - q[0], p[1] - q[1]);
const round = (n: number) => Math.round(n * 100) / 100;
const clamp = (v: number) => Math.min(1, Math.max(-1, v));
const toDeg = (rad: number) => (rad * 180) / Math.PI;
/** Interior angle opposite `opp`, between the two sides `adj1`/`adj2`, via the Law of Cosines. */
const angleAt = (opp: number, adj1: number, adj2: number) => toDeg(Math.acos(clamp((adj1 * adj1 + adj2 * adj2 - opp * opp) / (2 * adj1 * adj2))));
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/**
 * The page's hero indicator: drag any of the three vertices and every downstream number — all
 * three sides, all three angles (Law of Cosines), the area (shoelace formula, cross-checked
 * against Heron's), the perimeter, and the live side/angle classification — recomputes from the
 * actual dragged coordinates alone. A real client-side "island" (§18), built with Mafs
 * specifically because genuine continuous drag interaction over a coordinate plane is what this
 * indicator needs, unlike the click-to-select chips used elsewhere on this page.
 */
export default function TriangleInteractivePlayground() {
  const t = useTranslations("tools.triangle-calculator.education.lab.playground");
  const tw = useTranslations("tools.triangle-calculator.education.lab.playground.worked");
  const tAngleClass = useTranslations("tools.triangle-calculator.education.lab.angleReference.classes");
  const tSideClass = useTranslations("tools.triangle-calculator.education.lab.specialTypes.sideClasses");

  const A = useMovablePoint([EXAMPLE.vertices[0].x, EXAMPLE.vertices[0].y], { color: Theme.blue });
  const B = useMovablePoint([EXAMPLE.vertices[1].x, EXAMPLE.vertices[1].y], { color: Theme.green });
  const C = useMovablePoint([EXAMPLE.vertices[2].x, EXAMPLE.vertices[2].y], { color: Theme.orange });

  const sideA = dist(B.point, C.point); // opposite vertex A
  const sideB = dist(A.point, C.point); // opposite vertex B
  const sideC = dist(A.point, B.point); // opposite vertex C
  const perimeter = sideA + sideB + sideC;

  // Shoelace formula: area straight from the three dragged coordinates, with no reference to
  // side lengths at all — the most directly "live" of the two area formulas.
  const areaShoelace = Math.abs(A.point[0] * (B.point[1] - C.point[1]) + B.point[0] * (C.point[1] - A.point[1]) + C.point[0] * (A.point[1] - B.point[1])) / 2;

  const degenerate = areaShoelace < 0.05;

  const angleA = angleAt(sideA, sideB, sideC);
  const angleB = angleAt(sideB, sideA, sideC);
  const angleC = angleAt(sideC, sideA, sideB);
  const largestAngle = Math.max(angleA, angleB, angleC);

  // Independent cross-check via Heron's formula, from the same live side lengths.
  const s = perimeter / 2;
  const heronProduct = s * (s - sideA) * (s - sideB) * (s - sideC);
  const areaHeron = heronProduct > 0 ? Math.sqrt(heronProduct) : 0;
  const areasMatch = Math.abs(areaHeron - areaShoelace) < 0.02;

  const sideClass = classifyBySides(sideA, sideB, sideC);
  const angleClass = classifyByAngle(largestAngle);
  const classification = `${capitalize(tSideClass(sideClass))} · ${tAngleClass(angleClass)}`;

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-center">
        <div
          dir="ltr"
          className="triangle-mafs w-full shrink-0 overflow-hidden rounded-xl lg:w-[320px]"
        >
          <Mafs viewBox={{ x: [-2, 9], y: [-2, 7] }} height={280} pan={false} zoom={false}>
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
                  { label: tw("angleA"), value: `${round(angleA)}°` },
                  { label: tw("angleB"), value: `${round(angleB)}°` },
                  { label: tw("angleC"), value: `${round(angleC)}°` },
                  { label: tw("area"), value: round(areaShoelace).toString(), note: areasMatch ? tw("matchNote") : undefined },
                  { label: tw("perimeter"), value: round(perimeter).toString() },
                  { label: tw("classification"), value: classification, emphasize: true },
                ]
          }
        />
      </div>
      {!degenerate && (
        <TriangleSinCosLiveCurve angles={[{ label: "A", deg: angleA }, { label: "B", deg: angleB }, { label: "C", deg: angleC }]} />
      )}
      <p className="mt-3 text-xs opacity-60">{t("hint")}</p>
    </SectionCard>
  );
}
